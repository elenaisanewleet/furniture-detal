/**
 * Generated translations of the catalogue copy. Regenerate rather than hand-edit
 * where possible; the shapes are enforced by src/data/copy.ts.
 *
 * Every number, weight, percentage and allergen in here was checked against the
 * English before it was committed. Brand names (Semers, App'Lite, PastiLite,
 * Belevini, Maxima, Barbora) stay in Latin script on purpose.
 */
import type { Locale } from '~/i18n/config';
import type { CollectionCopy, FaqCopy, ProductCopy } from './copy';

/** slug → copy */
export const PRODUCT_COPY: Partial<Record<Locale, Record<string, ProductCopy>>> = {};

/** collection key → copy */
export const COLLECTION_COPY: Partial<Record<Locale, Record<string, CollectionCopy>>> = {};

/** English question → translated question and answer */
export const FAQ_COPY: Partial<Record<Locale, Record<string, FaqCopy>>> = {};
