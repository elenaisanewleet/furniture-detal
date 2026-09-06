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
 * A sentence with a price in it does not read the same on both pages: English
 * writes "over €25", Latvian "over 25 €". Comparing them literally would call
 * an untranslated sentence translated, purely because the number beside it
 * moved. Money is replaced by a placeholder on both sides, so the words are
 * what decides.
 */
const NORM_MONEY = /€\s?\d+(?:[.,]\d+)*|\d+(?:[.,]\d+)*\s?€/g;
const norm = (t) => t.replace(NORM_MONEY, '¤');

/*
 * "Still English" needs both halves of the comparison. A localised page is full
 * of prose that is not English — that is the point — so a string counts only if
 * it also appears on the English pages. That is the definition: the same words,
 * unchanged, on both.
 */
const englishRaw = await collect(ROOT, LOCALES);
const english = new Set([...englishRaw.keys()].map(norm));
/** Every string any page produces, in any language. */
const onAnyPage = await collect(ROOT);
const memories = {};
const found = {};
for (const locale of LOCALES) {
  memories[locale] = JSON.parse(await readFile(join('src/i18n', `prose.${locale}.json`), 'utf-8').catch(() => '{}'));
  try {
    const all = await collect(join(ROOT, locale));
    /*
     * A string the memory has an entry for is handled, even when that entry is
     * the English itself: "35 g" is "35 g" in Latvian, and a translator saying
     * so is a decision, not a gap. Without this the same few dozen units would
     * be reported as missing on every run, and a real gap would be lost in them.
     */
    found[locale] = [...all.values()].filter((e) => english.has(norm(e.text)) && !(e.text in memories[locale]));
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

console.log(`${englishRaw.size} English strings on the site`);
console.log(`still English in every language: ${everywhere.length} (${words(everywhere)} words)`);
for (const l of present) {
  const only = found[l].filter((e) => !shared.has(e.text));
  console.log(`  ${l}: ${found[l].length} still English` + (only.length ? `, ${only.length} of them only in ${l}` : ''));
}

for (const locale of present) {
  const path = join('src/i18n', `prose.${locale}.json`);
  const keys = Object.keys(memories[locale]);
  if (!keys.length) continue;
  // A key that no English page produces cannot ever apply.
  /*
   * A key is dead when neither it nor its translation appears on any page.
   *
   * Both halves are needed. A sentence with a price in it is keyed by what the
   * localised page says rather than by the English, so checking only the English
   * tree would call those keys dead — and a key that is working has replaced
   * itself on the page, so looking for the key alone would call every successful
   * entry dead too. What is left is the real thing: a translation for a sentence
   * that no longer exists.
   */
  const dead = keys.filter((k) => !englishRaw.has(k) && !onAnyPage.has(k) && !onAnyPage.has(memories[locale][k]));
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
