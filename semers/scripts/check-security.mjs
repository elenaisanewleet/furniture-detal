/**
 * The locks, tried rather than read.
 *
 * Everything else in `scripts/` checks that the shop works. This one checks
 * what happens when someone is not shopping: an oversized body, a forged
 * cookie, a session that was signed out somewhere else, a cross-site form post,
 * a password guessed eight times, a banner link with a scheme in it, and a
 * server error that would rather not name its own tables.
 *
 * The Worker is driven directly — its real `fetch`, over a real SQLite file
 * standing in for D1 — so what passes here is the code that ships, not a
 * description of it. The module keeps `schemaReady` per isolate, so each
 * scenario imports it afresh under its own query string to get its own
 * database.
 *
 * Usage: node scripts/check-security.mjs
 * Exits non-zero when something is wrong.
 */
import { DatabaseSync } from 'node:sqlite';

const PASSWORD = 'correct-horse-battery-staple';
const problems = [];
const note = (m) => problems.push(m);
const ok = (label) => console.log(`  ${label}`);

/** Enough of D1 for the Worker: prepare/bind/run/first/all and batch. */
function d1() {
  const db = new DatabaseSync(':memory:');
  const wrap = (sql) => {
    let args = [];
    let st = null;
    const stmt = () => (st ||= db.prepare(sql));
    const api = {
      bind: (...a) => ((args = a), api),
      run: async () => ({ meta: { changes: Number(stmt().run(...args).changes) } }),
      first: async () => stmt().get(...args) ?? null,
      all: async () => ({ results: stmt().all(...args) }),
    };
    return api;
  };
  return { prepare: wrap, batch: async (stmts) => Promise.all(stmts.map((s) => s.run())) };
}

let isolate = 0;
/** A fresh copy of the Worker, so its per-isolate schema flag does not leak between scenarios. */
async function worker(env = {}) {
  const mod = await import(`../worker/server.js?iso=${isolate++}`);
  const base = { ADMIN_PASSWORD: PASSWORD, DB: d1(), ...env };
  return {
    env: base,
    fetch: (path, init = {}) =>
      mod.default.fetch(new Request(`https://shop.example${path}`, init), base),
  };
}

const jsonInit = (body, headers = {}) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});
const cookieOf = (res) => (res.headers.get('set-cookie') || '').split(';')[0];
const ADMIN = { 'x-semers-admin': '1' };

/* ------------------------------------------------------- a body that will not fit */
{
  const w = await worker();
  const huge = 'x'.repeat(200 * 1024);
  const declared = await w.fetch('/api/order', jsonInit({ type: 'contact', message: huge }));
  if (declared.status !== 413) note(`a 200 KB body is answered ${declared.status}, not 413`);

  /*
   * The same body with no content-length: the header is a courtesy, and the
   * check that matters is the one that counts bytes as they arrive.
   */
  const chunked = await w.fetch('/api/order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    duplex: 'half',
    body: new ReadableStream({
      start(c) {
        for (let i = 0; i < 40; i++) c.enqueue(new TextEncoder().encode('y'.repeat(8 * 1024)));
        c.close();
      },
    }),
  });
  if (chunked.status !== 413) note(`a 320 KB chunked body is answered ${chunked.status}, not 413`);
  ok('an oversized body is refused, declared or streamed');
}

/* --------------------------------------------------------- signing out signs out */
{
  const w = await worker();
  const login = await w.fetch('/api/admin/login', jsonInit({ password: PASSWORD }));
  if (login.status !== 200) note(`the right password is answered ${login.status}`);
  const cookie = cookieOf(login);
  if (!/^sm_admin=/.test(cookie)) note('a successful login set no session cookie');
  const set = login.headers.get('set-cookie') || '';
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict']) {
    if (!set.includes(flag)) note(`the session cookie is missing ${flag}`);
  }

  const inside = await w.fetch('/api/admin/stats', { headers: { cookie } });
  if (inside.status !== 200) note(`a signed-in request is answered ${inside.status}`);

  await w.fetch('/api/admin/logout', { method: 'POST', headers: { cookie, ...ADMIN } });
  const after = await w.fetch('/api/admin/stats', { headers: { cookie } });
  if (after.status !== 401) note(`the same cookie still works after signing out (${after.status})`);
  ok('a session ends when it is signed out, not when the cookie expires');
}

