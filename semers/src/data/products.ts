/**
 * Product catalog — the single source of truth for shop pages, product
 * pages, cart, JSON-LD and the sitemap.
 *
 * Names, weights and EAN/GTIN codes come from the Semers order form
 * (EAN sheets, LV market). Prices are launch placeholders in EUR incl. VAT:
 * >>> TODO Semers: set final retail prices before launch (edit `price`). <<<
 * Nutrition values are typical per 100 g for baked-apple pastila and must be
 * verified against the pack before publishing (see `nutrition`).
 */
import { DEFAULT_LOCALE, LOCALE_META, type Locale } from '~/i18n/config';

export type FlavorKey =
  | 'classic'
  | 'berry'
  | 'cinnamon'
  | 'cherry'
  | 'blueberry'
  | 'lingonberry'
  | 'blackcurrant'
  | 'pine'
  | 'cranberry'
  | 'apple'
  | 'vanilla'
  | 'chocolate'
  | 'assorted';

export const FLAVORS: Record<FlavorKey, { label: string; color: string; note: string }> = {
  classic: { label: 'Classic', color: 'var(--fl-classic)', note: 'Pure baked Antonovka apple' },
  berry: { label: 'Berry Mix', color: 'var(--fl-berry)', note: 'Apple with blueberry & cranberry' },
  cinnamon: { label: 'Cinnamon', color: 'var(--fl-cinnamon)', note: 'Apple with cinnamon' },
  cherry: { label: 'Cherry', color: 'var(--fl-cherry)', note: 'Apple with sour cherry' },
  blueberry: { label: 'Blueberry', color: 'var(--fl-blueberry)', note: 'Apple with wild blueberry' },
  lingonberry: { label: 'Lingonberry', color: 'var(--fl-lingonberry)', note: 'Apple with forest lingonberry' },
  blackcurrant: { label: 'Black Currant', color: 'var(--fl-blackcurrant)', note: 'Apple with black currant' },
  pine: { label: 'Pine Nut', color: 'var(--fl-pine)', note: 'Apple with pine nuts' },
  cranberry: { label: 'Cranberry', color: 'var(--fl-cranberry)', note: 'Apple with cranberry' },
  apple: { label: 'Antonovka Apple', color: 'var(--fl-apple)', note: 'Classic apple zephyr' },
  vanilla: { label: 'Vanilla', color: 'var(--fl-vanilla)', note: 'Soft vanilla zephyr' },
  chocolate: { label: 'Chocolate-covered', color: 'var(--fl-chocolate)', note: 'Apple zephyr in dark chocolate' },
  assorted: { label: 'Assorted', color: 'var(--fl-assorted)', note: 'A mix of our favourites' },
};

export type DietTag = 'no-added-sugar' | 'gluten-free' | 'flourless' | 'vegetarian' | 'no-preservatives' | 'high-fibre';

export const DIET_TAGS: Record<DietTag, string> = {
  'no-added-sugar': 'No added sugar',
  'gluten-free': 'Gluten free',
  flourless: 'Flourless',
  vegetarian: 'Vegetarian',
  'no-preservatives': 'No preservatives',
  'high-fibre': 'Source of fibre',
};

export interface Variant {
  /** Stable id used in the cart: `${product.slug}:${variant.key}` */
  key: FlavorKey;
  /** Latvian-market EAN/GTIN-13 when known. */
  gtin?: string;
  /** Override the product price for this variant (EUR). */
  price?: number;
  inStock?: boolean;
}

export interface Nutrition {
  /** per 100 g */
  energyKcal: number;
  fat: number;
  saturates: number;
  carbs: number;
  sugars: number;
  fibre: number;
  protein: number;
  salt: number;
}

