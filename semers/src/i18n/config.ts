/**
 * Languages the shop is sold in.
 *
 * English stays at the root (`/shop/`); every other locale gets a prefix
 * (`/ru/shop/`, `/lv/shop/`). Adding a language is one entry here plus a
 * dictionary in ui.ts and content.ts — no routing or page changes.
 *
 * Why these three: the company is Latvian and sells at home in Latvian, the
 * owner's own properties already sell in Russian, and English carries the rest
 * of the EU. German and Swedish are the obvious next pair (semers.org already
 * runs them) and slot in the same way.
 */
export const LOCALES = ['en', 'ru', 'lv'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_META: Record<Locale, { label: string; native: string; ogLocale: string; intl: string }> = {
  en: { label: 'English', native: 'English', ogLocale: 'en_GB', intl: 'en-IE' },
  ru: { label: 'Russian', native: 'Русский', ogLocale: 'ru_RU', intl: 'ru-RU' },
  lv: { label: 'Latvian', native: 'Latviski', ogLocale: 'lv_LV', intl: 'lv-LV' },
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

/**
 * Turn a canonical English path into the same page in `locale`.
 * `/shop/` + ru → `/ru/shop/`; the root becomes `/ru/`, not `/ru`.
 */
export function localePath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === '/' ? `/${locale}/` : `/${locale}${clean}`;
}

/** Split a request path into its locale and the English path underneath it. */
export function stripLocale(path: string): { locale: Locale; path: string } {
  const m = /^\/(ru|lv)(?=\/|$)/.exec(path);
  if (!m) return { locale: DEFAULT_LOCALE, path };
  const rest = path.slice(m[0].length);
  return { locale: m[1] as Locale, path: rest || '/' };
}

/**
 * getStaticPaths entry for a page that exists in every language. The default
 * locale gets `undefined` so the rest parameter collapses and the English page
 * keeps its bare URL.
 */
export function localeParams(): { params: { locale: string | undefined }; props: { locale: Locale } }[] {
  return LOCALES.map((locale) => ({
    params: { locale: locale === DEFAULT_LOCALE ? undefined : locale },
    props: { locale },
  }));
}

/**
 * Multiply a page's own getStaticPaths entries by the locales, for the routes
 * that already have a parameter of their own (a product slug, a collection, a
 * box size). Each entry keeps its params and props and gains the locale.
 */
export function withLocales<P extends Record<string, string>, R extends Record<string, unknown>>(
  entries: { params: P; props: R }[],
): { params: P & { locale: string | undefined }; props: R & { locale: Locale } }[] {
  return LOCALES.flatMap((locale) =>
    entries.map((e) => ({
      params: { ...e.params, locale: locale === DEFAULT_LOCALE ? undefined : locale },
      props: { ...e.props, locale },
    })),
  );
}
