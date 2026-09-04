import type { Locale } from '~/i18n/config';

/**
 * Which font files a page should preload, by language.
 *
 * Every face is scoped to a unicode-range, so a page reads only the subsets its
 * own script needs: a Russian page never touches the Latin files and an English
 * one never touches the Cyrillic. A preload list that ignores that spends the
 * first two connections on files the page will not use and leaves the ones it
 * will to be discovered after the stylesheet parses — which is the swap the
 * preload exists to prevent.
 *
 * Latvian sets most of its text from the latin subset and reaches into
 * latin-ext only for ā, ē, ī, ū and the accented consonants, so it preloads
 * what English does and lets latin-ext follow.
 */
export const FONT_PRELOAD: Record<Locale, string[]> = {
  en: ['/fonts/fraunces-normal-latin.woff2', '/fonts/instrument-sans-normal-latin.woff2'],
  lv: ['/fonts/fraunces-normal-latin.woff2', '/fonts/instrument-sans-normal-latin.woff2'],
  ru: ['/fonts/literata-normal-cyrillic.woff2', '/fonts/inter-normal-cyrillic.woff2'],
};

/**
 * The display italic, for the one page whose headline is set in it. Same rule:
 * the Russian hero reads "99% яблока." and wants Literata, not Fraunces.
 */
export const FONT_PRELOAD_ITALIC: Record<Locale, string> = {
  en: '/fonts/fraunces-italic-latin.woff2',
  lv: '/fonts/fraunces-italic-latin.woff2',
  ru: '/fonts/literata-italic-cyrillic.woff2',
};
