/**
 * The back office, driven the way the owner drives it.
 *
 * It had only ever been checked through its API. Nothing had looked at the
 * page: whether each tab renders, whether the rows survive a phone width,
 * whether approving a review or saving a price sends what it should, and — the
 * one that matters most — whether a request that fails says what actually went
 * wrong, or sends the owner back to retype a password that was never the
 * problem.
 *
 * The API is stubbed, so nothing here touches a database.
 *
 * Needs a browser, which the build does not:
 *   npm i -D playwright && npx playwright install chromium
 * so it is deliberately not part of `npm run verify`. Point PLAYWRIGHT at an
 * install elsewhere if this project does not carry its own.
 *
 * Usage: node scripts/check-admin.mjs [origin]
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

/* Enough of each shape for the views to have something real to draw. */
const ORDERS = [
  {
    id: 'SM-260904-AB12', created_at: '2026-09-04T08:00:00Z', type: 'order', status: 'new',
    name: 'Anna Bērziņa', email: 'anna@example.com', phone: '+37120000000', country: 'Latvia', city: 'Rīga',
    postcode: 'LV-1010', address: 'Brīvības iela 42-5', delivery: 'Omniva', note: 'Позвоните перед доставкой',
    gift: '', currency: 'EUR', subtotal: 18.56, shipping: 3.9, total: 22.46,
    items: [{ name: "App'Lite Apple Bar", variant: 'Classic', qty: 2, price: 1.45, total: 2.9 }],
    admin_note: '', page: '/ru/checkout/',
  },
  {
    id: 'SM-260903-CD34', created_at: '2026-09-03T14:20:00Z', type: 'wholesale', status: 'confirmed',
    name: 'Jānis Ozols', email: 'janis@shop.lv', phone: '', country: 'Latvia', city: 'Liepāja',
    postcode: '', address: '', delivery: '', note: 'Интересует опт', gift: '', currency: 'EUR',
    subtotal: 0, shipping: 0, total: 0, items: [], admin_note: '', page: '/lv/wholesale/',
  },
];
const REVIEWS = [
  { id: 1, created_at: '2026-09-04T07:00:00Z', slug: 'apple-bar-35g', rating: 5, author: 'Мария', city: 'Рига', title: 'Отлично', body: 'Вкусно и без сахара.', email: 'm@example.com', status: 'pending', verified: 0, reply: '', locale: 'ru' },
  { id: 2, created_at: '2026-09-02T07:00:00Z', slug: 'tasting-box', rating: 4, author: 'Anna', city: 'Riga', title: 'Good', body: 'Nice box.', email: 'a@example.com', status: 'approved', verified: 1, reply: '', locale: 'en' },
];
const FIXTURES = {
  stats: { ok: true, orders: 12, revenue: 268.4, last30: { orders: 5, revenue: 96.2 }, byStatus: { new: 3, confirmed: 2, paid: 4, done: 3 }, pendingReviews: 1 },
  orders: { ok: true, orders: ORDERS },
  reviews: { ok: true, reviews: REVIEWS },
  products: { ok: true, products: [{ slug: 'apple-bar-35g', price: null, compare_at: null, in_stock: null, hidden: null, badge: '', batch: '', note: '' }] },
  settings: { ok: true, settings: { announcement_ru: 'Бесплатная доставка от 25 €', announcement_en: 'Free shipping over €25', freeFrom: 25, tiersOn: true } },
  subscribers: { ok: true, subscribers: [{ email: 'a@example.com', created_at: '2026-09-01T00:00:00Z', source: 'newsletter' }] },
  login: { ok: true },
  logout: { ok: true },
};

const problems = [];
const note = (m) => problems.push(m);
const browser = await chromium.launch();

/** `signedIn` decides whether the boot call lands on the login screen or the panel. */
const stub = (page, { seen = [], signedIn = true } = {}) =>
  page.route('**/api/admin/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/admin/', '').split('?')[0];
    seen.push(`${route.request().method()} ${path}${url.search}`);
    const body = path === 'session' ? { ok: signedIn, configured: true, database: true } : FIXTURES[path] || { ok: true };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

const TABS = [
  ['orders', /заказ/i],
  ['reviews', /отзыв/i],
  ['products', /товар|цен/i],
  ['settings', /настрой/i],
];

