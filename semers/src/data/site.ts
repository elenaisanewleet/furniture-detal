/**
 * Everything the store "is", in one place. Read by header, footer, JSON-LD,
 * Open Graph, checkout, and the contact page.
 *
 * TODO for Semers before launch: confirm email, phone, address, socials.
 */
export const site = {
  brand: {
    name: 'Semers',
    legalName: 'SIA Semers Group',
    /** Short line under the logo and in <title> suffixes. */
    tagline: 'Baked apple snacks. 99% apples. No added sugar.',
    /** Product sub-brands used on packaging. */
    lines: ["App'Lite", 'Flourless', 'PastiLite', 'Belyov Pastila', 'Belevini'],
  },

  locality: 'Riga',
  country: 'Latvia',
  countryCode: 'LV',

  /** Public contact channels. Empty string = not rendered. */
  email: import.meta.env.PUBLIC_MAIL || 'hello@semers.org',
  phone: import.meta.env.PUBLIC_PHONE || '',
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
    { name: 'Tirgus Online', country: 'Latvia', note: 'Online marketplace' },
    { name: 'Selected retailers', country: 'Germany', note: 'Specialty and online stores' },
    { name: 'Selected retailers', country: 'Poland', note: 'Drugstore chain listing via our partner' },
    { name: 'Selected retailers', country: 'Lithuania', note: 'Specialty stores' },
    { name: 'Selected retailers', country: 'Austria', note: 'Specialty stores' },
    { name: 'Selected retailers', country: 'Bulgaria', note: 'Specialty stores' },
  ],

  /** Countries we ship consumer orders to. Adjust when logistics is set. */
  shipping: {
    freeFrom: 25, // EUR — free shipping threshold (was used in the old shop)
    regions: ['Latvia', 'Lithuania', 'Estonia', 'European Union'],
    note: 'Orders ship from Riga within 1–2 business days.',
  },

  currency: 'EUR',

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

export const nav = [
  { label: 'Shop', href: '/shop/' },
  { label: 'Why pastila', href: '/why-pastila/' },
  { label: 'How it’s made', href: '/how-its-made/' },
  { label: 'Our story', href: '/story/' },
  { label: 'Journal', href: '/journal/' },
  { label: 'Wholesale', href: '/wholesale/' },
] as const;

export const footerNav = {
  shop: [
    { label: 'All products', href: '/shop/' },
    { label: 'Apple bars', href: '/shop/apple-bars/' },
    { label: 'Flourless bars', href: '/shop/flourless-bars/' },
    { label: 'Apple meringues', href: '/shop/meringues/' },
    { label: 'Belyov pastila', href: '/shop/pastila/' },
    { label: 'Zephyr', href: '/shop/zephyr/' },
    { label: 'Gift sets', href: '/shop/gift-sets/' },
  ],
  learn: [
    { label: 'Why pastila', href: '/why-pastila/' },
    { label: 'How it’s made', href: '/how-its-made/' },
    { label: 'Our story', href: '/story/' },
    { label: 'Journal', href: '/journal/' },
    { label: 'FAQ', href: '/faq/' },
  ],
  company: [
    { label: 'Where to buy', href: '/where-to-buy/' },
    { label: 'Wholesale', href: '/wholesale/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Shipping & returns', href: '/legal/shipping-returns/' },
    { label: 'Privacy', href: '/legal/privacy/' },
    { label: 'Terms', href: '/legal/terms/' },
  ],
} as const;
