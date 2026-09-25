/**
 * The payment path, driven in a real browser.
 *
 * scripts/test.mjs proves the server charges the right amount and signs the
 * Paysera request correctly. This proves the other half — that the page hands
 * the right thing to the server and does the right thing with the answer. The
 * failures it is looking for are the ones that cost a sale or a customer's
 * trust rather than throwing an error:
 *
 *   - a button that still says "Place order" while it opens a payment page;
 *   - a cart emptied on the way out, so anyone who hesitates on Paysera's page
 *     comes back to an empty box;
 *   - a cart still full after paying, so the next visit re-orders everything;
 *   - prices posted from the browser, which is the whole attack;
 *   - a parcel locker the shopper chose that never reaches the order;
 *   - a failed payment that quietly becomes an unpaid "order request", leaving
 *     someone believing they have paid.
 *
 * Paysera and Omniva are never called. /api/storefront, /api/lockers and
 * /api/checkout are stubbed in the page, and the hand-off to www.paysera.com is
 * caught before it leaves the machine, so this runs offline and sends nothing
 * anywhere.
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

// DIST points the check at another build, such as one made outside dist/ for a trial run.
const DIST = process.env.DIST ? `${process.env.DIST.replace(/\/$/, '')}/` : new URL('../dist/', import.meta.url).pathname;
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

/** "Pay for the order" as each language's dictionary spells it. */
const PAY_LABEL = { '': 'Pay for the order', '/ru': 'Оплатить заказ', '/lv': 'Apmaksāt pasūtījumu' };
const PAYSERA_URL = 'https://www.paysera.com/pay/?data=cHJvamVjdGlkPTE-&sign=0123456789abcdef0123456789abcdef';
const REF = 'SM-PAY-0001';
/** The compact shape /api/lockers serves, in Omniva's own spelling. */
const LOCKERS = [
  { id: '9102', name: 'Tallinna Kristiine pakiautomaat', city: 'Tallinn', address: 'Endla 45', country: 'EE' },
  { id: '96332', name: 'Āgenskalna tirgus pakomāts', city: 'Rīga', address: 'Nometņu iela 64', country: 'LV' },
  { id: '96331', name: 'Rīga Brīvības Rimi pakomāts', city: 'Rīga', address: 'Brīvības iela 372', country: 'LV' },
];

/** Fill the form the way a shopper does, choosing a locker from the list unless it would not load. */
const fill = async (page, { manual = false } = {}) => {
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
    const country = document.querySelector('[name="country"]');
    if (country?.tagName === 'SELECT') {
      country.value = [...country.options].find((o) => /Latvia|Latvija|Латв/i.test(o.textContent))?.value || country.options[0]?.value;
      country.dispatchEvent(new Event('change', { bubbles: true }));
    }
    document.querySelector('[name="terms"], [name="accept"]')?.click();
  });
  if (manual) {
    await page.waitForSelector('#co-locker-text:not([disabled])', { timeout: 3000 }).catch(() => null);
    if (!(await page.$('#co-locker-text:not([disabled])'))) return note('checkout', 'no typed locker field replaced the list that would not load');
    // Free postage used to be reachable by typing this word into the address.
    await page.fill('#co-locker-text', 'Omniva Brīvības iela 372, pickup, самовывоз');
    return;
  }
  // A checkout without the picker, or a picker that lists nothing, is a
  // finding rather than a crash: the checks after it report what that cost.
  if (!(await page.$('#co-locker-q'))) return note('checkout', 'there is no parcel-locker picker to choose from');
  await page.fill('#co-locker-q', 'briv');
  const listed = await page.waitForSelector('#co-locker-list [role="option"]', { timeout: 3000 }).catch(() => null);
  if (!listed) return note('checkout', 'typing "briv" listed no parcel locker');
  await page.click('#co-locker-list [role="option"]');
};

/**
 * Walk a shopper to the filled-in checkout form.
 *
 * `checkout` decides what /api/checkout answers, which is how the three
 * outcomes below — paid, keys gone, provider down — are told apart.
 */
