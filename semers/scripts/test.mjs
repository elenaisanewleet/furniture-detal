/**
 * Unit tests for the pieces of the build that decide what the reader sees.
 *
 * These are the parts with no visible failure mode: a link pass that skips the
 * wrong tag sends a Russian reader back into English, a prose scanner whose
 * offsets are off by one splices a translation into the middle of a word, and a
 * Worker that picks the wrong 404 hands someone a page in a language they were
 * not reading. None of that shows up in a build log, so it is asserted here.
 *
 * Usage: node scripts/test.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { localizeHtml, isExempt } from './localize-links.mjs';
import { scanProse, applyProse, isProse } from './prose-scan.mjs';
import {
  priceCart,
  shippingFor,
  tiersOf,
  tierPctFor,
  deliveryMethod,
  lockerId,
  md5,
  payseraRequest,
  payseraEncode,
  payseraDecode,
  payseraVerify,
  payseraOrderParams,
  compactLockers,
} from '../worker/server.js';

const O = 'https://semers-store.higgsfield.app';
let failed = 0;
let passed = 0;
const is = (name, got, want) => {
  if (JSON.stringify(got) === JSON.stringify(want)) { passed++; return; }
  failed++;
  console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`);
};
const group = (name) => console.log(`\n${name}`);

/* ------------------------------------------------------------------ links */
group('link localisation');
is('site root is exempt', isExempt('/', 'ru'), true);
is('a node id is exempt', isExempt('/#org', 'ru'), true);
is('a page is not exempt', isExempt('/faq/', 'ru'), false);
is('the api is exempt', isExempt('/api/order', 'ru'), true);
is('an asset is exempt', isExempt('/_astro/style.css', 'ru'), true);
is('a file is exempt', isExempt('/robots.txt', 'ru'), true);
is('the back office is exempt', isExempt('/admin/', 'ru'), true);
is('an already-localised path is exempt', isExempt('/ru/faq/', 'ru'), true);
is('a protocol-relative url is exempt', isExempt('//cdn.example/x', 'ru'), true);

is('a link is prefixed', localizeHtml('<a href="/faq/">x</a>', 'ru', O).html, '<a href="/ru/faq/">x</a>');
// The language switcher's whole job is to point at another language.
is('hreflang is left alone', localizeHtml('<a hreflang="lv" href="/lv/faq/">x</a>', 'ru', O).html, '<a hreflang="lv" href="/lv/faq/">x</a>');
is('an escaped payload url is prefixed', localizeHtml('<b data-add="{&quot;url&quot;:&quot;/products/x/&quot;}">', 'ru', O).html, '<b data-add="{&quot;url&quot;:&quot;/ru/products/x/&quot;}">');

