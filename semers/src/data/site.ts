/**
 * Everything the store "is", in one place. Read by header, footer, JSON-LD,
 * Open Graph, checkout, and the contact page.
 *
 * The company, contact and delivery details are the ones the owner confirmed on
 * 25.09.2026 for publication. The bank account is never published.
 */
export const site = {
  brand: {
    name: 'Semers',
    legalName: 'SIA Semers Group',
    /** Short line under the logo and in <title> suffixes. */
    // "99% baked apples" is printed on the App'Lite packs only, so it is not a line for the whole range.
    tagline: 'Baked apple snacks. No added sugar.',
    /** Product brands used on packaging. */
    lines: ["App'Lite", "Blum Baker's"],
  },

  /**
   * The company behind the shop, printed in the footer and on the legal pages.
   * The owner confirmed these for publication on 25.09.2026.
   */
  company: {
    legalName: 'SIA Semers Group',
    regNo: '40203400507',
    vatNo: 'LV40203400507',
    /** The registered (legal) address. */
    legalAddress: 'Vēju iela 14, Carnikava, Ādažu novads, LV-2163, Latvia',
    /** The office, which is also where returns are sent. */
    officeAddress: 'Pildas iela 10, Rīga, LV-1035',
  },

  /**
   * The food business operator a product page names beside the food
   * (Reg. 1169/2011 art. 8 and 9(1)(h)). The owner confirmed on 25.09.2026 that
   * it is SIA Semers Group at its legal address for every product, App'Lite and
   * Blum Baker's alike. The page prints the operator line only while both halves
   * are set: half an operator is not a declaration.
   */
  operator: {
    name: 'SIA Semers Group',
    // Widened from the literal so a page can test it without the type deciding the answer.
    address: 'Vēju iela 14, Carnikava, Ādažu novads, LV-2163, Latvia' as string,
  },

  locality: 'Riga',
  country: 'Latvia',
  countryCode: 'LV',

  /** Public contact channels. Empty string = not rendered. */
  email: import.meta.env.PUBLIC_MAIL || 'av@semers.org',
  phone: import.meta.env.PUBLIC_PHONE || '+371 22841714',
  whatsapp: import.meta.env.PUBLIC_WHATSAPP || '',
  wholesaleEmail: import.meta.env.PUBLIC_WHOLESALE_MAIL || 'sales@semers.org',

  social: {
    instagram: import.meta.env.PUBLIC_INSTAGRAM || 'https://www.instagram.com/',
    tiktok: import.meta.env.PUBLIC_TIKTOK || '',
    facebook: import.meta.env.PUBLIC_FACEBOOK || '',
    linkedin: import.meta.env.PUBLIC_LINKEDIN || '',
  },

  /** Where the products are on shelves. Rendered on /where-to-buy/. */
  retailers: [
    { name: 'Maxima', country: 'Latvia', note: 'Supermarkets across Latvia' },
    { name: 'Barbora', country: 'Latvia', note: 'Online grocery delivery', url: 'https://barbora.lv' },
    { name: 'Selected retailers', country: 'Germany', note: 'Specialty and online stores' },
    { name: 'Selected retailers', country: 'Poland', note: 'Specialty and online stores' },
    { name: 'Selected retailers', country: 'Lithuania', note: 'Specialty stores' },
    { name: 'Selected retailers', country: 'Austria', note: 'Specialty stores' },
    { name: 'Selected retailers', country: 'Bulgaria', note: 'Specialty stores' },
  ],

  /**
   * Consumer delivery, as the owner set it on 25.09.2026: all of Europe, free
   * from €20, no pickup. Omniva parcel lockers serve Latvia, Lithuania and
   * Estonia at the flat rate below; everywhere else goes by courier, whose
   * price the owner has not given yet. courierRate stays null until then, and
   * the checkout offers the courier only once it is a number.
   */
  shipping: {
    freeFrom: 20, // EUR — orders from this total ship free
    flatRate: 3.9, // EUR — Omniva parcel locker (LV, LT, EE) below the threshold; the owner's own price is pending
    courierRate: null as number | null, // EUR — EU courier; price pending from the owner, so not offered yet
    lockerCountries: ['Latvia', 'Lithuania', 'Estonia'],
    regions: ['Europe'],
    note: 'Orders ship from Riga within 1–2 business days.',
  },

  currency: 'EUR',

  /**
   * Storefront defaults for the parts the owner can change in the admin without
   * a redeploy. These are what the built pages ship with; /api/storefront
   * overrides them at runtime once a value has been saved, so the page is
   * correct before the fetch resolves and correct again after it.
   */
  storefront: {
    /**
     * The reassurance line beside the buy button. It states the owner's own
     * policy (25.09.2026) and nothing more: the refund-and-keep-the-box promise
     * that stood here was never one the owner made.
     */
    guarantee: 'Arrived damaged or wrong? We replace it, or refund it if you ask.',
    guaranteeOn: true,
    /** Volume ladder: buy this many of one product and the per-unit price drops. */
    tier1Qty: 3,
    tier1Pct: 5,
    tier2Qty: 6,
    tier2Pct: 10,
    tiersOn: true,
    reviewsOn: true,
  },

  /** Order endpoint. Empty = checkout falls back to e-mail/WhatsApp. */
  orderEndpoint: import.meta.env.PUBLIC_ORDER_ENDPOINT || '',

  /** Search console verification codes; omitted when empty. */
  verify: {
    google: import.meta.env.PUBLIC_GOOGLE_VERIFICATION || '',
    bing: import.meta.env.PUBLIC_BING_VERIFICATION || '',
  },
  /** Analytics: Plausible domain or GA4 id. Empty = no script. */
  analytics: {
    plausibleDomain: import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN || '',
    ga4: import.meta.env.PUBLIC_GA4_ID || '',
  },
} as const;

