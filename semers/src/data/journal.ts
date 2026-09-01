/**
 * Journal articles. Long-form, evergreen SEO content around the questions people
 * actually search for. `body` holds HTML fragments (paragraphs, h2/h3, lists) and
 * is rendered with set:html inside a .prose container.
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
    title: 'What is pastila? The 500-year-old apple sweet with two ingredients',
    description: 'Pastila is a baked-apple confection from Belyov and Kolomna, made from whipped apple purée and egg white. Here is where it comes from, how it is made and why it has no added sugar.',
    date: '2026-08-12',
    readMinutes: 6,
    image: 'pastila-slices',
    tags: ['pastila', 'history'],
    body: '',
  },
  {
    slug: 'healthy-snacks-no-added-sugar',
    title: 'Healthy snacks with no added sugar: what to look for on the label',
    description: 'Most “sugar-free” snack bars hide syrups, sweeteners or fruit concentrates. A practical guide to reading the ingredient list, with a short list of snacks that pass.',
    date: '2026-08-26',
    readMinutes: 7,
    image: 'flatlay-lunchbox',
    tags: ['nutrition', 'guide'],
    body: '',
  },
  {
    slug: 'antonovka-apples',
    title: 'Why Antonovka apples? The sour green apple behind every Semers bar',
    description: 'Antonovka is a hardy, tart, aromatic apple from the north. Its high pectin and acidity are exactly what pastila needs — here is why we will not use anything else.',
    date: '2026-09-01',
    readMinutes: 5,
    image: 'apples-orchard',
    tags: ['ingredients', 'orchard'],
    body: '',
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
export const ARTICLES_SORTED = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
