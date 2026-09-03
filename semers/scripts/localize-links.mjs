/**
 * Astro integration: prefix internal links inside the localised pages.
 *
 * The pages are one set of components rendered three times, and their bodies
 * carry canonical English paths (`/faq/`, `/products/tasting-box/`) written
 * either in the markup or derived from the catalogue. Threading a locale helper
 * through every link in every page and every data file would be ~150 edits with
 * a silent failure mode: miss one and a Russian reader is dropped back into
 * English mid-journey.
 *
 * So it is done once, here, over the emitted HTML of `dist/<locale>/**`, where
 * it is exhaustive by construction and can be asserted on. English is left
 * exactly as it was.
 *
 * What is deliberately NOT rewritten:
 *   //host, http(s):, mailto:, tel:, #anchor  — not internal paths
 *   /api/                                      — the Worker, not a page
 *   /_astro/, /fonts/, /img/                   — assets
 *   /admin/                                    — one back office, not three
 *   /anything.ext                              — a file, not a page
 *   /<locale>/...                              — already localised by a component
 *   any link carrying hreflang                 — the language switcher, whose
 *                                                whole job is to point at
 *                                                another language
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const SKIP_PREFIX = ['/api/', '/_astro/', '/fonts/', '/img/', '/admin/'];

/** True when a path must keep pointing where it points. */
export function isExempt(path, locale) {
  if (!path.startsWith('/') || path.startsWith('//')) return true;
  if (path === `/${locale}` || path.startsWith(`/${locale}/`)) return true;
  if (SKIP_PREFIX.some((p) => path === p.slice(0, -1) || path.startsWith(p))) return true;
  // A first segment with a dot in it is a file: /favicon.svg, /site.webmanifest,
  // /sitemap-index.xml, /robots.txt. Page paths never contain one.
  const first = path.slice(1).split(/[/?#]/)[0];
  return first.includes('.');
}

/** Rewrite one document's internal paths into `locale`. */
export function localizeHtml(html, locale) {
  let changed = 0;
  const prefix = (path) => {
    if (isExempt(path, locale)) return path;
    changed++;
    return `/${locale}${path}`;
  };
  // Rewritten tag by tag rather than attribute by attribute, so a link that
  // declares its own target language can be left alone: re-pointing the
  // language switcher at the page it sits on is exactly the bug this guards.
  let out = html.replace(/<(?:a|area|link)\s[^>]*>/gi, (tag) =>
    /\shreflang=/i.test(tag) ? tag : tag.replace(/href="(\/[^"]*)"/, (_m, p) => `href="${prefix(p)}"`),
  );
  // The add-to-cart payload is JSON inside an attribute, so its quotes arrive
  // HTML-escaped; the product URL in it is what the cart links each line to.
  out = out.replace(/&quot;url&quot;:&quot;(\/[^&]*)&quot;/g, (_m, p) => `&quot;url&quot;:&quot;${prefix(p)}&quot;`);
  return { html: out, changed };
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

/** @param {{ locales: string[] }} options */
export default function localizeLinks({ locales }) {
  return {
    name: 'semers:localize-links',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = dir.pathname;
        let files = 0;
        let links = 0;
        for (const locale of locales) {
          let base;
          try {
            base = join(root, locale);
            await readdir(base);
          } catch {
            logger.warn(`no pages emitted for /${locale}/ — skipping`);
            continue;
          }
          for await (const file of walk(base)) {
            const before = await readFile(file, 'utf-8');
            const { html, changed } = localizeHtml(before, locale);
            if (!changed) continue;
            await writeFile(file, html);
            files++;
            links += changed;
            logger.debug(`${relative(root, file)}: ${changed} links`);
          }
        }
        logger.info(`localised ${links} links across ${files} pages`);
      },
    },
  };
}
