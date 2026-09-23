/**
 * Does a product page carry what the law makes it carry?
 *
 * Regulation (EU) 1169/2011 Article 14 says that food sold at a distance must
 * show the mandatory particulars — everything on the pack except the date of
 * minimum durability — *before the purchase is concluded*. Not in the parcel,
 * not on request: on the page, before the button. It is the requirement small
 * food shops miss most often, and the one a customer with an allergy is
 * entitled to rely on.
 *
 * This reads the built pages, so it checks what a reader is actually served
 * rather than what the data file intends, and it checks every language: an
 * ingredient list that stayed in English is not an ingredient list for someone
 * shopping in Latvian.
 *
 * It also reads src/data/products.ts, for the one thing a page cannot reveal —
 * whether the numbers on it are real. Eleven products currently share three
 * nutrition tables between them, and the file says so itself.
 *
 * Two exit codes, because two different things are wrong:
 *   plain     lists what is missing and exits 0 while the gaps are all "the
 *             owner has not sent the labels yet". A worklist, not a failure.
 *   --strict  exits non-zero on any gap. This is the launch gate: run it before
 *             the shop is allowed to take money.
 *
 * Usage: node scripts/check-food.mjs [--strict]
 */
import { readFile } from 'node:fs/promises';

const STRICT = process.argv.includes('--strict');
const DIST = new URL('../dist/', import.meta.url);
const SRC = new URL('../src/', import.meta.url);

const catalogue = JSON.parse(await readFile(new URL('catalog.json', DIST), 'utf-8'));
const productsSrc = await readFile(new URL('data/products.ts', SRC), 'utf-8');

/** Every distinct product, in catalogue order; the catalogue is keyed per flavour. */
const SLUGS = [...new Set(Object.values(catalogue.items).map((i) => i.slug))];
const LOCALES = [
  ['', 'en'],
  ['ru/', 'ru'],
  ['lv/', 'lv'],
];

/*
 * The eight mandatory particulars a distance sale has to show up front. The
 * date of minimum durability is the one Article 14 lets you leave for the pack,
 * so it is not here; shelf life in months is shown anyway and is not a
 * substitute for it.
 */
const PARTICULARS = [
  { key: 'name', what: 'descriptive name of the food (not the brand)', article: 'art. 17' },
  { key: 'ingredients', what: 'list of ingredients', article: 'art. 18' },
  { key: 'allergens', what: 'allergens, emphasised inside the ingredient list', article: 'art. 21' },
  { key: 'quantity', what: 'net quantity', article: 'art. 23' },
  { key: 'storage', what: 'conditions of use and storage', article: 'art. 25' },
  { key: 'operator', what: 'name and address of the food business operator', article: 'art. 8(1), 9(1)(h)' },
  { key: 'nutrition', what: 'nutrition declaration per 100 g', article: 'art. 30' },
  { key: 'unitPrice', what: 'price per kilogram beside the selling price', article: 'MK Nr. 178' },
];

