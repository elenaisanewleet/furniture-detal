/**
 * Structured-data check over the built pages.
 *
 * check-seo asserts the JSON-LD parses and that its URLs follow the locale.
 * That is not the same as being usable: a rich result is withheld for a missing
 * property, a price written "€1.45" instead of "1.45", an availability value
 * spelled from memory rather than from the vocabulary, or a GTIN whose check
 * digit does not add up. None of that shows anywhere — the block is valid JSON,
 * the page renders, and the result quietly never appears.
 *
 * So this asserts what Google actually reads: the required properties per type,
 * the shape of the values, that on-site URLs point at pages that exist, and
 * that identifiers are unique within a page. Recommendations are reported
 * separately from requirements, because a warning is a decision and an error is
 * a bug.
 *
 * Usage: node scripts/check-schema.mjs [dist]
 * Exits non-zero on an error; warnings alone do not fail.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.argv[2] || 'dist';

/** schema.org enumerations Google matches literally. */
const AVAILABILITY = new Set(
  ['InStock', 'OutOfStock', 'PreOrder', 'BackOrder', 'Discontinued', 'InStoreOnly', 'LimitedAvailability', 'OnlineOnly', 'SoldOut'].map((v) => `https://schema.org/${v}`),
);
const CONDITION = new Set(['NewCondition', 'UsedCondition', 'RefurbishedCondition', 'DamagedCondition'].map((v) => `https://schema.org/${v}`));
const RETURN_CATEGORY = new Set(
  ['MerchantReturnFiniteReturnWindow', 'MerchantReturnNotPermitted', 'MerchantReturnUnlimitedWindow', 'MerchantReturnUnspecified'].map((v) => `https://schema.org/${v}`),
);
/** A price Google will read: digits with an optional decimal point, no symbol, no grouping. */
const PRICE = /^\d+(\.\d{1,2})?$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) {
      if (!['_astro', 'fonts', 'img'].includes(e.name)) yield* walk(f);
    } else if (e.name.endsWith('.html')) yield f;
  }
}