/* ------------------------------------------------- a cookie nobody was ever given */
{
  const w = await worker();
  const cookie = cookieOf(await w.fetch('/api/admin/login', jsonInit({ password: PASSWORD })));
  const token = cookie.slice('sm_admin='.length);
  const [exp, nonce, sig] = token.split('.');

  const cases = [
    ['no cookie at all', ''],
    ['a signature one character off', `sm_admin=${exp}.${nonce}.${sig.slice(0, -1)}${sig.endsWith('a') ? 'b' : 'a'}`],
    ['an expiry pushed into next year', `sm_admin=${Number(exp) + 31536000}.${nonce}.${sig}`],
    ['a shape that is not a token', 'sm_admin=nonsense'],
  ];
  for (const [what, jar] of cases) {
    const res = await w.fetch('/api/admin/orders', { headers: jar ? { cookie: jar } : {} });
    if (res.status !== 401) note(`${what} is answered ${res.status}, not 401`);
  }
  ok(`${cases.length} kinds of bad cookie are all turned away`);
}

/* ----------------------------------------------------- a form on someone else's page */
{
  const w = await worker();
  const cookie = cookieOf(await w.fetch('/api/admin/login', jsonInit({ password: PASSWORD })));
  const writes = [
    ['PATCH', '/api/admin/orders/SM-1', { status: 'done' }],
    ['PUT', '/api/admin/products', { slug: 'apple-bar-35g', price: 0.01 }],
    ['PUT', '/api/admin/settings', { freeFrom: 0 }],
    ['DELETE', '/api/admin/reviews/1', null],
  ];
  for (const [method, path, body] of writes) {
    const res = await w.fetch(path, {
      method,
      headers: { cookie, 'content-type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (res.status !== 403) note(`${method} ${path} without the admin header is answered ${res.status}, not 403`);
  }
  ok(`${writes.length} writes are refused without the header a cross-site form cannot set`);
}

/* ----------------------------------------------------------- guessing the password */
{
  const w = await worker();
  let last = 0;
  for (let i = 0; i < 9; i++) last = (await w.fetch('/api/admin/login', jsonInit({ password: `guess-${i}` }))).status;
  if (last !== 429) note(`the ninth wrong password is answered ${last}, not 429`);
  // And the door stays shut to the right password while the window is open,
  // because the limiter is the point.
  const right = await w.fetch('/api/admin/login', jsonInit({ password: PASSWORD }));
  if (right.status !== 429) note(`the limiter lets the right password through at ${right.status}`);
  ok('eight wrong passwords close the door for fifteen minutes');
}

/* ------------------------------------------------------ a shop with no password set */
{
  const w = await worker({ ADMIN_PASSWORD: '' });
  for (const path of ['/api/admin/login', '/api/admin/orders', '/api/admin/settings']) {
    const res = await w.fetch(path, path.endsWith('login') ? jsonInit({ password: '' }) : {});
    if (res.status !== 503) note(`${path} on an unconfigured shop is answered ${res.status}, not 503`);
  }
  const session = await w.fetch('/api/admin/session');
  const body = await session.json();
  if (body.ok !== false || body.configured !== false) note(`an unconfigured shop reports ${JSON.stringify(body)}`);
  ok('no password on the host means no way in, and the door says which it is');
}

/* --------------------------------------------- a banner link with a scheme in it */
{
  const w = await worker();
  const cookie = cookieOf(await w.fetch('/api/admin/login', jsonInit({ password: PASSWORD })));
  const tries = [
    ['javascript:alert(1)', ''],
    ['JaVaScRiPt:alert(1)', ''],
    ['data:text/html,<script>alert(1)</script>', ''],
    ['//evil.example/x', ''],
    ['/shop/', '/shop/'],
    ['https://semers.org/', 'https://semers.org/'],
  ];
  for (const [href, expect] of tries) {
    const res = await w.fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { cookie, 'content-type': 'application/json', ...ADMIN },
      body: JSON.stringify({ announcementHref: href, announcement: 'x', announcementOn: true }),
    });
    const got = (await res.json()).settings?.announcementHref;
    if (got !== expect) note(`the banner kept "${href}" as "${got}" where "${expect || 'nothing'}" was expected`);
    const front = await (await w.fetch('/api/storefront')).json();
    const served = front.settings?.announcementHref || '';
    if (served !== expect) note(`/api/storefront served "${served}" for "${href}"`);
  }
  ok(`${tries.length} banner links checked: only a path, https, mailto or tel survives`);
}

/* -------------------------------------------------- what a broken server admits to */
{
  // A database that throws on every statement is the shape of a real outage,
  // and the response must not carry the reason back to the caller.
  const exploding = { prepare: () => { throw new Error('D1_ERROR: no such column: orders.secret_column'); }, batch: () => { throw new Error('D1_ERROR'); } };
  const w = await worker({ DB: exploding });
  // Captured rather than silenced: the point is that the detail goes to the log
  // and not to the caller, so both halves have to be checked.
  const real = console.error;
  const logged = [];
  console.error = (...a) => logged.push(a.map(String).join(' '));
  const res = await w.fetch('/api/storefront');
  console.error = real;
  const body = await res.text();
  if (res.status !== 500) note(`a failing database is answered ${res.status}, not 500`);
  if (/secret_column|D1_ERROR|no such column/.test(body)) note(`a 500 hands the caller its own error: ${body.slice(0, 90)}`);
  if (!logged.some((l) => /secret_column/.test(l))) note('a 500 tells nobody at all — the detail never reached the log either');
  ok('a server error says that it happened to the caller, and what broke to the log');
}

/* -------------------------------------------------------------- the public endpoint */
{
  const w = await worker();
  const order = () =>
    w.fetch('/api/order', jsonInit({ type: 'newsletter', email: 'a@example.com' }));
  let last = 200;
  for (let i = 0; i < 31; i++) last = (await order()).status;
  if (last !== 429) note(`the thirty-first submission in an hour is answered ${last}, not 429`);

  const hp = await w.fetch('/api/order', jsonInit({ type: 'contact', website: 'spam', email: 'a@example.com', message: 'hi' }));
  if (hp.status !== 200) note(`the honeypot answers ${hp.status} instead of pretending to succeed`);

  const w2 = await worker();
  for (const [what, body] of [
    ['no type', { email: 'a@example.com' }],
    ['a type we do not take', { type: 'wire-transfer', email: 'a@example.com' }],
    ['an address that is not one', { type: 'newsletter', email: 'not-an-address' }],
    ['an order with an empty box', { type: 'order', customer: { email: 'a@example.com' }, items: [] }],
  ]) {
    const res = await w2.fetch('/api/order', jsonInit(body));
    if (res.status < 400) note(`${what} is accepted (${res.status})`);
  }
  ok('the order endpoint is rate limited, honeypotted and refuses what it cannot use');
}

/* ------------------------------------------------------------- nothing else answers */
{
  const w = await worker();
  const res = await w.fetch('/api/admin/../admin/orders');
  if (res.status !== 401 && res.status !== 404) note(`a path with .. in it is answered ${res.status}`);
  const unknown = await w.fetch('/api/whatever');
  if (unknown.status !== 404) note(`an unknown API route is answered ${unknown.status}`);
  ok('an unknown route is a 404, and a traversal does not become one of ours');
}

console.log(problems.length ? `\n${problems.length} problems:` : '\nevery lock on the shop holds when it is tried');
problems.forEach((p) => console.log('  -', p));
process.exit(problems.length ? 1 : 0);
