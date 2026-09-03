// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Canonical site URL. One place for canonical/OG/sitemap/robots/JSON-LD.
 *   SITE_URL=https://semers.org npm run build
 * On Vercel, VERCEL_PROJECT_PRODUCTION_URL is used until SITE_URL is set.
 *
 * The fallback is the host that actually serves the shop, not the brand domain:
 * semers.org still runs the old AppLite WordPress site, where every shop path 404s.
 * A canonical pointing there tells Google the real version of each page lives on a
 * URL that does not exist, and the shop drops out of the index entirely. Point
 * SITE_URL at the brand domain on the build that ships once it serves this shop.
 */
const VERCEL_HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const SITE =
  process.env.SITE_URL ||
  (VERCEL_HOST ? `https://${VERCEL_HOST}` : null) ||
  'https://semers-store.higgsfield.app';

/** Sitemap priorities follow commercial importance, not folder depth. */
/** @type {[RegExp, number][]} */
const PRIORITY = [
  [/^\/$/, 1.0],
  [/^\/shop\/$/, 0.9],
  [/^\/products\/[^/]+\/$/, 0.9],
  [/^\/shop\/[^/]+\/$/, 0.8],
  [/^\/(why-pastila|how-its-made|story|where-to-buy|wholesale)\/$/, 0.7],
  [/^\/journal\/[^/]+\/$/, 0.6],
  [/^\/(faq|contact|journal)\/$/, 0.5],
  [/^\/legal\//, 0.2],
];

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      filter: (page) => !/\/(cart|checkout|order|admin)\//.test(page),
      serialize(item) {
        const path = new URL(item.url).pathname;
        const hit = PRIORITY.find(([re]) => re.test(path));
        item.priority = hit ? Number(hit[1]) : 0.5;
        return item;
      },
    }),
  ],
  vite: {
    resolve: {
      alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) },
      // The '~' alias above is enough for bundling; tsconfig `paths` are only for the editor/astro check.
      // Vite 8's tsconfig discovery otherwise walks up to the parent repo's tsconfig and fails to resolve its `extends`.
      tsconfigPaths: false,
    },
    build: { cssCodeSplit: false },
  },
});