/** The last digit of a GTIN is a checksum over the others; a typo fails it. */
function gtinValid(code) {
  const d = String(code).replace(/\D/g, '');
  if (![8, 12, 13, 14].includes(d.length)) return false;
  const digits = [...d].map(Number);
  const check = digits.pop();
  digits.reverse();
  const sum = digits.reduce((n, v, i) => n + v * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

const errors = [];
const warnings = [];
let pages = 0;
let nodes = 0;
const seenTypes = new Map();

/** Every path the build produced, so an on-site URL can be resolved against it. */
const built = new Set();
for await (const f of walk(ROOT)) {
  const rel = relative(ROOT, f).replace(/index\.html$/, '').replace(/\\/g, '/');
  built.add('/' + rel);
}

for await (const file of walk(ROOT)) {
  const page = '/' + relative(ROOT, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  const html = await readFile(file, 'utf-8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) continue;
  pages++;

  const err = (m) => errors.push(`${page}: ${m}`);
  const warn = (m) => warnings.push(`${page}: ${m}`);
  const ids = new Set();

  for (const b of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(b[1]);
    } catch (e) {
      err(`a JSON-LD block does not parse — ${String(e).slice(0, 60)}`);
      continue;
    }
    const graph = parsed['@graph'] || (Array.isArray(parsed) ? parsed : [parsed]);
    if (!parsed['@context']) err('a JSON-LD block has no @context');

    /** Walk every node, however deeply nested, so a bad offer inside a variant is still seen. */
    const all = [];
    const collect = (n) => {
      if (Array.isArray(n)) return n.forEach(collect);
      if (!n || typeof n !== 'object') return;
      if (n['@type']) all.push(n);
      for (const v of Object.values(n)) collect(v);
    };
    collect(graph);
    nodes += all.length;

    /*
     * A node may be written once and referred to by @id everywhere else — the
     * Organization is the author of every article and the seller of every
     * offer, and repeating it would be three copies to keep in step. A checker
     * that reads the reference literally sees a node with no name and calls it
     * broken, so references are resolved against the block they live in.
     */
    const byId = new Map(all.filter((n) => n['@id']).map((n) => [n['@id'], n]));
    const deref = (v) => {
      if (Array.isArray(v)) return v.map(deref);
      if (v && typeof v === 'object' && v['@id'] && Object.keys(v).length === 1) return byId.get(v['@id']) ?? v;
      return v;
    };

    for (const n of all) {
      const type = Array.isArray(n['@type']) ? n['@type'][0] : n['@type'];
      seenTypes.set(type, (seenTypes.get(type) || 0) + 1);

      if (n['@id']) {
        if (ids.has(n['@id'])) err(`two nodes share @id ${n['@id']}`);
        ids.add(n['@id']);
      }

      // An on-site URL that 404s is worse than no URL at all.
      for (const key of ['url', 'item', 'target', 'merchantReturnLink']) {
        const v = typeof n[key] === 'string' ? n[key] : null;
        if (!v) continue;
        let path;
        try {
          path = new URL(v).pathname;
        } catch {
          continue;
        }
        if (!/^https?:/.test(v)) continue;
        const host = new URL(v).host;
        const local = [...built].some((p) => p === path);
        if (host.includes('semers') && !local && !/\.(webp|jpg|png|svg|xml|txt|ico)$/.test(path)) err(`${type}.${key} points at ${path}, which the build did not produce`);
      }

      switch (type) {
        case 'Product':
        case 'ProductGroup': {
          if (!n.name) err(`${type} has no name`);
          if (!n.image) err(`${type} "${n.name}" has no image`);
          const hasOffer = n.offers || n.review || n.aggregateRating || n.hasVariant;
          if (!hasOffer) err(`${type} "${n.name}" has neither offers, review nor aggregateRating`);
          if (n.gtin13 && !gtinValid(n.gtin13)) err(`${type} "${n.name}" has GTIN ${n.gtin13}, whose check digit does not add up`);
          if (type === 'ProductGroup') {
            if (!n.productGroupID) warn(`ProductGroup "${n.name}" has no productGroupID`);
            if (!n.variesBy) warn(`ProductGroup "${n.name}" does not say what it variesBy`);
            if (!Array.isArray(n.hasVariant) || !n.hasVariant.length) err(`ProductGroup "${n.name}" has no variants`);
          }
          if (type === 'Product' && !n.sku && !n.gtin13 && !n.mpn) warn(`Product "${n.name}" carries no identifier`);
          break;
        }
        case 'Offer': {
          if (n.price === undefined && !n.priceSpecification) err('an Offer has no price');
          if (n.price !== undefined && !PRICE.test(String(n.price))) err(`an Offer prices at "${n.price}", which is not a bare number`);
          if (!n.priceCurrency) err('an Offer has no priceCurrency');
          else if (!/^[A-Z]{3}$/.test(n.priceCurrency)) err(`an Offer uses currency "${n.priceCurrency}"`);
          if (!n.availability) warn('an Offer does not say whether it is in stock');
          else if (!AVAILABILITY.has(n.availability)) err(`an Offer claims availability "${n.availability}", which is not in the vocabulary`);
          if (n.itemCondition && !CONDITION.has(n.itemCondition)) err(`an Offer claims condition "${n.itemCondition}", which is not in the vocabulary`);
          if (n.priceValidUntil && !ISO_DATE.test(n.priceValidUntil)) err(`an Offer's priceValidUntil "${n.priceValidUntil}" is not a date`);
          break;
        }
        case 'AggregateRating': {
          if (n.ratingValue === undefined) err('an AggregateRating has no ratingValue');
          if (n.reviewCount === undefined && n.ratingCount === undefined) err('an AggregateRating has neither reviewCount nor ratingCount');
          const v = Number(n.ratingValue);
          const best = Number(n.bestRating ?? 5);
          const worst = Number(n.worstRating ?? 1);
          if (Number.isFinite(v) && (v > best || v < worst)) err(`an AggregateRating rates ${v} on a ${worst}–${best} scale`);
          break;
        }
        case 'Review': {
          if (!n.author) err('a Review has no author');
          if (!n.reviewRating) err('a Review has no reviewRating');
          break;
        }
        case 'BreadcrumbList': {
          const items = n.itemListElement || [];
          if (!items.length) err('a BreadcrumbList is empty');
          items.forEach((li, i) => {
            if (li.position !== i + 1) err(`a breadcrumb is at position ${li.position} where ${i + 1} was expected`);
            if (!li.name) err(`breadcrumb ${i + 1} has no name`);
            // The last crumb is the current page and may omit its own link.
            if (!li.item && i < items.length - 1) err(`breadcrumb ${i + 1} "${li.name}" has no item`);
          });
          break;
        }
        case 'FAQPage': {
          const qs = n.mainEntity || [];
          if (!qs.length) err('a FAQPage has no questions');
          for (const q of qs) {
            if (!q.name) err('a FAQ question has no name');
            const text = q.acceptedAnswer?.text;
            if (!text) err(`the FAQ question "${(q.name || '').slice(0, 40)}" has no answer text`);
          }
          break;
        }
        case 'Article':
        case 'BlogPosting': {
          if (!n.headline) err(`${type} has no headline`);
          else if (n.headline.length > 110) warn(`${type} headline is ${n.headline.length} chars; Google truncates past 110`);
          if (!n.image) warn(`${type} "${(n.headline || '').slice(0, 40)}" has no image`);
          if (!n.datePublished) err(`${type} has no datePublished`);
          else if (!ISO_DATE.test(n.datePublished)) err(`${type} datePublished "${n.datePublished}" is not a date`);
          if (n.dateModified && !ISO_DATE.test(n.dateModified)) err(`${type} dateModified "${n.dateModified}" is not a date`);
          const authors = n.author ? [deref(n.author)].flat() : [];
          if (!authors.length) err(`${type} has no author`);
          else if (!authors.every((a) => a?.name && a?.['@type'])) err(`${type} author needs both @type and name — an unresolved reference counts as neither`);
          break;
        }
        case 'Organization': {
          if (!n.name) err('Organization has no name');
          if (!n.url) err('Organization has no url');
          if (!n.logo) warn('Organization has no logo');
          break;
        }
        case 'ItemList': {
          const items = n.itemListElement || [];
          if (!items.length) err('an ItemList is empty');
          items.forEach((li, i) => {
            if (li.position !== i + 1) err(`an ItemList entry is at position ${li.position} where ${i + 1} was expected`);
            if (!li.url && !li.item) err(`ItemList entry ${i + 1} has neither url nor item`);
          });
          break;
        }
        case 'HowTo': {
          if (!n.name) err('a HowTo has no name');
          const steps = n.step || [];
          if (!steps.length) err(`the HowTo "${n.name}" has no steps`);
          steps.forEach((s, i) => {
            if (!s.text && !s.itemListElement) err(`HowTo step ${i + 1} has no text`);
          });
          break;
        }
        case 'MerchantReturnPolicy': {
          if (!n.returnPolicyCategory) err('a MerchantReturnPolicy has no returnPolicyCategory');
          else if (!RETURN_CATEGORY.has(n.returnPolicyCategory)) err(`a MerchantReturnPolicy uses category "${n.returnPolicyCategory}", which is not in the vocabulary`);
          if (n.returnPolicyCategory?.endsWith('FiniteReturnWindow') && n.merchantReturnDays === undefined) err('a finite return window does not say how many days');
          break;
        }
        case 'OfferShippingDetails': {
          if (!n.shippingDestination) err('OfferShippingDetails has no shippingDestination');
          if (!n.deliveryTime) warn('OfferShippingDetails gives no deliveryTime');
          else if (!n.deliveryTime.transitTime) warn('OfferShippingDetails gives a handling time but no transit time');
          break;
        }
      }
    }
  }
}

console.log(`${pages} pages carry structured data, ${nodes} nodes in all`);
console.log(
  [...seenTypes.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => `  ${String(n).padStart(5)} ${t}`)
    .join('\n'),
);

const uniq = (a) => [...new Set(a)];
const showErrors = uniq(errors);
const showWarnings = uniq(warnings);

if (showWarnings.length) {
  console.log(`\n${showWarnings.length} recommendations:`);
  showWarnings.slice(0, 20).forEach((w) => console.log('  ·', w));
  if (showWarnings.length > 20) console.log(`  … and ${showWarnings.length - 20} more`);
}
if (showErrors.length) {
  console.log(`\n${showErrors.length} problems:`);
  showErrors.slice(0, 30).forEach((e) => console.log('  -', e));
  if (showErrors.length > 30) console.log(`  … and ${showErrors.length - 30} more`);
  process.exit(1);
}
console.log('\nno problems');
