/**
 * The card path, driven in a real browser.
 *
 * scripts/test.mjs proves the server charges the right amount. This proves the
 * other half — that the page hands the right thing to the server and does the
 * right thing with the answer. The failures it is looking for are the ones that
 * cost a sale or a customer's trust rather than throwing an error:
 *
 *   - a button that still says "Place order" while it opens a card form;
 *   - a cart emptied on the way out, so anyone who hesitates at Stripe's page
 *     comes back to an empty box;
 *   - a cart still full after paying, so the next visit re-orders everything;
 *   - prices posted from the browser, which is the whole attack;
 *   - a failed payment that quietly becomes an unpaid "order request", leaving
 *     someone believing they have paid.
 *
 * Stripe is never called. /api/storefront and /api/checkout are stubbed in the
 * page, so this runs offline and sends nothing anywhere.
 *
 * Needs a browser, which the build does not:
 *   npm i -D playwright && npx playwright install chromium
 * so it is deliberately not part of `npm run verify`. Point PLAYWRIGHT at an
 * install elsewhere if this project does not carry its own.
 *
 * Usage: node scripts/check-pay.mjs
 * Exits non-zero when something is wrong.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

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

const DIST = new URL('../dist/', import.meta.url).pathname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };

const server = createServer(async (req, res) => {
  // normalize() collapses any ../ before the join, so a crafted path cannot
  // read outside dist even though this only ever serves a local build.
  const clean = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  for (const candidate of [join(DIST, clean), join(DIST, clean, 'index.html'), join(DIST, `${clean}.html`)]) {
    try {
      if (!(await stat(candidate)).isFile()) continue;
      res.writeHead(200, { 'content-type': TYPES[extname(candidate)] || 'application/octet-stream' });
      res.end(await readFile(candidate));
      return;
    } catch {
      /* try the next shape */
    }
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const problems = [];
const note = (where, msg) => problems.push(`${where}: ${msg}`);
const browser = await chromium.launch();

/** "Pay by card" as each language's dictionary spells it. */
const PAY_LABEL = { '': 'Pay by card', '/ru': 'Оплатить картой', '/lv': 'Maksāt ar karti' };
const STRIPE_URL = 'https://checkout.stripe.test/c/pay/cs_test_123';
const REF = 'SM-PAY-0001';

const fill = async (page) =>
  page.evaluate(() => {
    const set = (sel, v) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    set('[name="name"]', 'Anna Bērziņa');
    set('[name="email"]', 'anna@example.com');
    set('[name="phone"]', '+37120000000');
    // Free postage used to be reachable by typing this word into the address.
    set('[name="address"]', 'Brīvības iela 42-5, pickup, самовывоз');
    set('[name="city"]', 'Rīga');
    set('[name="postcode"]', 'LV-1010');
    const country = document.querySelector('[name="country"]');
    if (country?.tagName === 'SELECT') {
      country.value = [...country.options].find((o) => /Latvia|Latvija|Латв/i.test(o.textContent))?.value || country.options[1]?.value;
      country.dispatchEvent(new Event('change', { bubbles: true }));
    }
    document.querySelector('[name="terms"], [name="accept"]')?.click();
  });

/**
 * Walk a shopper to the filled-in checkout form.
 *
 * `checkout` decides what /api/checkout answers, which is how the three
 * outcomes below — paid, keys gone, provider down — are told apart.
 */
async function walk({ tag, loc = '', payments = true, checkout }) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const seen = { checkout: null, order: null, navigated: '' };
  page.on('pageerror', (e) => note(tag, `page error: ${String(e).slice(0, 120)}`));

  await page.route('**/api/storefront', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ settings: {}, payments, products: {}, reviews: {} }) }));
  await page.route('**/api/checkout', async (route) => {
    seen.checkout = JSON.parse(route.request().postData() || '{}');
    await route.fulfill(checkout);
  });
  await page.route('**/api/order', async (route) => {
    seen.order = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, ref: REF }) });
  });
  // The stub URL must not actually be fetched; catching it here records the
  // hand-off without leaving the machine.
  await page.route('https://checkout.stripe.test/**', async (route) => {
    seen.navigated = route.request().url();
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>stripe</title>' });
  });

  await page.goto(`${BASE}${loc}/products/apple-bar-35g/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.querySelector('.pdp__add')?.click());
  await page.waitForTimeout(300);
  await page.goto(`${BASE}${loc}/checkout/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500); // the storefront fetch repaints the button
  await fill(page);
  await page.waitForTimeout(150);
  return { page, ctx, seen };
}

