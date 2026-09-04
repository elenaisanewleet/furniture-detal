/**
 * Translated catalogue copy, kept apart from the catalogue itself.
 *
 * products.ts stays the single source of truth for everything factual — price,
 * weight, EAN, nutrition, images, flags. This file only carries the words, so a
 * translation can never quietly change a number or drop a variant: a locale may
 * override a text field and nothing else.
 *
 * A locale with no entry for a product falls back to English rather than
 * rendering a gap, which is what makes it safe to add a language a page at a
 * time.
 */
import { DEFAULT_LOCALE, type Locale } from '~/i18n/config';
import type { Collection, Product } from './products';
import type { Faq } from './faq';
import { PRODUCT_COPY, COLLECTION_COPY, FAQ_COPY } from './copy.data';

/** The only product fields a translation is allowed to replace. */
export type ProductCopy = Pick<Product, 'name' | 'title' | 'hook' | 'summary' | 'description' | 'ingredients' | 'allergens'>;
export type CollectionCopy = Pick<Collection, 'name' | 'title' | 'description'>;
export type FaqCopy = Pick<Faq, 'q' | 'a'>;

/** A product with its copy in `locale`, and every other field untouched. */
export function localizedProduct(p: Product, locale: Locale): Product {
  if (locale === DEFAULT_LOCALE) return p;
  const over = PRODUCT_COPY[locale]?.[p.slug];
  return over ? { ...p, ...over } : p;
}

export function localizedProducts(list: Product[], locale: Locale): Product[] {
  return locale === DEFAULT_LOCALE ? list : list.map((p) => localizedProduct(p, locale));
}

export function localizedCollection(c: Collection, locale: Locale): Collection {
  if (locale === DEFAULT_LOCALE) return c;
  const over = COLLECTION_COPY[locale]?.[c.key];
  return over ? { ...c, ...over } : c;
}

export function localizedCollections(list: Collection[], locale: Locale): Collection[] {
  return locale === DEFAULT_LOCALE ? list : list.map((c) => localizedCollection(c, locale));
}

/**
 * FAQs are matched by their English question, which is the only stable
 * identifier the list has; an unmatched entry stays in English.
 */
export function localizedFaqs(list: Faq[], locale: Locale): Faq[] {
  if (locale === DEFAULT_LOCALE) return list;
  const over = FAQ_COPY[locale];
  if (!over) return list;
  return list.map((f) => {
    const t = over[f.q];
    return t ? { ...f, ...t } : f;
  });
}