export interface Product {
  slug: string;
  /** Short display name, e.g. "Apple Bar". */
  name: string;
  /** Full name for titles, e.g. "App'Lite Apple Bar 35 g". */
  title: string;
  /** Packaging brand. */
  brand: string;
  collection: CollectionKey;
  weightGrams: number;
  /** Units per retail pack (1 for single bars). */
  pack: number;
  /** Retail price EUR incl. VAT, per unit. */
  price: number;
  /** Optional strike-through price. */
  compareAt?: number;
  /** Short punchy line for cards. */
  hook: string;
  /** 1–2 sentences for meta description and card hover. */
  summary: string;
  /** Long-form description paragraphs. */
  description: string[];
  ingredients: string;
  /** Allergen statement. */
  allergens: string;
  nutrition: Nutrition;
  /** Approximate kcal per single unit (bar/pack), for the comparison UI. */
  kcalPerUnit: number;
  diet: DietTag[];
  variants: Variant[];
  /** Image keys resolved through src/data/images.ts. */
  images: string[];
  /** Accent color for the card background. */
  accent: string;
  badge?: string;
  bestseller?: boolean;
  new?: boolean;
  shelfLifeMonths: number;
  /** Ordering weight for listings (lower first). */
  order: number;
}

export type CollectionKey =
  | 'apple-bars'
  | 'flourless-bars'
  | 'meringues'
  | 'applite'
  | 'pastila'
  | 'zephyr'
  | 'gift-sets';

export interface Collection {
  key: CollectionKey;
  name: string;
  title: string;
  description: string;
  /** Longer SEO intro rendered above the grid. */
  intro: string;
  image: string;
  accent: string;
}

export const COLLECTIONS: Collection[] = [
  {
    key: 'apple-bars',
    name: 'Apple bars',
    title: 'Apple Bars — 99% baked apples, no added sugar',
    description:
      "App'Lite Apple Bars: a 35 g snack made from 99% baked Antonovka apples and egg white. No added sugar, no flour, no gluten. Around 97 kcal per bar.",
    intro:
      'A chocolate-bar-sized snack with the ingredient list of a baked apple. Whipped, layered and slowly dried the traditional Belyov way, then cut into bars you can keep in a bag, a lunchbox or a desk drawer.',
    image: 'hero-bars',
    accent: 'var(--mint-100)',
  },
  {
    key: 'flourless-bars',
    name: 'Flourless bars',
    title: 'Flourless Apple Bars 50 g — dense, fruity, no flour',
    description:
      'Flourless 50 g bars made from baked apples, egg white and real fruit. No flour, no gluten, no added sugar. Original, cranberry, cinnamon and blueberry.',
    intro:
      'The heartier bar. Fifty grams of baked apple pressed with whole berries for a chewier bite and longer energy. Everything a flapjack wants to be, without the flour.',
    image: 'flourless-bar',
    accent: 'var(--honey-100)',
  },
  {
    key: 'meringues',
    name: 'Apple meringues',
    title: 'PastiLite Apple Meringues — crispy, no added sugar',
    description:
      'PastiLite crispy meringues made from baked apples, egg white and berries. Three ingredients, no added sugar. A light 35 g bag that melts in your mouth.',
    intro:
      'Take the same whipped apple base, bake it until it crackles, and you get a meringue with no sugar to add. Light as air, surprisingly filling, dangerously easy to finish.',
    image: 'meringue',
    accent: 'var(--coral-100)',
  },
  {
    key: 'applite',
    name: "App'Lite dessert",
    title: "App'Lite Baked Apple Dessert — no added sugar",
    description:
      "App'Lite baked apple dessert: a 50 g pastila square made from 99% baked apples with no added sugar. Classic, Berry Mix and Cinnamon.",
    intro:
      'The dessert format of our apple pastila. A thick, soft 50 g square that eats like a slice of apple pie filling. Perfect with tea, coffee or a spoon of yoghurt.',
    image: 'pastila-texture',
    accent: 'var(--cream-2)',
  },
  {
    key: 'pastila',
    name: 'Belyov pastila',
    title: 'Belyov Apple Pastila 100 g & 180 g — no added sugar',
    description:
      'Traditional Belyov apple pastila with no added sugar: baked Antonovka apples and egg white, whipped and dried in layers. 100 g and 180 g loaves.',
    intro:
      'The original. A recipe from 1888: baked Antonovka apples whipped with egg white, spread in thin layers and dried for hours until it becomes a soft, airy loaf. Slice it, share it, or eat it straight from the pack.',
    image: 'pastila-180',
    accent: 'var(--bar-300)',
  },
  {
    key: 'zephyr',
    name: 'Zephyr',
    title: 'Belevini Zephyr — soft apple marshmallow',
    description:
      'Belevini zephyr: the soft apple marshmallow of Eastern Europe, made with Antonovka apple purée, egg white, sugar and agar. Four kinds, 250 g boxes.',
    intro:
      'Zephyr is what a marshmallow becomes when it is made from apple purée and set with agar instead of gelatine. Cloud-soft, gently sweet, with a real apple tang underneath.',
    image: 'zephyr',
    accent: 'var(--coral-100)',
  },
  {
    key: 'gift-sets',
    name: 'Gift sets & boxes',
    title: 'Apple Snack Gift Sets & Tasting Boxes',
    description:
      'Curated boxes of apple bars, meringues and pastila. Tasting boxes, 12-packs and discovery sets with no added sugar, packed and shipped from Riga.',
    intro:
      'Boxes we would want to receive: a bit of everything, packed to survive the post, with a card if you ask for one.',
    image: 'gift-box',
    accent: 'var(--honey-100)',
  },
];

