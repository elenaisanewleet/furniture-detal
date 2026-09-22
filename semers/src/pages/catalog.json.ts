/**
 * The price list the Worker charges from.
 *
 * A browser can say anything. Once real money is involved, the only prices that
 * may reach Stripe are the ones the shop published, so the Worker recomputes
 * every line from this file and ignores whatever the cart sent beyond the id
 * and the quantity. It is emitted from `src/data/products.ts` at build time, so
 * the price a reader sees and the price a card is charged cannot drift apart.
 *
 * Nothing secret is in here — it is the same catalogue the pages already show.
 * The keys are the cart's own line ids (`slug:variant`, or a bare slug for a
 * product with one flavour), so a cart row maps straight onto a row here.
 */
import { PRODUCTS, FLAVORS } from '~/data/products';
import { site } from '~/data/site';

export const prerender = true;

export async function GET() {
  const items: Record<
    string,
    { slug: string; name: string; title: string; variant: string; price: number; gtin: string; weight: number; pack: number; tier: boolean }
  > = {};

  for (const p of PRODUCTS) {
    const rows = p.variants.length ? p.variants : [null];
    for (const v of rows) {
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

  return new Response(
    JSON.stringify({
      currency: site.currency,
      freeFrom: site.shipping.freeFrom,
      flatRate: site.shipping.flatRate,
      /* Mirrors FREE_SHIP_SLUGS in src/scripts/site.ts — a box that advertises free
         delivery must also be charged that way, or the customer is shown one
         total and billed another. */
      freeShipSlugs: ['tasting-box'],
      items,
    }),
    { headers: { 'content-type': 'application/json; charset=utf-8' } },
  );
}
