/**
 * Turns the Astro output into a Cloudflare Pages project.
 *
 * - dist/_worker.js: the shop's server (worker/server.js), unchanged.
 * - dist/_routes.json: only /api/* reaches it; every page and file is served
 *   straight from the build, as it was on the Worker.
 * - dist/ru/404.html, dist/lv/404.html: Pages answers a missing page with the
 *   nearest 404.html up the tree, so each language keeps its own not-found page.
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';

copyFileSync('worker/server.js', 'dist/_worker.js');
writeFileSync('dist/_routes.json', JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }) + '\n');
for (const lang of ['ru', 'lv']) {
  const page = `dist/${lang}/404/index.html`;
  if (existsSync(page)) copyFileSync(page, `dist/${lang}/404.html`);
}
if (!existsSync('dist/404.html')) throw new Error('dist/404.html is missing: Pages would treat the shop as a single-page app');
console.log('pages: _worker.js, _routes.json and per-language 404 pages in place');