const PASTILA_NUTRITION: Nutrition = {
  energyKcal: 278,
  fat: 0.4,
  saturates: 0.1,
  carbs: 61,
  sugars: 56,
  fibre: 5.2,
  protein: 3.6,
  salt: 0.05,
};

const MERINGUE_NUTRITION: Nutrition = {
  energyKcal: 312,
  fat: 0.5,
  saturates: 0.1,
  carbs: 68,
  sugars: 62,
  fibre: 4.5,
  protein: 5.2,
  salt: 0.08,
};

const ZEPHYR_NUTRITION: Nutrition = {
  energyKcal: 320,
  fat: 0.2,
  saturates: 0.1,
  carbs: 78,
  sugars: 70,
  fibre: 1.5,
  protein: 1.2,
  salt: 0.06,
};

export const PRODUCTS: Product[] = [
  {
    slug: 'apple-bar-35g',
    name: 'Apple Bar',
    title: "App'Lite Apple Bar 35 g",
    brand: "App'Lite",
    collection: 'apple-bars',
    weightGrams: 35,
    pack: 1,
    price: 1.45,
    hook: '99% baked apples. That’s the whole idea.',
    summary:
      'A 35 g bar of whipped, layered baked Antonovka apple. No added sugar, no flour, no gluten — about 97 kcal. Made in Riga, keeps 12 months.',
    description: [
      'Take a chocolate bar out of the drawer. Put this in instead. Same size, same “I need something now” moment, but the ingredient list reads: baked apples, egg white. That is it.',
      'We bake Antonovka apples until they are soft and caramel-sweet, whip the purée with egg white, spread it thin and dry it slowly in layers. The result is a bar that is soft, slightly chewy, and tastes like the inside of a baked apple.',
      'Around 97 kcal per bar, naturally sweet from the fruit, with fibre from the apple skins. Keeps for months without preservatives because the slow drying does the work.',
    ],
    ingredients: 'Baked apples (99%), egg white. Berry Mix: baked apples, egg white, blueberry, cranberry. Cinnamon: baked apples, egg white, cinnamon.',
    allergens: 'Contains egg. May contain traces of nuts.',
    nutrition: PASTILA_NUTRITION,
    kcalPerUnit: 97,
    diet: ['no-added-sugar', 'gluten-free', 'flourless', 'vegetarian', 'no-preservatives', 'high-fibre'],
    variants: [
      { key: 'classic', gtin: '4751043820181' },
      { key: 'berry', gtin: '4751043820174' },
      { key: 'cinnamon' },
    ],
    images: ['packshot-classic', 'packshot-berry', 'hero-bars', 'lifestyle-desk'],
    accent: 'var(--mint-100)',
    badge: 'Bestseller',
    bestseller: true,
    shelfLifeMonths: 12,
    order: 10,
  },
  {
    slug: 'flourless-apple-bar-50g',
    name: 'Flourless Apple Bar',
    title: 'Flourless Apple Bar 50 g',
    brand: 'Flourless',
    collection: 'flourless-bars',
    weightGrams: 50,
    pack: 1,
    price: 1.95,
    hook: 'The heartier bar. Whole berries, zero flour.',
    summary:
      'A dense 50 g bar of baked apple pressed with whole berries. No flour, no gluten, no added sugar. Original, Cranberry, Cinnamon, Blueberry.',
    description: [
      'Fifty grams of baked apple pastila, pressed with real dried berries for a chewier, fruitier bite. It is the bar we take on long walks and long meetings.',
      'Like everything we make, it is sweetened only by the apples themselves. No flour, no syrups, no “natural flavours” — just fruit, egg white and time.',
    ],
    ingredients: 'Baked apples, egg white, dried berries (cranberry, blueberry) or cinnamon depending on flavour.',
    allergens: 'Contains egg. May contain traces of nuts.',
    nutrition: { ...PASTILA_NUTRITION, energyKcal: 285, fibre: 5.8 },
    kcalPerUnit: 142,
    diet: ['no-added-sugar', 'gluten-free', 'flourless', 'vegetarian', 'no-preservatives', 'high-fibre'],
    variants: [
      { key: 'classic', gtin: '850039474002' },
      { key: 'cranberry', gtin: '850039474026' },
      { key: 'cinnamon', gtin: '850039474033' },
      { key: 'blueberry', gtin: '850039474019' },
    ],
    images: ['flourless-bar', 'pastila-texture', 'flatlay-lunchbox'],
    accent: 'var(--honey-100)',
    shelfLifeMonths: 12,
    order: 20,
  },
  {
    slug: 'apple-meringue-35g',
    name: 'Apple Meringue',
    title: 'PastiLite Apple Meringues 35 g',
    brand: 'PastiLite',
    collection: 'meringues',
    weightGrams: 35,
    pack: 1,
    price: 2.2,
    hook: 'Crispy, airy, and sweet without a grain of sugar.',
    summary:
      'Crispy meringue kisses made from baked apples, egg white and berries. Three ingredients, no added sugar, 35 g of air and crunch.',
    description: [
      'A meringue is usually egg white and a mountain of sugar. Ours is egg white and baked apple. It bakes into the same crackly, melt-away crunch — with the sweetness coming from Antonovka apples instead of the sugar bowl.',
      'Light enough to eat a whole bag, satisfying enough that you probably won’t need to. Great with coffee, crushed over yoghurt, or as the “dessert” in a lunchbox.',
    ],
    ingredients: 'Baked apples, egg white. Berry Mix: baked apples, egg white, berries (blueberry, cranberry).',
    allergens: 'Contains egg.',
    nutrition: MERINGUE_NUTRITION,
    kcalPerUnit: 109,
    diet: ['no-added-sugar', 'gluten-free', 'flourless', 'vegetarian', 'no-preservatives'],
    variants: [
      { key: 'classic', gtin: '4751043820204' },
      { key: 'berry', gtin: '4751043820211' },
      { key: 'cinnamon' },
    ],
    images: ['meringue-pouch', 'meringue', 'pastila-texture'],
    accent: 'var(--coral-100)',
    badge: 'New',
    new: true,
    shelfLifeMonths: 9,
    order: 30,
  },
  {
    slug: 'applite-baked-apple-dessert-50g',
    name: "App'Lite Dessert",
    title: "App'Lite Baked Apple Dessert 50 g",
    brand: "App'Lite",
    collection: 'applite',
    weightGrams: 50,
    pack: 1,
    price: 2.45,
    hook: 'Apple pie filling, without the pie.',
    summary:
      'A thick 50 g square of baked-apple pastila with no added sugar. Classic, Berry Mix or Cinnamon. Eat with tea, coffee or yoghurt.',
    description: [
      'The dessert cut of our pastila: thicker, softer, meant for a plate rather than a pocket. Fifty grams of layered baked apple that tastes like a warm apple pie filling.',
      'Serve it with a spoon of yoghurt, crumble it over porridge, or slice it thin on a cheese board. It is sweet, but never sugary.',
    ],
    ingredients: 'Baked apples (99%), egg white. Berry Mix adds blueberry and cranberry; Cinnamon adds cinnamon.',
    allergens: 'Contains egg. May contain traces of nuts.',
    nutrition: PASTILA_NUTRITION,
    kcalPerUnit: 139,
    diet: ['no-added-sugar', 'gluten-free', 'flourless', 'vegetarian', 'no-preservatives', 'high-fibre'],
    variants: [
      { key: 'classic', gtin: '4751043820013' },
      { key: 'berry', gtin: '4751043820037' },
      { key: 'cinnamon', gtin: '4751043820020' },
    ],
    images: ['pastila-slices', 'pastila-texture', 'pastila-macro'],
    accent: 'var(--cream-2)',
    shelfLifeMonths: 12,
    order: 40,
  },
  {
    slug: 'belyov-apple-pastila-100g',
    name: 'Belyov Apple Pastila',
    title: 'Belyov Apple Pastila 100 g',
    brand: 'Belyov Pastila',
    collection: 'pastila',
    weightGrams: 100,
    pack: 1,
    price: 4.9,
    hook: 'The original 1888 recipe, in a pocket size.',
    summary:
      'A 100 g loaf of traditional Belyov apple pastila with no added sugar: baked Antonovka apples and egg white, whipped and dried in layers.',
    description: [
      'Belyov pastila is the great-grandmother of every apple snack we make. Baked Antonovka apples are whipped with egg white, spread in thin layers, dried for hours, then stacked and dried again.',
      'What you get is an airy, layered loaf with a texture between sponge cake and dried fruit — and the honest, slightly tart taste of a baked apple. The 100 g loaf is the one to try first.',
    ],
    ingredients: 'Baked apples, egg white. Flavoured versions add berries (lingonberry, cherry, blueberry, black currant) or cinnamon.',
    allergens: 'Contains egg. May contain traces of nuts.',
    nutrition: PASTILA_NUTRITION,
    kcalPerUnit: 278,
    diet: ['no-added-sugar', 'gluten-free', 'flourless', 'vegetarian', 'no-preservatives', 'high-fibre'],
    variants: [
      { key: 'classic', gtin: '4751043820198' },
      { key: 'berry', gtin: '4751043820228' },
      { key: 'lingonberry', gtin: '4751043820235' },
      { key: 'cherry', gtin: '4751043820419' },
      { key: 'blackcurrant' },
    ],
    images: ['pastila-100-pack', 'pastila-slices', 'pastila-macro'],
    accent: 'var(--bar-300)',
    bestseller: true,
    shelfLifeMonths: 12,
    order: 50,
  },
  {
    slug: 'belyov-apple-pastila-180g',
    name: 'Belyov Apple Pastila',
    title: 'Belyov Apple Pastila 180 g',
    brand: 'Belyov Pastila',
    collection: 'pastila',
    weightGrams: 180,
    pack: 1,
    price: 7.9,
    hook: 'The family loaf. Seven flavours, zero added sugar.',
    summary:
      'The full 180 g loaf of Belyov apple pastila with no added sugar, in seven flavours from Classic to Pine Nut. Slice it for the table.',
    description: [
      'The loaf that started it all, in the size made for sharing. One hundred and eighty grams of layered baked apple, dried slowly until it is soft, airy and keeps for months without preservatives.',
      'Classic is pure Antonovka. Cinnamon is what autumn tastes like. Cherry and Black Currant are bright and tart, Blueberry and Lingonberry are forest-sweet, and Pine Nut adds a buttery crunch between the layers.',
    ],
    ingredients: 'Baked apples, egg white. Flavoured versions add berries, cinnamon or pine nuts.',
    allergens: 'Contains egg. Pine Nut variant contains nuts. May contain traces of nuts.',
    nutrition: PASTILA_NUTRITION,
    kcalPerUnit: 500,
    diet: ['no-added-sugar', 'gluten-free', 'flourless', 'vegetarian', 'no-preservatives', 'high-fibre'],
    variants: [
      { key: 'classic', gtin: '4751043820341' },
      { key: 'cinnamon', gtin: '4751043820389' },
      { key: 'cherry', gtin: '4751043820396' },
      { key: 'blueberry', gtin: '4751043820358' },
      { key: 'lingonberry', gtin: '4751043820334' },
      { key: 'blackcurrant', gtin: '4751043820365' },
      { key: 'pine', gtin: '4751043820426' },
    ],
    images: ['pastila-block', 'pastila-180', 'pastila-slices'],
    accent: 'var(--bar-300)',
    shelfLifeMonths: 12,
    order: 60,
  },
  {
    slug: 'belevini-zephyr-250g',
    name: 'Belevini Zephyr',
    title: 'Belevini Apple Zephyr 250 g',
    brand: 'Belevini',
    collection: 'zephyr',
    weightGrams: 250,
    pack: 1,
    price: 5.9,
    hook: 'Cloud-soft apple zephyr, set with agar.',
    summary:
      'Soft apple zephyr made with Antonovka purée, egg white, sugar and agar. Classic apple, cranberry, assorted, and dark-chocolate-covered. 250 g box.',
    description: [
      'Zephyr is the Eastern European cousin of the marshmallow, made with fruit purée and set with agar instead of gelatine. Ours starts with the same Antonovka apples as our pastila and, unlike everything else we make, is made with sugar; the pack says so.',
      'Cloud-soft, delicately sweet, with a fresh apple tang underneath. The chocolate-covered version is the one that disappears first at the table.',
    ],
    ingredients: 'Apple purée, sugar, egg white, agar. Chocolate-covered: plus dark chocolate (cocoa mass, sugar, cocoa butter, emulsifier: soy lecithin).',
    allergens: 'Contains egg. Chocolate-covered contains soy; may contain milk and traces of nuts.',
    nutrition: ZEPHYR_NUTRITION,
    kcalPerUnit: 800,
    diet: ['gluten-free', 'flourless', 'vegetarian'],
    variants: [
      { key: 'apple', gtin: '4751043820259' },
      { key: 'cranberry', gtin: '4751043820143' },
      { key: 'assorted', gtin: '4751043820266' },
      { key: 'chocolate', gtin: '4751043820129' },
    ],
    images: ['zephyr-box', 'zephyr'],
    accent: 'var(--coral-100)',
    shelfLifeMonths: 3,
    order: 70,
  },
  // ---- Bundles & gift sets --------------------------------------------
  {
    slug: 'tasting-box',
    name: 'Tasting Box',
    title: 'Semers Tasting Box — bars, meringues & pastila',
    brand: 'Semers',
    collection: 'gift-sets',
    weightGrams: 420,
    pack: 1,
    price: 17.9,
    compareAt: 19.0,
    hook: 'Try everything once. Then argue about a favourite.',
    summary:
      'Our starter box: 4 Apple Bars, 2 Flourless Bars, 2 bags of Apple Meringues and a 100 g Belyov pastila loaf. Free shipping.',
    description: [
      'Everything we make, in one box: four App’Lite Apple Bars (two Classic, two Berry Mix), two Flourless Bars, two bags of PastiLite meringues, and a 100 g loaf of Belyov pastila.',
      'It ships free, it makes a good present, and it settles the question of which one to reorder.',
    ],
    ingredients: 'See individual products. All items: baked apples, egg white, fruit or spices.',
    allergens: 'Contains egg. May contain traces of nuts.',
    nutrition: PASTILA_NUTRITION,
    kcalPerUnit: 0,
    diet: ['no-added-sugar', 'gluten-free', 'flourless', 'vegetarian', 'no-preservatives'],
    variants: [{ key: 'assorted' }],
    images: ['tasting-box', 'gift-box', 'hero-bars'],
    accent: 'var(--honey-100)',
    badge: 'Free shipping',
    bestseller: true,
    shelfLifeMonths: 9,
    order: 5,
  },
  {
    slug: 'apple-bar-12-pack',
    name: 'Apple Bar 12-pack',
    title: "App'Lite Apple Bar 35 g — box of 12",
    brand: "App'Lite",
    collection: 'gift-sets',
    weightGrams: 420,
    pack: 12,
    price: 14.9,
    compareAt: 17.4,
    hook: 'A drawer full of good decisions.',
    summary: 'Twelve App’Lite Apple Bars in one box — Classic, Berry Mix or a half-and-half mix. Saves 14% versus single bars. 99% baked apples, no added sugar.',
    description: [
      'The box we send to offices, gyms and anyone who keeps finding wrappers in coat pockets. Twelve 35 g Apple Bars, sealed individually, in a shelf-friendly box.',
      'Pick a single flavour or let us pack six Classic and six Berry Mix.',
    ],
    ingredients: 'Baked apples (99%), egg white; Berry Mix adds blueberry and cranberry.',
    allergens: 'Contains egg. May contain traces of nuts.',
    nutrition: PASTILA_NUTRITION,
    kcalPerUnit: 97,
    diet: ['no-added-sugar', 'gluten-free', 'flourless', 'vegetarian', 'no-preservatives', 'high-fibre'],
    variants: [{ key: 'classic' }, { key: 'berry' }, { key: 'assorted' }],
    images: ['bar-12-pack', 'packshot-classic', 'packshot-berry'],
    accent: 'var(--mint-100)',
    badge: 'Save 14%',
    shelfLifeMonths: 12,
    order: 15,
  },
  {
    slug: 'pastila-discovery-set',
    name: 'Pastila Discovery Set',
    title: 'Belyov Pastila Discovery Set — 3 × 100 g',
    brand: 'Belyov Pastila',
    collection: 'gift-sets',
    weightGrams: 300,
    pack: 3,
    price: 13.9,
    compareAt: 14.7,
    hook: 'Classic, Cherry, Lingonberry. The holy trinity.',
    summary: 'Three 100 g loaves of Belyov apple pastila — Classic, Cherry and Lingonberry — in a gift sleeve. Baked Antonovka apples and egg white, no added sugar.',
    description: [
      'The three loaves we would put in front of someone who has never tried pastila: the pure Classic, the bright Cherry, and the forest-sweet Lingonberry.',
      'Packed in a kraft gift sleeve. Add a note at checkout and we will write it on the card.',
    ],
    ingredients: 'Baked apples, egg white, cherry or lingonberry depending on loaf.',
    allergens: 'Contains egg. May contain traces of nuts.',
    nutrition: PASTILA_NUTRITION,
    kcalPerUnit: 278,
    diet: ['no-added-sugar', 'gluten-free', 'flourless', 'vegetarian', 'no-preservatives', 'high-fibre'],
    variants: [{ key: 'assorted' }],
    images: ['pastila-set', 'pastila-slices', 'pastila-macro'],
    accent: 'var(--bar-300)',
    shelfLifeMonths: 12,
    order: 25,
  },
];