/* -------------------------------------------------------- structured data */
group('structured data localisation');
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const run = (o) => JSON.parse(/ld\+json">([\s\S]*?)<\/script>/.exec(localizeHtml(ld(o), 'ru', O).html)[1]);
is('a product url follows the locale', run({ url: `${O}/products/x/` }).url, `${O}/ru/products/x/`);
is('breadcrumb items follow the locale', run({ itemListElement: [{ item: `${O}/shop/` }] }).itemListElement[0].item, `${O}/ru/shop/`);
is('the organisation keeps one identity', run({ '@id': `${O}/#org` })['@id'], `${O}/#org`);
is('an image url is not a page url', run({ image: `${O}/img/a.webp`, url: `${O}/faq/` }).image, `${O}/img/a.webp`);
is('an off-site url is untouched', run({ url: 'https://maxima.lv/x' }).url, 'https://maxima.lv/x');
is('a malformed block is left alone', localizeHtml('<script type="application/ld+json">{oops</script>', 'ru', O).html, '<script type="application/ld+json">{oops</script>');
is('no origin means no json-ld pass', localizeHtml(ld({ url: `${O}/faq/` }), 'ru', '').changed, 0);

/* ----------------------------------------------------------- prose scanner */
group('prose scanner');
is('a sentence is prose', isProse('Baked apples, nothing else.'), true);
is('a number is not', isProse('35'), false);
is('a price is not', isProse('€4.90'), false);
is('a url is not', isProse('https://example.com'), false);
is('an e-mail is not', isProse('hello@semers.org'), false);
is('a unit is prose, because it has a word in it', isProse('35 g'), true);

const collect = (html) => { const r = []; scanProse(html, (x) => r.push(x)); return r; };
is('script contents are skipped', collect('<script>var a = "Hello there";</script>').length, 0);
is('style contents are skipped', collect('<style>.a{content:"Hello there"}</style>').length, 0);
is('translate=no is skipped', collect('<p translate="no">Semers Group</p>').length, 0);
is('an element with its own lang is skipped', collect('<span lang="lv">Latviski</span>').length, 0);
// html and body carry the page's own language, which is not an opt-out.
is('html lang does not exempt the document', collect('<html lang="ru"><p>Baked apples</p></html>').length, 1);
is('an alt is collected', collect('<img alt="A pack of apple bars">')[0].kind, 'alt');
is('a machine meta is skipped', collect('<meta name="viewport" content="width=device-width">').length, 0);
is('a description meta is collected', collect('<meta name="description" content="Baked apple bars">')[0].kind, 'meta:description');
// A form control also carries name=, and must not be read as a meta tag.
is('a form control is not a meta tag', collect('<input name="q" placeholder="Search the shop">')[0].kind, 'placeholder');

const doc = '<p>Baked apples, nothing else.</p><img alt="A pack of bars">';
is('a text run slices back to itself', doc.slice(collect(doc)[0].start, collect(doc)[0].end), 'Baked apples, nothing else.');
is('an attribute run slices back to itself', doc.slice(collect(doc)[1].start, collect(doc)[1].end), 'A pack of bars');
is('an identity memory changes nothing', applyProse(doc, { 'Baked apples, nothing else.': 'Baked apples, nothing else.' }).html, doc);
is('a translation is spliced in place', applyProse(doc, { 'Baked apples, nothing else.': 'Печёные яблоки.' }).html, '<p>Печёные яблоки.</p><img alt="A pack of bars">');
is('an attribute translation is escaped', applyProse('<img alt="Bars">', { Bars: 'A "quoted" name' }).html, '<img alt="A &quot;quoted&quot; name">');
is('a text translation is escaped', applyProse('<p>Bars</p>', { Bars: 'Fruit & fibre' }).html, '<p>Fruit &amp; fibre</p>');
/*
 * The scanner reports text as it appears in the source, entities and all, so a
 * key can be "Shipping &amp; returns" and a translation is written in that same
 * space. Escaping every ampersand would turn an entity the translator kept into
 * &amp;amp;, which renders as the literal characters "&amp;".
 */
is('an entity the translator kept is left alone', applyProse('<h2>Shipping &amp; returns</h2>', { 'Shipping &amp; returns': 'Доставка &amp; возврат' }).html, '<h2>Доставка &amp; возврат</h2>');
is('a numeric entity is left alone', applyProse('<p>Bars</p>', { Bars: 'Caf&#233;' }).html, '<p>Caf&#233;</p>');
is('a hex entity is left alone', applyProse('<p>Bars</p>', { Bars: 'Caf&#xE9;' }).html, '<p>Caf&#xE9;</p>');
is('a lone ampersand is still escaped', applyProse('<p>Bars</p>', { Bars: 'R&D' }).html, '<p>R&amp;D</p>');
is('a translation cannot introduce markup', applyProse('<p>Bars</p>', { Bars: 'a <b>tag</b>' }).html, '<p>a &lt;b&gt;tag&lt;/b&gt;</p>');
is('nor break out of an attribute', applyProse('<img alt="Bars">', { Bars: '" onerror="x' }).html, '<img alt="&quot; onerror=&quot;x">');
is('an unknown string stays English', applyProse('<p>Bars</p>', {}).html, '<p>Bars</p>');

/* --------------------------------------------------- admin-driven settings */
group('storefront settings');
/*
 * These two rules live in the browser bundle, where the build cannot check
 * them: the announcement arrives from the database after the page is built, so
 * neither the link pass nor the prose pass has ever seen it. The logic is
 * mirrored here from src/scripts/site.ts, and the mirror is the point — if the
 * two drift, one of them is wrong and this is where it shows.
 */
const forLocale = (st, key, locale) => {
  const suffix = locale === 'ru' ? 'Ru' : locale === 'lv' ? 'Lv' : '';
  return String((suffix && st[key + suffix]) || st[key] || '');
};
const localeHref = (href, locale) => {
  if (!locale || locale === 'en') return href;
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (href === `/${locale}` || href.startsWith(`/${locale}/`)) return href;
  if (/^\/(api|_astro|fonts|img|admin)\//.test(href)) return href;
  if (href.slice(1).split(/[/?#]/)[0].includes('.')) return href;
  return `/${locale}${href}`;
};

const S = { announcement: 'Free shipping', announcementRu: 'Бесплатная доставка', announcementLv: '' };
is('english takes the english field', forLocale(S, 'announcement', 'en'), 'Free shipping');
is('russian takes the russian field', forLocale(S, 'announcement', 'ru'), 'Бесплатная доставка');
is('a blank language falls back to english', forLocale(S, 'announcement', 'lv'), 'Free shipping');
is('nothing written is empty', forLocale({}, 'announcement', 'ru'), '');

is('a banner link enters the locale', localeHref('/shop/', 'ru'), '/ru/shop/');
is('english is left alone', localeHref('/shop/', 'en'), '/shop/');
is('an already-localised link is left alone', localeHref('/ru/shop/', 'ru'), '/ru/shop/');
is('an external link is left alone', localeHref('https://maxima.lv/', 'ru'), 'https://maxima.lv/');
is('the back office is left alone', localeHref('/admin/', 'ru'), '/admin/');
is('a file is left alone', localeHref('/robots.txt', 'ru'), '/robots.txt');

const worker = await import('data:text/javascript;base64,' + Buffer.from(await readFile(new URL('../worker/server.js', import.meta.url), 'utf-8')).toString('base64'));

/* -------------------------------------------------------- order notifications */
group('order notifications');
/*
 * The owner reads these in Telegram and answers by hand, so the language the
 * customer was reading has to be in the message. A bogus value must not be able
 * to invent a fourth language, or to put anything into the text that the reader
 * did not type.
 */
{
  let text = '';
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    try { text = JSON.parse(init.body).text; } catch { /* not the notification call */ }
    return new Response('{"ok":true}', { status: 200 });
  };
  const env = { TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' };
  const notify = async (body) => {
    text = '';
    await worker.default.fetch(new Request('https://x.test/api/order', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), env);
    return text;
  };
  const said = (t) => /Language: (\w+)/.exec(t)?.[1];

  is('a russian order', said(await notify({ type: 'order', customer: { name: 'A', email: 'a@b.co' }, items: [{ qty: 1, name: 'Bar', total: 1.45 }], locale: 'ru' })), 'RU');
  is('a latvian message', said(await notify({ type: 'contact', name: 'B', email: 'b@c.co', message: 'Sveiki', locale: 'lv' })), 'LV');
  is('a wholesale enquiry', said(await notify({ type: 'wholesale', company: 'Co', name: 'C', email: 'c@d.co', country: 'LV', kind: 'shop', locale: 'lv' })), 'LV');
  is('a newsletter signup', said(await notify({ type: 'newsletter', email: 'e@f.co', locale: 'ru' })), 'RU');
  is('nothing sent means english', said(await notify({ type: 'contact', name: 'D', email: 'd@e.co', message: 'Hi' })), 'EN');
  is('a bogus value cannot invent a language', said(await notify({ type: 'contact', name: 'E', email: 'e@f.co', message: 'Hi', locale: '<script>x</script>' })), 'EN');
  is('and cannot smuggle text into the message', (await notify({ type: 'contact', name: 'F', email: 'f@g.co', message: 'Hi', locale: '<script>x</script>' })).includes('script'), false);

  globalThis.fetch = realFetch;
}

/* ------------------------------------------------------------ admin login */
group('admin login');
/*
 * The login rate limit counts failures per client IP. If the bucket could be
 * chosen by the caller, it would not be a limit — so this proves that rotating
 * a client-set header does not get a fresh allowance, while the edge-set header
 * still separates two genuinely different callers.
 */
{
  const rows = [];
  // Sessions are rows too, so signing out can end one. A stub that forgets them
  // would answer "expired" to a cookie the Worker had just issued.
  const live = new Set();
  const fakeDb = {
    prepare(sql) {
      return {
        bind: (...args) => ({
          run: async () => {
            if (/^INSERT INTO login_attempts/.test(sql)) rows.push(args[0]);
            if (/^DELETE FROM login_attempts WHERE ip/.test(sql)) for (let i = rows.length - 1; i >= 0; i--) if (rows[i] === args[0]) rows.splice(i, 1);
            if (/^INSERT OR REPLACE INTO sessions/.test(sql)) live.add(args[0]);
            if (/^DELETE FROM sessions WHERE nonce/.test(sql)) live.delete(args[0]);
            return {};
          },
          first: async () => {
            if (/COUNT\(\*\) AS c FROM login_attempts/.test(sql)) return { c: rows.filter((r) => r === args[0]).length };
            if (/FROM sessions WHERE nonce/.test(sql)) return live.has(args[0]) ? { nonce: args[0] } : null;
            return null;
          },
          all: async () => ({ results: [] }),
        }),
        run: async () => ({}),
        first: async () => null,
        all: async () => ({ results: [] }),
      };
    },
  };
  const env = { ADMIN_PASSWORD: 'correct horse', ADMIN_SESSION_SECRET: 'k', DB: fakeDb };
  const tryLogin = (headers) =>
    worker.default.fetch(
      new Request('https://x.test/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify({ password: 'wrong' }) }),
      env,
    );

  // Eight failures from one edge IP, then the ninth is refused.
  let last;
  for (let i = 0; i < 9; i++) last = await tryLogin({ 'cf-connecting-ip': '1.2.3.4' });
  is('the ninth failure from one address is refused', last.status, 429);

  // A caller rotating x-forwarded-for gets no new allowance.
  const spoofed = await tryLogin({ 'cf-connecting-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' });
  is('a client-set header cannot buy a fresh allowance', spoofed.status, 429);

  // A genuinely different caller is unaffected.
  const other = await tryLogin({ 'cf-connecting-ip': '5.6.7.8' });
  is('another address still gets its own tries', other.status, 401);

  // The right password clears the record and issues a session.
  const good = await worker.default.fetch(
    new Request('https://x.test/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '5.6.7.8' }, body: JSON.stringify({ password: 'correct horse' }) }),
    env,
  );
  is('the right password is accepted', good.status, 200);
  const setCookie = good.headers.get('set-cookie') || '';
  is('the session cookie is not readable by script', /HttpOnly/.test(setCookie), true);
  is('nor sent over plain http', /Secure/.test(setCookie), true);
  is('nor sent cross-site', /SameSite=Strict/.test(setCookie), true);

  // A mutation needs the session and our own header; the cookie alone is not enough.
  const token = /sm_admin=([^;]+)/.exec(setCookie)?.[1] || '';
  const noHeader = await worker.default.fetch(
    new Request('https://x.test/api/admin/settings', { method: 'PUT', headers: { cookie: `sm_admin=${token}`, 'content-type': 'application/json' }, body: '{}' }),
    env,
  );
  is('a cross-site post without our header is refused', noHeader.status, 403);
  const tampered = await worker.default.fetch(
    new Request('https://x.test/api/admin/settings', { method: 'PUT', headers: { cookie: `sm_admin=${token.replace(/.$/, (c) => (c === 'a' ? 'b' : 'a'))}`, 'x-semers-admin': '1', 'content-type': 'application/json' }, body: '{}' }),
    env,
  );
  is('a tampered signature is refused', tampered.status, 401);

  // Signing out ends the session for everyone holding the token, not just for
  // the browser that cleared its own cookie.
  await worker.default.fetch(
    new Request('https://x.test/api/admin/logout', { method: 'POST', headers: { cookie: `sm_admin=${token}`, 'x-semers-admin': '1' } }),
    env,
  );
  const afterLogout = await worker.default.fetch(new Request('https://x.test/api/admin/orders', { headers: { cookie: `sm_admin=${token}` } }), env);
  is('a signed-out session is refused', afterLogout.status, 401);
}

/* --------------------------------------------------------- submission limit */
group('submission limit');
/*
 * /api/order is public and, once Resend is configured, e-mails a receipt to
 * whatever address is submitted. Without a limit it is a mail relay. The limit
 * must also fail in the right direction: a database that is missing or broken
 * must not stop the shop taking orders.
 */
{
  const makeDb = (broken = false) => {
    const rows = [];
    return {
      prepare(sql) {
        const act = (...args) => ({
          run: async () => {
            if (broken) throw new Error('d1 unavailable');
            if (/^INSERT INTO rate/.test(sql)) rows.push(args[0]);
            return {};
          },
          first: async () => {
            if (broken) throw new Error('d1 unavailable');
            return /COUNT\(\*\) AS c FROM rate/.test(sql) ? { c: rows.filter((r) => r === args[0]).length } : null;
          },
          all: async () => ({ results: [] }),
        });
        return { bind: act, ...act() };
      },
    };
  };
  const send = (env, headers = { 'cf-connecting-ip': '1.2.3.4' }, body = { type: 'contact', name: 'A', email: 'a@b.co', message: 'Hello there' }) =>
    worker.default.fetch(new Request('https://x.test/api/order', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }), env);

  const env = { DB: makeDb() };
  let last;
  for (let i = 0; i < 31; i++) last = await send(env);
  is('the thirty-first submission in an hour is refused', last.status, 429);
  is('another caller is unaffected', (await send(env, { 'cf-connecting-ip': '5.6.7.8' })).status, 200);

  // The honeypot answers before the allowance is spent, so a bot cannot use up
  // a person's tries.
  const hp = { DB: makeDb() };
  for (let i = 0; i < 40; i++) await send(hp, { 'cf-connecting-ip': '9.9.9.9' }, { type: 'contact', name: 'Bot', email: 'b@c.co', message: 'spam', website: 'http://spam' });
  is('a honeypot hit does not spend the allowance', (await send(hp, { 'cf-connecting-ip': '9.9.9.9' })).status, 200);

  /*
   * A limiter that cannot read its table must not be the thing that rejects.
   * With no database and no notification channel the handler answers 503
   * "not-configured" — there is nowhere to put the order — but that is the
   * order path failing honestly, not the limiter turning people away.
   */
  is('a broken database does not trip the limit', (await send({ DB: makeDb(true) })).status !== 429, true);
  is('nor does no database at all', (await send({})).status !== 429, true);
  is('and an unrecorded order says so', (await send({})).status, 503);
}

/* ------------------------------------------------------- storefront payload */
group('storefront payload');
/*
 * The built page already carries the guarantee line, translated with the rest
 * of the page prose. If the API echoed the untouched default back, the script
 * would overwrite that translation with English a moment after the page loads.
 * So a text setting is sent only once the owner has actually changed it.
 */
{
  const stored = (rows) => ({
    prepare: (sql) => ({
      bind: () => ({ run: async () => ({}), first: async () => null, all: async () => ({ results: [] }) }),
      run: async () => ({}),
      first: async () => null,
      all: async () => ({ results: /FROM settings/.test(sql) ? rows : [] }),
    }),
  });
  const payload = async (rows) => {
    const res = await worker.default.fetch(new Request('https://x.test/api/storefront'), { DB: stored(rows) });
    return (await res.json()).settings;
  };

  const untouched = await payload([]);
  is('an untouched guarantee is not sent', 'guarantee' in untouched, false);
  is('nor its russian and latvian', 'guaranteeRu' in untouched || 'guaranteeLv' in untouched, false);
  is('numbers are always sent', untouched.freeFrom, worker.SETTING_DEFAULTS.freeFrom);
  is('and so are switches', untouched.guaranteeOn, true);

  const changed = await payload([{ key: 'guaranteeRu', value: 'Вернём деньги в течение 14 дней.' }]);
  is('a guarantee the owner wrote is sent', changed.guaranteeRu, 'Вернём деньги в течение 14 дней.');
  is('and the ones they did not are still absent', 'guarantee' in changed, false);

  /*
   * A save stores every setting, so a database written while the old guarantee
   * was the default still holds it, in all three languages. That promise (a
   * refund with the box kept) was never the owner's; it must read as the new
   * default and stay off the page, not return as if the owner had typed it.
   */
  const stale = await payload([
    { key: 'guarantee', value: JSON.stringify('Not what you hoped for? Tell us within 14 days and we refund the order — you keep the box.') },
    { key: 'guaranteeRu', value: JSON.stringify('Что-то не так? Напишите нам в течение 14 дней — вернём деньги за заказ, коробку оставьте себе.') },
    { key: 'guaranteeLv', value: JSON.stringify('Kaut kas nav kārtībā? Uzrakstiet mums 14 dienu laikā — atmaksāsim pasūtījumu, kārbu paturiet sev.') },
  ]);
  is('a stored copy of the retired guarantee is not sent', 'guarantee' in stale || 'guaranteeRu' in stale || 'guaranteeLv' in stale, false);
  const oldKeep = /keep the box|коробку оставьте|kārbu paturiet/;
  is('and nothing in the payload still promises the refund-and-keep line', oldKeep.test(JSON.stringify(stale)), false);
}

/* ------------------------------------------------------------ schema */
group('database schema');
/*
 * The live database predates the reviews.locale column, and CREATE TABLE IF NOT
 * EXISTS leaves an existing table exactly as it is. So the column has to arrive
 * by ALTER TABLE, and SQLite has no ADD COLUMN IF NOT EXISTS — meaning the
 * second deploy must survive the error the first one's success guarantees.
 * A fake D1 records what was run and can be told to fail the way SQLite does.
 */
{
  const fakeDb = (onAlter) => {
    const ran = [];
    return {
      ran,
      d1: {
        prepare(sql) {
          return {
            bind: () => ({ run: async () => ({}), first: async () => null, all: async () => ({ results: [] }) }),
            run: async () => {
              ran.push(sql);
              if (/^ALTER TABLE/.test(sql)) onAlter?.(sql);
              return {};
            },
            first: async () => null,
            all: async () => ({ results: [] }),
          };
        },
      },
    };
  };

  // A fresh module per case: the worker caches "schema is ready" in a module
  // variable, so the same source has to be imported as a different module.
  let nth = 0;
  const src = await readFile(new URL('../worker/server.js', import.meta.url), 'utf-8');
  const freshWorker = () => import('data:text/javascript;base64,' + Buffer.from(`${src}\n// instance ${nth++}`).toString('base64'));

  const first = fakeDb();
  const w1 = await freshWorker();
  await w1.default.fetch(new Request('https://x.test/api/reviews?slug=apple-bar-35g'), { DB: first.d1 });
  is('a new database is given the column', first.ran.some((q) => /ALTER TABLE reviews ADD COLUMN locale/.test(q)), true);
  is('the tables are created too', first.ran.some((q) => /CREATE TABLE IF NOT EXISTS reviews/.test(q)), true);

  // Second deploy: the column is there, so SQLite rejects the ALTER.
  const again = fakeDb((sql) => { throw new Error(`duplicate column name: ${/COLUMN (\w+)/.exec(sql)[1]}`); });
  const w2 = await freshWorker();
  const res = await w2.default.fetch(new Request('https://x.test/api/reviews?slug=apple-bar-35g'), { DB: again.d1 });
  is('a duplicate column does not break the request', res.status, 200);
}

/* ------------------------------------------------------------ worker 404 */
group('worker 404');
const PAGES = ['/404.html', '/ru/404/', '/lv/404/'];
const served = async (path, present = PAGES) => {
  const asked = [];
  const res = await worker.default.fetch(new Request(`https://x.test${path}`), {
    ASSETS: { async fetch(u) { const p = new URL(u).pathname; asked.push(p); return { ok: present.includes(p), body: p }; } },
  });
  return { status: res.status, page: asked.find((p) => present.includes(p)) };
};
is('an unknown english path', await served('/nope/'), { status: 404, page: '/404.html' });
is('an unknown russian path', await served('/ru/nope/'), { status: 404, page: '/ru/404/' });
is('an unknown latvian path', await served('/lv/products/nope/'), { status: 404, page: '/lv/404/' });
is('an unknown language falls back', await served('/de/nope/'), { status: 404, page: '/404.html' });
is('a missing localised page falls back', await served('/ru/nope/', ['/404.html']), { status: 404, page: '/404.html' });

/* ------------------------------------------------------ two attributes, one tag */
group('attribute substitution');
/*
 * Attributes are reported in the order ATTRS lists them, not the order they
 * appear in the tag, so a tag carrying two of them hands the substituter a list
 * that runs backwards. Splicing that list in the order given writes the second
 * value at an offset the first has already moved.
 */
{
  const two = '<button data-alt="A hand reaching" aria-label="Image 4 of 4"></button>';
  const mem = { 'A hand reaching': 'Roka sniedzas', 'Image 4 of 4': '4. attēls no 4' };
  is('two attributes on one tag both land', applyProse(two, mem).html, '<button data-alt="Roka sniedzas" aria-label="4. attēls no 4"></button>');
  is('and the tag still parses', /^<button( [\w-]+="[^"]*")+><\/button>$/.test(applyProse(two, mem).html), true);
  // The same in the other order, so the fix is not the new order by luck.
  const flipped = '<button aria-label="Image 4 of 4" data-alt="A hand reaching"></button>';
  is('either order works', applyProse(flipped, mem).html, '<button aria-label="4. attēls no 4" data-alt="Roka sniedzas"></button>');
  is('a mobile table label is prose', applyProse('<td data-label="Shelf life">x</td>', { 'Shelf life': 'Срок годности' }).html, '<td data-label="Срок годности">x</td>');
}

/* ------------------------------------------------------- runtime dictionary */
group('runtime dictionary');
/*
 * The strings the browser needs are shipped in window.SEMERS.strings, and a key
 * the dictionary never filled in falls back to the English written at the call
 * site — silently, in the middle of a Russian page. So every key the script
 * asks for has to exist in all three languages, and a plural has to exist in
 * every form its own language can select. Both sides are read out of the
 * TypeScript by pattern rather than by import, because neither file is
 * loadable from here without a compiler.
 */
{
  const ui = await readFile(new URL('../src/i18n/ui.ts', import.meta.url), 'utf-8');
  const script = await readFile(new URL('../src/scripts/site.ts', import.meta.url), 'utf-8');

  // The three `runtime: { … }` blocks, in dictionary order: en, ru, lv.
  const blocks = [...ui.matchAll(/\n  runtime: \{\n([\s\S]*?)\n  \}/g)].map((m) =>
    new Set([...m[1].matchAll(/^\s{4}([A-Za-z_]\w*):/gm)].map((k) => k[1])),
  );
  is('three dictionaries carry runtime strings', blocks.length, 3);
  const [enK, ruK, lvK] = blocks;
  const has = (k) => [enK.has(k), ruK.has(k), lvK.has(k)];

  const asked = [...new Set([...script.matchAll(/\bS\('([\w]+)'/g)].map((m) => m[1]))];
  // A pattern that quietly stops matching would let every assertion below pass
  // on an empty list, so the count is asserted before the contents.
  is('the script does ask for strings', asked.length > 30, true);
  is('the dictionaries are not empty', enK.size > 30, true);
  const missing = asked.filter((k) => !enK.has(k) || !ruK.has(k) || !lvK.has(k));
  is('every key the script asks for is translated', missing, []);

  // Only the forms a language actually selects: Russian never says "other" for
  // a whole number, and Latvian has no "few" at all.
  const FORMS = { 0: ['en-IE', enK], 1: ['ru-RU', ruK], 2: ['lv-LV', lvK] };
  const gaps = [];
  const bases = [...new Set([...script.matchAll(/\bP\('([\w]+)'/g)].map((m) => m[1]))];
  is('the counts on the page are plurals', bases.length, 4);
  for (const base of bases) {
    for (const [intl, keys] of Object.values(FORMS)) {
      const rules = new Intl.PluralRules(intl);
      for (const n of [0, 1, 2, 5, 11, 21, 101]) {
        const form = rules.select(n);
        if (!keys.has(`${base}_${form}`)) gaps.push(`${intl} ${base}_${form}`);
      }
    }
  }
  is('every plural has the forms its language selects', [...new Set(gaps)], []);

  // The pairs these replaced must be gone, or a stale key reads as translated.
  is('the old one/many pairs are retired', [...enK].filter((k) => /(One|Many)$/.test(k)), []);
  is('the cart count is a plural family', has('cartCount_one'), [true, true, true]);
}

/* ------------------------------------------------------------ plural forms */
group('plural forms');
/*
 * The rule is Intl's, not ours; what is asserted here is that each dictionary
 * lists the forms its language needs, so the fallback never has to guess. The
 * numbers are the ones that change the answer: Latvian takes the singular at
 * 21 and 101 and a genitive plural at 0 and 11, Russian changes again at 5.
 */
{
  const pick = (intl, n, forms) => forms[new Intl.PluralRules(intl).select(n)] ?? forms.other ?? forms.many ?? forms.one;
  const RU = { one: 'товар', few: 'товара', many: 'товаров' };
  const LV = { zero: 'preču', one: 'prece', other: 'preces' };
  is('russian counts', [1, 2, 5, 21, 22, 25].map((n) => pick('ru-RU', n, RU)), ['товар', 'товара', 'товаров', 'товар', 'товара', 'товаров']);
  is('russian zero', pick('ru-RU', 0, RU), 'товаров');
  is('latvian counts', [0, 1, 2, 11, 21, 101].map((n) => pick('lv-LV', n, LV)), ['preču', 'prece', 'preces', 'preču', 'prece', 'prece']);
  is('english counts', [0, 1, 2].map((n) => pick('en-IE', n, { one: 'item', other: 'items' })), ['items', 'item', 'items']);
  is('a missing form falls back rather than blanking', pick('ru-RU', 5, { one: 'товар' }), 'товар');
}

/* -------------------------------------------------------- customer e-mail */
group('customer e-mail');
/*
 * Two of the four e-mails are addressed to the shopper: the order receipt and
 * the newsletter welcome. The shop's own notification stays English, but a
 * receipt that arrives in English after someone read the whole site in Latvian
 * is a different shop's e-mail — so these assert the language, the money format
 * the page used, and that the internal lines of the owner's copy stay out of
 * the customer's.
 */
{
  const realFetch = globalThis.fetch;
  let sent = [];
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('api.resend.com')) sent.push(JSON.parse(init.body));
    return new Response('{"ok":true}', { status: 200 });
  };
  const env = { RESEND_API_KEY: 'k', ORDER_TO_EMAIL: 'shop@semers.org', ORDER_FROM_EMAIL: 'Semers <shop@semers.org>', SITE_URL: 'https://semers.org' };
  const post = async (body) => {
    sent = [];
    await worker.default.fetch(new Request('https://x.test/api/order', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), env);
    return sent;
  };
  const order = (locale, extra = {}) => ({
    type: 'order',
    customer: { name: 'A', email: 'buyer@example.com', address: 'Iela 1', city: 'Rīga', postcode: 'LV-1010', country: 'Latvia' },
    items: [{ qty: 2, name: 'Apple Bar', total: 2.9 }],
    subtotal: 2.9, shipping: 3.9, total: 6.8, locale, ...extra,
  });
  const toBuyer = (msgs) => msgs.find((m) => m.to[0] === 'buyer@example.com');
  const toShop = (msgs) => msgs.find((m) => m.to[0] === 'shop@semers.org');

  const ru = toBuyer(await post(order('ru')));
  is('the shop and the buyer both get one', (await post(order('ru'))).length, 2);
  is('a russian buyer gets a russian subject', /Ваш заказ SM-/.test(ru.subject), true);
  is('and russian labels', ru.text.includes('Итого:'), true);
  // The site writes 6,80 € on a Russian page, so the receipt has to as well.
  is('and money the way the page wrote it', ru.text.includes('6,80'), true);
  is('with the euro sign after the amount', /6,80 ?€/.test(ru.text), true);
  is('the shop still reads english', /NEW ORDER REQUEST/.test(toShop(await post(order('ru'))).text), true);

  const lv = toBuyer(await post(order('lv')));
  is('a latvian buyer gets a latvian subject', /Jūsu pasūtījums SM-/.test(lv.subject), true);
  is('and latvian labels', lv.text.includes('Kopā:'), true);

  const en = toBuyer(await post(order('en')));
  is('an english buyer keeps the symbol first', /€6\.80/.test(en.text), true);
  is('an unknown language is english, not blank', /We have your order SM-/.test(toBuyer(await post(order('de'))).subject), true);

  // The owner's copy carries the page and the language; the customer's must not.
  is('the receipt drops the internal lines', /\bPage:|\bLanguage:/.test(ru.text), false);
  is('and does not repeat their own address back as a field', ru.text.includes('E-mail: buyer@example.com'), false);
  is('but does confirm where it is going', ru.text.includes('Адрес доставки: Iela 1, Rīga, LV-1010, Latvia'), true);

  // The form sends the method's English label; the receipt names it by its key, in the buyer's language.
  const byLocker = await post(order('lv', { method: 'locker', customer: { name: 'A', email: 'buyer@example.com', address: 'Omniva: Rīga Brīvības pakomāts (96331)', city: 'Rīga', country: 'Latvia', delivery: 'Omniva parcel locker', locker: '96331' } }));
  is('the method is named in their language', toBuyer(byLocker).text.includes('Piegādes veids: Omniva pakomāts'), true);
  is('and the english label stays with the shop', toBuyer(byLocker).text.includes('Omniva parcel locker'), false);
  is('the shop sees the locker id', toShop(byLocker).text.includes('Omniva locker ID: 96331'), true);
  is('an order request still promises a payment link', /maksājuma saiti/.test(toBuyer(byLocker).text), true);

  // /api/order is public. Only a verified Paysera callback can make an order read as paid.
  const forged = await post(order('en', { paid: true, payTest: false, pay: { test: false } }));
  is('a request that says it is paid is still a request to the shop', /NEW ORDER REQUEST/.test(toShop(forged).text) && !/PAID|Paysera/.test(toShop(forged).text), true);
  is('and to the buyer', /We have your order/.test(toBuyer(forged).subject) && !/payment for order/.test(toBuyer(forged).text), true);

  const welcome = async (locale) => {
    sent = [];
    await worker.default.fetch(new Request('https://x.test/api/order', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'newsletter', email: 'buyer@example.com', locale }) }), env);
    return toBuyer(sent);
  };
  const wLv = await welcome('lv');
  is('the welcome is in their language', wLv.subject, 'Laipni lūdzam Semers');
  is('and links into it', wLv.text.includes('https://semers.org/lv/products/apple-bar-35g/'), true);
  is('an english subscriber gets the plain path', (await welcome('en')).text.includes('https://semers.org/products/apple-bar-35g/'), true);
  // Only products on sale: the tasting box is not sold now.
  is('every pick is linked', [...(await welcome('ru')).text.matchAll(/https:\/\/semers\.org\/ru\/products\//g)].length, 2);
  is('and none of them is off sale', /tasting-box/.test((await welcome('en')).text), false);

  globalThis.fetch = realFetch;
}

/* ------------------------------------------------------------------ fonts */
group('font coverage');
/*
 * A unicode-range that does not cover the script fails silently: the glyph
 * still draws, in whatever the browser reaches for next, and the page looks
 * finished. That is how the whole Russian site came to be set in Georgia and
 * Arial. So the ranges are asserted here against the alphabets they have to
 * carry, and every file a face points at has to exist.
 */
{
  const css = await readFile(new URL('../src/styles/fonts.css', import.meta.url), 'utf-8');
  const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => {
    const f = (k) => (new RegExp(`${k}:\\s*([^;]+);`).exec(m[1]) || [])[1]?.trim();
    return { family: f('font-family')?.replace(/'/g, ''), style: f('font-style'), range: f('unicode-range'), src: f('src') };
  });
  is('the stylesheet declares faces', faces.length > 8, true);

  /** Every code point a unicode-range covers, as a lookup. */
  const covers = (range, cp) =>
    range.split(',').some((part) => {
      const [a, b] = part.trim().replace(/^U\+/i, '').split('-');
      const lo = parseInt(a.replace(/\?/g, '0'), 16);
      const hi = parseInt((b ?? a).replace(/\?/g, 'F'), 16);
      return cp >= lo && cp <= hi;
    });
  const set = (text, style) => {
    const cps = [...text].map((c) => c.codePointAt(0));
    return cps.every((cp) => faces.some((f) => f.style === style && f.range && covers(f.range, cp)));
  };

  // One letter per alphabet that the site actually has to print.
  is('english is covered', set('The quick brown fox — €1.45', 'normal'), true);
  is('latvian diacritics are covered', set('Ābolu batoniņi bez miltiem, žāvēti', 'normal'), true);
  is('russian is covered', set('Батончик, в котором 99% яблока', 'normal'), true);
  is('the russian ё is covered', set('печёное', 'normal'), true);
  is('and in italic too', set('Батончик Ābolu The', 'italic'), true);

  const files = new Set(await readdir(new URL('../public/fonts', import.meta.url)));
  const missing = faces
    .map((f) => /url\('\/fonts\/([^']+)'\)/.exec(f.src || '')?.[1])
    .filter((n) => n && !files.has(n));
  is('every declared file is on disk', missing, []);

  // The brand faces must sit ahead of the metric fallbacks, which are Arial
  // and would otherwise take the text themselves.
  const tokens = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf-8');
  const stack = (name) => new RegExp(`--font-${name}:([^;]+);`).exec(tokens)[1].split(',').map((s) => s.trim().replace(/'/g, ''));
  const before = (list, a, b) => list.indexOf(a) !== -1 && list.indexOf(a) < list.indexOf(b);
  is('the display face outranks its fallback', before(stack('display'), 'Lifehack Sans', 'Lifehack Sans Fallback'), true);
  is('the text face outranks its fallback', before(stack('sans'), 'PT Sans', 'PT Sans Fallback'), true);

  // The preload list has to name files that exist, or it is a wasted request
  // and a missed one.
  const preload = await readFile(new URL('../src/data/fonts.ts', import.meta.url), 'utf-8');
  const named = [...preload.matchAll(/'\/fonts\/([^']+)'/g)].map((m) => m[1]);
  is('the preloads name real files', named.filter((n) => !files.has(n)), []);
  is('russian preloads its own subsets', named.filter((n) => n.includes('cyrillic')).length, 2);
}


/* ------------------------------------------------------------------ payment */
/*
 * The places where a mistake costs real money: what the shopper is charged,
 * what delivery costs, and whether a "Paysera says it is paid" message is
 * actually from Paysera.
 */
group('cart pricing');
const CATALOG = {
  currency: 'EUR',
  freeFrom: 20,
  flatRate: 3.9,
  lockerCountries: ['LV', 'LT', 'EE'],
  courierRate: null,
  courierCountries: [],
  countryNames: { LV: 'Latvia', LT: 'Lithuania', EE: 'Estonia', DE: 'Germany', FI: 'Finland' },
  freeShipSlugs: ['tasting-box'],
  boxes: { sizes: [{ size: 4, discount: 0.05 }, { size: 6, discount: 0.1 }], items: ['apple-bar-35g:classic', 'apple-bar-35g:berry'] },
  items: {
    'apple-bar-35g:classic': { slug: 'apple-bar-35g', name: 'Apple Bar', title: "App'Lite Apple Bar 35 g", variant: 'Classic', price: 1.45, gtin: '4751043820181', weight: 35, pack: 1, tier: true },
    'apple-bar-35g:berry': { slug: 'apple-bar-35g', name: 'Apple Bar', title: "App'Lite Apple Bar 35 g", variant: 'Berry Mix', price: 1.45, gtin: '4751043820198', weight: 35, pack: 1, tier: true },
    'apple-bar-12-pack': { slug: 'apple-bar-12-pack', name: 'Apple Bar 12-pack', title: 'Apple Bar 12-pack', variant: '', price: 14.9, gtin: '', weight: 420, pack: 12, tier: false },
    'tasting-box': { slug: 'tasting-box', name: 'Tasting Box', title: 'Tasting Box', variant: '', price: 17.9, gtin: '', weight: 600, pack: 1, tier: false },
    'ten-euro': { slug: 'ten-euro', name: 'Ten', title: 'Ten', variant: '', price: 10, gtin: '', weight: 100, pack: 1, tier: true },
  },
};
/** The same catalogue once the owner has given the courier a price. */
const WITH_COURIER = { ...CATALOG, courierRate: 7.5, courierCountries: ['LV', 'LT', 'EE', 'DE', 'FI'] };
const SETTINGS = { freeFrom: 20, tiersOn: true, tier1Qty: 3, tier1Pct: 5, tier2Qty: 6, tier2Pct: 10 };
{
  const price = (lines, settings = SETTINGS, overrides = {}, opts = {}, catalog = CATALOG) => priceCart(catalog, settings, overrides, lines, opts);

  is('the ladder is read from settings', tiersOf(SETTINGS), [[3, 5], [6, 10]]);
  is('the owner can switch the ladder off', tiersOf({ ...SETTINGS, tiersOn: false }), []);
  is('a step below the first rung is full price', tierPctFor([[3, 5], [6, 10]], 2), 0);
  is('the highest rung reached wins', tierPctFor([[3, 5], [6, 10]], 7), 10);

  // One bar and one 12-pack: under the threshold, so the parcel locker is charged.
  const basket = price([{ id: 'apple-bar-35g:classic', qty: 1 }, { id: 'apple-bar-12-pack', qty: 1 }]);
  is('a two-line basket totals correctly', [basket.subtotal, basket.shipping, basket.total], [16.35, 3.9, 20.25]);
  is('and is priced as the parcel locker', basket.method, 'locker');

  is('delivery is free from the threshold, not only over it', price([{ id: 'ten-euro', qty: 2 }]).shipping, 0);
  is('a cent under the threshold pays delivery', price([{ id: 'ten-euro', qty: 1 }, { id: 'apple-bar-35g:classic', qty: 1 }], { ...SETTINGS, freeFrom: 11.46 }).shipping, 3.9);
  is("the owner's threshold is the one that applies", price([{ id: 'ten-euro', qty: 2 }], { ...SETTINGS, freeFrom: 25 }).shipping, 3.9);
  is('the tasting box carries free delivery at any total', price([{ id: 'tasting-box', qty: 1 }]).shipping, 0);

  // Delivery methods: the parcel locker in the Baltics, the courier only once it has a price.
  is('there is no pickup: the word is a parcel locker', price([{ id: 'apple-bar-35g:classic', qty: 1 }], SETTINGS, {}, { method: 'pickup' }).shipping, 3.9);
  is('the courier is refused while it has no price', price([{ id: 'apple-bar-35g:classic', qty: 1 }], SETTINGS, {}, { method: 'courier', country: 'Latvia' }).reason, 'method');
  is('a parcel locker in Lithuania', price([{ id: 'apple-bar-35g:classic', qty: 1 }], SETTINGS, {}, { method: 'locker', country: 'Lithuania' }).ok, true);
  is('the country can come as a code', price([{ id: 'apple-bar-35g:classic', qty: 1 }], SETTINGS, {}, { method: 'locker', country: 'ee' }).ok, true);
  is('a parcel locker in Germany is refused', price([{ id: 'apple-bar-35g:classic', qty: 1 }], SETTINGS, {}, { method: 'locker', country: 'Germany' }).reason, 'country');
  is('a country nobody listed is refused', price([{ id: 'apple-bar-35g:classic', qty: 1 }], SETTINGS, {}, { method: 'locker', country: 'Narnia' }).reason, 'country');
  const byCourier = price([{ id: 'apple-bar-35g:classic', qty: 1 }], SETTINGS, {}, { method: 'courier', country: 'Germany' }, WITH_COURIER);
  is('with a price, the courier is charged its own rate', [byCourier.method, byCourier.shipping, byCourier.total], ['courier', 7.5, 8.95]);
  is('and is free from the same threshold', price([{ id: 'ten-euro', qty: 2 }], SETTINGS, {}, { method: 'courier', country: 'Finland' }, WITH_COURIER).shipping, 0);
  is('the parcel locker keeps its own rate beside it', price([{ id: 'apple-bar-35g:classic', qty: 1 }], SETTINGS, {}, { method: 'locker', country: 'Latvia' }, WITH_COURIER).shipping, 3.9);
  is('a courier outside its countries is refused', price([{ id: 'apple-bar-35g:classic', qty: 1 }], SETTINGS, {}, { method: 'courier', country: 'Norway' }, WITH_COURIER).reason, 'country');
  is('shippingFor agrees with priceCart', shippingFor(WITH_COURIER, { method: 'courier', subtotal: 5, free: false, freeFrom: 20 }), 7.5);
  is('and says so when a method has no price', shippingFor(CATALOG, { method: 'courier', subtotal: 5, free: false, freeFrom: 20 }), null);

  // The ladder must reach the money, not only the label.
  const three = price([{ id: 'apple-bar-35g:classic', qty: 3 }]);
  is('three bars take 5% off the unit', [three.items[0].unit, three.subtotal], [1.38, 4.14]);
  const six = price([{ id: 'apple-bar-35g:classic', qty: 6 }]);
  is('six bars take 10% off the unit', [six.items[0].unit, six.subtotal], [1.31, 7.86]);
  is('a line opted out of the ladder keeps its price', price([{ id: 'apple-bar-12-pack', qty: 6 }]).items[0].unit, 14.9);

  // A box from the builder is priced from its pieces, with the builder's own discount.
  const four = 'bundle:apple-bar-35g:berry+apple-bar-35g:classic+apple-bar-35g:classic+apple-bar-35g:classic';
  const box = price([{ id: four, qty: 1 }]);
  is('a built box is its pieces less the discount for its size', [box.items[0].unit, box.items[0].name], [5.51, 'Box of 4']);
  is('and names what is in it', box.items[0].variant, '1× Apple Bar Berry Mix, 3× Apple Bar Classic');
  is('the ladder does not stack on a box', price([{ id: four, qty: 3 }]).items[0].unit, 5.51);
  is('a box of a size nobody sells is refused', price([{ id: 'bundle:apple-bar-35g:classic+apple-bar-35g:classic+apple-bar-35g:classic', qty: 1 }]).reason, 'unknown-item');
  is('a piece that does not go in a box is refused', price([{ id: 'bundle:apple-bar-12-pack+apple-bar-35g:classic+apple-bar-35g:classic+apple-bar-35g:classic', qty: 1 }]).reason, 'unknown-item');
  is('a box with a piece taken off sale is refused', price([{ id: four, qty: 1 }], SETTINGS, { 'apple-bar-35g': { inStock: false } }).reason, 'unavailable');

  // Everything a hostile cart could try.
  is('a price sent by the browser is ignored', price([{ id: 'apple-bar-35g:classic', qty: 1, price: 0.01 }]).total, 5.35);
  is('an unknown line is refused', price([{ id: 'free-lunch', qty: 1 }]).reason, 'unknown-item');
  is('and names itself, so the page can say which', price([{ id: 'free-lunch', qty: 1 }]).id, 'free-lunch');
  is('a zero quantity is refused', price([{ id: 'tasting-box', qty: 0 }]).reason, 'quantity');
  is('a fractional quantity is refused', price([{ id: 'tasting-box', qty: 1.5 }]).reason, 'quantity');
  is('a negative quantity is refused', price([{ id: 'tasting-box', qty: -3 }]).reason, 'quantity');
  is('an absurd quantity is refused', price([{ id: 'tasting-box', qty: 500 }]).reason, 'quantity');
  is('an empty cart is refused', price([]).reason, 'empty');
  is('no catalogue means no charge', priceCart(null, SETTINGS, {}, [{ id: 'tasting-box', qty: 1 }]).reason, 'no-catalog');

  // The admin's overrides are the live shop, so they decide the price too.
  is("the owner's price wins", price([{ id: 'tasting-box', qty: 1 }], SETTINGS, { 'tasting-box': { price: 19.5 } }).subtotal, 19.5);
  is('a hidden product cannot be bought', price([{ id: 'tasting-box', qty: 1 }], SETTINGS, { 'tasting-box': { hidden: true } }).reason, 'unavailable');
  is('a sold-out product cannot be bought', price([{ id: 'tasting-box', qty: 1 }], SETTINGS, { 'tasting-box': { inStock: false } }).reason, 'unavailable');

  // The GTIN is the only code the shop and the production floor share, so it
  // has to survive into the line the operations base receives.
  is('the line carries its GTIN', basket.items[0].gtin, '4751043820181');
}

group('free shipping, in every place that decides it');
{
  /*
   * The rule is written down in several places: the cart summary and the
   * drawer the shopper reads, the cart page's own meter, the structured data
   * Google reads, the catalogue the payment is priced from, and the Worker's
   * defaults. Several copies of one fact is how a shop comes to show one total
   * and bill another, so they are compared here rather than trusted to stay in
   * step.
   */
  const src = (file) => readFile(new URL(`../src/${file}`, import.meta.url), 'utf-8');
  const list = (text, re) => [...(re.exec(text)?.[1].matchAll(/'([^']+)'/g) || [])].map((m) => m[1]).sort();
  const [siteTs, schema, catalogue, cartPage, checkoutPage, data, base] = await Promise.all([
    src('scripts/site.ts'),
    src('lib/schema.ts'),
    src('pages/catalog.json.ts'),
    src('pages/[...locale]/cart.astro'),
    src('pages/[...locale]/checkout.astro'),
    src('data/site.ts'),
    src('layouts/Base.astro'),
  ]);
  const slugs = {
    cart: list(siteTs, /const FREE_SHIP_SLUGS = new Set\(\[([^\]]*)\]\)/),
    cartPage: list(cartPage, /const FREE_SHIP_SLUGS = new Set\(\[([^\]]*)\]\)/),
    schema: list(schema, /const FREE_SHIP_SLUGS = new Set\(\[([^\]]*)\]\)/),
    catalogue: list(catalogue, /freeShipSlugs: \[([^\]]*)\]/),
  };
  is('the cart and the price the payment is charged agree', slugs.catalogue, slugs.cart);
  is("the cart page's meter agrees", slugs.cartPage, slugs.cart);
  is('the structured data agrees too', slugs.schema, slugs.cart);
  is('and the list is not empty, which would pass by accident', slugs.cart.length > 0, true);

  // The threshold itself: one number in site.ts, read everywhere else.
  const freeFrom = Number(/shipping:\s*\{[^}]*?freeFrom:\s*([\d.]+)/.exec(data)?.[1]);
  is('site.ts states a threshold', Number.isFinite(freeFrom) && freeFrom > 0, true);
  is("the Worker's default is the same number", worker.SETTING_DEFAULTS.freeFrom, freeFrom);
  is('the catalogue reads it from site.ts', /freeFrom: site\.shipping\.freeFrom/.test(catalogue), true);
  is('so does the page config', /freeFrom: site\.shipping\.freeFrom/.test(base), true);
  // A literal fallback in the browser is a second copy waiting to go stale.
  is('the cart script keeps no threshold of its own', /freeFrom:\s*\d/.test(siteTs), false);
  is('nor does the cart page', /\|\|\s*25\b|\|\|\s*20\b/.test(cartPage), false);

  // The rates: site.ts again, and never a number typed into a page.
  is('the catalogue reads the locker rate from site.ts', /flatRate: site\.shipping\.flatRate/.test(catalogue), true);
  is('and the courier rate', /site\.shipping\.courierRate/.test(catalogue), true);
  is('the checkout prices from site.ts', /data-shipping=\{site\.shipping\.flatRate\}/.test(checkoutPage), true);
  is('so does the cart page', /data-shipping=\{site\.shipping\.flatRate\}/.test(cartPage), true);
  is('no page types a rate', /data-shipping="[\d.]+"/.test(checkoutPage + cartPage), false);

  // Where a parcel can go: one EU list in the checkout and one in the catalogue.
  const eu = (text) => list(text, /const EU_COUNTRIES = \[([^\]]*)\]/);
  is('the checkout and the catalogue list the same countries', eu(checkoutPage), eu(catalogue));
  is('and it is the whole EU', eu(catalogue).length, 27);

  // A box the builder can make must be a box the Worker can price.
  const builder = await src('components/BoxBuilder.astro');
  is('the builder and the catalogue agree on what goes in a box', list(catalogue, /const BOX_SOURCES = \[([^\]]*)\]/), list(builder, /const sources = \[([^\]]*)\]/));

  // The promise beside the buy button, as the admin shows it and as the page prints it.
  const guarantee = /guarantee:\s*'((?:[^'\\]|\\.)*)'/.exec(data)?.[1];
  is("the Worker's guarantee is the one the page prints", worker.SETTING_DEFAULTS.guarantee, guarantee);
}

group('delivery method');
{
  /*
   * Free postage used to be reachable by typing the word "pickup" into the
   * address field: the server read the method out of that free text, waived
   * the postage, and a courier went out anyway. Only the keys decide — and
   * pickup is not one of them any more.
   */
  is('a real key is kept', [deliveryMethod('locker'), deliveryMethod('courier')], ['locker', 'courier']);
  is('pickup is gone', deliveryMethod('pickup'), 'locker');
  is('prose is not a key', deliveryMethod('Pickup in Riga'), 'locker');
  is('a word typed into an address is not a key', deliveryMethod('Brīvības iela 42, courier'), 'locker');
  is('the russian word is not a key either', deliveryMethod('самовывоз'), 'locker');
  is('nothing sent falls back to the parcel locker', [deliveryMethod(''), deliveryMethod(undefined), deliveryMethod(null)], ['locker', 'locker', 'locker']);
  is('an object cannot slip through', deliveryMethod({ toString: () => 'courier' }), 'locker');
  is('a locker id is kept', [lockerId('96331'), lockerId(96331)], ['96331', '96331']);
  is('anything else is dropped', [lockerId('96331; drop'), lockerId('<b>'), lockerId(''), lockerId({})], ['', '', '', '']);
}

group('md5');
{
  /*
   * WebCrypto has no MD5, so the Worker carries its own, and Paysera's
   * signatures are only as right as it is. Node's is the reference. The
   * lengths either side of 56 and 64 bytes are where the padding changes shape.
   */
  const ref = (v) => createHash('md5').update(v).digest('hex');
  const cases = ['', 'a', 'abc', 'message digest', 'abcdefghijklmnopqrstuvwxyz', 'The quick brown fox jumps over the lazy dog', 'Ābolu batoniņš, bez pievienota cukura', 'Печёное яблоко — без добавленного сахара', '🍏🍎', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(63), 'x'.repeat(64), 'x'.repeat(65), 'y'.repeat(100_000)];
  is('every case matches node', cases.filter((c) => md5(c) !== ref(c)).map((c) => c.slice(0, 20)), []);
  // RFC 1321's own test suite, so the reference is not the only witness.
  is('the RFC 1321 vectors', [md5(''), md5('abc'), md5('message digest')], ['d41d8cd98f00b204e9800998ecf8427e', '900150983cd24fb0d6963f7d28e17f72', 'f96b697d7cb7938d525a2f31aaf161d0']);
  is('bytes hash the same as their text', md5(new TextEncoder().encode('Rīga')), ref('Rīga'));
}

group('paysera request');
const PAYSERA = { PAYSERA_PROJECT_ID: '123456', PAYSERA_PASSWORD: 'p@ss-Wörd' };
{
  const params = payseraOrderParams(PAYSERA, { id: 'SM-260925-ABCD', origin: 'https://shop.example', loc: 'lv', total: 19.9, currency: 'EUR', email: 'anna@example.com', name: 'Anna Marija Bērziņa' });
  is('the order is identified by its reference', [params.projectid, params.orderid], ['123456', 'SM-260925-ABCD']);
  is('the amount is whole cents', [params.amount, Number.isInteger(params.amount)], [1990, true]);
  is('in euro, paid from Latvia', [params.currency, params.country, params.version], ['EUR', 'LV', '1.6']);
  is('back to the thank-you page in the language it was paid in', params.accepturl, 'https://shop.example/lv/order/thank-you/?paid=1&ref=SM-260925-ABCD');
  is('a change of mind goes back to the cart', params.cancelurl, 'https://shop.example/lv/cart/');
  is('the callback is the Worker', params.callbackurl, 'https://shop.example/api/paysera/callback');
  is("and Paysera's own language code", params.lang, 'LAV');
  const en = payseraOrderParams(PAYSERA, { id: 'SM-1', origin: 'https://shop.example', loc: 'en', total: 5, currency: 'EUR', email: 'a@b.co', name: 'Cher' });
  is('english keeps the bare paths', [en.accepturl, en.cancelurl, en.lang], ['https://shop.example/order/thank-you/?paid=1&ref=SM-1', 'https://shop.example/cart/', 'ENG']);
  is('russian', payseraOrderParams(PAYSERA, { id: 'SM-1', origin: 'https://x', loc: 'ru', total: 1, currency: 'EUR', email: 'a@b.co', name: '' }).lang, 'RUS');
  is('the name is split into first and last', [params.p_firstname, params.p_lastname], ['Anna Marija', 'Bērziņa']);
  is('one word is a first name', [en.p_firstname, en.p_lastname], ['Cher', '']);
  is('the purpose names the order', /\[order_nr\]/.test(params.paytext), true);
  is('live unless told otherwise', params.test, 0);
  is('PAYSERA_TEST=1 is a test payment', payseraOrderParams({ ...PAYSERA, PAYSERA_TEST: '1' }, { id: 'SM-1', origin: 'https://x', loc: 'en', total: 1, currency: 'EUR', email: 'a@b.co', name: 'A' }).test, 1);

  const req = payseraRequest(params, PAYSERA.PAYSERA_PASSWORD);
  const url = new URL(req.url);
  is('the shopper goes to paysera.com/pay', [url.origin, url.pathname], ['https://www.paysera.com', '/pay/']);
  is('carrying the data and its signature', [url.searchParams.get('data'), url.searchParams.get('sign')], [req.data, req.sign]);
  is('the data is URL-safe base64', /^[A-Za-z0-9_=-]+$/.test(req.data), true);
  is('the signature is md5(data + password), lowercase hex', req.sign, createHash('md5').update(req.data + PAYSERA.PAYSERA_PASSWORD).digest('hex'));
  is('it decodes back to what was sent', payseraDecode(req.data), Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '').map(([k, v]) => [k, String(v)])));
  is('an empty last name is left out, not sent blank', 'p_lastname' in payseraDecode(payseraRequest(en, 'x').data), false);

  // A URL-encoded query never reaches '+' or '/' in base64, so the swap is
  // proven on text that does: '?', '>' and '~' left unencoded, and UTF-8.
  const raw = ['a=???>>>~~~', 'paytext=Ābols?>', 'x=~~~~~~&y=????'];
  const standard = raw.map((r) => Buffer.from(r).toString('base64'));
  is('these really do use + and /', standard.every((b) => /[+/]/.test(b)), true);
  is('the encoder swaps them for - and _', raw.map(payseraEncode), standard.map((b) => b.replace(/\+/g, '-').replace(/\//g, '_')));
  is('and the decoder swaps them back', raw.map((r) => payseraDecode(payseraEncode(r))), raw.map((r) => Object.fromEntries(new URLSearchParams(r))));
  is('the request is exactly that encoding of its query', req.data, Buffer.from(new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '').map(([k, v]) => [k, String(v)])).toString()).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'));
  is('padding may be missing on the way back', payseraDecode(payseraEncode('a=1').replace(/=+$/, '')), { a: '1' });
  is('garbage does not decode', [payseraDecode(''), payseraDecode('***'), payseraDecode(null)], [null, null, null]);

  is('a good ss1 verifies', payseraVerify(req.data, req.sign, PAYSERA.PAYSERA_PASSWORD), true);
  is('in capitals too', payseraVerify(req.data, req.sign.toUpperCase(), PAYSERA.PAYSERA_PASSWORD), true);
  is('a wrong ss1 does not', payseraVerify(req.data, md5('something else'), PAYSERA.PAYSERA_PASSWORD), false);
  is('nor one for other data', payseraVerify(`${req.data}A`, req.sign, PAYSERA.PAYSERA_PASSWORD), false);
  is('nor a truncated one', payseraVerify(req.data, req.sign.slice(0, 31), PAYSERA.PAYSERA_PASSWORD), false);
  is('nor anything without a password', payseraVerify(req.data, md5(req.data), ''), false);
  is('nor a missing ss1', payseraVerify(req.data, undefined, PAYSERA.PAYSERA_PASSWORD), false);
}

/**
 * Enough of D1 for the Worker, over a real SQLite database, so the payment
 * path is tested against the SQL that ships rather than a description of it.
 */
function sqliteD1() {
  const db = new DatabaseSync(':memory:');
  const wrap = (sql) => {
    let args = [];
    const api = {
      bind: (...a) => ((args = a), api),
      run: async () => ({ success: true, meta: { changes: Number(db.prepare(sql).run(...args).changes) } }),
      first: async () => db.prepare(sql).get(...args) ?? null,
      all: async () => ({ results: db.prepare(sql).all(...args) }),
    };
    return api;
  };
  return { db, d1: { prepare: wrap, batch: async (stmts) => Promise.all(stmts.map((st) => st.run())) } };
}

/** A fresh Worker module: it keeps its schema flag, catalogue and locker list per isolate. */
let isolateN = 0;
const workerSrc = await readFile(new URL('../worker/server.js', import.meta.url), 'utf-8');
const freshIsolate = () => import('data:text/javascript;base64,' + Buffer.from(`${workerSrc}\n// isolate ${isolateN++}`).toString('base64'));

group('paysera checkout and callback');
{
  const realFetch = globalThis.fetch;
  // The Worker's log is part of what is asserted: a forged callback must leave a trace.
  const realError = console.error;
  const logged = [];
  console.error = (...a) => logged.push(a.map(String).join(' '));
  const sent = { mail: [], telegram: [], ops: [] };
  let opsOk = true;
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.includes('api.resend.com')) sent.mail.push(JSON.parse(init.body));
    else if (u.includes('api.telegram.org')) sent.telegram.push(JSON.parse(init.body));
    else if (u.startsWith('https://ops.example')) {
      sent.ops.push(JSON.parse(init.body));
      return new Response('{}', { status: opsOk ? 200 : 500 });
    }
    return new Response('{"ok":true}', { status: 200 });
  };
  const w = await freshIsolate();
  const { db, d1 } = sqliteD1();
  const catalog = { ...CATALOG };
  const env = {
    ...PAYSERA,
    PAYSERA_TEST: '1',
    DB: d1,
    ASSETS: { fetch: async (u) => (new URL(u).pathname === '/catalog.json' ? new Response(JSON.stringify(catalog)) : new Response('', { status: 404 })) },
    RESEND_API_KEY: 'k',
    ORDER_TO_EMAIL: 'orders@example.com',
    TELEGRAM_BOT_TOKEN: 't',
    TELEGRAM_CHAT_ID: '1',
    OPS_WEBHOOK_URL: 'https://ops.example/hook',
  };
  const call = (path, init) => w.default.fetch(new Request(`https://shop.example${path}`, init), env);
  const post = (body) => call('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4' }, body: JSON.stringify(body) });
  const customer = { name: 'Anna Bērziņa', email: 'anna@example.com', phone: '+37120000000', country: 'Latvia', address: 'Omniva: Rīga Brīvības pakomāts (96331)', city: 'Rīga', locker: '96331', delivery: 'Omniva parcel locker' };
  const order = (extra = {}) => ({ customer, method: 'locker', items: [{ id: 'apple-bar-35g:classic', qty: 2 }], locale: 'lv', page: '/lv/checkout/', ...extra });

  is('the storefront says payments are on', (await (await call('/api/storefront')).json()).payments, true);
  is('and off without the password', (await (await w.default.fetch(new Request('https://shop.example/api/storefront'), { PAYSERA_PROJECT_ID: '1' })).json()).payments, false);
  is('checkout without Paysera says so', (await (await w.default.fetch(new Request('https://shop.example/api/checkout', { method: 'POST', body: '{}' }), {})).json()).reason, 'not-configured');

  const res = await post(order());
  const out = await res.json();
  is('checkout answers with a payment link', [res.status, out.ok, typeof out.url], [200, true, 'string']);
  const link = new URL(out.url);
  is('on www.paysera.com', link.hostname, 'www.paysera.com');
  const sentParams = payseraDecode(link.searchParams.get('data'));
  is('signed with the project password', link.searchParams.get('sign'), createHash('md5').update(link.searchParams.get('data') + PAYSERA.PAYSERA_PASSWORD).digest('hex'));
  // Two bars at 1.45 and the parcel-locker rate: the server's arithmetic, not the browser's.
  is('for the amount the server priced', [sentParams.amount, sentParams.currency, sentParams.orderid], ['680', 'EUR', out.ref]);
  is('as a test payment', sentParams.test, '1');
  is('with the buyer', [sentParams.p_email, sentParams.p_firstname, sentParams.p_lastname], ['anna@example.com', 'Anna', 'Bērziņa']);
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(out.ref);
  is('the order row exists before the shopper leaves', [row?.status, row?.total, row?.shipping, row?.pay_provider], ['new', 6.8, 3.9, 'paysera']);
  is('with the locker it goes to', [row.address, JSON.parse(row.payload_json).locker, JSON.parse(row.payload_json).method, row.delivery], ['Omniva: Rīga Brīvības pakomāts (96331)', '96331', 'locker', 'Omniva parcel locker']);

  // What a browser cannot talk the server into.
  is('a courier with no price is refused', (await (await post(order({ method: 'courier', customer: { ...customer, postcode: 'LV-1010' } }))).json()).reason, 'method');
  is('a parcel locker abroad is refused', (await (await post(order({ customer: { ...customer, country: 'Germany' } }))).json()).reason, 'country');
  is('no address is refused', (await (await post(order({ customer: { ...customer, address: '' } }))).json()).reason, 'address');
  is('a product off sale is refused by name', await (await post(order({ items: [{ id: 'gone-product', qty: 1 }] }))).json(), { ok: false, reason: 'unknown-item', id: 'gone-product' });

  const callback = async (params, { method = 'GET', ss1, password = PAYSERA.PAYSERA_PASSWORD } = {}) => {
    const { data, sign } = payseraRequest(params, password);
    const sig = ss1 ?? sign;
    const r =
      method === 'GET'
        ? await call(`/api/paysera/callback?data=${encodeURIComponent(data)}&ss1=${sig}&ss2=ignored`)
        : await call('/api/paysera/callback', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ data, ss1: sig, ss2: 'ignored' }).toString() });
    return { status: r.status, text: await r.text() };
  };
  const paid = (extra = {}) => ({ projectid: PAYSERA.PAYSERA_PROJECT_ID, orderid: out.ref, amount: '680', currency: 'EUR', status: '1', test: '1', requestid: '987654', p_email: 'anna@example.com', ...extra });
  const statusOf = (id = out.ref) => db.prepare('SELECT status FROM orders WHERE id = ?').get(id)?.status;
  const counts = () => [sent.mail.length, sent.telegram.length, sent.ops.length];

  // A forged callback: right shape, wrong signature.
  is('a bad signature is refused', await callback(paid(), { ss1: md5('forged') }), { status: 400, text: 'bad signature' });
  is('and is logged', logged.some((l) => /paysera callback rejected: signature/.test(l)), true);
  is('one signed with another password too', (await callback(paid(), { password: 'guess' })).status, 400);
  is('and the order is untouched', statusOf(), 'new');
  is('a callback for another project is refused', (await callback(paid({ projectid: '999' }))).status, 400);

  // Not paid yet: acknowledged, and nothing changes.
  is('a pending status is acknowledged', await callback(paid({ status: '2' })), { status: 200, text: 'OK' });
  is('a failed one too', await callback(paid({ status: '0' })), { status: 200, text: 'OK' });
  is('without marking the order paid', statusOf(), 'new');
  is('or telling anyone', counts(), [0, 0, 0]);

  // Someone else's sum, signed: not paid, flagged once.
  is('a different amount is acknowledged', await callback(paid({ amount: '1' })), { status: 200, text: 'OK' });
  is('but not marked paid', statusOf(), 'new');
  is('and flagged for a person', /PAYSERA AMOUNT MISMATCH/.test(db.prepare('SELECT admin_note FROM orders WHERE id = ?').get(out.ref).admin_note), true);
  await callback(paid({ amount: '1' }));
  is('once, however often it comes', [sent.telegram.length, (db.prepare('SELECT admin_note FROM orders WHERE id = ?').get(out.ref).admin_note.match(/MISMATCH/g) || []).length], [1, 1]);
  is('another currency is the same', [(await callback(paid({ currency: 'USD' }))).text, statusOf()], ['OK', 'new']);
  sent.telegram.length = 0;

  // The real thing, by POST as Paysera may send it.
  is('the paid callback is acknowledged', await callback(paid(), { method: 'POST' }), { status: 200, text: 'OK' });
  const done = db.prepare('SELECT * FROM orders WHERE id = ?').get(out.ref);
  is('the order is paid', [done.status, done.pay_provider, done.pay_ref, done.pay_test, done.paid_at !== ''], ['paid', 'paysera', '987654', 1, true]);
  is('the shop and the buyer are told, and the floor gets it', counts(), [2, 1, 1]);
  const toBuyer = sent.mail.find((m) => m.to[0] === 'anna@example.com');
  is('the buyer is told in their language that it is paid', /Apmaksa saņemta/.test(toBuyer?.subject || ''), true);
  is('with the method in their language', toBuyer.text.includes('Piegādes veids: Omniva pakomāts'), true);
  is('the shop sees a test is a test', /ТЕСТ/.test(sent.telegram[0].text) && /TEST, no money moved/.test(sent.telegram[0].text), true);
  is('and which locker', sent.telegram[0].text.includes('Omniva locker ID: 96331'), true);
  const ops = sent.ops[0];
  is('the floor gets the locker and the payment', [ops.delivery.method, ops.delivery.carrier, ops.delivery.locker_id, ops.payment.provider, ops.payment.ref, ops.livemode], ['locker', 'Omniva', '96331', 'paysera', '987654', false]);
  is('and the lines by GTIN', ops.items.map((i) => [i.gtin, i.qty]), [['4751043820181', 2]]);

  // Paysera repeats itself. Nobody gets a second e-mail and the floor no second order.
  is('a repeated callback is acknowledged', await callback(paid()), { status: 200, text: 'OK' });
  is('and changes nothing', [counts(), statusOf()], [[2, 1, 1], 'paid']);
  db.prepare("UPDATE orders SET status = 'shipped' WHERE id = ?").run(out.ref);
  await callback(paid());
  is('a late repeat cannot pull a shipped order back to paid', statusOf(), 'shipped');

  // The floor was down: the callback fails so Paysera comes back, and the retry sends only what is owed.
  const second = await (await post(order())).json();
  opsOk = false;
  is('an operations failure asks Paysera to retry', (await callback(paid({ orderid: second.ref }))).status, 500);
  is('with the order already paid and the e-mails sent', [statusOf(second.ref), counts()], ['paid', [4, 2, 2]]);
  opsOk = true;
  is('the retry is acknowledged', (await callback(paid({ orderid: second.ref }))).text, 'OK');
  is('and only the floor hears again', counts(), [4, 2, 3]);
  is('then never again', [(await callback(paid({ orderid: second.ref }))).text, counts()], ['OK', [4, 2, 3]]);

  // Money for an order nobody wrote down: kept, and raised for a person.
  is('a payment with no order is acknowledged', (await callback(paid({ orderid: 'SM-000000-LOST', amount: '1234' }))).text, 'OK');
  const lost = db.prepare('SELECT * FROM orders WHERE id = ?').get('SM-000000-LOST');
  is('and recorded as a paid row to finish by hand', [lost?.status, lost?.total, /RECOVERED/.test(lost?.admin_note || '')], ['paid', 12.34, true]);

  // The admin reads the same table.
  is('the stored order is readable as json', typeof JSON.parse(db.prepare('SELECT items_json FROM orders WHERE id = ?').get(out.ref).items_json)[0].unit, 'number');
  is('the operations failure was logged', logged.some((l) => /operations webhook refused/.test(l)), true);
  globalThis.fetch = realFetch;
  console.error = realError;
}

