/**
 * Image manifest. Every visual used by the site is referenced by a key.
 *
 * `remote` is the Higgsfield CDN URL the image was generated at. `local` is
 * the path under /public once `npm run localize-images` has downloaded and
 * optimised it (recommended before launch so the site does not depend on a
 * third-party CDN). `img()` prefers local when present.
 */
export interface SiteImage {
  remote: string;
  local?: string;
  alt: string;
  width: number;
  height: number;
  /** Transparent packshots are shown with object-fit: contain on a tinted background. */
  fit?: 'cover' | 'contain';
  /** Background colour the photo was shot on, so sections can blend seamlessly. */
  bg?: string;
}

const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_32PUi7N1yLbRwJAjaFXFk2hFbAT/';
/** Semers' own uploads (packshots, 3D renders, product photography) in the same Higgsfield library. */
const UPLOADS = 'https://d2ol7oe51mr4n9.cloudfront.net/user_32PUi7N1yLbRwJAjaFXFk2hFbAT/';
/** Dark cocoa background of the 3D apple renders. */
export const RENDER_BG = '#3a322e';

export const IMAGES: Record<string, SiteImage> = {
  'hero-bars': {
    remote: CDN + 'hf_20260901_225023_a4fea9d4-74e6-4d8a-8d6a-b3b1a99ef2c3.png',
    alt: "App'Lite Apple Bar packs in Classic and Berry Mix with an unwrapped baked-apple bar and fresh apple",
    width: 1638,
    height: 2048,
  },
  'hero-wide': {
    remote: CDN + 'hf_20260901_225023_926c3652-7ec1-4594-b920-a8699340f89e.png',
    alt: 'Apple Bar packs, apple slices and berries floating on a cream background',
    width: 2048,
    height: 1152,
  },
  'flatlay-lunchbox': {
    remote: CDN + 'hf_20260901_225022_d78edc83-de42-4ff5-9e36-6103003cf70b.png',
    alt: 'Lunchbox with apple slices and an Apple Bar, seen from above',
    width: 2048,
    height: 2048,
  },
  'pastila-texture': {
    remote: CDN + 'hf_20260901_225022_909c6942-a4d8-46ac-ba1b-f095d7897f69.png',
    alt: 'Macro of the layered, fibrous texture of baked-apple pastila',
    width: 2048,
    height: 1365,
  },
  'apples-orchard': {
    remote: CDN + 'hf_20260901_225022_29375710-036e-4242-8e6d-57684ccdc717.png',
    alt: 'Wooden crate of freshly picked green Antonovka apples in an orchard',
    width: 2048,
    height: 1365,
  },
  'process-oven': {
    remote: CDN + 'hf_20260901_225022_32f57c48-d83c-4ae8-a1b0-f16862fd2c69.png',
    alt: 'Whipped baked-apple purée in a bowl with egg whites and baked apple halves',
    width: 2048,
    height: 1365,
  },
  meringue: {
    remote: CDN + 'hf_20260901_225022_a7a325ad-8e39-4352-8904-a46f5eb6cb11.png',
    alt: 'Crispy apple meringues piled in a ceramic bowl',
    width: 2048,
    height: 2048,
  },
  'flourless-bar': {
    remote: CDN + 'hf_20260901_225022_3705d90b-23a2-4009-be83-6afaec8d19c2.png',
    alt: 'Flourless apple bar with cranberries broken in half',
    width: 1638,
    height: 2048,
  },
  'pastila-180': {
    remote: CDN + 'hf_20260901_225022_42e9288b-7e44-40a9-aa83-e3f8a1b7485a.png',
    alt: 'Sliced loaf of Belyov apple pastila on a walnut board with cinnamon and apple',
    width: 1638,
    height: 2048,
  },
  zephyr: {
    remote: CDN + 'hf_20260901_225022_332f2f27-c930-41e4-8f3f-da2a1da7bc96.png',
    alt: 'Soft pink and ivory apple zephyr on a ceramic plate',
    width: 2048,
    height: 2048,
  },
  'lifestyle-desk': {
    remote: CDN + 'hf_20260901_225022_40687b45-0b6c-41cd-a9b1-c8852a593827.png',
    alt: 'Hand reaching for a Berry Mix Apple Bar on a desk beside a laptop and coffee',
    width: 2048,
    height: 1365,
  },
  'gift-box': {
    remote: CDN + 'hf_20260901_225023_ed696359-b629-4008-80b1-482d2ae9cb5f.png',
    alt: 'Open kraft gift box with Apple Bars, meringues and sliced pastila',
    width: 2048,
    height: 2048,
  },
  /* ---------- Semers' own assets ---------- */
  'packshot-classic': {
    // 2K upscale + background cut-out of the original 500 px packshot (transparent PNG).
    remote: CDN + 'hf_20260901_233114_a5d78e50-99c2-433b-b954-3db2e42ff935.png',
    alt: "App'Lite Apple Bar Classic — two mint-green packs with slices of baked-apple bar and a green apple",
    width: 2160,
    height: 2160,
    fit: 'contain',
  },
  'packshot-berry': {
    // 2K upscale + background cut-out of the original 500 px packshot (transparent PNG).
    remote: CDN + 'hf_20260901_233527_46fddb4a-15d6-4f01-aa8e-cf47724bd92c.png',
    alt: "App'Lite Apple Bar Berry Mix — two coral packs with blueberries and cranberries",
    width: 2160,
    height: 2160,
    fit: 'contain',
  },
  'apple-render': {
    remote: UPLOADS + 'fbf1d4f9-5d20-4b55-9754-f4ef5f278a7e.jpg',
    alt: 'A green apple cut open to reveal layers of golden baked-apple pastila inside, next to a whole Antonovka apple',
    width: 1600,
    height: 1200,
    bg: RENDER_BG,
  },
  'apple-render-sm': {
    remote: UPLOADS + '99a53d30-d24f-48b8-8e15-b9307a435d8b.jpg',
    alt: 'Apple made of layered pastila beside a whole green apple on a dark background',
    width: 736,
    height: 595,
    bg: RENDER_BG,
  },
  'pastila-slices': {
    remote: UPLOADS + '46554a64-8687-4368-a400-1ade319296fc.jpg',
    alt: 'Three thick slices of layered Belyov apple pastila on parchment paper',
    width: 1280,
    height: 1280,
  },
  'pastila-block': {
    remote: UPLOADS + '29c9f3a4-0e36-4429-aed8-698b76bdd089.jpg',
    alt: 'A tall block of layered apple pastila on a wooden board with a green Antonovka apple',
    width: 1280,
    height: 1280,
  },
  'pastila-macro': {
    remote: UPLOADS + 'cddbd190-b79b-4e11-8c5e-fe02e383209a.jpg',
    alt: 'Macro cross-section of apple pastila showing its fibrous, honeycomb-like layers',
    width: 1120,
    height: 1034,
  },
  'apple-split': {
    remote: UPLOADS + '8965e89d-6183-4547-a4db-105689b5a710.jpg',
    alt: 'A pastila apple split open beside half a fresh green apple, showing the golden layered inside',
    width: 2400,
    height: 1350,
    bg: RENDER_BG,
  },
  'apple-render-wide': {
    remote: UPLOADS + '0b816717-9c3e-4d8d-bcea-2adbccf3ba42.jpg',
    alt: 'Wide shot of an apple made of layered pastila next to a whole green apple on a dark cocoa background',
    width: 2400,
    height: 1350,
    bg: RENDER_BG,
  },
  'apple-render-tall': {
    remote: UPLOADS + '9953ab69-d064-414d-ab06-0a45625b3ce2.jpg',
    alt: 'Portrait crop of the pastila apple and a fresh apple on a dark background',
    width: 1600,
    height: 2000,
    bg: RENDER_BG,
  },
  'retail-boxes': {
    remote: UPLOADS + '3be47a15-416e-4a61-9aed-512ee970f7a4.jpg',
    alt: "Retail cases of App'Lite Apple Bars stacked for a wholesale delivery",
    width: 1013,
    height: 1800,
  },
  'orchard-picking': {
    remote: UPLOADS + '9c6b5eed-9cac-42cb-97d8-a7ce66c0da38.jpg',
    alt: 'A child on a wooden ladder picking apples in a sunlit orchard',
    width: 1018,
    height: 1800,
  },
  /* ---------- Generated product shots (batch 2) ---------- */
  'bar-12-pack': {
    remote: CDN + 'hf_20260901_234638_26ffc8c9-7a3d-40b6-adc5-a6eb13f97d08.png',
    alt: "Open kraft box with twelve App'Lite Apple Bars in Classic and Berry Mix wrappers, a green apple and blueberries",
    width: 1856,
    height: 2304,
  },
  'pastila-set': {
    remote: CDN + 'hf_20260901_234638_81010186-f11b-4c7b-aea6-60515172aee6.png',
    alt: 'Three kraft-wrapped 100 g packs of Belyov apple pastila with a cut slice, a green apple and lingonberries',
    width: 1856,
    height: 2304,
  },
  'tasting-box': {
    remote: CDN + 'hf_20260901_234638_07a2e1ad-5032-416b-9897-00faa6c51229.png',
    alt: 'Open tasting box with two Apple Bars, a pouch of apple meringues and slices of golden pastila',
    width: 2048,
    height: 2048,
  },
  'pastila-100-pack': {
    remote: CDN + 'hf_20260901_234638_9dc5e7a5-3d4c-4066-b468-a972d5c8b872.png',
    alt: 'A kraft-paper 100 g pack of apple pastila beside two layered slices and half a green apple',
    width: 1856,
    height: 2304,
  },
  'meringue-pouch': {
    remote: CDN + 'hf_20260901_234638_3a1f69aa-c141-4eae-9c65-1e73da9365f4.png',
    alt: 'Mint-green pouch of crispy apple meringues spilling onto a ceramic plate with dried apple slices',
    width: 1856,
    height: 2304,
  },
  'zephyr-box': {
    remote: CDN + 'hf_20260901_234638_14176616-67e1-416b-a694-906a8d93a595.png',
    alt: 'Open box of pink and ivory apple zephyr swirls next to a cup of tea and a green apple',
    width: 1856,
    height: 2304,
  },
};

export function img(key: string): SiteImage {
  const i = IMAGES[key];
  if (!i) throw new Error(`Unknown image key: ${key}`);
  return i;
}

export function imgSrc(key: string): string {
  const i = img(key);
  return i.local || i.remote;
}