/**
 * Sizes the mix-and-match box is sold in. Each one is its own page with its own
 * URL and its own per-piece price, so a set can be advertised directly instead
 * of living behind a quantity control; a bigger box earns a bigger discount,
 * the same shape as the volume ladder on a single product.
 */
export const BOX_SIZES = [
  { size: 4, discount: 0.05 },
  { size: 6, discount: 0.1 },
  { size: 8, discount: 0.15 },
] as const;

/** The 6-piece box keeps the bare /shop/build-your-box/ URL it has always had. */
export const BOX_DEFAULT_SIZE = 6;

export function boxHref(size: number): string {
  return size === BOX_DEFAULT_SIZE ? '/shop/build-your-box/' : `/shop/build-your-box/${size}/`;
}

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productsInCollection(key: CollectionKey): Product[] {
  return PRODUCTS.filter((p) => p.collection === key).sort((a, b) => a.order - b.order);
}

export function collectionByKey(key: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.key === key);
}

/*
 * Money is formatted for the language the page is in. English writes €4.90;
 * Russian and Latvian both write 4,90 €. The cart does the same formatting in
 * the browser from the same locale tag, so a price cannot read one way on the
 * page and another way in the cart.
 */
export function formatPrice(eur: number, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(LOCALE_META[locale].intl, { style: 'currency', currency: 'EUR' }).format(eur);
}

/** Whole-euro amounts such as the free-shipping threshold read "€25", not "€25.00". */
export function formatThreshold(eur: number, locale: Locale = DEFAULT_LOCALE): string {
  if (!Number.isInteger(eur)) return formatPrice(eur, locale);
  return new Intl.NumberFormat(LOCALE_META[locale].intl, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(eur);
}

/** The price of 100 g, e.g. "€4.14". The "per 100 g" label comes from the dictionary. */
export function unitPrice(p: Product, locale: Locale = DEFAULT_LOCALE): string {
  return formatPrice(p.price / (p.weightGrams / 100), locale);
}