async function walk({ tag, loc = '', payments = true, checkout, lockers = true }) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const seen = { checkout: null, order: null, navigated: '' };
  page.on('pageerror', (e) => note(tag, `page error: ${String(e).slice(0, 120)}`));

  await page.route('**/api/storefront', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ settings: {}, payments, products: {}, reviews: {} }) }));
  await page.route('**/api/lockers', (route) => (lockers ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(LOCKERS) }) : route.fulfill({ status: 502, contentType: 'application/json', body: '{"ok":false}' })));
  await page.route('**/api/checkout', async (route) => {
    seen.checkout = JSON.parse(route.request().postData() || '{}');
    await route.fulfill(checkout);
  });
  await page.route('**/api/order', async (route) => {
    seen.order = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, ref: REF }) });
  });
  // Paysera must not actually be reached; catching the navigation here
  // records the hand-off without leaving the machine.
  await page.route('https://www.paysera.com/**', async (route) => {
    seen.navigated = route.request().url();
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>paysera</title>' });
  });

  await page.goto(`${BASE}${loc}/products/apple-bar-35g/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.querySelector('.pdp__add')?.click());
  await page.waitForTimeout(300);
  await page.goto(`${BASE}${loc}/checkout/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500); // the storefront fetch repaints the button
  await fill(page, { manual: !lockers });
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
  if (/payment link|ссылк|saite/i.test(shown.note)) note(tag, `the note still promises an e-mailed payment link: "${shown.note.slice(0, 70)}"`);
  if (!/Paysera/i.test(shown.note)) note(tag, `the note does not say where the payment happens: "${shown.note.slice(0, 70)}"`);
  await ctx.close();
}

/* ------------------------------------------------------------- the happy path */

