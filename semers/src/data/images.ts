/**
 * Image manifest. Every visual used by the site is referenced by a key.
 *
 * `remote` is the Higgsfield CDN URL the image was generated at. `local` is
 * the path under /public once `npm run localize-images` has downloaded and
 * optimised it (recommended before launch so the site does not depend on a
 * third-party CDN). `img()` prefers local when present.
 *
 * The owner's pack photographs never lived on the CDN: they were encoded
 * straight into public/img, so they have a `local` and no `remote`, and
 * localize-images leaves them alone. Every entry has at least one of the two.
 */
export interface SiteImage {
  remote?: string;
  local?: string;
  alt: string;
  width: number;
  height: number;
  /** Transparent packshots are shown with object-fit: contain on a tinted background. */
  fit?: 'cover' | 'contain';
  /** Background colour the photo was shot on, so sections can blend seamlessly. */
  bg?: string;
  /** Widths of the resized local variants (/img/<key>-<w>.webp) written by localize-images. */
  widths?: number[];
}

const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_32PUi7N1yLbRwJAjaFXFk2hFbAT/';
/** Semers' own uploads (packshots, 3D renders, product photography) in the same Higgsfield library. */
const UPLOADS = 'https://d2ol7oe51mr4n9.cloudfront.net/user_32PUi7N1yLbRwJAjaFXFk2hFbAT/';
/** Dark cocoa background of the 3D apple renders. */
export const RENDER_BG = '#3a322e';

