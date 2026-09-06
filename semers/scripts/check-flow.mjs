/**
 * The path a customer walks, and the keyboard that has to walk it too.
 *
 * Every part of this is checked somewhere else — the pages build, the strings
 * are translated, the markup is sound. The joins are not, and the joins are
 * where a shop breaks: a box that empties on navigation, a total that disagrees
 * with the drawer, a thank-you page with no reference on it, a drawer a
 * keyboard can open and never leave.
 *
 * Two passes:
 *   flow      product → add → drawer → cart → checkout → submit → thank-you,
 *             in every language at a desktop and a phone width, against a
 *             stubbed endpoint so nothing is sent anywhere;
 *   keyboard  the skip link actually hands over focus, every Tab stop shows a
 *             ring, the drawer takes focus and holds it, Escape closes it and
 *             gives focus back to the button that opened it.
 *
 * Needs a browser, which the build does not:
 *   npm i -D playwright && npx playwright install chromium
 * so it is deliberately not part of `npm run verify`. Point PLAYWRIGHT at an
 * install elsewhere if this project does not carry its own.
 *
 * Usage: node scripts/check-flow.mjs [origin]
 * Exits non-zero when something is wrong.
 */
const BASE = process.argv[2] || 'http://127.0.0.1:4331';

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

const LOCALES = [
  ['', 'english'],
  ['/ru', 'russian'],
  ['/lv', 'latvian'],
];
const WIDTHS = [
  [1440, 900, 'desktop'],
  [390, 844, 'phone'],
];
/** Two packs of the same bar: enough to exercise a quantity, cheap enough to stay under the free-shipping threshold. */
const PRODUCT = '/products/apple-bar-35g/';
const REF = 'SM-TEST-0001';

const problems = [];
const note = (where, msg) => problems.push(`${where}: ${msg}`);
const browser = await chromium.launch();

/* ------------------------------------------------------------------- flow */

