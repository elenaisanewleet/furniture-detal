/**
 * schema.org builders. Every page emits one @graph; product pages add
 * Product/ProductGroup with Offers so Google can show price and availability
 * in search results.
 */
import { site } from '~/data/site';
import { FLAVORS, type Product } from '~/data/products';
import { imgSrc } from '~/data/images';

export function organization(origin: string) {
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
    sameAs: Object.values(site.social).filter(Boolean),
  };
}

export function webSite(origin: string) {
  return {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: site.brand.name,
    publisher: { '@id': `${origin}/#org` },
    inLanguage: 'en',
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

function absImg(origin: string, key: string) {
  const s = imgSrc(key);
  return s.startsWith('http') ? s : new URL(s, origin).toString();
}

export function productSchema(origin: string, p: Product) {
  const url = `${origin}/products/${p.slug}/`;
  const images = p.images.map((k) => absImg(origin, k));
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
    ...(gtin ? { gtin13: gtin } : {}),
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'LV' },
    },
  });

  if (p.variants.length === 1) {
    const v = p.variants[0];
    return {
      '@type': 'Product',
      '@id': `${url}#product`,
      ...base,
      sku: `${p.slug}:${v.key}`,
      ...(v.gtin ? { gtin13: v.gtin } : {}),
      offers: offer(v.price ?? p.price, v.gtin, `${p.slug}:${v.key}`),
    };
  }

  return {
    '@type': 'ProductGroup',
    '@id': `${url}#group`,
    ...base,
    productGroupID: p.slug,
    variesBy: ['https://schema.org/flavor'],
    hasVariant: p.variants.map((v) => ({
      '@type': 'Product',
      name: `${p.title} — ${FLAVORS[v.key].label}`,
      sku: `${p.slug}:${v.key}`,
      ...(v.gtin ? { gtin13: v.gtin } : {}),
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
