/**
 * Product catalog — the single source of truth for shop pages, product
 * pages, cart, JSON-LD and the sitemap.
 *
 * Every fact about a food in here — its name, ingredients, nutrition, storage,
 * shelf life and price — comes from the product cards Semers Group sent in
 * September 2026, and from nowhere else. EAN/GTIN codes come from the Semers
 * order form (EAN sheets, LV market). Prices are the card prices in EUR incl. VAT.
 *
 * Where a card is silent the value is null, and the page prints "not yet
 * declared" instead of a number. A figure on a food page is a statement about
 * that food; a gap is honest, a borrowed or estimated figure is not.
 */
import { DEFAULT_LOCALE, LOCALE_META, type Locale } from '~/i18n/config';

export type FlavorKey = 'classic' | 'berry' | 'cinnamon' | 'blueberry' | 'cranberry' | 'assorted';

export const FLAVORS: Record<FlavorKey, { label: string; color: string; note: string }> = {
  classic: { label: 'Classic', color: 'var(--fl-classic)', note: 'Apple and egg white only' },
  berry: { label: 'Berry Mix', color: 'var(--fl-berry)', note: 'Apple with blackcurrant, cranberry, lingonberry & blueberry' },
  cinnamon: { label: 'Cinnamon', color: 'var(--fl-cinnamon)', note: 'Apple with cinnamon' },
  blueberry: { label: 'Blueberry', color: 'var(--fl-blueberry)', note: 'Apple with blueberry' },
  cranberry: { label: 'Cranberry', color: 'var(--fl-cranberry)', note: 'Apple with cranberry' },
  assorted: { label: 'Assorted', color: 'var(--fl-assorted)', note: 'A mix of our favourites' },
};

/*
 * "Source of fibre" used to be here. It is a regulated nutrition claim
 * (Reg. 1924/2006: at least 3 g of fibre per 100 g), and no card declares
 * fibre at all, so the claim cannot be made until one does. "Vegetarian" and
 * "No preservatives" went for the same reason: no pack or card makes them.
 * A tag is here only when the product's own pack prints it.
 */
export type DietTag = 'no-added-sugar' | 'gluten-free' | 'flourless';

export const DIET_TAGS: Record<DietTag, string> = {
  'no-added-sugar': 'No added sugar',
  'gluten-free': 'Gluten free',
  flourless: 'Flourless',
};

/**
 * A nutrition declaration per 100 g. null means the value has not been
 * declared to us: it renders as "not yet declared", never as 0, because
 * "0 g fat" is a statement about the food and a missing number is not.
 */
export interface Nutrition {
  energyKj: number | null;
  energyKcal: number | null;
  fat: number | null;
  saturates: number | null;
  carbs: number | null;
  sugars: number | null;
  protein: number | null;
  salt: number | null;
}

export interface Variant {
  /** Stable id used in the cart: `${product.slug}:${variant.key}` */
  key: FlavorKey;
  /** Latvian-market EAN/GTIN-13 when known. */
  gtin?: string;
  /** Override the product price for this variant (EUR). */
  price?: number;
  inStock?: boolean;
  /** This flavour's own pack photo (an images.ts key), where it has one. */
  image?: string;
  /** This flavour's own declaration, where its card gives different figures from the product's. */
  nutrition?: Nutrition;
}