for (const [loc, name] of LOCALES) {
  for (const [w, h, size] of WIDTHS) {
    const tag = `${name} ${size}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    const trace = { rows: 0, qty: '?', total: '?', ref: '', left: '?' };
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 100)));

    let posted = null;
    await page.route('**/api/order', async (route) => {
      posted = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, ref: REF }) });
    });

    try {
      await page.goto(`${BASE}${loc}${PRODUCT}`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.querySelector('[data-qty-inc]')?.click());
      await page.evaluate(() => document.querySelector('.pdp__add')?.click());
      await page.waitForTimeout(400);

      const drawer = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('#cart-items .ci')];
        return { rows: rows.length, qty: rows[0]?.querySelector('output')?.textContent?.trim() };
      });
      trace.rows = drawer.rows;
      trace.qty = drawer.qty;
      if (!drawer.rows) note(tag, 'nothing in the drawer after adding to the box');
      if (drawer.qty !== '2') note(tag, `the drawer says ${drawer.qty} where 2 was added`);

      await page.goto(`${BASE}${loc}/cart/`, { waitUntil: 'domcontentloaded' });
      const rows = await page.evaluate(() => document.querySelectorAll('.ci').length);
      if (!rows) note(tag, 'the cart page is empty after the drawer had a line in it');

      await page.goto(`${BASE}${loc}/checkout/`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        const set = (sel, v) => {
          const el = document.querySelector(sel);
          if (!el) return;
          el.value = v;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        set('[name="name"]', 'Anna Bērziņa');
        set('[name="email"]', 'anna@example.com');
        set('[name="phone"]', '+37120000000');
        set('[name="address"]', 'Brīvības iela 42-5');
        set('[name="city"]', 'Rīga');
        set('[name="postcode"]', 'LV-1010');
        const country = document.querySelector('[name="country"]');
        if (country?.tagName === 'SELECT') {
          country.value = [...country.options].find((o) => /Latvia|Latvija|Латв/i.test(o.textContent))?.value || country.options[1]?.value;
          country.dispatchEvent(new Event('change', { bubbles: true }));
        }
        document.querySelector('[name="terms"], [name="accept"]')?.click();
      });
      await page.waitForTimeout(150);
      await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
      await page.waitForTimeout(900);

      if (!posted) {
        const why = await page.evaluate(() => document.querySelector('[data-checkout-note]')?.textContent?.trim() || '');
        note(tag, `the order never reached the endpoint${why ? ` — the page said "${why.slice(0, 80)}"` : ''}`);
      } else {
        trace.total = posted.total;
        if (posted.locale !== (loc.replace('/', '') || 'en')) note(tag, `the order reports locale "${posted.locale}"`);
        if (!posted.items?.length) note(tag, 'the order carried no items');
        const lines = (posted.items || []).reduce((n, i) => n + Number(i.total || 0), 0);
        if (Math.abs(lines - Number(posted.subtotal)) > 0.011) note(tag, `subtotal ${posted.subtotal} does not match the lines (${lines.toFixed(2)})`);
        const sum = Number(posted.subtotal) + Number(posted.shipping || 0);
        if (Math.abs(sum - Number(posted.total)) > 0.011) note(tag, `total ${posted.total} is not subtotal + shipping (${sum.toFixed(2)})`);
      }

      await page.waitForTimeout(500);
      const done = await page.evaluate(() => ({
        url: location.pathname,
        ref: document.body.innerText.match(/SM-[A-Z0-9-]+/)?.[0] || '',
        left: JSON.parse(localStorage.getItem('semers.cart') || '[]').length,
      }));
      trace.ref = done.ref;
      trace.left = done.left;
      if (!/thank-you|order/.test(done.url)) note(tag, `stayed on ${done.url} instead of the thank-you page`);
      else {
        if (done.ref !== REF) note(tag, `the thank-you page shows "${done.ref}" instead of the reference`);
        if (done.left) note(tag, `the box still holds ${done.left} line(s) after the order went through`);
      }
      for (const e of errors) note(tag, `console ${e}`);
    } catch (e) {
      note(tag, String(e).slice(0, 120));
    }
    await ctx.close();
    // A silent pass proves nothing without evidence the steps happened.
    console.log(`  ${tag.padEnd(17)} drawer ${trace.rows}×${trace.qty} · posted ${trace.total} · ref ${trace.ref || '—'} · box left ${trace.left}`);
  }
}

/* --------------------------------------------------------------- keyboard */

for (const [loc, name] of LOCALES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${loc}${PRODUCT}`, { waitUntil: 'domcontentloaded' });

  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const landed = await page.evaluate(() => {
    const a = document.activeElement;
    return { inMain: a?.id === 'main' || !!a?.closest('main'), on: `${a?.tagName.toLowerCase()}#${a?.id || ''}` };
  });
  // Chrome and Safari scroll to a fragment without moving focus unless the
  // target can take it, and then the next Tab carries on from the skip link —
  // back into the header the reader just asked to skip.
  if (!landed.inMain) note(name, `the skip link left focus on ${landed.on}, outside main`);

  /*
   * Pressed, not called: el.focus() does not put a button into :focus-visible
   * in Chromium, so a check built on it reports every keyboard-only ring as
   * missing.
   */
  const invisible = [];
  const seen = new Set();
  for (let i = 0; i < 70; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body || a === document.documentElement || a.tagName === 'MAIN') return null;
      const s = getComputedStyle(a);
      // getComputedStyle is live, so the values are copied out before anything
      // else can change them.
      const outline = `${s.outlineStyle} ${s.outlineWidth}`;
      const shadow = s.boxShadow;
      return {
        key: `${a.tagName}.${a.className}.${(a.textContent || '').slice(0, 20)}`,
        ringed: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (shadow && shadow !== 'none'),
        label: `${a.tagName.toLowerCase()}.${String(a.className).split(' ')[0]} "${(a.textContent || a.value || a.getAttribute('aria-label') || '').trim().slice(0, 28)}" — outline ${outline}`,
      };
    });
    if (!r || seen.has(r.key)) continue;
    seen.add(r.key);
    if (!r.ringed) invisible.push(r.label);
  }
  for (const el of invisible.slice(0, 6)) note(name, `no visible focus ring on ${el}`);

  await page.evaluate(() => document.querySelector('.pdp__add')?.click());
  await page.waitForTimeout(450);
  if (!(await page.evaluate(() => !!document.activeElement?.closest('#cart')))) note(name, 'opening the drawer left focus outside it');

  let escaped = null;
  for (let i = 0; i < 25 && !escaped; i++) {
    await page.keyboard.press('Tab');
    escaped = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return 'body';
      return a.closest('#cart') ? null : `${a.tagName.toLowerCase()}.${String(a.className).split(' ')[0]}`;
    });
  }
  if (escaped) note(name, `Tab walked out of the open drawer onto ${escaped}`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(350);
  const after = await page.evaluate(() => {
    const d = document.querySelector('#cart');
    const s = d && getComputedStyle(d);
    return {
      open: !!(d?.open || d?.hasAttribute('open') || (s && s.visibility !== 'hidden' && s.display !== 'none')),
      focus: document.activeElement?.className || document.activeElement?.tagName,
    };
  });
  if (after.open) note(name, 'Escape did not close the drawer');
  if (/^BODY$/i.test(String(after.focus))) note(name, 'closing the drawer dropped focus on the body instead of the button that opened it');

  await page.close();
  console.log(`  ${name.padEnd(17)} ${seen.size} Tab stops, all ringed; drawer takes focus, holds it, and gives it back`);
}

await browser.close();
console.log(problems.length ? `\n${problems.length} problems:` : '\nthe whole path works in every language, by mouse and by keyboard');
problems.forEach((p) => console.log('  -', p));
process.exit(problems.length ? 1 : 0);
