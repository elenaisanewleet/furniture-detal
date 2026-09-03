/**
 * What is still English on a translated page?
 *
 * The answer is not a guess: a string handled by the dictionary, the catalogue
 * overrides or the prose memory has already been replaced by the time the page
 * is written out, so anything English still standing in dist/ru or dist/lv is,
 * by construction, exactly what is missing. That makes this both the report of
 * the gap and the proof that the rest landed.
 *
 * It also names memory entries that no page uses any more, which is what
 * happens when English copy is edited after a translation was made — those are
 * dead weight, not errors, but they hide the fact that the sentence they were
 * written for now renders in English.
 *
 * Usage: node scripts/check-i18n.mjs [dist] [--max N]
 *   --max N   fail when more than N strings are still English (default: report only)
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { scanProse } from './prose-scan.mjs';

const args = process.argv.slice(2);
const ROOT = args.find((a) => !a.startsWith('--')) || 'dist';
const maxArg = args.indexOf('--max');
const MAX = maxArg > -1 ? Number(args[maxArg + 1]) : null;
const LOCALES = ['ru', 'lv'];

/** `skip` also drops the localised trees when walking the English one. */
async function* walk(dir, skip = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) {
      if (!['_astro', 'fonts', 'img', 'admin', ...skip].includes(e.name)) yield* walk(f, skip);
    } else if (e.name.endsWith('.html')) yield f;
  }
}

const collect = async (root, skip = []) => {
  const seen = new Map();
  for await (const file of walk(root, skip)) {
    const page = '/' + relative(root, file).replace(/index\.html$/, '').replace(/\.html$/, '');
    const html = await readFile(file, 'utf-8');
    scanProse(html, ({ text, kind }) => {
      const e = seen.get(text) || { text, kind, pages: [], count: 0 };
      e.count++;
      if (e.pages.length < 3 && !e.pages.includes(page)) e.pages.push(page);
      seen.set(text, e);
    });
  }
  return seen;
};

const words = (list) => list.reduce((n, e) => n + e.text.split(/\s+/).length, 0);

/*
 * "Still English" needs both halves of the comparison. A localised page is full
 * of prose that is not English — that is the point — so a string counts only if
 * it also appears on the English pages. That is the definition: the same words,
 * unchanged, on both.
 */
const english = await collect(ROOT, LOCALES);
const found = {};
for (const locale of LOCALES) {
  try {
    const all = await collect(join(ROOT, locale));
    found[locale] = [...all.values()].filter((e) => english.has(e.text));
  } catch {
    console.log(`no pages under ${ROOT}/${locale} — skipping`);
  }
}
const present = LOCALES.filter((l) => found[l]);
if (!present.length) process.exit(0);

/*
 * A string English in every language is untranslated copy. One English in only
 * some means a language was translated and another was not — which a single
 * total would hide.
 */
const everywhere = found[present[0]].filter((e) => present.every((l) => found[l].some((x) => x.text === e.text)));
const shared = new Set(everywhere.map((e) => e.text));

console.log(`${english.size} English strings on the site`);
console.log(`still English in every language: ${everywhere.length} (${words(everywhere)} words)`);
for (const l of present) {
  const only = found[l].filter((e) => !shared.has(e.text));
  console.log(`  ${l}: ${found[l].length} still English` + (only.length ? `, ${only.length} of them only in ${l}` : ''));
}

for (const locale of present) {
  const path = join('src/i18n', `prose.${locale}.json`);
  const memory = JSON.parse(await readFile(path, 'utf-8').catch(() => '{}'));
  const keys = Object.keys(memory);
  if (!keys.length) continue;
  // A key that no English page produces cannot ever apply.
  const dead = keys.filter((k) => !english.has(k));
  console.log(`${path}: ${keys.length} entries` + (dead.length ? `, ${dead.length} matching nothing on any page` : ''));
  dead.slice(0, 5).forEach((k) => console.log(`    unused: ${JSON.stringify(k.slice(0, 66))}`));
  if (dead.length > 5) console.log(`    … and ${dead.length - 5} more`);
}

const top = everywhere.sort((a, b) => b.count - a.count || a.text.localeCompare(b.text));
if (top.length) {
  console.log('\nmost common:');
  top.slice(0, 15).forEach((e) => console.log(`  ${String(e.count).padStart(3)}× [${e.kind}] ${JSON.stringify(e.text.slice(0, 72))}  ${e.pages[0]}`));
  if (top.length > 15) console.log(`  … and ${top.length - 15} more`);
}

if (MAX !== null && everywhere.length > MAX) {
  console.log(`\n${everywhere.length} untranslated strings, over the limit of ${MAX}`);
  process.exit(1);
}
