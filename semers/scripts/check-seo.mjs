/**
 * A build-output check, not a linter: it reads the emitted HTML and asserts the
 * things that only go wrong once the site is assembled from three locales, two
 * post-build passes and a sitemap.
 *
 * What it asserts:
 *   - every indexable page has a canonical, and it points at itself;
 *   - hreflang is reciprocal — an alternate that does not point back is worse
 *     than no alternate at all, because Google drops the whole cluster;
 *   - html lang matches the directory the page was emitted into;
 *   - every internal link resolves to a page that was actually built;
 *   - the sitemap lists exactly the indexable pages, no more and no less;
 *   - a noindex page carries neither canonical nor alternates, which would
 *     contradict it, and stays out of the sitemap.
 *
 * Usage: node scripts/check-seo.mjs [dist]
 * Exits non-zero when something is wrong, so it can gate a deploy.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.argv[2] || 'dist';
/** The back office is not part of the site Google sees. */
const SKIP = ['/admin/'];
/** Google truncates a description around here; longer is not broken, but it is not read either. */
const DESC_MAX = 175;

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) {
      if (!['_astro', 'fonts', 'img'].includes(e.name)) yield* walk(f);
    } else if (e.name.endsWith('.html')) yield f;
  }
}
const pathOf = (file) => '/' + relative(ROOT, file).replace(/index\.html$/, '').replace(/\.html$/, '');

const pages = new Map();
for await (const f of walk(ROOT)) {
  const h = await readFile(f, 'utf-8');
  pages.set(pathOf(f), {
    canonical: /<link rel="canonical" href="([^"]+)"/.exec(h)?.[1],
    alts: [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]),
    noindex: /<meta name="robots" content="[^"]*noindex/.test(h),
    lang: /<html lang="([^"]+)"/.exec(h)?.[1],
    title: /<title>([^<]*)<\/title>/.exec(h)?.[1],
    desc: /<meta name="description" content="([^"]*)"/.exec(h)?.[1],
    links: [...h.matchAll(/<a\s[^>]*href="(\/[^"#?]*)"/g)].map((m) => m[1]),
  });
}

const sitemap = await readFile(join(ROOT, 'sitemap-0.xml'), 'utf-8').catch(() => '');
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));

const bad = [];
const warn = [];
let indexable = 0;

for (const [path, p] of pages) {
  if (SKIP.some((s) => path.startsWith(s))) continue;
  const self = path.endsWith('/') || path === '/404' ? path : `${path}/`;

  if (p.noindex) {
    if (p.canonical) bad.push(`${path}: noindex page still declares a canonical`);
    if (p.alts.length) bad.push(`${path}: noindex page still declares hreflang alternates`);
    if (listed.has(path)) bad.push(`${path}: noindex but listed in the sitemap`);
  } else {
    indexable++;
    if (!p.canonical) bad.push(`${path}: no canonical`);
    else if (new URL(p.canonical).pathname !== self) bad.push(`${path}: canonical points at ${new URL(p.canonical).pathname}`);
    if (!listed.has(path)) bad.push(`${path}: indexable but not in the sitemap`);
    if (!p.desc) bad.push(`${path}: no meta description`);
    else if (p.desc.length > DESC_MAX) warn.push(`${path}: description is ${p.desc.length} chars`);

    for (const [lang, href] of p.alts) {
      if (lang === 'x-default') continue;
      const target = new URL(href).pathname;
      const t = pages.get(target) || pages.get(target.replace(/\/$/, ''));
      if (!t) { bad.push(`${path}: hreflang ${lang} → ${target} was never built`); continue; }
      if (!t.alts.some(([l, h]) => l !== 'x-default' && new URL(h).pathname === self)) bad.push(`${path}: hreflang ${lang} → ${target} does not point back`);
    }
  }

  if (!p.title) bad.push(`${path}: no title`);
  const expected = path.startsWith('/ru/') ? 'ru' : path.startsWith('/lv/') ? 'lv' : 'en';
  if (p.lang !== expected) bad.push(`${path}: html lang="${p.lang}", expected "${expected}"`);

  for (const href of new Set(p.links)) {
    if (href.startsWith('/api/') || SKIP.some((s) => href.startsWith(s))) continue;
    if (/\.[a-z0-9]+$/i.test(href)) continue; // a file, not a page
    if (!pages.has(href) && !pages.has(href.replace(/\/$/, ''))) bad.push(`${path}: links to ${href} — no such page`);
  }
}

console.log(`${pages.size} pages, ${indexable} indexable, ${listed.size} in the sitemap`);
for (const w of warn) console.log('  warn:', w);
if (!bad.length) {
  console.log('no problems');
  process.exit(0);
}
console.log(`\n${bad.length} problems:`);
bad.forEach((b) => console.log('  -', b));
process.exit(1);
