/**
 * Accessibility audit of the built pages, in every language, at two widths.
 *
 * check-html asserts structure — nesting, headings, ids, labels — because that
 * is what a string can see. It cannot see colour contrast, an ARIA attribute
 * used on an element that does not take it, a scrollable box a keyboard cannot
 * reach, or two landmarks that answer to the same name. Those need a browser
 * and a rules engine, so this runs axe over a real render.
 *
 * Three languages matter here rather than one: Russian and Latvian set longer
 * words, and length moves layout. The overlap that hid the quantity stepper's
 * "+" behind the add-to-box button existed only on the Russian product page at
 * 390px, in no other language and at no other width.
 *
 * Needs a browser and the rules engine, neither of which the build requires:
 *   npm i -D playwright axe-core && npx playwright install chromium
 * so it is deliberately not part of `npm run verify`. Point PLAYWRIGHT at an
 * install elsewhere if the project does not carry its own.
 *
 * Usage: node scripts/check-a11y.mjs [origin]
 * Exits non-zero when something fails, so CI can gate on it.
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const BASE = process.argv[2] || 'http://127.0.0.1:4331';

/** The pages worth auditing: one of every template, not one of every URL. */
const PAGES = [
  '/',
  '/shop/',
  '/products/apple-bar-35g/',
  '/shop/build-your-box/4/',
  '/cart/',
  '/checkout/',
  '/wholesale/',
  '/faq/',
  '/contact/',
  '/legal/terms/',
  '/story/',
  '/why-pastila/',
  '/journal/',
  '/where-to-buy/',
];
const LOCALES = ['', '/ru', '/lv'];
const WIDTHS = [
  [1440, 900],
  [390, 844],
];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

let chromium;
try {
  // A CommonJS build arrives under `default`, an ES one exports the name.
  const pw = await import(process.env.PLAYWRIGHT || 'playwright');
  chromium = pw.chromium ?? pw.default?.chromium;
} catch {
  /* fall through to the message below */
}
if (!chromium) {
  console.log('playwright is not installed — see the header of this file. Skipping.');
  process.exit(0);
}
const AXE = await readFile(require_.resolve('axe-core/axe.min.js'), 'utf-8');

const browser = await chromium.launch();
const found = new Map();
let checked = 0;

for (const [w, h] of WIDTHS) {
  for (const locale of LOCALES) {
    for (const path of PAGES) {
      const url = `${BASE}${locale}${path}`;
      const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        /*
         * Anything parked for a scroll reveal is invisible to a contrast check,
         * so the reveal is forced — but a half-finished fade is worse than a
         * hidden element: axe composites the running opacity into the colour
         * and reports a failure against a colour no reader ever sees. Motion
         * off, transitions cut, then a beat before measuring.
         */
        await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
        await page.evaluate(() => document.querySelectorAll('[data-reveal],.reveal').forEach((el) => el.classList.add('is-in')));
        await page.waitForTimeout(120);
        await page.addScriptTag({ content: AXE });
        const res = await page.evaluate(
          async (tags) => await window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: tags } }),
          TAGS,
        );
        checked++;
        for (const v of res.violations) {
          if (!found.has(v.id)) found.set(v.id, { impact: v.impact, help: v.help, samples: new Set(), pages: new Set() });
          const rec = found.get(v.id);
          rec.pages.add(`${w}px ${locale || '/en'}${path}`);
          for (const n of v.nodes.slice(0, 2)) {
            const why = (n.failureSummary || '').split('\n').filter(Boolean).slice(-1)[0]?.trim().slice(0, 160);
            rec.samples.add(`${n.target.join(' ')}\n        ${why}`);
          }
        }
      } catch (e) {
        found.set(`load:${url}`, { impact: 'critical', help: String(e).slice(0, 120), samples: new Set(), pages: new Set([url]) });
      }
      await page.close();
    }
  }
}
await browser.close();

const RANK = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const rows = [...found.entries()].sort((a, b) => (RANK[a[1].impact] ?? 9) - (RANK[b[1].impact] ?? 9) || b[1].pages.size - a[1].pages.size);

console.log(`${checked} page audits across ${LOCALES.length} languages at ${WIDTHS.map(([w]) => `${w}px`).join(' and ')}`);
if (!rows.length) {
  console.log('no violations');
  process.exit(0);
}
console.log(`\n${rows.length} distinct rules failing\n`);
for (const [id, r] of rows) {
  console.log(`${(r.impact || '?').toUpperCase()}  ${id} — ${r.help}`);
  console.log(`    on ${r.pages.size} of ${checked} audits, e.g. ${[...r.pages].slice(0, 3).join(', ')}`);
  for (const s of [...r.samples].slice(0, 3)) console.log(`    · ${s}`);
  console.log();
}
process.exit(1);