/**
 * The header: the shop, two blocks of the home page and the footer's contacts.
 * `key` indexes the nav labels in src/i18n/ui.ts; `href` is the English path,
 * or a bare #anchor that stays on the page it is clicked on. The other pages
 * (why pastila, how it's made, the story, the journal, wholesale) are in the footer.
 */
export const nav = [
  { key: 'shop', href: '/shop/' },
  { key: 'inside', href: '/#about' },
  { key: 'delivery', href: '/#delivery' },
  { key: 'contacts', href: '#contact' },
] as const;

/**
 * Footer columns. `key` indexes footerLinks (or nav) in src/i18n/ui.ts and
 * `href` is always the English path, localised where it is rendered.
 */
export const footerNav = {
  shop: [
    { key: 'allProducts', href: '/shop/' },
    { key: 'appleBars', href: '/shop/apple-bars/' },
    { key: 'flourlessBars', href: '/shop/flourless-bars/' },
    { key: 'meringues', href: '/shop/meringues/' },
    // Rendered only while the collection has a product on sale; see Footer.astro.
    { key: 'giftSets', href: '/shop/gift-sets/' },
    { key: 'buildYourBox', href: '/shop/build-your-box/' },
  ],
  learn: [
    { key: 'whyPastila', href: '/why-pastila/' },
    { key: 'howItsMade', href: '/how-its-made/' },
    { key: 'story', href: '/story/' },
    { key: 'journal', href: '/journal/' },
    { key: 'faq', href: '/faq/' },
  ],
  company: [
    { key: 'whereToBuy', href: '/where-to-buy/' },
    { key: 'wholesale', href: '/wholesale/' },
    { key: 'contact', href: '/contact/' },
    { key: 'shippingReturns', href: '/legal/shipping-returns/' },
    { key: 'privacy', href: '/legal/privacy/' },
    { key: 'terms', href: '/legal/terms/' },
  ],
} as const;
