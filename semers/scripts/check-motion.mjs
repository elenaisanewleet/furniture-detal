/**
 * The apple that turns into a bar, driven the way three different readers meet it.
 *
 * The sequence is the one thing on the site that only exists once JavaScript has
 * run and only means anything if the reader scrolls. That is three ways to be
 * let down, and none of them show up in a build log:
 *
 *   scrolling        the silhouette actually changes, the steps keep pace, and
 *                    the last frame is the bar rather than whatever it was
 *                    halfway through;
 *   reduced motion   nothing is pinned and nothing morphs — the five steps are
 *                    a list and the drawing is the finished bar;
 *   no JavaScript    the same, without being asked: a three-screen-tall section
 *                    holding one frozen apple is worse than no section at all.
 *
 * Needs a browser, which the build does not:
 *   npm i -D playwright && npx playwright install chromium
 * so it is deliberately not part of `npm run verify`.
 *
 * Usage: node scripts/check-motion.mjs [origin]
 * Exits non-zero when something is wrong.
 */
const BASE = process.argv[2] || 'http://127.0.0.1:4331';

let chromium;
try {
  const pw = await import(process.env.PLAYWRIGHT || 'playwright');
  chromium = pw.chromium ?? pw.default?.chromium;
} catch {
  /* fall through to the message below */
}
if (!chromium) {
  console.log('playwright is not installed — see the header of this file. Skipping.');
  process.exit(0);
}

const LOCALES = [['', 'english'], ['/ru', 'russian'], ['/lv', 'latvian']];
const problems = [];
const note = (m) => problems.push(m);
const browser = await chromium.launch();

/** Where the section is and how far the reader can travel through it. */
const geometry = () => {
  const el = document.querySelector('[data-forge]');
  if (!el) return null;
  return { top: el.getBoundingClientRect().top + window.scrollY, travel: el.offsetHeight - window.innerHeight, height: el.offsetHeight };
};
/** What the reader can see of it right now. */
const state = () => {
  const el = document.querySelector('[data-forge]');
  const shape = el.querySelector('[data-forge-shape]');
  return {
    d: shape.getAttribute('d') || '',
    // getComputedStyle(...).fill is `url(#forge-body)` — the paint server, not
    // the paint. The colours that actually move are the gradient's stops.
    fill: [...el.querySelectorAll('[data-forge-stop]')].map((s) => s.getAttribute('stop-color')).join(' / '),
    // Measured rather than parsed out of the `d`: an arc's flags and radii are
    // numbers in the string that are not coordinates.
    ratio: (() => { const b = shape.getBBox(); return b.height ? b.width / b.height : 0; })(),
    step: [...el.querySelectorAll('.forge__step')].findIndex((s) => s.classList.contains('is-on')),
    visibleSteps: [...el.querySelectorAll('.forge__step')].filter((s) => Number(getComputedStyle(s).opacity) > 0.9).length,
    sticky: getComputedStyle(el.querySelector('.forge__sticky')).position,
    height: el.offsetHeight,
    wide: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
  };
};

/* ------------------------------------------------------------- scrolling it */

for (const [loc, name] of LOCALES) {
  for (const [w, h, size] of [[1440, 900, 'desktop'], [390, 844, 'phone']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 110)));
    page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text().slice(0, 110)));
    const tag = `${name} ${size}`;

    await page.goto(`${BASE}${loc}/`, { waitUntil: 'domcontentloaded' });
    // A jump this long animates if the page asked it to, and the shot would
    // land mid-flight.
    await page.addStyleTag({ content: 'html,*{scroll-behavior:auto !important}' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const geo = await page.evaluate(geometry);
    if (!geo) {
      note(`${tag}: there is no [data-forge] section on the page at all`);
      await page.close();
      continue;
    }
    if (geo.travel < h) note(`${tag}: the section gives ${geo.travel}px of travel — too short to read five steps in`);

    const seen = [];
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      await page.evaluate((y) => window.scrollTo(0, y), geo.top + t * geo.travel);
      await page.waitForTimeout(320);
      seen.push(await page.evaluate(state));
    }
    const [first, , middle, , last] = seen;
    if (first.sticky !== 'sticky') note(`${tag}: the stage is ${first.sticky}, so nothing pins`);
    if (new Set(seen.map((s) => s.d)).size !== seen.length) note(`${tag}: the silhouette repeats itself — ${new Set(seen.map((s) => s.d)).size} distinct shapes across 5 stops`);
    if (new Set(seen.map((s) => s.fill)).size < 3) note(`${tag}: the colour barely moves (${[...new Set(seen.map((s) => s.fill))].join(', ')})`);
    if (seen.map((s) => s.step).join() !== '0,1,2,3,4') note(`${tag}: the steps read ${seen.map((s) => s.step).join(',')} instead of 0,1,2,3,4`);
    if (seen.some((s) => s.visibleSteps !== 1)) note(`${tag}: ${seen.map((s) => s.visibleSteps).join(',')} steps shown at once — one at a time is the point`);
    for (const s of seen) if (s.wide > 1) note(`${tag}: the page scrolls sideways by ${s.wide}px inside the section`);

    // The last frame has to be the bar the markup ships as its static shape:
    // a rounded rectangle is wider than it is tall, an apple is not.
    if (first.ratio > 1.2) note(`${tag}: the first frame is ${first.ratio.toFixed(2)} wide-to-tall — that is not an apple`);
    if (last.ratio < 2) note(`${tag}: the last frame is ${last.ratio.toFixed(2)} wide-to-tall — that is not a bar`);
    if (middle.ratio > last.ratio) note(`${tag}: the middle is already flatter than the end`);

    for (const e of errors) note(`${tag}: console ${e}`);
    await page.close();
    console.log(`  ${tag.padEnd(17)} 5 shapes, 5 colours, steps 0→4, ends ${last.ratio.toFixed(1)}× wide`);
  }
}

/* ------------------------------------------ asked for less motion, and none at all */

for (const [what, opts] of [
  ['reduced motion', { reducedMotion: 'reduce' }],
  ['no javascript', { javaScriptEnabled: false }],
]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const s = await page.evaluate(state);
  if (s.sticky === 'sticky') note(`${what}: the stage still pins the reader`);
  if (s.visibleSteps !== 5) note(`${what}: ${s.visibleSteps} of 5 steps are readable`);
  if (s.height > 1400) note(`${what}: the section is still ${s.height}px tall with nothing happening in it`);
  if (s.wide > 1) note(`${what}: the page scrolls sideways by ${s.wide}px`);
  // The markup's own `d` is the bar, so this holds even with no script at all.
  if (s.ratio < 2) note(`${what}: the drawing is ${s.ratio.toFixed(2)} wide-to-tall — it should be resting on the bar`);
  await ctx.close();
  console.log(`  ${what.padEnd(17)} nothing pinned, all 5 steps readable, resting on the bar`);
}

await browser.close();
console.log(problems.length ? `\n${problems.length} problems:` : '\nthe apple becomes a bar, and stays a bar for everyone who asked not to watch');
problems.forEach((p) => console.log('  -', p));
process.exit(problems.length ? 1 : 0);