const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
const textOf = (html) =>
  strip(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

/** The fourteen allergen groups, in the three languages a reader may be in. */
const ALLERGEN_WORDS =
  /\b(egg|eggs|milk|gluten|wheat|nut|nuts|peanut|soy|soya|sesame|celery|mustard|sulphite|lupin|molluscs?|fish|crustacean|яйц\w*|молок\w*|глютен\w*|пшениц\w*|орех\w*|арахис\w*|со[яию]\w*|кунжут\w*|сельдер\w*|горчиц\w*|сульфит\w*|люпин\w*|olu\b|olas\b|piena?\b|lipekl\w*|kviešu\w*|rieks?t\w*|zemesrieks?t\w*|sojas?\b|sezama?\b|selerij\w*|sinep\w*|sulfīt\w*|lupīn\w*)/i;

const problems = [];
/** Things that are present but want a human decision rather than a fix. */
const notes = new Set();
/** slug -> particular -> the distinct reasons, so every language that is short of it survives into the report. */
const worklist = new Map();
const miss = (slug, key, detail) => {
  if (!worklist.has(slug)) worklist.set(slug, new Map());
  const gaps = worklist.get(slug);
  if (!gaps.has(key)) gaps.set(key, new Set());
  gaps.get(key).add(detail);
};

/* --------------------------------------------------------------- the pages */

for (const slug of SLUGS) {
  for (const [prefix, lang] of LOCALES) {
    let html;
    try {
      html = await readFile(new URL(`${prefix}products/${slug}/index.html`, DIST), 'utf-8');
    } catch {
      problems.push(`${slug} (${lang}): the page was not built`);
      continue;
    }
    const text = textOf(html);

    // Ingredients and the allergen statement are labelled blocks in the markup,
    // so their absence is checked on the element rather than on a word that
    // might appear in prose somewhere else on the page.
    const ingBlock = /class="[^"]*pdp-inside__ing[^"]*"[^>]*>([\s\S]*?)<\/p>/.exec(html);
    const allBlock = /class="[^"]*pdp-inside__all[^"]*"[^>]*>([\s\S]*?)<\/p>/.exec(html);
    const ingText = ingBlock ? textOf(ingBlock[1]) : '';
    const allText = allBlock ? textOf(allBlock[1]) : '';

    if (!ingText || ingText.length < 20) miss(slug, 'ingredients', `not on the ${lang} page`);
    if (!allText || allText.length < 10) miss(slug, 'allergens', `no allergen statement on the ${lang} page`);

    /*
     * Article 21 wants the allergen emphasised *within* the list of
     * ingredients — bold, or a different type — so an eye running down the list
     * catches it. A separate sentence underneath is extra information, not
     * compliance, and every product here does it the second way.
     */
    if (ingBlock && ALLERGEN_WORDS.test(ingText) && !/<(strong|b)\b/i.test(ingBlock[1])) {
      miss(slug, 'allergens', `named in the ${lang} ingredient list but not emphasised in it`);
    }

    // Everything the page has to say, but does not yet.
    /*
     * JavaScript's \b is ASCII-only, so \bг\b can never match on the Russian
     * page — which made every product look as if it carried no weight at all.
     * The unit is bounded by "not a letter" instead, which holds in all three
     * alphabets.
     */
    if (!/\d+(?:[.,]\d+)?\s*(?:g|gr|г|гр)(?!\p{L})/iu.test(text)) miss(slug, 'quantity', `no net quantity on the ${lang} page`);
    /*
     * Storage has to be stated as a storage condition. "Keeps 12 months — no
     * fridge needed" in a list of selling points and "a cool, dry place" buried
     * in an FAQ answer are both true, and neither is a declaration; saying
     * which of the two was found is the difference between "write this" and
     * "move this".
     */
    if (!/data-storage\b/.test(html)) {
      const inProse = /(cool,? dry|room temperature|прохладн|сухом месте|sausā|vēsā)/i.test(text);
      miss(slug, 'storage', inProse ? `on the ${lang} page only as prose, not declared as a storage condition` : `no storage conditions on the ${lang} page`);
    }
    /*
     * "SIA" appears in the footer of every page, so looking for it anywhere
     * passed all ten products without a single one naming its operator. The
     * particular belongs to the food, beside the food — a reader with a
     * question about an ingredient should not have to infer who made it from
     * the copyright line.
     */
    if (!/data-operator\b/.test(html)) miss(slug, 'operator', `not named beside the food on the ${lang} page`);
    /*
     * Article 17 wants the name of the food: what it is, not what it is called.
     * "App'Lite" is a brand; "Ābolu batoniņš" is a name. No page carries one
     * yet, and no machine can write them — they come from the pack.
     */
    if (!/data-legal-name\b/.test(html)) miss(slug, 'name', `the page leads with the brand; the name of the food is missing (${lang})`);
    /*
     * A unit price is already shown, per 100 g. Whether that satisfies the
     * Latvian rule or whether it has to be per kilogram depends on the pack
     * size, and is a question for the owner's accountant rather than for a
     * regular expression — so the absence of any unit price is a finding and
     * the choice of unit is a note.
     */
    if (!/(per\s*100\s*g|на\s*100\s*г|uz\s*100\s*g|per kg|\/\s*kg|за кг)/i.test(text)) {
      miss(slug, 'unitPrice', `no unit price at all on the ${lang} page`);
    } else if (!/(per kg|\/\s*kg|за кг)/i.test(text) && lang === 'lv') {
      notes.add('the unit price is shown per 100 g; confirm that is the permitted unit for these pack sizes (Dir. 98/6/EC, MK Nr. 178)');
    }

    // A nutrition table is mandatory and has eight rows. A missing row is as
    // non-compliant as a missing table, and easier to ship by accident.
    for (const [row, re] of [
      ['energy', /(energy|энерг|enerģ)/i],
      ['fat', /(\bfat\b|жир|tauki)/i],
      ['saturates', /(saturate|насыщ|piesātin)/i],
      ['carbohydrate', /(carbohydrate|углевод|ogļhidrāt)/i],
      ['sugars', /(sugar|сахар|cukur)/i],
      ['protein', /(protein|белок|белк|olbaltum)/i],
      ['salt', /(\bsalt\b|соль|sāls)/i],
    ]) {
      if (!re.test(text)) miss(slug, 'nutrition', `the ${lang} nutrition table has no ${row} row`);
    }

    // The Latvian page has to be Latvian: an ingredient list left in English is
    // not one for the reader it was meant for (Valsts valodas likums, 21. p.).
    if (lang === 'lv' && ingText && /\b(apples?|egg white|baked|sugar|whipped)\b/i.test(ingText)) {
      miss(slug, 'ingredients', 'the Latvian ingredient list is still in English');
    }
  }
}

/* ------------------------------------------------- the numbers behind them */

/*
 * The page cannot show whether its own figures are real. The data file can: it
 * says at the top that the nutrition values are typical rather than measured,
 * and eight products point at one shared table. Printing a shared table as "per
 * 100 g of this product" is a statement about food that nobody has weighed.
 */
const shared = new Map();
for (const m of productsSrc.matchAll(/slug:\s*'([^']+)'[\s\S]*?nutrition:\s*([A-Z_]+|\{\s*\.\.\.([A-Z_]+))/g)) {
  const table = m[3] || m[2];
  if (!shared.has(table)) shared.set(table, []);
  shared.get(table).push(m[1]);
}
for (const [table, users] of shared) {
  if (users.length > 1) {
    for (const slug of users) miss(slug, 'nutrition', `shares ${table} with ${users.length - 1} other product(s) — not measured for this one`);
  }
}
if (/values are typical|must be verified against the pack/i.test(productsSrc)) {
  problems.push('src/data/products.ts still says its nutrition values are typical and unverified');
}

