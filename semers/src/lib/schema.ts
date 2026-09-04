/**
 * schema.org builders. Every page emits one @graph; product pages add
 * Product/ProductGroup with Offers so Google can show price and availability
 * in search results.
 */
import { site } from '~/data/site';
import { LOCALES } from '~/i18n/config';
import { FLAVORS, type Product } from '~/data/products';
import { imgSrc } from '~/data/images';

export function organization(origin: string) {
  // Only real profile URLs; a bare domain (the env placeholder) would claim the network's homepage is ours.
  const sameAs = Object.values(site.social).filter((u) => /^https?:\/\/[^/]+\/.+/.test(u));
  return {
    '@type': 'Organization',
    '@id': `${origin}/#org`,
    name: site.brand.name,
    legalName: site.brand.legalName,
    url: `${origin}/`,
    logo: `${origin}/logo.png`,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.locality,
      addressCountry: site.countryCode,
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function webSite(origin: string) {
  return {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: site.brand.name,
    publisher: { '@id': `${origin}/#org` },
    // One WebSite node serves all three languages, so it names all three rather
    // than claiming the site is English and the other two are something else.
    inLanguage: [...LOCALES],
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${origin}/shop/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbs(origin: string, trail: { name: string; href: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: new URL(t.href, origin).toString(),
    })),
  };
}

export function faqPage(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

/** GTIN property keyed by code length; the LV market uses EAN-13, the flourless line carries UPC-A (12 digits). */
function gtinProp(gtin?: string) {
  if (!gtin) return {};
  const key = ({ 8: 'gtin8', 12: 'gtin12', 13: 'gtin13', 14: 'gtin14' } as Record<number, string>)[gtin.length] ?? 'gtin';
  return { [key]: gtin };
}

function absImg(origin: string, key: string) {
  const s = imgSrc(key);
  return s.startsWith('http') ? s : new URL(s, origin).toString();
}

/** Bundles sold as "ships free" regardless of the threshold; mirrors FREE_SHIP_SLUGS in src/scripts/site.ts. */
const FREE_SHIP_SLUGS = new Set(['tasting-box']);

/**
 * `flavourLabels` comes from the page's dictionary so the variant a shopper
 * reads and the variant Google reads are named the same thing; without it the
 * English labels are used, which is right for the English pages.
 */
export function productSchema(origin: string, p: Product, flavourLabels?: Record<string, string>) {
  const flavour = (key: string) => flavourLabels?.[key] ?? FLAVORS[key as keyof typeof FLAVORS].label;
  const url = `${origin}/products/${p.slug}/`;
  const images = p.images.map((k) => absImg(origin, k));
  const shipRate = FREE_SHIP_SLUGS.has(p.slug) ? 0 : site.shipping.flatRate;
  const base = {
    name: p.title,
    description: p.summary,
    brand: { '@type': 'Brand', name: p.brand },
    image: images,
    url,
    category: 'Food & Beverages > Snacks',
    weight: { '@type': 'QuantitativeValue', value: p.weightGrams, unitCode: 'GRM' },
  };
  const offer = (price: number, gtin?: string, sku?: string) => ({
    '@type': 'Offer',
    url,
    priceCurrency: site.currency,
    price: price.toFixed(2),
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    ...(sku ? { sku } : {}),
    ...gtinProp(gtin),
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      // Flat Baltic rate for a single item (every product is under the free-shipping threshold on its own), 0 for bundles that ship free.
      shippingRate: { '@type': 'MonetaryAmount', value: shipRate.toFixed(2), currency: site.currency },
      shippingDestination: ['LV', 'LT', 'EE'].map((c) => ({ '@type': 'DefinedRegion', addressCountry: c })),
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        // Both halves, because Google adds them to show one delivery estimate and
        // shows none at all with only the first. The figures are the ones on
        // /legal/shipping-returns/: dispatched in 1–2 business days, 1–3 in transit
        // to the Baltic destinations named above.
        handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
      },
    },
    // Mirrors /legal/shipping-returns/: 14 days, sealed goods only, customer pays return postage, full refund.
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: ['LV', 'LT', 'EE'],
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 14,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      refundType: 'https://schema.org/FullRefund',
      itemCondition: 'https://schema.org/NewCondition',
      merchantReturnLink: `${origin}/legal/shipping-returns/`,
    },
  });

  if (p.variants.length === 1) {
    const v = p.variants[0];
    return {
      '@type': 'Product',
      '@id': `${url}#product`,
      ...base,
      sku: `${p.slug}:${v.key}`,
      ...gtinProp(v.gtin),
      offers: offer(v.price ?? p.price, v.gtin, `${p.slug}:${v.key}`),
    };
  }

  return {
    '@type': 'ProductGroup',
    '@id': `${url}#group`,
    ...base,
    productGroupID: p.slug,
    // schema.org has no "flavor" term, so the varying attribute is carried on each variant as a PropertyValue.
    // variesBy names that PropertyValue, which is how a reader knows the variants
    // are one product in three flavours rather than three products. It stays in
    // English on every locale: the value beside it is translated, but the name is
    // the key the two sides are matched on.
    variesBy: 'Flavour',
    hasVariant: p.variants.map((v) => ({
      '@type': 'Product',
      name: `${p.title} — ${flavour(v.key)}`,
      sku: `${p.slug}:${v.key}`,
      ...gtinProp(v.gtin),
      additionalProperty: { '@type': 'PropertyValue', name: 'Flavour', value: flavour(v.key) },
      image: images[0],
      offers: offer(v.price ?? p.price, v.gtin, `${p.slug}:${v.key}`),
    })),
  };
}

export function itemList(origin: string, products: Product[]) {
  return {
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${origin}/products/${p.slug}/`,
      name: p.title,
    })),
  };
}

export function article(origin: string, a: { title: string; description: string; href: string; date: string; image: string }) {
  return {
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    dateModified: a.date,
    image: absImg(origin, a.image),
    author: { '@id': `${origin}/#org` },
    publisher: { '@id': `${origin}/#org` },
    mainEntityOfPage: new URL(a.href, origin).toString(),
  };
}

export function graph(nodes: unknown[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });
}