{
  const tag = 'payment path';
  const { page, ctx, seen } = await walk({ tag, checkout: { status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, ref: REF, url: PAYSERA_URL }) } });
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
    // The locker the shopper picked has to reach the order, by name and by id.
    const c = seen.checkout.customer || {};
    if (c.locker !== '96331') note(tag, `the request carried locker "${c.locker}" instead of the one chosen (96331)`);
    if (c.address !== 'Omniva: Rīga Brīvības Rimi pakomāts (96331)') note(tag, `the address reads "${c.address}" instead of the chosen locker`);
    if (c.city !== 'Rīga') note(tag, `the city reads "${c.city}" instead of the locker's`);
    if ('newsletter' in c) note(tag, 'the checkout still carries a newsletter signup');
  }
  if (seen.order) note(tag, 'the old order-request endpoint was called as well as the payment one');
  if (seen.navigated !== PAYSERA_URL) note(tag, `the browser went to "${seen.navigated || 'nowhere'}" instead of the payment page`);
  else if (new URL(seen.navigated).hostname !== 'www.paysera.com') note(tag, 'the payment page is not on www.paysera.com');

  // Paysera's cancel link comes back to the cart. A box emptied on the way out
  // loses the sale of everyone who hesitates on the payment page.
  //
  // The browser is standing on the payment page now, and localStorage is
  // per-origin — reading it there reads Paysera's, which is empty whatever we
  // did. Walking back to the cart, exactly as the cancel link does, is both the
  // only way to see our own storage and the situation being tested.
  await page.goto(`${BASE}/cart/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const left = await page.evaluate(() => JSON.parse(localStorage.getItem('semers.cart.v1') || '[]').length);
  if (left === 0) note(tag, 'the cart was emptied before the payment was made');
  await ctx.close();
}

/* --------------------------------------------- the locker list would not load */

{
  // Omniva's feed is down: the picker gives way to a typed field, and the sale goes on.
  const tag = 'lockers down';
  const { page, ctx, seen } = await walk({ tag, lockers: false, checkout: { status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, ref: REF, url: PAYSERA_URL }) } });
  const state = await page.evaluate(() => ({
    manual: !document.querySelector('[data-locker-manual]')?.hidden,
    picker: !document.querySelector('[data-locker-picker]')?.hidden,
    said: document.querySelector('[data-locker-status]')?.textContent?.trim() || '',
  }));
  if (!state.manual || state.picker) note(tag, 'the typed field did not replace the picker');
  if (!state.said) note(tag, 'nothing said why the list is missing');
  await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
  await page.waitForTimeout(900);
  const c = seen.checkout?.customer || {};
  if (!seen.checkout) note(tag, 'the order could not be placed without the list');
  else {
    if (!/Brīvības iela 372/.test(c.address || '')) note(tag, `the typed locker did not reach the order: "${c.address}"`);
    if (c.locker) note(tag, `a locker id "${c.locker}" was sent that nobody chose`);
    if (seen.checkout.method !== 'locker') note(tag, `the request reports method "${seen.checkout.method}"`);
  }
  await ctx.close();
}

{
  // A locker has to be chosen, not just typed at: the form says so instead of sending a guess.
  const tag = 'no locker chosen';
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  let posted = false;
  await page.route('**/api/storefront', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ settings: {}, payments: true, products: {}, reviews: {} }) }));
  await page.route('**/api/lockers', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(LOCKERS) }));
  await page.route('**/api/checkout', (route) => ((posted = true), route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })));
  await page.goto(`${BASE}/products/apple-bar-35g/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.querySelector('.pdp__add')?.click());
  await page.waitForTimeout(300);
  await page.goto(`${BASE}/checkout/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    for (const [n, v] of [['name', 'A B'], ['email', 'a@b.co'], ['phone', '+37120000000']]) document.querySelector(`[name="${n}"]`).value = v;
    document.querySelector('[name="terms"]').click();
  });
  if (!(await page.$('#co-locker-q'))) note(tag, 'there is no parcel-locker picker to leave empty');
  else {
    await page.fill('#co-locker-q', 'Rīga');
    await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
    await page.waitForTimeout(500);
    if (posted) note(tag, 'an order went out with no locker chosen');
    const invalid = await page.evaluate(() => document.querySelector('#co-locker-q')?.validationMessage || '');
    if (!invalid) note(tag, 'the locker field did not say a locker must be chosen');
  }
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
  // Paysera appends its own data and ss1 to the accept URL; the page must not mind.
  await page.goto(`${BASE}/order/thank-you/${q}${q.includes('paid') ? '&data=ZGF0YQ--&ss1=abc&ss2=def' : ''}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const left = await page.evaluate(() => JSON.parse(localStorage.getItem('semers.cart.v1') || '[]').length);
  if (left !== want) {
    note(tag, want === 0 ? `the cart still holds ${left} line(s) after a paid order — the next visit would re-order it` : 'the cart was emptied by a visit that never paid');
  }
  // The page tells a paid order from an order request, and never promises a payment link to someone who has paid.
  const shown = await page.evaluate(() => ({
    paid: [...document.querySelectorAll('[data-ty="paid"]')].every((n) => !n.hidden),
    request: [...document.querySelectorAll('[data-ty="request"]')].every((n) => !n.hidden),
    ref: document.getElementById('ty-ref')?.textContent || '',
  }));
  if (want === 0 && (!shown.paid || shown.request)) note(tag, 'a paid order was shown the order-request text');
  if (want === 1 && (shown.paid || !shown.request)) note(tag, 'an order request was shown the paid text');
  if (shown.ref !== REF) note(tag, `the reference reads "${shown.ref}"`);
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
  // The checkout endpoint failed. Saying so is the only safe answer: an order
  // request here would leave someone believing they had paid.
  const tag = 'checkout down';
  const { page, ctx, seen } = await walk({ tag, checkout: { status: 502, contentType: 'application/json', body: JSON.stringify({ ok: false, reason: 'server-error' }) } });
  await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
  await page.waitForTimeout(1200);
  if (seen.order) note(tag, 'a failed payment quietly became an unpaid order request');
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

{
  // A product taken off sale after it went into the cart: the page names it.
  const tag = 'item gone';
  const { page, ctx, seen } = await walk({ tag, checkout: { status: 422, contentType: 'application/json', body: JSON.stringify({ ok: false, reason: 'unknown-item', id: 'apple-bar-35g:classic' }) } });
  await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
  await page.waitForTimeout(900);
  if (seen.navigated) note(tag, 'the browser went to pay for a cart the server refused');
  const said = await page.evaluate(() => document.querySelector('[data-checkout-note]')?.textContent?.trim() || '');
  if (!/Apple Bar/.test(said)) note(tag, `the page did not name the product that is gone: "${said.slice(0, 80)}"`);
  await ctx.close();
}

/* ------------------------------------------------------------- no keys at all */

{
  const tag = 'payments off';
  const { page, ctx, seen } = await walk({ tag, payments: false, checkout: { status: 503, contentType: 'application/json', body: '{}' } });
  const label = await page.evaluate(() => document.querySelector('form[data-checkout] [type="submit"]')?.textContent?.trim() || '');
  if (label === PAY_LABEL['']) note(tag, 'the button offers a payment page on a shop with no payment keys');
  await page.evaluate(() => document.querySelector('form [type="submit"]')?.click());
  await page.waitForTimeout(900);
  if (seen.checkout) note(tag, 'the payment endpoint was called on a shop that cannot take payments');
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
console.log('\nthe payment path holds: the button tells the truth, prices stay on the server,');
console.log('the chosen locker reaches the order, the box survives a change of mind, and a failed payment says so');
