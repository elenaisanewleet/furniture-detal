/**
 * The price list the Worker charges from.
 *
 * A browser can say anything. Once real money is involved, the only prices that
 * may reach the payment page are the ones the shop published, so the Worker
 * recomputes every line from this file and ignores whatever the cart sent
 * beyond the id and the quantity. It is emitted from `src/data/products.ts` and
 * `src/data/site.ts` at build time, so the price a reader sees and the price a
 * card is charged cannot drift apart. A product that is not on sale is not in
 * PRODUCTS, so it is not in here either, and a stale cart cannot buy it.
 *
 * Delivery is priced from here too: the parcel-locker flat rate, the courier
 * rate (null until the owner sets one, and then no courier is sold), the
 * countries each reaches, and the free-shipping threshold.
 *
 * Nothing secret is in here — it is the same catalogue the pages already show.
 * The keys are the cart's own line ids (`slug:variant`, or a bare slug for a
 * product with one flavour), so a cart row maps straight onto a row here.
 */
import { PRODUCTS, FLAVORS, BOX_SIZES } from '~/data/products';
import { site } from '~/data/site';

export const prerender = true;

/*
 * The EU member states in ISO 3166 codes: where a courier can go once it has a
 * price. The same list is in src/pages/[...locale]/checkout.astro, which offers
 * them; scripts/test.mjs holds the two copies to each other.
 */
const EU_COUNTRIES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

/*
 * What the build-your-box pages let a shopper put in a box. Mirrors the
 * `sources` list in src/components/BoxBuilder.astro; scripts/test.mjs compares
 * the two, because a box the page can build and the Worker cannot price is a
 * box nobody can pay for.
 */
const BOX_SOURCES = ['apple-bar-35g', 'flourless-apple-bar-50g', 'apple-meringue-35g'];

export async function GET() {
  const items: Record<
    string,
    { slug: string; name: string; title: string; variant: string; price: number; gtin: string; weight: number; pack: number; tier: boolean }
  > = {};

  for (const p of PRODUCTS) {
    const rows = p.variants.length ? p.variants : [null];
    for (const v of rows) {
      // A flavour marked out of stock is not for sale, whatever the product is.
      if (v && v.inStock === false) continue;
      const key = v ? `${p.slug}:${v.key}` : p.slug;
      items[key] = {
        slug: p.slug,
        name: p.name,
        title: p.title,
        variant: v ? FLAVORS[v.key].label : '',
        price: v?.price ?? p.price,
        gtin: v?.gtin ?? '',
        weight: p.weightGrams,
        pack: p.pack,
        tier: true,
      };
    }
  }

  /* English names, because that is what the checkout form sends as the country. */
  const english = new Intl.DisplayNames(['en'], { type: 'region' });
  const countryNames = Object.fromEntries(EU_COUNTRIES.map((code) => [code, english.of(code) || code]));
  const codeOf = (name: string) => EU_COUNTRIES.find((code) => countryNames[code] === name) || '';
  const lockerCountries = site.shipping.lockerCountries.map(codeOf).filter(Boolean);
  const rate = site.shipping.courierRate;
  const courierRate = typeof rate === 'number' && Number.isFinite(rate) && rate >= 0 ? rate : null;

  return new Response(
    JSON.stringify({
      currency: site.currency,
      freeFrom: site.shipping.freeFrom,
      /* Omniva parcel locker, in the countries below. */
      flatRate: site.shipping.flatRate,
      lockerCountries,
      /* null means no courier is sold, and courierCountries is empty to match. */
      courierRate,
      courierCountries: courierRate === null ? [] : EU_COUNTRIES,
      countryNames,
      /* Mirrors FREE_SHIP_SLUGS in src/scripts/site.ts — a box that advertises free
         delivery must also be charged that way, or the customer is shown one
         total and billed another. */
      freeShipSlugs: ['tasting-box'],
      boxes: {
        sizes: BOX_SIZES.map((b) => ({ size: b.size, discount: b.discount })),
        items: Object.keys(items).filter((key) => BOX_SOURCES.includes(items[key].slug)),
      },
      items,
    }),
    { headers: { 'content-type': 'application/json; charset=utf-8' } },
  );
}