for (const [w, h, size] of [
  [1440, 900, 'desktop'],
  [390, 844, 'phone'],
]) {
  const seen = [];
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 110)));
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text().slice(0, 110)));
  await stub(page, { seen, signedIn: false });

  await page.goto(`${BASE}/admin/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const pw_ = await page.$('#adm-pw, input[type="password"]');
  if (!pw_) note(`${size}: no password field on the login screen`);
  else {
    await pw_.fill('hunter2');
    await page.evaluate(() => document.querySelector('#adm form')?.requestSubmit());
    await page.waitForTimeout(600);
  }

  for (const [tab, reads] of TABS) {
    await page.evaluate((t) => document.querySelector(`[data-tab="${t}"]`)?.click(), tab);
    await page.waitForTimeout(400);
    const state = await page.evaluate(() => ({
      text: document.getElementById('adm')?.innerText || '',
      selected: document.querySelector('[data-tab][aria-selected="true"]')?.getAttribute('data-tab'),
      wide: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    }));
    if (state.selected !== tab) note(`${size}: clicking the ${tab} tab left "${state.selected}" selected`);
    if (!reads.test(state.text)) note(`${size}: the ${tab} tab does not read as itself`);
    if (state.wide > 1) note(`${size}: the ${tab} tab scrolls sideways by ${state.wide}px`);
    if (state.text.trim().length < 40) note(`${size}: the ${tab} tab is empty`);
  }

  await page.evaluate(() => document.querySelector('[data-tab="reviews"]')?.click());
  await page.waitForTimeout(400);
  seen.length = 0;
  await page.evaluate(() => document.querySelector('[data-review-action="approved"]')?.click());
  await page.waitForTimeout(500);
  if (!seen.some((s) => /^(PUT|POST|PATCH) reviews/.test(s))) note(`${size}: approving a review sent ${JSON.stringify(seen)}`);

  await page.evaluate(() => document.querySelector('[data-tab="products"]')?.click());
  await page.waitForTimeout(400);
  seen.length = 0;
  const priced = await page.evaluate(() => {
    const input = document.querySelector('[data-p="price"]');
    if (!input) return false;
    input.value = '1.99';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.closest('tr')?.querySelector('button')?.click();
    return true;
  });
  await page.waitForTimeout(600);
  if (!priced) note(`${size}: no price field in the products tab`);
  else if (!seen.some((s) => /^(PUT|POST|PATCH) products/.test(s))) note(`${size}: saving a price sent ${JSON.stringify(seen)}`);

  for (const e of errors) note(`${size}: console ${e}`);
  await page.close();
  console.log(`  ${size}: login, four tabs, a review approved and a price saved`);
}

/* --------------------------------------------------- what the door says */

/*
 * Only a 401 means the password was wrong. Everything else — no ADMIN_PASSWORD
 * on the host, no database, a 500 — used to be reported as a wrong password,
 * which sends the owner to type it again, eight more times, until the login
 * limiter locks them out of a door that was never locked.
 */
const DOORS = [
  [401, 'password', /неверный пароль/i, 'a wrong password'],
  [429, 'too-many-attempts', /слишком много попыток/i, 'too many attempts'],
  [503, 'admin-not-configured', /ADMIN_PASSWORD/, 'no password set on the host'],
  [503, 'no-database', /база данных/i, 'the database is unreachable'],
  [500, undefined, /не удалось/i, 'an unexplained server error'],
];
for (const [status, reason, expect, what] of DOORS) {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.route('**/api/admin/**', (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/admin/', '').split('?')[0];
    if (path === 'session') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false,"configured":true,"database":true}' });
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ ok: false, ...(reason ? { reason } : {}) }) });
  });
  await page.goto(`${BASE}/admin/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await (await page.$('#adm-pw, input[type="password"]'))?.fill('x');
  await page.evaluate(() => document.querySelector('#adm form')?.requestSubmit());
  await page.waitForTimeout(500);
  const said = (await page.evaluate(() => document.querySelector('#adm .adm-err')?.textContent || document.getElementById('adm')?.innerText || '')).trim().split('\n')[0];
  if (!expect.test(said)) note(`${what} is reported as "${said.slice(0, 70)}"`);
  await page.close();
}
console.log(`  the login screen names all ${DOORS.length} reasons it can fail`);

/* ------------------------------------------------ and it refuses to be framed */

/*
 * A transparent frame over someone else's page turns the owner's clicks into
 * approvals, price changes and deletions. The page is a static file served by a
 * Worker that never sees the request, so there is no response to hang
 * X-Frame-Options on: it has to refuse on its own.
 *
 * Two outcomes are safe and the page must reach one of them. Framed normally it
 * navigates the top window to itself, which throws the probe away with the
 * attacker's page. Framed inside a sandbox that forbids that, it cannot
 * navigate — so it stays hidden instead of quietly becoming a control somebody
 * else is aiming.
 *
 * The parent has to be same-origin or `contentDocument` is null whatever the
 * page does, and a check that cannot see into the frame passes on anything.
 */
for (const [sandbox, what] of [
  [null, 'in a plain frame it navigates the top window away'],
  ['allow-scripts allow-same-origin', 'in a sandbox that forbids that, it stays blank'],
]) {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await stub(page);
  await page.goto(`${BASE}/shop/`, { waitUntil: 'domcontentloaded' });
  const framed = await page
    .evaluate(async ([src, sb]) => {
      const f = document.createElement('iframe');
      f.src = src;
      f.width = '800';
      f.height = '600';
      if (sb !== null) f.setAttribute('sandbox', sb);
      document.body.appendChild(f);
      await new Promise((r) => setTimeout(r, 900));
      const d = f.contentDocument;
      if (!d) return { blind: true };
      return { display: getComputedStyle(d.documentElement).display, text: (d.body?.innerText || '').trim().slice(0, 40) };
    }, [`${BASE}/admin/`, sandbox])
    // The probe dying with its own page is the loud version of a pass: the
    // frame navigated the top window, taking the evaluate context with it.
    .catch(() => ({ bustedOut: true }));
  await page.waitForTimeout(300);
  const left = !new URL(page.url()).pathname.startsWith('/shop');
  if (framed.blind) note(`${what}: could not see into the frame, so nothing was proved`);
  else if (!framed.bustedOut && !left && framed.display !== 'none') note(`framed with sandbox="${sandbox}", the back office renders anyway ("${framed.text}")`);
  await page.close();
  console.log(`  ${what}`);
}

await browser.close();
console.log(problems.length ? `\n${problems.length} problems:` : '\nthe back office works, and says what went wrong when it does not');
problems.forEach((p) => console.log('  -', p));
process.exit(problems.length ? 1 : 0);