export interface Product {
  slug: string;
  /** Short display name, e.g. "Apple Bar". */
  name: string;
  /** Full name for titles, e.g. "App'Lite Apple Bar 35 g". */
  title: string;
  /** Packaging brand. Absent where the card names none, which the page then leaves out rather than guesses. */
  brand?: string;
  /**
   * The name of the food (Reg. 1169/2011 art. 17): what it is, as opposed to
   * what the brand calls it, in the words of the card. Absent where no card
   * names the food, which the page then leaves out rather than guesses.
   */
  legalName?: string;
  /**
   * Flavours whose card names the food differently. It sits on the product
   * rather than on each variant so that a translation can replace it, which
   * is the only kind of field a translation is allowed to touch.
   */
  legalNameByFlavour?: Partial<Record<FlavorKey, string>>;
  collection: CollectionKey;
  weightGrams: number;
  /**
   * False where the contents are not settled yet, so there is no net quantity
   * to state: the card and the page print neither a weight nor a price per
   * 100 g, and weightGrams is only the parcel estimate the cart ships by.
   */
  netWeightKnown?: boolean;
  /** Units per retail pack (1 for single bars). */
  pack: number;
  /** Retail price EUR incl. VAT, per unit. */
  price: number;
  /**
   * What the same contents cost bought as single units at their own price. It
   * is printed as that sum ("12 × €1.40 = €16.80"), never as a bare struck-out
   * price: a strike-through claims a price reduction, and needs a real earlier price.
   */
  compareAt?: number;
  /** Short punchy line for cards. */
  hook: string;
  /** 1–2 sentences for meta description and card hover. */
  summary: string;
  /** Long-form description paragraphs. */
  description: string[];
  ingredients: string;
  /**
   * The allergen sentence in the card's own words. Absent where the card gives
   * none; the allergen is still emphasised inside the ingredient list.
   */
  allergens?: string;
  /** Flavours whose card words the allergen sentence differently; on the product so a translation can replace it. */
  allergensByFlavour?: Partial<Record<FlavorKey, string>>;
  nutrition: Nutrition;
  /** Storage conditions as the card states them; null where the card gives none. */
  storage: string | null;
  /** kcal in one unit (bar, pack), for the cards and the comparison UI; null unless a card backs it. */
  kcalPerUnit: number | null;
  diet: DietTag[];
  variants: Variant[];
  /** Image keys resolved through src/data/images.ts. */
  images: string[];
  /** Accent color for the card background. */
  accent: string;
  badge?: string;
  bestseller?: boolean;
  new?: boolean;
  /** Shelf life in months as the card states it; null where the card gives storage conditions only, or none. */
  shelfLifeMonths: number | null;
  /** Ordering weight for listings (lower first). */
  order: number;
}

export type CollectionKey = 'apple-bars' | 'flourless-bars' | 'meringues' | 'applite' | 'gift-sets';

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
      "App'Lite Apple Bars: a 35 g snack that is 99% baked apples. No added sugar, no flour, gluten free. Classic and Berry Mix.",
    intro:
      'A chocolate-bar-sized snack with the ingredient list of a baked apple. Keep one in a bag, a lunchbox or a desk drawer.',
    image: 'hero-bars',
    accent: 'var(--mint-100)',
  },
  {
    // The key keeps the /shop/flourless-bars/ address; the pack calls the food a cake, so the words do too.
    key: 'flourless-bars',
    name: 'Flourless apple cakes',
    title: "Blum Baker's Flourless Apple Cakes 50 g — no flour, no added sugar",
    description:
      "Blum Baker's flourless apple cakes, 50 g: apples and egg white, with no flour and no added sugar. Classic, Cinnamon, Blueberry and Cranberry.",
    intro: 'A 50 g apple cake with no flour in it: plain, or with cinnamon, blueberries or cranberries.',
    image: 'flourless-bar',
    accent: 'var(--honey-100)',
  },
  {
    key: 'meringues',
    name: 'Apple meringues',
    title: "App'Lite Apple Meringues — crispy, no added sugar",
    description:
      "App'Lite crispy meringues: 99% baked apples and egg white, with no added sugar. Classic and Berry Mix, in a 35 g tub.",
    intro:
      'Take the same whipped apple base, bake it until it crackles, and you get a meringue with no sugar added. Light as air, surprisingly filling, dangerously easy to finish.',
    image: 'meringue',
    accent: 'var(--coral-100)',
  },
  {
    // The key keeps the /shop/applite/ address; the 500 g carton names no brand, so the collection does not either.
    key: 'applite',
    name: 'Baked apple desserts',
    title: 'Baked Apple Desserts — no added sugar',
    description:
      "Baked apple desserts with no added sugar: App'Lite 50 g packs in Classic, Berry Mix and Cinnamon, and a 500 g carton of classic apple dessert.",
    intro:
      'Layered baked apple for a plate rather than a pocket: a 50 g pack, or a 500 g carton of individually wrapped pieces. Good with tea, coffee or a spoon of yoghurt.',
    image: 'pastila-texture',
    accent: 'var(--cream-2)',
  },
  {
    key: 'gift-sets',
    name: 'Gift sets & boxes',
    title: 'Apple Snack Gift Sets & Tasting Boxes',
    description:
      'Boxes of apple bars, meringues and flourless apple cakes: a tasting box and a 12-pack of Apple Bars, with no added sugar, packed and shipped from Riga.',
    intro:
      'Boxes we would want to receive: a bit of everything, packed to survive the post, with a card if you ask for one.',
    image: 'gift-box',
    accent: 'var(--honey-100)',
  },
];