export const IMAGES: Record<string, SiteImage> = {
  'family-kitchen': {
    remote: CDN + 'hf_20260904_161845_c3e0e41e-6233-43ef-b9e2-9e29f3790c01.png',
    alt: 'A mother and her two children laughing on a sunlit kitchen floor, sharing apple bars from a kraft box',
    width: 1376,
    height: 768,
  },
  'hero-bars': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_225023_a4fea9d4-74e6-4d8a-8d6a-b3b1a99ef2c3.png
    remote: UPLOADS + 'af7ae71b-f935-4779-b81a-139f401ba900.webp',
    alt: "App'Lite Apple Bar packs in Classic and Berry Mix with an unwrapped baked-apple bar and fresh apple",
    width: 1611,
    height: 2000,
  },
  'hero-wide': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_225023_926c3652-7ec1-4594-b920-a8699340f89e.png
    remote: UPLOADS + 'e37fd1e4-cc15-419c-a4eb-cf87d4b77168.webp',
    alt: 'Apple Bar packs, apple slices and berries floating on a cream background',
    width: 2000,
    height: 1116,
  },
  'flatlay-lunchbox': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_225022_d78edc83-de42-4ff5-9e36-6103003cf70b.png
    remote: UPLOADS + 'c2e1a710-d6c3-41ae-9507-20291a3fcc0a.webp',
    alt: 'Lunchbox with apple slices and an Apple Bar, seen from above',
    width: 2000,
    height: 2000,
  },
  'pastila-texture': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_225022_909c6942-a4d8-46ac-ba1b-f095d7897f69.png
    remote: UPLOADS + '12ee57d5-1f75-4df3-b96a-9f53710fe0eb.webp',
    alt: 'Macro of the layered, fibrous texture of baked-apple pastila',
    width: 2000,
    height: 1342,
  },
  'apples-orchard': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_225022_29375710-036e-4242-8e6d-57684ccdc717.png
    remote: UPLOADS + '71be79db-db13-4b27-b5eb-169203ca946e.webp',
    alt: 'Wooden crate of freshly picked green apples in an orchard',
    width: 2000,
    height: 1342,
  },
  'process-oven': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_225022_32f57c48-d83c-4ae8-a1b0-f16862fd2c69.png
    remote: UPLOADS + '8caa0bf9-27bb-478b-93d3-54535f27fa11.webp',
    alt: 'Whipped baked-apple purée in a bowl with egg whites and baked apple halves',
    width: 2000,
    height: 1342,
  },
  meringue: {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_225022_a7a325ad-8e39-4352-8904-a46f5eb6cb11.png
    remote: UPLOADS + '13241143-e0ea-4f9b-8928-2b03e1367b19.webp',
    alt: 'Crispy apple meringues piled in a ceramic bowl',
    width: 2000,
    height: 2000,
  },
  'flourless-bar': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_225022_3705d90b-23a2-4009-be83-6afaec8d19c2.png
    remote: UPLOADS + '1981833c-2072-4cc0-8b31-5811ffca2a45.webp',
    alt: 'Flourless apple bar with cranberries broken in half',
    width: 1611,
    height: 2000,
  },
  'lifestyle-desk': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_225022_40687b45-0b6c-41cd-a9b1-c8852a593827.png
    remote: UPLOADS + '9f0eb4ff-63e1-4c9f-9d68-aa674de54aed.webp',
    alt: 'Hand reaching for a Berry Mix Apple Bar on a desk beside a laptop and coffee',
    width: 2000,
    height: 1342,
  },
  'gift-box': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_225023_ed696359-b629-4008-80b1-482d2ae9cb5f.png
    remote: UPLOADS + '51efa1af-0a10-465d-b6e0-5e853db51c36.webp',
    alt: 'Open kraft gift box with Apple Bars, meringues and sliced pastila',
    width: 2000,
    height: 2000,
  },
  /* ---------- Semers' own assets ---------- */
  'packshot-classic': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_233114_a5d78e50-99c2-433b-b954-3db2e42ff935.png
    remote: UPLOADS + 'bbd22a70-7da1-4442-a95c-0281faffbc7a.webp',
    alt: "App'Lite Apple Bar Classic — two mint-green packs with slices of baked-apple bar and a green apple",
    width: 2000,
    height: 2000,
    fit: 'contain',
  },
  'packshot-berry': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_233527_46fddb4a-15d6-4f01-aa8e-cf47724bd92c.png
    remote: UPLOADS + 'aa5cc467-b640-4c7d-b54a-57ce7cb41830.webp',
    alt: "App'Lite Apple Bar Berry Mix — two coral packs with blueberries and cranberries",
    width: 2000,
    height: 2000,
    fit: 'contain',
  },
  'apple-render': {
    remote: UPLOADS + 'fbf1d4f9-5d20-4b55-9754-f4ef5f278a7e.jpg',
    alt: 'A green apple cut open to reveal layers of golden baked-apple pastila inside, next to a whole green apple',
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
    alt: 'Three thick slices of layered apple pastila on parchment paper',
    width: 1280,
    height: 1280,
  },
  'pastila-block': {
    remote: UPLOADS + '29c9f3a4-0e36-4429-aed8-698b76bdd089.jpg',
    alt: 'A tall block of layered apple pastila on a wooden board with a green apple',
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
    // WebP (≤2000 px) re-encoded from the original hf_20260901_234638_26ffc8c9-7a3d-40b6-adc5-a6eb13f97d08.png
    remote: UPLOADS + '245e1dd7-18d9-4124-bcaa-b4e2ff82717b.webp',
    alt: "Open kraft box with twelve App'Lite Apple Bars in Classic and Berry Mix wrappers, a green apple and blueberries",
    width: 1611,
    height: 2000,
  },
  'tasting-box': {
    // WebP (≤2000 px) re-encoded from the original hf_20260901_234638_07a2e1ad-5032-416b-9897-00faa6c51229.png
    remote: UPLOADS + 'af92cfb6-711c-4319-8c19-46130fe4a53b.webp',
    alt: 'Open tasting box with two Apple Bars, a pouch of apple meringues and slices of golden pastila',
    width: 2000,
    height: 2000,
  },
  /* ---------- The owner's pack photographs (local only) ---------- */
  'pack-bar-classic': {
    local: '/img/pack-bar-classic.webp',
    alt: "App'Lite Apple Bar Classic pack in turquoise: 99% baked apples, no flour, gluten free, hand made, no sugar added",
    width: 1280,
    height: 960,
    fit: 'contain',
    widths: [480, 960, 1280],
  },
  'pack-bar-berry': {
    local: '/img/pack-bar-berry.webp',
    alt: "App'Lite Apple Bar Berry Mix pack in pink: 99% baked apples, no flour, gluten free, hand made, no sugar added",
    width: 1448,
    height: 1086,
    fit: 'contain',
    widths: [480, 960, 1448],
  },
  'pack-meringue-classic': {
    local: '/img/pack-meringue-classic.webp',
    alt: "Green tub of App'Lite Classic baked apple dessert meringues, marked 3 kcal per piece",
    width: 960,
    height: 535,
    fit: 'contain',
    widths: [480, 960],
  },
  'pack-meringue-berry': {
    local: '/img/pack-meringue-berry.webp',
    alt: "Red tub of App'Lite Berry Mix baked apple dessert meringues, marked 3 kcal in one piece",
    width: 960,
    height: 536,
    fit: 'contain',
    widths: [480, 960],
  },
  'pack-dessert-classic': {
    local: '/img/pack-dessert-classic.webp',
    alt: "Green box of App'Lite Baked Apple Dessert Classic: 99% baked apples, no sugar added, no flour, gluten free",
    width: 960,
    height: 1440,
    fit: 'contain',
    widths: [480, 960],
  },
  'pack-dessert-berry': {
    local: '/img/pack-dessert-berry.webp',
    alt: "Pink box of App'Lite Baked Apple Dessert Berry Mix: 99% baked apples and berries, no sugar added, no flour, gluten free",
    width: 960,
    height: 1440,
    fit: 'contain',
    widths: [480, 960],
  },
  'pack-dessert-cinnamon': {
    local: '/img/pack-dessert-cinnamon.webp',
    alt: "Beige box of App'Lite Baked Apple Dessert Cinnamon: 99% baked apples, no sugar added, no flour, gluten free",
    width: 960,
    height: 1440,
    fit: 'contain',
    widths: [480, 960],
  },
  'pack-flourless-classic': {
    local: '/img/pack-flourless-classic.webp',
    alt: "Blum Baker's Flourless Original Apple Cake wrapper, 50 g, no sugar added",
    width: 1600,
    height: 1200,
    fit: 'contain',
    widths: [480, 960, 1600],
  },
  'pack-flourless-cinnamon': {
    local: '/img/pack-flourless-cinnamon.webp',
    alt: "Blum Baker's Flourless Apple Cake with Cinnamon wrapper, 50 g, no sugar added",
    width: 1500,
    height: 2000,
    fit: 'contain',
    widths: [480, 960, 1500],
  },
  'pack-flourless-cranberry': {
    local: '/img/pack-flourless-cranberry.webp',
    alt: "Blum Baker's Flourless Apple Cake with Cranberries wrapper, 50 g, no sugar added",
    width: 1600,
    height: 1200,
    fit: 'contain',
    widths: [480, 960, 1600],
  },
  'box-dessert-500': {
    local: '/img/box-dessert-500.webp',
    alt: 'White carton of individually wrapped pieces of layered baked apple dessert, with one piece unwrapped beside green apples and berries',
    width: 896,
    height: 1196,
    fit: 'contain',
    widths: [480, 896],
  },
};

