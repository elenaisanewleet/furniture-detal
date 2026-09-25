/**
 * Astro integration: substitute the translated page prose into the localised
 * pages after the build.
 *
 * Page copy lives in the .astro files, which is where copy should live for
 * authoring — a paragraph reads as a paragraph, next to the markup it belongs
 * to. Hollowing twenty pages out into key lookups would make every future edit
 * a two-file change and would put the English behind an indirection nobody
 * wants when they are writing it.
 *
 * So the English stays where it is, and the translations are a memory: a flat
 * map of English string to translated string, per locale, in
 * `src/i18n/prose.<locale>.json`. That file is data the owner can read and
 * correct without touching code, and a string missing from it renders in
 * English rather than as a blank or a key — a half-translated page is readable,
 * which is what makes it safe to ship a language before it is finished.
 *
 * The scanning rules live in prose-scan.mjs, shared with the extractor, so what
 * was pulled out for translation and what gets put back are decided by the same
 * code. If those two ever disagreed, a translated string would silently fail to
 * apply and nothing would say so.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { applyProse } from './prose-scan.mjs';

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

/** @param {{ locales: string[], dir?: string }} options */
export default function localizeProse({ locales, dir = 'src/i18n' }) {
  /** @type {Record<string, Record<string, string>>} */
  const memories = {};
  let srcRoot = '';

  return {
    name: 'semers:localize-prose',
    hooks: {
      'astro:config:done': ({ config }) => {
        srcRoot = new URL(dir + '/', config.root).pathname;
      },
      'astro:build:done': async ({ dir: outDir, logger }) => {
        const root = outDir.pathname;
        for (const locale of locales) {
          const path = join(srcRoot, `prose.${locale}.json`);
          try {
            memories[locale] = JSON.parse(await readFile(path, 'utf-8'));
          } catch {
            // A language whose memory has not been written yet simply stays in
            // English; that is a state worth shipping, not a build failure.
            logger.warn(`no prose memory at ${relative(root, path)} — /${locale}/ stays in English`);
            continue;
          }

          let base;
          try {
            base = join(root, locale);
            await readdir(base);
          } catch {
            logger.warn(`no pages emitted for /${locale}/ — skipping`);
            continue;
          }

          let files = 0;
          let strings = 0;
          for await (const file of walk(base)) {
            const before = await readFile(file, 'utf-8');
            const { html, applied } = applyProse(before, memories[locale]);
            if (!applied) continue;
            await writeFile(file, html);
            files++;
            strings += applied;
            logger.debug(`${relative(root, file)}: ${applied} strings`);
          }
          logger.info(`/${locale}/: ${strings} strings across ${files} pages (${Object.keys(memories[locale]).length} in memory)`);
        }
      },
    },
  };
}