/*
 * One declaration per food, each from its own card. Where two products point
 * at the same table it is because neither has one: NOT_DECLARED is an
 * admission, not a placeholder that stands in for real figures.
 */

/** The bar cards carry no nutrition table, and a mixed box has none of its own. */
const NOT_DECLARED: Nutrition = {
  energyKj: null,
  energyKcal: null,
  fat: null,
  saturates: null,
  carbs: null,
  sugars: null,
  protein: null,
  salt: null,
};

/** The meringue cards give energy, carbohydrate and protein only, and the two flavours differ. */
const MERINGUE_CLASSIC_NUTRITION: Nutrition = { ...NOT_DECLARED, energyKj: 1560, energyKcal: 370, carbs: 84, protein: 7.5 };
const MERINGUE_BERRY_NUTRITION: Nutrition = { ...NOT_DECLARED, energyKj: 1530, energyKcal: 360, carbs: 82, protein: 7.5 };

/** Identical for all three flavours on the cards; fat, saturates, sugars and salt were not supplied. */
const DESSERT_50G_NUTRITION: Nutrition = { ...NOT_DECLARED, energyKj: 1173, energyKcal: 276, carbs: 65, protein: 4 };

/** The one complete declaration, and the same for all four flavours. */
const FLOURLESS_NUTRITION: Nutrition = {
  energyKj: 1337,
  energyKcal: 320,
  fat: 0,
  saturates: 0,
  carbs: 72,
  sugars: 52,
  protein: 8,
  salt: 0,
};

/*
 * The 500 g card gives 13 g carbohydrate and 1 g protein, which make about
 * 56 kcal, beside 276 kcal / 1156 kJ. The two cannot both be right, so only
 * the energy line is kept, as printed, until the owner says which figures hold.
 */
const DESSERT_500G_NUTRITION: Nutrition = { ...NOT_DECLARED, energyKj: 1156, energyKcal: 276 };

/** Both bar flavours, as their cards list them. The pack front says "99% baked apples", so the list carries the figure (Reg. 1169/2011 art. 22). */
const BAR_INGREDIENTS =
  'Classic: baked apples (99%), egg white. Berry Mix: baked apples (99%), blackcurrants, cranberries, lingonberries, blueberries, egg white.';