/* ------------------------------------------------- the button tells the truth */

for (const loc of ['', '/ru', '/lv']) {
  const tag = `label ${loc || 'en'}`;
  const { page, ctx } = await walk({ tag, loc, checkout: { status: 200, contentType: 'application/json', body: '{}' } });
  const shown = await page.evaluate(() => ({
    button: document.querySelector('form[data-checkout] [type="submit"]')?.textContent?.trim() || '',
    note: document.querySelector('[data-pay-note]')?.textContent?.trim() || '',
  }));
  if (shown.button !== PAY_LABEL[loc]) note(tag, `the button says "${shown.button}" where it should say "${PAY_LABEL[loc]}"`);
  if (/payment link|платёж|maksājum/i.test(shown.note) && !/Stripe/i.test(shown.note)) note(tag, `the note still promises an e-mailed payment link: "${shown.note.slice(0, 70)}"`);
  if (!/Stripe/i.test(shown.note)) note(tag, `the note does not say where the card details go: "${shown.note.slice(0, 70)}"`);
  await ctx.close();
}

/* ------------------------------------------------------------- the happy path */

{
  const tag = 'card path';
  const { page, ctx, seen } = await walk({ tag, checkout: { status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, ref: REF, url: STRIPE_URL }) } });
  await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
  await page.waitForTimeout(900);

  if (!seen.checkout) note(tag, 'nothing reached /api/checkout');
  else {
    const lines = seen.checkout.items || [];
    if (!lines.length) note(tag, 'the request carried no lines');
    // The attack this whole design exists to stop: if a price can travel up
    // from the browser, a cart edited in the console buys for a cent.
    const leaked = lines.flatMap((i) => Object.keys(i).filter((k) => k !== 'id' && k !== 'qty'));
    if (leaked.length) note(tag, `a line carried more than id and qty: ${[...new Set(leaked)].join(', ')}`);
    for (const money of ['subtotal', 'shipping', 'total', 'currency']) {
      if (seen.checkout[money] !== undefined) note(tag, `the request carried "${money}" from the browser`);
    }
    if (!seen.checkout.customer?.email) note(tag, 'the request carried no e-mail');
    // The delivery method must travel as a key. The label is prose and is
    // translated; the address is whatever the shopper typed, and the form was
    // filled in above with "pickup" inside it on purpose.
    if (seen.checkout.method !== 'locker') note(tag, `the request reports method "${seen.checkout.method}" where the parcel-locker option was selected`);
  }
  if (seen.order) note(tag, 'the old order-request endpoint was called as well as the card one');
  if (seen.navigated !== STRIPE_URL) note(tag, `the browser went to "${seen.navigated || 'nowhere'}" instead of the payment page`);

  // Stripe's cancel link comes back to the cart. A box emptied on the way out
  // loses the sale of everyone who hesitates at the card form.
  //
  // The browser is standing on the payment page now, and localStorage is
  // per-origin — reading it there reads Stripe's, which is empty whatever we
  // did. Walking back to the cart, exactly as the cancel link does, is both the
  // only way to see our own storage and the situation being tested.
  await page.goto(`${BASE}/cart/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const left = await page.evaluate(() => JSON.parse(localStorage.getItem('semers.cart.v1') || '[]').length);
  if (left === 0) note(tag, 'the cart was emptied before the payment was made');
  await ctx.close();
}

/* --------------------------------------------- coming back, paid and not paid */

for (const [q, want, tag] of [
  ['?ref=SM-PAY-0001&paid=1', 0, 'return paid'],
  ['?ref=SM-PAY-0001', 1, 'return unpaid'],
]) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.route('**/api/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ settings: {}, payments: true, products: {}, reviews: {} }) }));
  await page.goto(`${BASE}/products/apple-bar-35g/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.querySelector('.pdp__add')?.click());
  await page.waitForTimeout(300);
  await page.goto(`${BASE}/order/thank-you/${q}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const left = await page.evaluate(() => JSON.parse(localStorage.getItem('semers.cart.v1') || '[]').length);
  if (left !== want) {
    note(tag, want === 0 ? `the cart still holds ${left} line(s) after a paid order — the next visit would re-order it` : 'the cart was emptied by a visit that never paid');
  }
  await ctx.close();
}

/* ------------------------------------------------------- when things go wrong */

{
  // The keys were pulled since the page loaded. The old path still works, and
  // a shop that quietly keeps selling is better than one that stops.
  const tag = 'keys gone';
  const { page, ctx, seen } = await walk({ tag, checkout: { status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, reason: 'not-configured' }) } });
  await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
  await page.waitForTimeout(1200);
  if (!seen.order) note(tag, 'the order was not placed the old way after the card path turned out to be off');
  const where = await page.evaluate(() => location.pathname);
  if (!/thank-you/.test(where)) note(tag, `stayed on ${where} instead of the thank-you page`);
  await ctx.close();
}

{
  // The provider is down. Saying so is the only safe answer: an order request
  // here would leave someone believing they had paid.
  const tag = 'provider down';
  const { page, ctx, seen } = await walk({ tag, checkout: { status: 502, contentType: 'application/json', body: JSON.stringify({ ok: false, reason: 'payment-provider' }) } });
  await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
  await page.waitForTimeout(1200);
  if (seen.order) note(tag, 'a failed card payment quietly became an unpaid order request');
  if (seen.navigated) note(tag, 'the browser navigated away on a failed payment');
  const state = await page.evaluate(() => ({
    said: document.querySelector('[data-checkout-note]')?.textContent?.trim() || '',
    button: document.querySelector('form[data-checkout] [type="submit"]')?.textContent?.trim() || '',
    disabled: document.querySelector('form[data-checkout] [type="submit"]')?.disabled,
    left: JSON.parse(localStorage.getItem('semers.cart.v1') || '[]').length,
  }));
  if (!state.said) note(tag, 'the page said nothing about the failed payment');
  if (state.button !== PAY_LABEL['']) note(tag, `the button was left reading "${state.button}" instead of offering another try`);
  if (state.disabled) note(tag, 'the button was left disabled, so nobody can try again');
  if (!state.left) note(tag, 'the cart was emptied by a payment that never happened');
  await ctx.close();
}

{
  // Checkout could not write the order down. Handing back a payment link here
  // would charge a card against an order that does not exist.
  const tag = 'order not recorded';
  const { page, ctx, seen } = await walk({ tag, checkout: { status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, reason: 'not-recorded' }) } });
  await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
  await page.waitForTimeout(1200);
  if (seen.navigated) note(tag, 'the browser was sent to pay for an order that was never written down');
  const said = await page.evaluate(() => document.querySelector('[data-checkout-note]')?.textContent?.trim() || '');
  if (!said) note(tag, 'the page said nothing when the order could not be recorded');
  await ctx.close();
}

/* ------------------------------------------------------------- no keys at all */

{
  const tag = 'payments off';
  const { page, ctx, seen } = await walk({ tag, payments: false, checkout: { status: 503, contentType: 'application/json', body: '{}' } });
  const label = await page.evaluate(() => document.querySelector('form[data-checkout] [type="submit"]')?.textContent?.trim() || '');
  if (label === PAY_LABEL['']) note(tag, 'the button offers a card form on a shop with no payment keys');
  await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
  await page.waitForTimeout(900);
  if (seen.checkout) note(tag, 'the card endpoint was called on a shop that cannot take cards');
  if (!seen.order) note(tag, 'the order-request path stopped working');
  await ctx.close();
}

await browser.close();
server.close();

if (problems.length) {
  console.log(`\n${problems.length} problem(s) on the payment path:`);
  for (const p of problems) console.log(`  ${p}`);
  process.exit(1);
}
console.log('\nthe card path holds: the button tells the truth, prices stay on the server,');
console.log('the box survives a change of mind, and a failed payment says so');