group('parcel lockers');
{
  // The documented shape of Omniva's locations.json, with the awkward cases in it.
  const FEED = [
    { ZIP: '96331', NAME: 'Rīga Brīvības Rimi pakomāts', TYPE: '0', A0_NAME: 'LV', A1_NAME: 'Rīga', A2_NAME: 'Rīga', A5_NAME: 'Brīvības iela', A7_NAME: '372' },
    { ZIP: '96332', NAME: 'Āgenskalna tirgus pakomāts', TYPE: '0', A0_NAME: 'LV', A1_NAME: 'Rīga', A2_NAME: 'NULL', A5_NAME: 'Nometņu iela', A7_NAME: '64' },
    { ZIP: '1001', NAME: 'Rīgas pasta nodaļa', TYPE: '1', A0_NAME: 'LV', A1_NAME: 'Rīga', A2_NAME: 'Rīga', A5_NAME: 'Stacijas laukums', A7_NAME: '1' },
    { ZIP: 9102, NAME: 'Tallinna Kristiine Omniva pakiautomaat', TYPE: 0, A0_NAME: 'EE', A1_NAME: 'Harju maakond', A2_NAME: 'Tallinn', A5_NAME: 'Endla', A7_NAME: '45' },
    { ZIP: '44001', NAME: 'Vilniaus Akropolis paštomatas', TYPE: '0', A0_NAME: 'LT', A1_NAME: 'Vilniaus apskr.', A2_NAME: 'Vilnius', A5_NAME: 'Ozo g.', A7_NAME: '25' },
    { ZIP: '00100', NAME: 'Helsinki pakettiautomaatti', TYPE: '0', A0_NAME: 'FI', A1_NAME: 'Uusimaa', A2_NAME: 'Helsinki', A5_NAME: 'Mannerheimintie', A7_NAME: '1' },
    { ZIP: '96331', NAME: 'Rīga Brīvības Rimi pakomāts (again)', TYPE: '0', A0_NAME: 'LV' },
    { ZIP: '', NAME: 'No id', TYPE: '0', A0_NAME: 'LV' },
    { ZIP: '96333', TYPE: '0', A0_NAME: 'LV' },
    null,
    'a string',
    42,
  ];
  const got = compactLockers(FEED);
  // Ā sorts with A, so Āgenskalna comes before Rīga.
  is('parcel machines in the three countries, nothing else, by country then name', got.map((l) => l.id), ['9102', '44001', '96332', '96331']);
  is('in the compact shape', got.find((l) => l.id === '96331'), { id: '96331', name: 'Rīga Brīvības Rimi pakomāts', city: 'Rīga', address: 'Brīvības iela 372', country: 'LV' });
  is('a NULL city falls back to the county', got.find((l) => l.id === '96332').city, 'Rīga');
  is('a numeric ZIP and TYPE still count', got[0], { id: '9102', name: 'Tallinna Kristiine Omniva pakiautomaat', city: 'Tallinn', address: 'Endla 45', country: 'EE' });
  is('one row per locker id', got.filter((l) => l.id === '96331').length, 1);
  is('a feed that is not a list is an empty list', [compactLockers(null), compactLockers({ locations: FEED }), compactLockers('[]'), compactLockers(undefined)], [[], [], [], []]);

  const realFetch = globalThis.fetch;
  const serve = (body, status = 200) => (globalThis.fetch = async (u) => {
    if (!String(u).startsWith('https://www.omniva.ee/')) throw new Error(`unexpected fetch ${u}`);
    if (body instanceof Error) throw body;
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  });
  const ask = async (w) => {
    const r = await w.default.fetch(new Request('https://shop.example/api/lockers'), {});
    return { status: r.status, body: await r.json().catch(() => null), cache: r.headers.get('cache-control') };
  };

  const w1 = await freshIsolate();
  serve(FEED);
  const first = await ask(w1);
  is('the endpoint serves the compact list', [first.status, first.body.length, first.body[0].id], [200, 4, '9102']);
  is('and lets the browser keep it an hour', first.cache, 'public, max-age=3600');
  serve(new Error('omniva is down'));
  is('a second call inside the day does not refetch', (await ask(w1)).body.length, 4);

  const w2 = await freshIsolate();
  serve('{"not": "json"');
  is('a malformed feed is a 502, not a crash', (await ask(w2)).status, 502);
  serve({ locations: [] });
  is('a feed of the wrong shape too', (await ask(w2)).status, 502);
  serve([], 200);
  is('an empty one too', (await ask(w2)).status, 502);
  serve('oops', 503);
  is('an Omniva error too', (await ask(w2)).status, 502);
  serve(new Error('offline'));
  is('and no network at all', (await ask(w2)).body, { ok: false, reason: 'lockers-unavailable' });
  is('only GET', (await w2.default.fetch(new Request('https://shop.example/api/lockers', { method: 'POST' }), {})).status, 405);
  globalThis.fetch = realFetch;
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