export const PRODUCTS: Product[] = [
  {
    slug: 'apple-bar-35g',
    name: 'Apple Bar',
    title: "App'Lite Apple Bar 35 g",
    brand: "App'Lite",
    legalName: 'Apple bar with no added sugar',
    legalNameByFlavour: {
      classic: '“Classic” apple bar with no added sugar',
      berry: '“Berry Mix” apple bar with no added sugar',
    },
    collection: 'apple-bars',
    weightGrams: 35,
    pack: 1,
    price: 1.4,
    hook: '99% baked apples. That’s the whole idea.',
    summary:
      'A 35 g bar that is 99% baked apples. No added sugar, no flour, gluten free. Classic or Berry Mix; keeps 12 months.',
    description: [
      'Take a chocolate bar out of the drawer. Put this in instead. Same “I need something now” moment, but the Classic’s ingredient list reads: baked apples, egg white. That is it.',
      'Berry Mix adds blackcurrants, cranberries, lingonberries and blueberries. Both are hand made, with no flour and no sugar added.',
    ],
    ingredients: BAR_INGREDIENTS,
    // The bar cards carry no allergen sentence; the egg white is emphasised in the ingredient list.
    nutrition: NOT_DECLARED,
    storage: null,
    kcalPerUnit: null,
    // The pack front: no flour, gluten free, no sugar added.
    diet: ['no-added-sugar', 'gluten-free', 'flourless'],
    variants: [
      { key: 'classic', gtin: '4751043820181', image: 'pack-bar-classic' },
      { key: 'berry', gtin: '4751043820174', image: 'pack-bar-berry' },
    ],
    images: ['pack-bar-classic', 'pack-bar-berry', 'hero-bars', 'lifestyle-desk'],
    accent: 'var(--mint-100)',
    badge: 'Bestseller',
    bestseller: true,
    shelfLifeMonths: 12,
    order: 10,
  },
  {
    slug: 'flourless-apple-bar-50g',
    name: 'Flourless Apple Cake',
    title: "Blum Baker's Flourless Apple Cake 50 g",
    brand: "Blum Baker's",
    legalName: 'Apple cake with no added sugar',
    legalNameByFlavour: {
      cranberry: 'Apple & cranberry cake with no added sugar',
      cinnamon: 'Apple & cinnamon cake with no added sugar',
      blueberry: 'Apple & blueberry cake with no added sugar',
    },
    collection: 'flourless-bars',
    weightGrams: 50,
    pack: 1,
    price: 1.99,
    hook: 'Apple cake with no flour and no sugar added.',
    summary:
      'A 50 g flourless apple cake made from apples and egg white, with no added sugar. Classic, Cranberry, Cinnamon or Blueberry.',
    description: [
      'Apples and egg white, made into a 50 g cake without flour and without added sugar. Cranberry, Cinnamon and Blueberry each add one ingredient to that.',
    ],
    ingredients:
      'Classic: apples, egg white. Cranberry: apples, cranberries, egg white. Cinnamon: apples, egg white, cinnamon. Blueberry: apples, blueberries, egg white.',
    allergens: 'Contains eggs and egg products.',
    nutrition: FLOURLESS_NUTRITION,
    storage: 'Store in a cool, dry place at a temperature between +8 and +21 °C.',
    // 320 kcal per 100 g on the card, and one cake weighs 50 g.
    kcalPerUnit: 160,
    // The pack prints no added sugar and gluten-free, and names the cake flourless.
    diet: ['no-added-sugar', 'gluten-free', 'flourless'],
    // There is no photograph of the Blueberry pack yet, so that flavour shows the Classic one.
    variants: [
      { key: 'classic', gtin: '850039474002', image: 'pack-flourless-classic' },
      { key: 'cranberry', gtin: '850039474026', image: 'pack-flourless-cranberry' },
      { key: 'cinnamon', gtin: '850039474033', image: 'pack-flourless-cinnamon' },
      { key: 'blueberry', gtin: '850039474019', image: 'pack-flourless-classic' },
    ],
    images: ['pack-flourless-classic', 'pack-flourless-cranberry', 'pack-flourless-cinnamon'],
    accent: 'var(--honey-100)',
    // The card gives storage conditions and no shelf life.
    shelfLifeMonths: null,
    order: 20,
  },
  {
    slug: 'apple-meringue-35g',
    name: 'Apple Meringue',
    title: "App'Lite Apple Meringue 35 g",
    brand: "App'Lite",
    legalName: 'Apple meringue with no added sugar',
    legalNameByFlavour: {
      classic: 'Classic apple meringue with no added sugar',
      berry: 'Apple meringue with mixed berries, no added sugar',
    },
    collection: 'meringues',
    weightGrams: 35,
    pack: 1,
    price: 2.8,
    hook: 'Crispy, airy, and no sugar added.',
    summary:
      'Crispy meringues of 99% baked apples and egg white, with no added sugar. 3 kcal a piece. Classic or Berry Mix, in a 35 g tub.',
    description: [
      'A meringue is usually egg white and a mountain of sugar. Ours is egg white and baked apple. It bakes into the same crackly, melt-away crunch — with the sweetness coming from the apples instead of the sugar bowl. Berry Mix adds blackcurrants, cranberries, lingonberries and blueberries.',
      'Light enough to eat a whole tub, satisfying enough that you probably won’t need to. Great with coffee, crushed over yoghurt, or as the “dessert” in a lunchbox.',
    ],
    // The tub prints "99% baked apples" for both flavours, so both lists carry the figure on the apples.
    ingredients:
      'Classic: baked apples (99%), egg white. Berry Mix: baked apples (99%), blackcurrants, cranberries, lingonberries, blueberries, egg white.',
    allergens: 'Contains egg white.',
    nutrition: MERINGUE_CLASSIC_NUTRITION,
    storage:
      'Store at a temperature not exceeding 25 °C and a relative humidity not exceeding 75%. Do not store together with products that have a strong or distinctive odour.',
    kcalPerUnit: null,
    // The tub: no flour, gluten free; the card: no added sugar.
    diet: ['no-added-sugar', 'gluten-free', 'flourless'],
    variants: [
      { key: 'classic', gtin: '4751043820204', image: 'pack-meringue-classic' },
      { key: 'berry', gtin: '4751043820211', image: 'pack-meringue-berry', nutrition: MERINGUE_BERRY_NUTRITION },
    ],
    images: ['pack-meringue-classic', 'pack-meringue-berry', 'meringue'],
    accent: 'var(--coral-100)',
    badge: 'New',
    new: true,
    // The card gives storage conditions and no shelf life.
    shelfLifeMonths: null,
    order: 30,
  },
  {
    slug: 'applite-baked-apple-dessert-50g',
    name: "App'Lite Dessert",
    title: "App'Lite Baked Apple Dessert 50 g",
    brand: "App'Lite",
    legalName: 'Apple dessert with no added sugar',
    legalNameByFlavour: {
      berry: 'Apple dessert with mixed berries, no added sugar',
      cinnamon: 'Apple dessert with cinnamon, no added sugar',
    },
    collection: 'applite',
    weightGrams: 50,
    pack: 1,
    price: 2.5,
    hook: 'Apple pie filling, without the pie.',
    summary:
      'A 50 g baked apple dessert: 99% baked apples, no added sugar, no flour, gluten free. Classic, Berry Mix or Cinnamon.',
    description: [
      'Fifty grams of layered baked apple, meant for a plate rather than a pocket.',
      'Serve it with a spoon of yoghurt, crumble it over porridge, or slice it thin on a cheese board.',
    ],
    // Classic and Cinnamon packs say "99% baked apples"; the Berry Mix pack says "99% baked apples & berries".
    ingredients:
      'Classic: baked apples (99%), egg white. Berry Mix: baked apples and berries (99%: apples, cranberries, blueberries, blackcurrants, lingonberries), egg white. Cinnamon: baked apples (99%), egg white, cinnamon.',
    allergens: 'Contains eggs.',
    nutrition: DESSERT_50G_NUTRITION,
    storage:
      '9 months when stored at a temperature between +8 and +10 °C; 4 months when stored at a temperature between +10 and +25 °C. The relative humidity must not exceed 75–80%.',
    // 276 kcal per 100 g makes 138 kcal a pack, but the pack itself prints 148, so neither is quoted until one is confirmed.
    kcalPerUnit: null,
    // The box: no sugar added, no flour, gluten free.
    diet: ['no-added-sugar', 'gluten-free', 'flourless'],
    variants: [
      { key: 'classic', gtin: '4751043820013', image: 'pack-dessert-classic' },
      { key: 'berry', gtin: '4751043820037', image: 'pack-dessert-berry' },
      { key: 'cinnamon', gtin: '4751043820020', image: 'pack-dessert-cinnamon' },
    ],
    images: ['pack-dessert-classic', 'pack-dessert-berry', 'pack-dessert-cinnamon'],
    accent: 'var(--cream-2)',
    // The room-temperature figure: nine months needs +8 to +10 °C, which a shelf does not promise.
    shelfLifeMonths: 4,
    order: 40,
  },
  {
    // The card names no brand for the carton, so it has none here: the name is the card's.
    slug: 'applite-baked-apple-dessert-500g',
    name: 'Classic Apple Dessert',
    title: 'Classic Apple Dessert 500 g',
    legalName: 'Classic apple dessert with no added sugar',
    collection: 'applite',
    weightGrams: 500,
    pack: 1,
    price: 12.99,
    hook: 'Half a kilo, wrapped piece by piece.',
    summary:
      'A 500 g carton of classic apple dessert in individually wrapped pieces. Apples and egg white, no added sugar.',
    description: ['Classic apple dessert in a 500 g carton, every piece wrapped on its own. Two ingredients: apples and egg white.'],
    ingredients: 'Apples, egg white.',
    // The card gives no allergen sentence; the egg white is emphasised in the ingredient list.
    nutrition: DESSERT_500G_NUTRITION,
    storage: '18 months when stored at +8 to +25 °C.',
    kcalPerUnit: null,
    // The card claims only "no added sugar", in the name of the food; neither gluten free nor flourless.
    diet: ['no-added-sugar'],
    variants: [{ key: 'classic' }],
    images: ['box-dessert-500'],
    accent: 'var(--cream-2)',
    new: true,
    shelfLifeMonths: 18,
    order: 45,
  },
  // ---- Bundles & gift sets --------------------------------------------
  {
    slug: 'tasting-box',
    name: 'Tasting Box',
    title: 'Semers Tasting Box — bars, meringues & cakes',
    brand: 'Semers',
    collection: 'gift-sets',
    // A parcel estimate only: the contents are not settled until the owner decides them, so no weight is printed.
    weightGrams: 420,
    netWeightKnown: false,
    pack: 1,
    price: 17.9,
    hook: 'Try everything once. Then argue about a favourite.',
    summary: 'Our starter box of App’Lite Apple Bars, App’Lite apple meringues and Blum Baker’s flourless apple cakes. Free shipping.',
    description: [
      'One box to try the range: App’Lite Apple Bars, App’Lite apple meringues and Blum Baker’s flourless apple cakes.',
      'It ships free, it makes a good present, and it settles the question of which one to reorder.',
    ],
    ingredients: 'See individual products. All items: baked apples, egg white, fruit or spices.',
    allergens: 'Contains eggs.',
    nutrition: NOT_DECLARED,
    storage: null,
    kcalPerUnit: null,
    // What the bars, meringues and cakes named above all print.
    diet: ['no-added-sugar', 'gluten-free', 'flourless'],
    variants: [{ key: 'assorted' }],
    images: ['tasting-box', 'gift-box', 'hero-bars'],
    accent: 'var(--honey-100)',
    badge: 'Free shipping',
    bestseller: true,
    // The contents, and so the shelf life, are not defined yet.
    shelfLifeMonths: null,
    order: 5,
  },
  {
    slug: 'apple-bar-12-pack',
    name: 'Apple Bar 12-pack',
    title: "App'Lite Apple Bar 35 g — box of 12",
    brand: "App'Lite",
    legalName: 'Apple bars with no added sugar',
    collection: 'gift-sets',
    weightGrams: 420,
    pack: 12,
    price: 14.9,
    // Twelve single bars at the card price of €1.40.
    compareAt: 16.8,
    hook: 'A drawer full of good decisions.',
    summary: 'Twelve App’Lite Apple Bars in one box — Classic, Berry Mix or a half-and-half mix. Saves 11% versus single bars. 99% baked apples, no added sugar.',
    description: [
      'The box we send to offices, gyms and anyone who keeps finding wrappers in coat pockets. Twelve 35 g Apple Bars, sealed individually, in a shelf-friendly box.',
      'Pick a single flavour or let us pack six Classic and six Berry Mix.',
    ],
    ingredients: BAR_INGREDIENTS,
    // As for the single bar: no allergen sentence on the card, the egg white emphasised in the list.
    nutrition: NOT_DECLARED,
    storage: null,
    kcalPerUnit: null,
    diet: ['no-added-sugar', 'gluten-free', 'flourless'],
    variants: [{ key: 'classic' }, { key: 'berry' }, { key: 'assorted' }],
    images: ['bar-12-pack', 'packshot-classic', 'packshot-berry'],
    accent: 'var(--mint-100)',
    badge: 'Save 11%',
    shelfLifeMonths: 12,
    order: 15,
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

/** Whether the product has a net quantity to print; a box whose contents are not settled has none, and so no price per 100 g either. */
export function hasNetWeight(p: Product): boolean {
  return p.netWeightKnown !== false;
}

/** The price of 100 g, e.g. "€4.14". The "per 100 g" label comes from the dictionary. */
export function unitPrice(p: Product, locale: Locale = DEFAULT_LOCALE): string {
  return formatPrice(p.price / (p.weightGrams / 100), locale);
}
