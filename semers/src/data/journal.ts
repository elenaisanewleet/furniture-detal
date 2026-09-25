/**
 * Journal articles. Long-form, evergreen SEO content around the questions people
 * actually search for. `body` holds HTML fragments (paragraphs, h2/h3, lists) and
 * is rendered with set:html inside a .prose container.
 *
 * The article on one apple variety was deleted on 25.09.2026: the owner has not
 * confirmed the variety, so no page names one.
 */
export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readMinutes: number;
  image: string; // image key
  tags: string[];
  body: string;
}

export const ARTICLES: Article[] = [
  {
    slug: 'what-is-pastila',
    title: 'What is pastila? The apple sweet with two ingredients',
    description: 'Pastila is a baked-apple confection made from whipped apple purée and egg white. Here is how it is made, what it tastes like and why it needs no added sugar.',
    date: '2026-08-12',
    readMinutes: 5,
    image: 'pastila-slices',
    tags: ['pastila', 'guide'],
    body: '',
  },
  {
    slug: 'healthy-snacks-no-added-sugar',
    title: 'Healthy snacks with no added sugar: what to look for on the label',
    description: 'Plenty of snack bars sold as healthy hide syrups, sweeteners or fruit concentrates. A practical guide to reading the ingredient list, with a short list of snacks that pass.',
    date: '2026-08-26',
    readMinutes: 7,
    image: 'flatlay-lunchbox',
    tags: ['nutrition', 'guide'],
    body: '',
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
export const ARTICLES_SORTED = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
