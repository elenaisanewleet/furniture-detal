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
import { readFile } from 'node:fs/promises';
import { localizeHtml, isExempt } from './localize-links.mjs';
import { scanProse, applyProse, isProse } from './prose-scan.mjs';

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
  const fakeDb = {
    prepare(sql) {
      return {
        bind: (...args) => ({
          run: async () => {
            if (/^INSERT INTO login_attempts/.test(sql)) rows.push(args[0]);
            if (/^DELETE FROM login_attempts WHERE ip/.test(sql)) for (let i = rows.length - 1; i >= 0; i--) if (rows[i] === args[0]) rows.splice(i, 1);
            return {};
          },
          first: async () => (/COUNT\(\*\) AS c FROM login_attempts/.test(sql) ? { c: rows.filter((r) => r === args[0]).length } : null),
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
  is('numbers are always sent', untouched.freeFrom, 25);
  is('and so are switches', untouched.guaranteeOn, true);

  const changed = await payload([{ key: 'guaranteeRu', value: 'Вернём деньги в течение 14 дней.' }]);
  is('a guarantee the owner wrote is sent', changed.guaranteeRu, 'Вернём деньги в течение 14 дней.');
  is('and the ones they did not are still absent', 'guarantee' in changed, false);
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

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