export function img(key: string): SiteImage {
  const i = IMAGES[key];
  if (!i) throw new Error(`Unknown image key: ${key}`);
  return i;
}

export function imgSrc(key: string): string {
  const i = img(key);
  const src = i.local || i.remote;
  // An entry with neither would render <img src=""> and fail silently; failing the build names it instead.
  if (!src) throw new Error(`Image ${key} has neither a local file nor a remote URL`);
  return src;
}

/**
 * `srcset` for the local width variants, or undefined while images still come
 * from the CDN (Astro drops undefined attributes, so markup stays valid either way).
 */
export function imgSrcset(key: string): string | undefined {
  const i = img(key);
  if (!i.local || !i.widths?.length) return undefined;
  const base = i.local.replace(/\.webp$/, '');
  const list = i.widths.filter((w) => w !== i.width).map((w) => `${base}-${w}.webp ${w}w`);
  list.push(`${i.local} ${i.width}w`);
  return list.join(', ');
}

/** Smallest local variant (thumbnails, cart rows), falling back to the main file. */
export function imgSmall(key: string): string {
  const i = img(key);
  if (!i.local || !i.widths?.length) return imgSrc(key);
  const w = Math.min(...i.widths);
  return w === i.width ? i.local : `${i.local.replace(/\.webp$/, '')}-${w}.webp`;
}

/** Everything an <img> needs: src, srcset (when variants exist), alt, width, height. */
export function im(key: string) {
  return { ...img(key), src: imgSrc(key), srcset: imgSrcset(key) };
}

/** `sizes` presets matching the layout slots; a slot that is over-estimated only costs bytes, never sharpness. */
export const SIZES = {
  full: '100vw',
  half: '(max-width: 60rem) 100vw, 50vw',
  third: '(max-width: 40rem) 100vw, (max-width: 60rem) 50vw, 33vw',
  card: '(max-width: 40rem) 50vw, (max-width: 60rem) 33vw, 25vw',
  tile: '(max-width: 40rem) 50vw, 33vw',
} as const;