/*
 * A gift set is several different foods in one box. One ingredient list and one
 * nutrition table cannot describe it, so each food in the box needs its own —
 * which the data model has no room for yet.
 */
for (const slug of SLUGS) {
  if (/set|box/i.test(slug) && !/12-pack/.test(slug)) {
    miss(slug, 'ingredients', 'a mixed box needs the particulars of every food in it, not one shared list');
  }
}

/* ------------------------------------------------------------------ report */

const label = Object.fromEntries(PARTICULARS.map((p) => [p.key, p]));
const ORDER = PARTICULARS.map((p) => p.key);

if (problems.length) {
  console.log('Wrong, not merely missing:');
  for (const p of problems) console.log(`  ${p}`);
  console.log('');
}

if (!worklist.size) {
  console.log(`every product page carries all eight mandatory particulars, in all three languages`);
  process.exit(0);
}

console.log(`Mandatory food information — Regulation (EU) 1169/2011, art. 14.`);
console.log(`What must be on the page before the pay button, and is not.\n`);

const tally = new Map();
for (const slug of SLUGS) {
  const gaps = worklist.get(slug);
  if (!gaps) continue;
  console.log(`  ${slug}`);
  for (const key of ORDER) {
    if (!gaps.has(key)) continue;
    tally.set(key, (tally.get(key) || 0) + 1);
    console.log(`    ${label[key].what} (${label[key].article})`);
    for (const reason of gaps.get(key)) console.log(`      ${reason}`);
  }
}

console.log(`\n${worklist.size} of ${SLUGS.length} products are short of something. By particular:`);
for (const key of ORDER) {
  if (tally.has(key)) console.log(`  ${String(tally.get(key)).padStart(2)} × ${label[key].what}`);
}

if (notes.size) {
  console.log(`\nPresent, but worth a decision:`);
  for (const n of notes) console.log(`  ${n}`);
}

console.log(`\nMost of this is read off the back of a pack. Ask for a photograph of`);
console.log(`the label of each product, plus the operator name and address to publish.`);

process.exit(STRICT ? 1 : 0);
