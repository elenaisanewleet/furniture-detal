/**
 * Semers store Worker.
 *
 * Static pages and assets are served asset-first from dist/client, so this
 * handler only ever sees /api/* and paths that matched no file.
 *
 * Three groups of routes:
 *   public   /api/order, /api/storefront, GET+POST /api/reviews
 *   admin    /api/admin/* behind a password and a signed session cookie
 *   fallback the 404 page
 *
 * Secrets come from website_secrets (env bindings):
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, RESEND_API_KEY, ORDER_TO_EMAIL,
 *   ORDER_FROM_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET.
 * Without ADMIN_PASSWORD the admin API stays off entirely — a shop that has
 * not set a password must not be reachable with an empty one.
 *
 * D1 (env.DB) is optional: with no database the shop still takes orders by
 * Telegram and e-mail exactly as before, and the admin API reports it is
 * unavailable rather than failing halfway through a write.
 */

const MAX_BODY = 64 * 1024;
const MAX_ITEMS = 60;
/** Telegram rejects messages over 4096 characters; keep the notification well under it. */
const MAX_TG = 4000;
const TYPES = new Set(['order', 'newsletter', 'contact', 'wholesale']);
const ORDER_STATUSES = new Set(['new', 'confirmed', 'paid', 'shipped', 'done', 'cancelled']);
const REVIEW_STATUSES = new Set(['pending', 'approved', 'rejected']);
/** Session lifetime. Long enough to work a morning of orders, short enough that a forgotten tab expires. */
const SESSION_TTL_S = 12 * 60 * 60;
const LOGIN_WINDOW_S = 15 * 60;
const LOGIN_MAX_FAILS = 8;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Single-line field: control characters and line breaks are collapsed so a value cannot pose as one of our own lines. */
/** The site's languages. Anything else is English, so a bad value cannot create a fourth. */
const LOCALES = new Set(['en', 'ru', 'lv']);
const locale = (v) => (LOCALES.has(v) ? v : 'en');

const s = (v, max = 400) => (typeof v === 'string' ? v.replace(/[\0-\x1f\x7f\u2028\u2029]+/g, ' ').trim().slice(0, max) : '');
/** Free-text field: keeps its line breaks, indented under the label for the same reason. */
const multi = (v, max) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(/[\0-\x09\x0b-\x1f\x7f\u2028\u2029]+/g, ' ').trim().slice(0, max).split('\n').join('\n    ') : '');
/** Free-text kept as typed (no indent) for storage and for the admin UI. */
const text = (v, max = 4000) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(/[\0-\x09\x0b-\x1f\x7f\u2028\u2029]+/g, ' ').trim().slice(0, max) : '');
const n = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v) * 100) / 100 : 0);
const money = (v, cur = 'EUR') => `${n(v).toFixed(2)} ${cur}`;
/** Only an ISO-4217 code goes into the notification text; anything else the client sent falls back to EUR. */
const currency = (v) => (/^[A-Z]{3}$/.test(String(v || '')) ? v : 'EUR');
const escapeHtml = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
/** Substitute {placeholders} in a template from the mail dictionary. */
const fill = (tpl, vars) => String(tpl).replace(/\{(\w+)\}/g, (_m, k) => String(vars[k] ?? ''));
const nowIso = () => new Date().toISOString();
/** Optional numeric override: an empty field clears it, so undefined and '' must both become NULL rather than 0. */
const numOrNull = (v) => (v === null || v === undefined || v === '' ? null : Number.isFinite(Number(v)) ? Math.round(Number(v) * 100) / 100 : null);
const boolOrNull = (v) => (v === null || v === undefined || v === '' ? null : v ? 1 : 0);

function ref() {
  const d = new Date();
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, '');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const rnd = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `SM-${ymd}-${rnd}`;
}

/** Refused with its own status rather than as a parse failure, so a caller can say which it was. */
function tooLarge() {
  return Object.assign(new Error('body too large'), { status: 413, reason: 'too-large' });
}

/**
 * The body is read against the limit rather than after it. `request.text()`
 * buffers whatever was sent before anything measures it, so a 64 KB cap
 * enforced on the result is not a cap: one request could spend the isolate's
 * whole memory allowance getting to the line that rejects it.
 */
async function readJson(request) {
  const asObject = (b) => (b && typeof b === 'object' && !Array.isArray(b) ? b : {});
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY) throw tooLarge();
  if (!request.body) return {};
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel();
      throw tooLarge();
    }
    chunks.push(value);
  }
  if (!size) return {};
  const buf = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) buf.set(c, at), (at += c.byteLength);
  return asObject(JSON.parse(new TextDecoder().decode(buf)));
}

const json = (status, data, extraHeaders) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...(extraHeaders || {}) },
  });

/* ------------------------------------------------------------------ database */

/** Set once per isolate: the schema is idempotent but re-running it on every request would cost a round trip. */
let schemaReady = false;

function db(env) {
  return env && env.DB ? env.DB : null;
}

/**
 * Create the tables if the deploy has not run migrations yet. Every statement is
 * IF NOT EXISTS, so this is safe to call against a database that already has data.
 */
/** [table, column, definition] for columns that postdate the first schema. */
const ADDED_COLUMNS = [
  ['reviews', 'locale', `TEXT NOT NULL DEFAULT 'en'`],
  ['orders', 'stripe_session', `TEXT NOT NULL DEFAULT ''`],
  ['orders', 'stripe_intent', `TEXT NOT NULL DEFAULT ''`],
  ['orders', 'paid_at', `TEXT NOT NULL DEFAULT ''`],
  /* 0 means the paid order has not reached the operations base yet, so it can be replayed. */
  ['orders', 'ops_sent', `INTEGER NOT NULL DEFAULT 0`],
  /* When the notifications went out. Empty means a retry still owes them; set means it must not send them twice. */
  ['orders', 'notified_at', `TEXT NOT NULL DEFAULT ''`],
];

async function ensureSchema(env) {
  const d = db(env);
  if (!d || schemaReady) return d;
  const stmts = [
    `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
      name TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '', postcode TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '', delivery TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '',
      gift TEXT NOT NULL DEFAULT '', currency TEXT NOT NULL DEFAULT 'EUR', subtotal REAL NOT NULL DEFAULT 0,
      shipping REAL NOT NULL DEFAULT 0, total REAL NOT NULL DEFAULT 0, items_json TEXT NOT NULL DEFAULT '[]',
      payload_json TEXT NOT NULL DEFAULT '{}', admin_note TEXT NOT NULL DEFAULT '', page TEXT NOT NULL DEFAULT '')`,
    `CREATE INDEX IF NOT EXISTS orders_created ON orders (created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS orders_status ON orders (status, created_at DESC)`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, slug TEXT NOT NULL, rating INTEGER NOT NULL,
      author TEXT NOT NULL, city TEXT NOT NULL DEFAULT '', title TEXT NOT NULL DEFAULT '', body TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'pending', verified INTEGER NOT NULL DEFAULT 0,
      reply TEXT NOT NULL DEFAULT '', locale TEXT NOT NULL DEFAULT 'en')`,
    `CREATE INDEX IF NOT EXISTS reviews_slug ON reviews (slug, status, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS reviews_status ON reviews (status, created_at DESC)`,
    `CREATE TABLE IF NOT EXISTS product_overrides (
      slug TEXT PRIMARY KEY, price REAL, compare_at REAL, in_stock INTEGER, hidden INTEGER,
      badge TEXT, batch TEXT, note TEXT, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, created_at TEXT NOT NULL, source TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT NOT NULL, at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS sessions (nonce TEXT PRIMARY KEY, exp INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS rate (bucket TEXT NOT NULL, at TEXT NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS rate_bucket ON rate (bucket, at)`,
    `CREATE INDEX IF NOT EXISTS login_attempts_ip ON login_attempts (ip, at)`,
    `CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '')`,
    `CREATE INDEX IF NOT EXISTS audit_at ON audit (at DESC)`,
    /*
     * Stripe retries a webhook until it gets a 2xx, so the same event arrives
     * more than once as a matter of course. The event id being the primary key
     * is what makes "mark it paid and tell the floor" happen exactly once.
     */
    `CREATE TABLE IF NOT EXISTS stripe_events (id TEXT PRIMARY KEY, at TEXT NOT NULL, type TEXT NOT NULL DEFAULT '')`,
  ];
  for (const q of stmts) await d.prepare(q).run();
  /*
   * Columns added after a database already exists. CREATE TABLE IF NOT EXISTS
   * leaves an older table alone, so each one is added separately and the error
   * from "it is already there" is the expected outcome, not a failure. SQLite
   * has no ADD COLUMN IF NOT EXISTS.
   */
  for (const [table, column, def] of ADDED_COLUMNS) {
    try {
      await d.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`).run();
    } catch {
      /* already present */
    }
  }
  schemaReady = true;
  return d;
}

async function audit(env, action, detail) {
  const d = db(env);
  if (!d) return;
  try {
    await d.prepare(`INSERT INTO audit (at, action, detail) VALUES (?, ?, ?)`).bind(nowIso(), s(action, 60), s(detail, 400)).run();
  } catch {
    /* the audit trail must never be the reason a write fails */
  }
}

/* ------------------------------------------------------------------ settings */

/**
 * Storefront settings the owner can change without a redeploy. Anything absent
 * from the table falls back to the value the built pages already show, so an
 * empty database behaves exactly like the site before the admin existed.
 */
const SETTING_DEFAULTS = {
  announcement: '',
  /*
   * The shop is read in three languages, so a banner written once is a banner
   * two thirds of the readers cannot read. English is the one that must be
   * filled in; a language left blank falls back to it, which is better than an
   * empty bar and honest about what the owner actually wrote.
   */
  announcementRu: '',
  announcementLv: '',
  announcementHref: '',
  announcementOn: false,
  freeFrom: 25,
  guarantee: 'Not what you hoped for? Tell us within 14 days and we refund the order — you keep the box.',
  guaranteeRu: 'Что-то не так? Напишите нам в течение 14 дней — вернём деньги за заказ, коробку оставьте себе.',
  guaranteeLv: 'Kaut kas nav kārtībā? Uzrakstiet mums 14 dienu laikā — atmaksāsim pasūtījumu, kārbu paturiet sev.',
  guaranteeOn: true,
  tier1Qty: 3,
  tier1Pct: 5,
  tier2Qty: 6,
  tier2Pct: 10,
  tiersOn: true,
  reviewsOn: true,
};

/**
 * The banner link is the one thing the owner types that becomes a live href on
 * every page a visitor loads. A `javascript:` there would turn a single admin
 * write — or one stolen session — into script running in every reader's
 * browser, so only the shapes a shop banner actually needs get through.
 */
function safeHref(v) {
  const h = s(v, 300);
  if (!h) return '';
  if (h.startsWith('//')) return '';
  if (h.startsWith('/')) return h;
  return /^(https?:\/\/|mailto:|tel:)/i.test(h) ? h : '';
}

function coerceSettings(raw) {
  const out = { ...SETTING_DEFAULTS };
  for (const [k, def] of Object.entries(SETTING_DEFAULTS)) {
    if (!(k in raw)) continue;
    const v = raw[k];
    if (typeof def === 'boolean') out[k] = v === true || v === 'true' || v === 1 || v === '1';
    else if (typeof def === 'number') out[k] = Number.isFinite(Number(v)) ? Number(v) : def;
    else out[k] = k === 'announcementHref' ? safeHref(v) : s(v, 300);
  }
  // A discount ladder that goes backwards would quietly overcharge the larger box.
  if (out.tier2Qty <= out.tier1Qty) out.tier2Qty = out.tier1Qty + 1;
  out.tier1Qty = Math.max(2, Math.min(48, Math.round(out.tier1Qty)));
  out.tier2Qty = Math.max(out.tier1Qty + 1, Math.min(99, Math.round(out.tier2Qty)));
  out.tier1Pct = Math.max(0, Math.min(50, Math.round(out.tier1Pct)));
  out.tier2Pct = Math.max(out.tier1Pct, Math.min(50, Math.round(out.tier2Pct)));
  out.freeFrom = Math.max(0, Math.min(500, Math.round(out.freeFrom)));
  return out;
}

async function readSettings(env) {
  const d = await ensureSchema(env);
  if (!d) return { ...SETTING_DEFAULTS };
  const rows = await d.prepare(`SELECT key, value FROM settings`).all();
  const raw = {};
  for (const r of rows.results || []) {
    try {
      raw[r.key] = JSON.parse(r.value);
    } catch {
      raw[r.key] = r.value;
    }
  }
  return coerceSettings(raw);
}

async function writeSettings(env, patch) {
  const d = await ensureSchema(env);
  if (!d) return null;
  const next = coerceSettings({ ...(await readSettings(env)), ...patch });
  const at = nowIso();
  await d.batch(
    Object.entries(next).map(([k, v]) => d.prepare(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).bind(k, JSON.stringify(v), at)),
  );
  return next;
}

/* ---------------------------------------------------------------- admin auth */

const enc = new TextEncoder();

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(v) {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(String(v)));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compare two equal-length hex digests without leaking where they first differ. */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Signing key for session cookies. Falls back to the password so a shop only has to set one secret. */
function sessionSecret(env) {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || '';
}

/**
 * A signature alone cannot be taken back. Every issued session is also a row, so
 * signing out actually ends the session instead of only clearing the cookie on
 * the one device that asked — which is the difference between "I logged out" and
 * "a token copied off this laptop works for the next twelve hours".
 *
 * Without a database there is no table to check and the signature is all there
 * is; the admin API already refuses to serve anything in that state.
 */
async function issueSession(env) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_S;
  const nonce = [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const body = `${exp}.${nonce}`;
  const d = await ensureSchema(env);
  if (d) {
    await d.prepare(`DELETE FROM sessions WHERE exp < ?`).bind(Math.floor(Date.now() / 1000)).run();
    await d.prepare(`INSERT OR REPLACE INTO sessions (nonce, exp) VALUES (?, ?)`).bind(nonce, exp).run();
  }
  return `${body}.${await hmac(sessionSecret(env), body)}`;
}

/** The signed parts of a token, or null when it is not ours or has expired. */
async function readSession(env, token) {
  if (!token || !sessionSecret(env)) return null;
  const parts = String(token).split('.');
  if (parts.length !== 3) return null;
  const [exp, nonce, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Math.floor(Date.now() / 1000)) return null;
  if (!timingSafeEqual(sig, await hmac(sessionSecret(env), `${exp}.${nonce}`))) return null;
  return { exp: Number(exp), nonce };
}

async function validSession(env, token) {
  const claim = await readSession(env, token);
  if (!claim) return false;
  const d = await ensureSchema(env);
  if (!d) return true;
  const row = await d.prepare(`SELECT nonce FROM sessions WHERE nonce = ? AND exp >= ?`).bind(claim.nonce, Math.floor(Date.now() / 1000)).first();
  return !!row;
}

async function endSession(env, token) {
  const claim = await readSession(env, token);
  const d = claim ? await ensureSchema(env) : null;
  if (d) await d.prepare(`DELETE FROM sessions WHERE nonce = ?`).bind(claim.nonce).run();
}

function cookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

const SESSION_COOKIE = 'sm_admin';
const setCookie = (value, maxAge) => `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;

/** Form submissions allowed from one caller per hour. */
const SUBMIT_MAX = 30;
const SUBMIT_WINDOW_S = 60 * 60;

/**
 * A sliding-window limit on a named bucket. Returns true when the caller has
 * already used the allowance, and otherwise records this attempt.
 *
 * Without a database there is no limit — the same posture as the rest of the
 * Worker, which degrades to "the shop still takes orders" rather than refusing
 * them. An order lost is worse than an order counted twice.
 */
async function overLimit(env, bucket, max, windowS) {
  const d = await ensureSchema(env);
  if (!d) return false;
  const since = new Date(Date.now() - windowS * 1000).toISOString();
  try {
    await d.prepare(`DELETE FROM rate WHERE at < ?`).bind(since).run();
    const row = await d.prepare(`SELECT COUNT(*) AS c FROM rate WHERE bucket = ? AND at >= ?`).bind(bucket, since).first();
    if (row && Number(row.c) >= max) return true;
    await d.prepare(`INSERT INTO rate (bucket, at) VALUES (?, ?)`).bind(bucket, nowIso()).run();
  } catch {
    // A limiter that fails must not take the shop down with it.
    return false;
  }
  return false;
}

/**
 * The bucket the login rate limit counts against.
 *
 * Only cf-connecting-ip is trusted: the edge sets it and a client cannot. An
 * x-forwarded-for fallback would be worse than none — the header is
 * attacker-controlled, so anyone hitting the limit could simply pick a new
 * value and carry on, and a bucket the attacker chooses is not a limit at all.
 *
 * Without the edge header everything shares one bucket. That is the safe
 * direction to fail: guesses are throttled harder, never less, and the window
 * is fifteen minutes rather than a lockout.
 */
function clientIp(request) {
  return s(request.headers.get('cf-connecting-ip') || 'no-edge-ip', 60);
}

/**
 * Every admin request must carry the session cookie, and every mutation must
 * also carry our own header — a cross-site form post cannot set that header,
 * which is the second lock behind SameSite=Strict.
 */
async function requireAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return json(503, { ok: false, reason: 'admin-not-configured' });
  if (!(await validSession(env, cookie(request, SESSION_COOKIE)))) return json(401, { ok: false, reason: 'auth' });
  if (request.method !== 'GET' && request.headers.get('x-semers-admin') !== '1') return json(403, { ok: false, reason: 'csrf' });
  if (!db(env)) return json(503, { ok: false, reason: 'no-database' });
  return null;
}

async function handleLogin(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, reason: 'method' });
  if (!env.ADMIN_PASSWORD) return json(503, { ok: false, reason: 'admin-not-configured' });
  const d = await ensureSchema(env);
  const ip = clientIp(request);
  const since = new Date(Date.now() - LOGIN_WINDOW_S * 1000).toISOString();
  if (d) {
    await d.prepare(`DELETE FROM login_attempts WHERE at < ?`).bind(since).run();
    const row = await d.prepare(`SELECT COUNT(*) AS c FROM login_attempts WHERE ip = ? AND at >= ?`).bind(ip, since).first();
    if (row && Number(row.c) >= LOGIN_MAX_FAILS) return json(429, { ok: false, reason: 'too-many-attempts' });
  }

  let body;
  try {
    body = await readJson(request);
  } catch (e) {
    return json(e?.status || 400, { ok: false, reason: e?.reason || 'bad-json' });
  }
  // Both sides are hashed first so the comparison is over fixed-length strings
  // whatever the password lengths are.
  const ok = timingSafeEqual(await sha256Hex(s(body.password, 200)), await sha256Hex(env.ADMIN_PASSWORD));
  if (!ok) {
    if (d) await d.prepare(`INSERT INTO login_attempts (ip, at) VALUES (?, ?)`).bind(ip, nowIso()).run();
    await audit(env, 'login.fail', ip);
    return json(401, { ok: false, reason: 'password' });
  }
  if (d) await d.prepare(`DELETE FROM login_attempts WHERE ip = ?`).bind(ip).run();
  await audit(env, 'login.ok', ip);
  return json(200, { ok: true }, { 'set-cookie': setCookie(await issueSession(env), SESSION_TTL_S) });
}

/* -------------------------------------------------------------- public reads */

/**
 * One request that carries everything the built pages need to correct
 * themselves: owner settings, per-product overrides and review counts.
 */
/**
 * Text settings the owner has not touched are left out of the payload.
 *
 * The built page already says these things, in the language it was built for —
 * the guarantee line is translated with the rest of the page prose. Sending the
 * default back would make the script overwrite that translation with the
 * dictionary-free English default a moment after the page loads. Only a value
 * the owner actually chose should replace what the page says.
 */
function ownerChangedOnly(settings) {
  const out = { ...settings };
  for (const [k, def] of Object.entries(SETTING_DEFAULTS)) {
    if (typeof def === 'string' && out[k] === def) delete out[k];
  }
  return out;
}

async function handleStorefront(request, env) {
  const settings = await readSettings(env);
  /*
   * Whether the shop can charge a card is a property of this deployment, not
   * of the built page, so it is reported here rather than baked in. The
   * checkout button reads it and stops promising a card form that is not
   * there — or an e-mailed payment link once there is one.
   */
  const out = { settings: ownerChangedOnly(settings), payments: !!env.STRIPE_SECRET_KEY, products: {}, reviews: {} };
  const d = db(env);
  if (d) {
    const [ov, rv] = await Promise.all([
      d.prepare(`SELECT slug, price, compare_at, in_stock, hidden, badge, batch, note FROM product_overrides`).all(),
      d.prepare(`SELECT slug, COUNT(*) AS count, AVG(rating) AS avg FROM reviews WHERE status = 'approved' GROUP BY slug`).all(),
    ]);
    for (const r of ov.results || []) {
      out.products[r.slug] = {
        price: r.price === null ? null : Number(r.price),
        compareAt: r.compare_at === null ? null : Number(r.compare_at),
        inStock: r.in_stock === null ? null : !!r.in_stock,
        hidden: r.hidden === null ? null : !!r.hidden,
        badge: r.badge || '',
        batch: r.batch || '',
        note: r.note || '',
      };
    }
    for (const r of rv.results || []) out.reviews[r.slug] = { count: Number(r.count), avg: Math.round(Number(r.avg) * 10) / 10 };
  }
  return json(200, out, { 'cache-control': 'public, max-age=60' });
}

async function handleReviewsGet(request, env) {
  const url = new URL(request.url);
  const slug = s(url.searchParams.get('slug'), 64);
  if (!SLUG_RE.test(slug)) return json(400, { ok: false, reason: 'slug' });
  const d = await ensureSchema(env);
  if (!d) return json(200, { ok: true, slug, count: 0, avg: 0, reviews: [] });
  /*
   * A shop this size cannot afford to hide reviews from a reader just because
   * they were written in another language — three languages would mean three
   * near-empty product pages. So every approved review is served, the reader's
   * own language first, and each one carries the language it was written in so
   * the page can mark it up honestly.
   */
  const want = locale(url.searchParams.get('locale'));
  const rows = await d
    .prepare(
      `SELECT id, created_at, rating, author, city, title, body, verified, reply, locale FROM reviews
       WHERE slug = ? AND status = 'approved' ORDER BY (locale = ?) DESC, created_at DESC LIMIT 50`,
    )
    .bind(slug, want)
    .all();
  const list = (rows.results || []).map((r) => ({
    id: r.id,
    date: String(r.created_at).slice(0, 10),
    rating: Number(r.rating),
    author: r.author,
    city: r.city || '',
    title: r.title || '',
    body: r.body,
    locale: locale(r.locale),
    verified: !!r.verified,
    reply: r.reply || '',
  }));
  const count = list.length;
  const avg = count ? Math.round((list.reduce((t, r) => t + r.rating, 0) / count) * 10) / 10 : 0;
  return json(200, { ok: true, slug, count, avg, reviews: list }, { 'cache-control': 'public, max-age=60' });
}

async function handleReviewPost(request, env) {
  const d = await ensureSchema(env);
  if (!d) return json(503, { ok: false, reason: 'no-database' });
  let body;
  try {
    body = await readJson(request);
  } catch (e) {
    return json(e?.status || 400, { ok: false, reason: e?.reason || 'bad-json' });
  }
  if (s(body.website)) return json(200, { ok: true }); // honeypot
  // Reviews are moderated, so spam costs the owner time rather than reaching a
  // reader — but a queue nobody can face is a queue nobody reads.
  if (await overLimit(env, `review:${clientIp(request)}`, 10, SUBMIT_WINDOW_S)) return json(429, { ok: false, reason: 'too-many' });
  const slug = s(body.slug, 64);
  const rating = Math.round(Number(body.rating));
  const author = s(body.author, 60);
  const review = text(body.body, 2000);
  if (!SLUG_RE.test(slug)) return json(422, { ok: false, reason: 'slug' });
  if (!(rating >= 1 && rating <= 5)) return json(422, { ok: false, reason: 'rating' });
  if (author.length < 2) return json(422, { ok: false, reason: 'author' });
  if (review.length < 10) return json(422, { ok: false, reason: 'body' });

  const email = s(body.email, 160);
  // One pending review per product per author: a refresh-and-resubmit must not
  // fill the moderation queue with the same text.
  const dupe = await d.prepare(`SELECT id FROM reviews WHERE slug = ? AND author = ? AND status = 'pending'`).bind(slug, author).first();
  if (dupe) return json(200, { ok: true, pending: true });

  await d
    .prepare(`INSERT INTO reviews (created_at, slug, rating, author, city, title, body, email, status, locale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`)
    .bind(nowIso(), slug, rating, author, s(body.city, 60), s(body.title, 120), review, EMAIL_RE.test(email) ? email : '', locale(body.locale))
    .run();
  await audit(env, 'review.new', `${slug} ${rating}★ ${locale(body.locale)}`);
  await sendTelegram(env, `⭐ New review awaiting approval\n${slug} — ${rating}/5 by ${author}\n\n${review.slice(0, 500)}`).catch(() => false);
  return json(200, { ok: true, pending: true });
}

/* --------------------------------------------------------------- order intake */

function render(type, body, id) {
  const lines = [];
  if (type === 'order') {
    const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
    const c = body.customer && typeof body.customer === 'object' ? body.customer : {};
    const cur = currency(body.currency);
    lines.push(`🍏 NEW ORDER REQUEST ${id}`);
    lines.push('');
    for (const it of items) {
      if (!it || typeof it !== 'object') continue;
      const v = s(it.variant, 80);
      const note = s(it.note, 300);
      lines.push(`${n(it.qty)} × ${s(it.name, 120)}${v ? ` (${v})` : ''}${note ? ` — ${note}` : ''} = ${money(it.total, cur)}`);
    }
    lines.push('');
    lines.push(`Subtotal: ${money(body.subtotal, cur)}`);
    lines.push(`Shipping: ${n(body.shipping) ? money(body.shipping, cur) : s(body.shippingNote, 120) || 'free'}`);
    lines.push(`TOTAL: ${money(body.total, cur)}`);
    lines.push('');
    lines.push(`Name: ${s(c.name)}`);
    lines.push(`E-mail: ${s(c.email)}`);
    if (s(c.phone)) lines.push(`Phone: ${s(c.phone)}`);
    lines.push(`Address: ${[s(c.address), s(c.city), s(c.postcode), s(c.country)].filter(Boolean).join(', ')}`);
    if (s(c.delivery)) lines.push(`Delivery: ${s(c.delivery)}`);
    if (multi(c.note, 1000)) lines.push(`Note: ${multi(c.note, 1000)}`);
    if (s(c.gift)) lines.push(`Gift message: ${s(c.gift, 300)}`);
  } else if (type === 'newsletter') {
    lines.push(`📬 Newsletter signup ${id}`);
    lines.push(`E-mail: ${s(body.email)}`);
  } else if (type === 'wholesale') {
    lines.push(`🏪 WHOLESALE ENQUIRY ${id}`);
    lines.push(`Company: ${s(body.company)}`);
    lines.push(`Name: ${s(body.name)}`);
    lines.push(`E-mail: ${s(body.email)}`);
    if (s(body.phone)) lines.push(`Phone: ${s(body.phone)}`);
    lines.push(`Country: ${s(body.country)}`);
    lines.push(`Type: ${s(body.kind)}`);
    if (s(body.volume)) lines.push(`Volume: ${s(body.volume)}`);
    if (multi(body.message, 2000)) lines.push(`Message: ${multi(body.message, 2000)}`);
  } else {
    lines.push(`✉️ Contact form ${id}`);
    lines.push(`Name: ${s(body.name)}`);
    lines.push(`E-mail: ${s(body.email)}`);
    if (s(body.topic)) lines.push(`Topic: ${s(body.topic)}`);
    lines.push(`Message: ${multi(body.message, 2000)}`);
  }
  if (s(body.page)) lines.push(`Page: ${s(body.page, 200)}`);
  // The language they were reading is the language to answer in.
  lines.push(`Language: ${locale(body.locale).toUpperCase()}`);
  return lines.join('\n');
}

/* ------------------------------------------------------------ customer mail */

/**
 * Four e-mails leave this Worker and two of them are addressed to the customer
 * rather than to the shop: the order receipt and the newsletter welcome. The
 * shop reads one language, so its own notification stays English — but a
 * receipt that arrives in English after someone has read the whole site in
 * Latvian is a different shop's e-mail. Every submission reports the language
 * the page was in, so the customer's two are written in it.
 *
 * A missing key falls back to English, the same rule the site's own dictionary
 * follows, so a half-translated language sends a readable letter.
 */
const MAIL = {
  en: {
    intl: 'en-IE',
    prefix: '',
    receiptSubject: 'We have your order {id}',
    receiptOpen: 'Thank you. Your order {id} has reached us. We will confirm what is in stock and send a payment link within one business day.',
    orderLine: 'Your order',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    quoted: 'EU courier rate, quoted by e-mail',
    free: 'Free',
    total: 'Total',
    deliverTo: 'Delivery address',
    delivery: 'Delivery',
    phone: 'Phone',
    note: 'Your note',
    gift: 'Gift message',
    reply: 'Reply to this e-mail if anything needs changing — the order is not final until we confirm it.',
    signoff: '— Semers, Riga',
    welcomeSubject: 'Welcome to Semers',
    welcomeOpen: 'Thank you for subscribing.',
    welcomeWhat: [
      'Here is what you have signed up for, and nothing else: a note when a new flavour',
      'lands, a note when something you liked is back in stock, and now and then a recipe.',
      'A few times a month at most, and one click unsubscribes.',
    ],
    welcomeStart: 'While you are here, the three people usually start with:',
    picks: [
      "App'Lite Apple Bar — 99% baked apple, egg white, nothing else",
      'Apple Meringue — the same apple, whipped and dried crisp',
      'Tasting Box — one of everything, so you can decide in one order',
    ],
    welcomeBox: 'Or build your own box and take 10% off:',
  },
  ru: {
    intl: 'ru-RU',
    prefix: '/ru',
    receiptSubject: 'Ваш заказ {id} у нас',
    receiptOpen: 'Спасибо! Заказ {id} получен. В течение рабочего дня подтвердим наличие и пришлём ссылку на оплату.',
    orderLine: 'Ваш заказ',
    subtotal: 'Товары',
    shipping: 'Доставка',
    quoted: 'Тариф курьера по ЕС — посчитаем в письме',
    free: 'Бесплатно',
    total: 'Итого',
    deliverTo: 'Адрес доставки',
    delivery: 'Способ доставки',
    phone: 'Телефон',
    note: 'Ваш комментарий',
    gift: 'Текст для открытки',
    reply: 'Если что-то нужно поменять — просто ответьте на это письмо: заказ не окончательный, пока мы его не подтвердили.',
    signoff: '— Semers, Рига',
    welcomeSubject: 'Добро пожаловать в Semers',
    welcomeOpen: 'Спасибо за подписку.',
    welcomeWhat: [
      'Вот что вы будете получать — и ничего сверх этого: письмо, когда появится новый вкус,',
      'письмо, когда снова будет в наличии то, что вам понравилось, и время от времени рецепт.',
      'Не чаще нескольких раз в месяц, отписаться можно в один клик.',
    ],
    welcomeStart: 'Раз уж вы здесь — вот три вещи, с которых обычно начинают:',
    picks: [
      "App'Lite Apple Bar — 99% печёного яблока, яичный белок и больше ничего",
      'Яблочное безе — то же яблоко, взбитое и высушенное до хруста',
      'Дегустационная коробка — по одной каждого, чтобы выбрать за один заказ',
    ],
    welcomeBox: 'Или соберите свою коробку со скидкой 10%:',
  },
  lv: {
    intl: 'lv-LV',
    prefix: '/lv',
    receiptSubject: 'Jūsu pasūtījums {id} ir saņemts',
    receiptOpen: 'Paldies! Pasūtījums {id} ir pie mums. Vienas darbdienas laikā apstiprināsim pieejamību un atsūtīsim maksājuma saiti.',
    orderLine: 'Jūsu pasūtījums',
    subtotal: 'Preces',
    shipping: 'Piegāde',
    quoted: 'ES kurjera tarifs — aprēķināsim e-pastā',
    free: 'Bez maksas',
    total: 'Kopā',
    deliverTo: 'Piegādes adrese',
    delivery: 'Piegādes veids',
    phone: 'Tālrunis',
    note: 'Jūsu piezīme',
    gift: 'Teksts dāvanu kartītei',
    reply: 'Ja kaut kas jāmaina, vienkārši atbildiet uz šo vēstuli — pasūtījums nav galīgs, kamēr to neesam apstiprinājuši.',
    signoff: '— Semers, Rīga',
    welcomeSubject: 'Laipni lūdzam Semers',
    welcomeOpen: 'Paldies, ka pierakstījāties.',
    welcomeWhat: [
      'Lūk, kam jūs pierakstījāties, un neko vairāk: vēstule, kad parādās jauna garša,',
      'vēstule, kad atkal ir pieejams kaut kas, kas jums patika, un ik pa laikam recepte.',
      'Ne biežāk kā dažas reizes mēnesī, un atrakstīties var ar vienu klikšķi.',
    ],
    welcomeStart: 'Un, ja jau esat šeit, trīs lietas, ar kurām parasti sāk:',
    picks: [
      "App'Lite ābolu batoniņš — 99% cepta ābola, olas baltums un nekā vairāk",
      'Ābolu bezē — tas pats ābols, saputots un izkaltēts kraukšķīgs',
      'Degustācijas kaste — pa vienam no katra, lai izvēlētos vienā pasūtījumā',
    ],
    welcomeBox: 'Vai salieciet savu kasti ar 10% atlaidi:',
  },
};

/** The customer's language, with English filling anything it has not translated. */
const mail = (loc) => ({ ...MAIL.en, ...(MAIL[locale(loc)] || {}) });

/**
 * The site writes "€1.45" in English and "1,45 €" in Russian and Latvian, so
 * the receipt has to as well — a letter that formats money the way the page did
 * not is the first thing that reads as machine-generated.
 */
function customerMoney(v, cur, intl) {
  try {
    return new Intl.NumberFormat(intl, { style: 'currency', currency: cur }).format(n(v));
  } catch {
    return money(v, cur);
  }
}

/**
 * The customer's copy of their order. Not the same text as the shop's: it drops
 * the reference page, the language line and the e-mail address they just typed,
 * and it names each field in their language.
 */
function customerSummary(body, id, loc) {
  const m = mail(loc);
  const cur = currency(body.currency);
  const c = body.customer && typeof body.customer === 'object' ? body.customer : {};
  const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
  const lines = [fill(m.receiptOpen, { id }), '', `${m.orderLine}:`];
  for (const it of items) {
    if (!it || typeof it !== 'object') continue;
    const v = s(it.variant, 80);
    const note = s(it.note, 300);
    lines.push(`  ${n(it.qty)} × ${s(it.name, 120)}${v ? ` (${v})` : ''}${note ? ` — ${note}` : ''} = ${customerMoney(it.total, cur, m.intl)}`);
  }
  lines.push('');
  lines.push(`${m.subtotal}: ${customerMoney(body.subtotal, cur, m.intl)}`);
  lines.push(`${m.shipping}: ${body.shippingQuote ? m.quoted : n(body.shipping) ? customerMoney(body.shipping, cur, m.intl) : m.free}`);
  lines.push(`${m.total}: ${customerMoney(body.total, cur, m.intl)}`);
  const address = [s(c.address), s(c.city), s(c.postcode), s(c.country)].filter(Boolean).join(', ');
  if (address) lines.push('', `${m.deliverTo}: ${address}`);
  if (s(c.delivery)) lines.push(`${m.delivery}: ${s(c.delivery)}`);
  if (s(c.phone)) lines.push(`${m.phone}: ${s(c.phone)}`);
  if (multi(c.note, 1000)) lines.push(`${m.note}: ${multi(c.note, 1000)}`);
  if (s(c.gift)) lines.push(`${m.gift}: ${s(c.gift, 300)}`);
  lines.push('', m.reply, '', m.signoff);
  return lines.join('\n');
}

async function sendTelegram(env, text) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chat = env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text: text.slice(0, MAX_TG), disable_web_page_preview: true }),
  });
  return r.ok;
}

async function sendEmail(env, subject, text, replyTo) {
  const key = env.RESEND_API_KEY;
  const to = env.ORDER_TO_EMAIL;
  if (!key || !to) return false;
  const from = env.ORDER_FROM_EMAIL || 'Semers Shop <shop@semers.org>';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: to.split(',').map((x) => x.trim()),
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
      html: `<pre style="font:14px/1.5 ui-monospace,monospace">${escapeHtml(text)}</pre>`,
    }),
  });
  return r.ok;
}

const WELCOME_PICKS = ['apple-bar-35g', 'apple-meringue-35g', 'tasting-box'];

async function sendWelcome(env, email, loc) {
  const key = env.RESEND_API_KEY;
  if (!key || !EMAIL_RE.test(email)) return false;
  const from = env.ORDER_FROM_EMAIL || 'Semers Shop <shop@semers.org>';
  const site = env.SITE_URL || 'https://semers-store.higgsfield.app';
  const m = mail(loc);
  // Every link goes to the page in the language they were reading, not to the
  // English one with a language switcher on it.
  const url = (path) => `${site}${m.prefix}${path}`;
  const lines = [
    m.welcomeOpen,
    '',
    ...m.welcomeWhat,
    '',
    m.welcomeStart,
    ...m.picks.map((p, i) => `· ${p}: ${url(`/products/${WELCOME_PICKS[i]}/`)}`),
    '',
    `${m.welcomeBox} ${url('/shop/build-your-box/')}`,
    '',
    m.signoff,
  ].join('\n');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [email], subject: m.welcomeSubject, text: lines }),
  });
  return r.ok;
}

async function sendCustomerReceipt(env, body, id) {
  const key = env.RESEND_API_KEY;
  const email = s(body?.customer?.email);
  if (!key || !email || !EMAIL_RE.test(email)) return false;
  const from = env.ORDER_FROM_EMAIL || 'Semers Shop <shop@semers.org>';
  const m = mail(body.locale);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: fill(m.receiptSubject, { id }),
      text: customerSummary(body, id, body.locale),
    }),
  });
  return r.ok;
}

/** Store the submission so the owner sees it in the admin even if Telegram or e-mail is down. */
async function persist(env, type, body, id) {
  const d = await ensureSchema(env);
  if (!d) return false;
  const c = (type === 'order' ? body.customer : body) || {};
  const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
  await d
    .prepare(
      `INSERT INTO orders (id, created_at, type, status, name, email, phone, country, city, postcode, address, delivery, note, gift, currency, subtotal, shipping, total, items_json, payload_json, page)
       VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      nowIso(),
      type,
      s(c.name || body.company, 120),
      s(c.email || body.email, 160),
      s(c.phone, 60),
      s(c.country, 80),
      s(c.city, 80),
      s(c.postcode, 30),
      s(c.address, 200),
      s(c.delivery, 120),
      text(c.note || body.message, 2000),
      s(c.gift, 300),
      currency(body.currency),
      n(body.subtotal),
      n(body.shipping),
      n(body.total),
      JSON.stringify(items),
      JSON.stringify(body).slice(0, MAX_BODY),
      s(body.page, 200),
    )
    .run();
  const email = s(c.email || body.email, 160);
  if (EMAIL_RE.test(email) && (type === 'newsletter' || body.subscribe)) {
    await d.prepare(`INSERT OR IGNORE INTO subscribers (email, created_at, source) VALUES (?, ?, ?)`).bind(email, nowIso(), type).run();
  }
  return true;
}

async function handleOrder(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  if (request.method !== 'POST') return json(405, { ok: false, reason: 'method' });

  let body;
  try {
    body = await readJson(request);
  } catch (e) {
    return json(e?.status || 400, { ok: false, reason: e?.reason || 'bad-json' });
  }

  const type = s(body.type, 20);
  if (!TYPES.has(type)) return json(400, { ok: false, reason: 'bad-type' });
  if (s(body.website) || s(body.customer?.website)) return json(200, { ok: true, ref: 'HP' });

  /*
   * The endpoint is public and, once Resend is configured, e-mails a receipt to
   * whatever address is submitted — so it must not be scriptable as a mail
   * relay. Thirty an hour is far above any real shopper and far below any use
   * worth having. The honeypot above answers first, so a bot that trips it
   * never spends the allowance a person might need.
   */
  if (await overLimit(env, `submit:${clientIp(request)}`, SUBMIT_MAX, SUBMIT_WINDOW_S)) return json(429, { ok: false, reason: 'too-many' });

  const email = s(type === 'order' ? body.customer?.email : body.email);
  if (!EMAIL_RE.test(email)) return json(422, { ok: false, reason: 'email' });
  if (type === 'order' && (!Array.isArray(body.items) || body.items.length === 0)) return json(422, { ok: false, reason: 'empty' });

  const id = ref();
  const text = render(type, body, id);
  const subject = text.split('\n')[0];
  // The record is what the owner works from, so it is written before the
  // notifications and a notification failure never loses the order.
  const stored = await persist(env, type, body, id).catch(() => false);
  const [tg, mail] = await Promise.all([sendTelegram(env, text).catch(() => false), sendEmail(env, subject, text, email).catch(() => false)]);
  if (!tg && !mail && !stored) return json(503, { ok: false, reason: 'not-configured' });
  if (type === 'order') await sendCustomerReceipt(env, body, id).catch(() => false);
  if (type === 'newsletter') await sendWelcome(env, email, body.locale).catch(() => false);
  return json(200, { ok: true, ref: id });
}

/* -------------------------------------------------------------------- payment */

/*
 * Stripe over plain fetch, on purpose.
 *
 * The npm SDK's constructEvent() verifies a webhook with Node's crypto, which
 * the Workers runtime does not have; the async path through a SubtleCrypto
 * provider exists but drags a megabyte of SDK behind it for two REST calls. The
 * REST API is form-encoded and stable, and the signature scheme is an HMAC this
 * file already knows how to compute — so both are done here, and the Worker
 * keeps having no dependencies at all.
 */
const STRIPE_API = 'https://api.stripe.com/v1';
/** A captured webhook POST must not be replayable tomorrow. Stripe's own default. */
const STRIPE_TOLERANCE_S = 300;
/** Stripe Checkout's own translations; anything else falls back to its auto-detect. */
const STRIPE_LOCALE = { en: 'en', ru: 'ru', lv: 'lv' };
/*
 * Delivery methods, as keys rather than as the words on the button.
 *
 * The label a shopper reads is prose, and it is translated, so matching on it
 * would be a different test in every language — and it arrives in a free-text
 * field the browser fills in. Reading "pickup" out of that text meant anyone
 * who typed the word into their address got their postage waived and a courier
 * anyway. Only these three keys decide anything, and anything else is the
 * cheapest paid option rather than the free one.
 */
const DELIVERY_METHODS = new Set(['locker', 'courier', 'pickup']);
export const deliveryMethod = (v) => (DELIVERY_METHODS.has(v) ? v : 'locker');

/**
 * The catalogue the Worker charges from, fetched once per isolate.
 *
 * It is a build artefact of src/data/products.ts served beside the pages, so
 * the price a reader was shown and the price a card is charged come from one
 * file. Without the ASSETS binding there is no price list, and checkout refuses
 * rather than trusting the browser's numbers.
 */
let catalogCache = null;

async function loadCatalog(request, env) {
  if (catalogCache) return catalogCache;
  if (!env.ASSETS) return null;
  try {
    const res = await env.ASSETS.fetch(new URL('/catalog.json', request.url));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.items || typeof data.items !== 'object') return null;
    catalogCache = data;
    return catalogCache;
  } catch {
    return null;
  }
}

/** The volume ladder as the owner has it set, so an admin change is what applies. */
export function tiersOf(settings) {
  if (!settings || !settings.tiersOn) return [];
  return [
    [Number(settings.tier1Qty) || 0, Number(settings.tier1Pct) || 0],
    [Number(settings.tier2Qty) || 0, Number(settings.tier2Pct) || 0],
  ]
    .filter(([q, pct]) => q > 1 && pct > 0)
    .sort((a, b) => a[0] - b[0]);
}

/** Percent off one line at this quantity — the same ladder the cart shows. */
export function tierPctFor(tiers, qty) {
  let pct = 0;
  for (const [minQty, p] of tiers) if (qty >= minQty) pct = p;
  return pct;
}

/**
 * Turn what the browser sent into what the shop will actually charge.
 *
 * Only the line id and the quantity survive from the request. Everything with a
 * number on it — unit price, discount, shipping, total — is recomputed here
 * from the catalogue, the owner's overrides and the owner's settings. A cart
 * edited in the console therefore buys the same goods at the same price as one
 * that was not.
 *
 * Exported because this is the function that decides what a card is charged;
 * scripts/test.mjs asserts it directly.
 */
export function priceCart(catalog, settings, overrides, lines, opts = {}) {
  if (!catalog) return { ok: false, reason: 'no-catalog' };
  if (!Array.isArray(lines) || !lines.length) return { ok: false, reason: 'empty' };
  if (lines.length > MAX_ITEMS) return { ok: false, reason: 'too-many' };

  const tiers = tiersOf(settings);
  const freeFrom = Number(settings?.freeFrom ?? catalog.freeFrom ?? 25);
  const flatRate = Number(catalog.flatRate ?? 3.9);
  const freeSlugs = new Set(catalog.freeShipSlugs || []);
  const items = [];
  let subtotal = 0;
  let free = false;

  for (const raw of lines) {
    const id = s(raw?.id, 128);
    const entry = catalog.items[id];
    if (!entry) return { ok: false, reason: 'unknown-item', id };
    // Rounding here would invent a quantity nobody chose: "1.5" would be
    // charged as two. The browser may tidy its own input; the endpoint that
    // takes the money refuses anything that is not already a whole number.
    const qty = Number(raw?.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) return { ok: false, reason: 'quantity', id };

    // An override is the owner's live price for that product; a hidden or
    // out-of-stock product must not be sellable through a stale tab.
    const ov = overrides?.[entry.slug];
    if (ov && (ov.hidden === true || ov.inStock === false)) return { ok: false, reason: 'unavailable', id };
    const base = ov && ov.price !== null && ov.price !== undefined ? Number(ov.price) : Number(entry.price);
    if (!Number.isFinite(base) || base <= 0) return { ok: false, reason: 'price', id };

    const pct = entry.tier === false ? 0 : tierPctFor(tiers, qty);
    const unit = pct ? Math.round(base * (100 - pct)) / 100 : Math.round(base * 100) / 100;
    const line = Math.round(unit * qty * 100) / 100;
    subtotal = Math.round((subtotal + line) * 100) / 100;
    if (freeSlugs.has(entry.slug)) free = true;

    items.push({
      id,
      slug: entry.slug,
      name: entry.name,
      title: entry.title || entry.name,
      variant: entry.variant || '',
      gtin: entry.gtin || '',
      weight: Number(entry.weight) || 0,
      qty,
      unit,
      line,
      discountPct: pct,
    });
  }

  const pickup = !!opts.pickup;
  const shipping = pickup || free || subtotal >= freeFrom ? 0 : Math.round(flatRate * 100) / 100;
  return {
    ok: true,
    currency: currency(catalog.currency),
    items,
    subtotal,
    shipping,
    total: Math.round((subtotal + shipping) * 100) / 100,
    freeFrom,
  };
}

/**
 * Stripe's REST API takes bracketed form keys, not JSON. Flattening here keeps
 * the call sites readable as the object shape Stripe documents.
 */
export function stripeForm(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((el, i) => (el !== null && typeof el === 'object' ? stripeForm(el, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(el))));
    else if (typeof v === 'object') stripeForm(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripePost(env, path, params, idempotencyKey) {
  const headers = {
    authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    'content-type': 'application/x-www-form-urlencoded',
  };
  if (idempotencyKey) headers['idempotency-key'] = idempotencyKey;
  const res = await fetch(`${STRIPE_API}${path}`, { method: 'POST', headers, body: stripeForm(params).toString() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Stripe's message names the parameter it rejected, which is what makes a
    // bad integration findable — but it goes to the log, never to the shopper.
    console.error('stripe', path, res.status, data?.error?.message || '');
    return { ok: false, status: res.status, code: data?.error?.code || '' };
  }
  return { ok: true, data };
}

/** Cents, because Stripe counts in the currency's smallest unit and 19.9 * 100 is 1989.9999. */
const cents = (v) => Math.round(Number(v) * 100);

/**
 * Verify a Stripe webhook signature.
 *
 * The header carries the signed timestamp and one or more v1 signatures — more
 * than one while an endpoint secret is being rotated, so every v1 is tried. The
 * timestamp is part of the signed payload and is checked against the clock,
 * which is what stops a captured request from being replayed later.
 *
 * `hmacFn` and `nowS` are parameters so the test can drive this with a known
 * vector instead of the wall clock.
 */
export async function verifyStripeSignature(header, payload, secret, nowS, hmacFn = hmac) {
  if (!secret) return { ok: false, reason: 'not-configured' };
  let t = '';
  const sigs = [];
  for (const part of String(header || '').split(',')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === 't') t = v;
    else if (k === 'v1') sigs.push(v.toLowerCase());
  }
  if (!t || !sigs.length) return { ok: false, reason: 'malformed' };
  const ts = Number(t);
  if (!Number.isFinite(ts)) return { ok: false, reason: 'malformed' };
  if (Math.abs(nowS - ts) > STRIPE_TOLERANCE_S) return { ok: false, reason: 'stale' };
  const expected = await hmacFn(secret, `${t}.${payload}`);
  for (const sig of sigs) if (timingSafeEqual(expected, sig)) return { ok: true };
  return { ok: false, reason: 'signature' };
}

/**
 * The order as the Semers order regulation wants it.
 *
 * Retail buyers deliberately do not become rows in the client directory: the
 * owner's own normalisation rule puts every web sale under one client,
 * "Интернет-заказы", with the shop's reference in the external-number field, and
 * says naming retail buyers is a separate job done from the shop's own export.
 * That is also the kinder reading of GDPR — the operations base gets what it
 * needs to pick and ship, and the buyer's details stay in the shop.
 *
 * The line key is the GTIN, because that is the one code the catalogue and the
 * operations product master already share.
 */
function opsPayload(order) {
  return {
    source: 'semers-store',
    version: 1,
    channel: 'Интернет-магазин',
    client: 'Интернет-заказы',
    order_no: order.id,
    external_no: order.id,
    ordered_at: order.created_at,
    paid_at: order.paid_at || '',
    status: 'Принят',
    payment_status: 'Оплачен',
    currency: order.currency,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    payment: { provider: 'stripe', session: order.stripe_session || '', intent: order.stripe_intent || '' },
    contact: { name: order.name, email: order.email, phone: order.phone },
    delivery: { method: order.delivery, country: order.country, city: order.city, postcode: order.postcode, address: order.address },
    note: order.note || '',
    items: (order.items || []).map((i) => ({ gtin: i.gtin || '', name: i.title || i.name, variant: i.variant || '', qty: i.qty, unit: i.unit, line: i.line, weight_g: i.weight })),
  };
}

/**
 * Hand the paid order to whatever runs operations — Baserow, a Notion bridge,
 * Zapier, Make. One signed POST, so the receiver can prove it came from us and
 * nobody can post fake orders into the shop floor's queue.
 *
 * The D1 row is the durable record. If this fails the order is not lost: it is
 * still in the database with ops_sent = 0, and the admin can replay it.
 */
async function pushToOps(env, order) {
  if (!env.OPS_WEBHOOK_URL) return false;
  const body = JSON.stringify(opsPayload(order));
  const headers = { 'content-type': 'application/json' };
  if (env.OPS_WEBHOOK_SECRET) {
    const ts = Math.floor(Date.now() / 1000);
    headers['x-semers-timestamp'] = String(ts);
    headers['x-semers-signature'] = await hmac(env.OPS_WEBHOOK_SECRET, `${ts}.${body}`);
  }
  try {
    const res = await fetch(env.OPS_WEBHOOK_URL, { method: 'POST', headers, body });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Start a payment.
 *
 * The order row is written before the redirect, so an abandoned checkout is a
 * visible unpaid order rather than nothing at all, and the webhook has a row to
 * find when the money lands.
 */
async function handleCheckout(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  if (request.method !== 'POST') return json(405, { ok: false, reason: 'method' });
  if (!env.STRIPE_SECRET_KEY) return json(503, { ok: false, reason: 'not-configured' });

  let body;
  try {
    body = await readJson(request);
  } catch (e) {
    return json(e?.status || 400, { ok: false, reason: e?.reason || 'bad-json' });
  }
  if (s(body.website) || s(body.customer?.website)) return json(200, { ok: true, url: '' });
  if (await overLimit(env, `checkout:${clientIp(request)}`, SUBMIT_MAX, SUBMIT_WINDOW_S)) return json(429, { ok: false, reason: 'too-many' });

  const c = body.customer || {};
  const email = s(c.email, 160);
  if (!EMAIL_RE.test(email)) return json(422, { ok: false, reason: 'email' });

  const catalog = await loadCatalog(request, env);
  const settings = await readSettings(env);
  const store = await storefrontOverrides(env);
  const delivery = s(c.delivery, 120);
  const method = deliveryMethod(s(body.method, 20));
  const priced = priceCart(catalog, settings, store, body.items, { pickup: method === 'pickup' });
  if (!priced.ok) return json(priced.reason === 'no-catalog' ? 503 : 422, { ok: false, reason: priced.reason });

  const id = ref();
  const origin = new URL(request.url).origin;
  const loc = locale(body.locale);
  const prefix = loc === 'en' ? '' : `/${loc}`;

  const params = {
    mode: 'payment',
    customer_email: email,
    client_reference_id: id,
    locale: STRIPE_LOCALE[loc] || 'auto',
    success_url: `${origin}${prefix}/order/thank-you/?ref=${encodeURIComponent(id)}&paid=1`,
    cancel_url: `${origin}${prefix}/cart/?ref=${encodeURIComponent(id)}`,
    metadata: { order_ref: id, locale: loc },
    payment_intent_data: { metadata: { order_ref: id } },
    line_items: priced.items.map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: priced.currency.toLowerCase(),
        unit_amount: cents(i.unit),
        product_data: {
          name: [i.title, i.variant].filter(Boolean).join(' — '),
          metadata: { gtin: i.gtin, slug: i.slug },
        },
      },
    })),
  };
  if (priced.shipping > 0) {
    params.shipping_options = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: s(delivery, 60) || 'Delivery',
          fixed_amount: { amount: cents(priced.shipping), currency: priced.currency.toLowerCase() },
        },
      },
    ];
  }

  // The reference is unique per attempt, so it is also the idempotency key: a
  // double-clicked button reuses the same session instead of opening two.
  const created = await stripePost(env, '/checkout/sessions', params, `checkout:${id}`);
  if (!created.ok) return json(502, { ok: false, reason: 'payment-provider' });

  /*
   * The row comes before the payment link, and a failure here stops the sale.
   *
   * Handing back the link anyway would mean a card charged against an order
   * that was never written down: the webhook arrives, finds no row, and the
   * money exists with nothing attached to it. A shopper told "try again in a
   * minute" is a far better outcome than that, so the write is allowed to
   * refuse the sale.
   */
  const stored = await persistPending(env, id, body, priced, created.data.id, method).catch((e) => {
    console.error('checkout persist', e);
    return false;
  });
  if (!stored) return json(503, { ok: false, reason: 'not-recorded' });
  return json(200, { ok: true, ref: id, url: created.data.url });
}

/** The overrides the storefront already exposes, in the shape priceCart wants. */
async function storefrontOverrides(env) {
  const d = db(env);
  if (!d) return {};
  const out = {};
  try {
    const ov = await d.prepare(`SELECT slug, price, hidden, in_stock FROM product_overrides`).all();
    for (const r of ov.results || []) {
      out[r.slug] = {
        price: r.price === null ? null : Number(r.price),
        hidden: r.hidden === null ? null : !!r.hidden,
        inStock: r.in_stock === null ? null : !!r.in_stock,
      };
    }
  } catch {
    /* no overrides table yet: catalogue prices stand */
  }
  return out;
}

async function persistPending(env, id, body, priced, session, method) {
  const d = await ensureSchema(env);
  if (!d) return false;
  const c = body.customer || {};
  await d
    .prepare(
      `INSERT INTO orders (id, created_at, type, status, name, email, phone, country, city, postcode, address, delivery, note, gift, currency, subtotal, shipping, total, items_json, payload_json, page, stripe_session)
       VALUES (?, ?, 'order', 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      nowIso(),
      s(c.name, 120),
      s(c.email, 160),
      s(c.phone, 60),
      s(c.country, 80),
      s(c.city, 80),
      s(c.postcode, 30),
      s(c.address, 200),
      s(c.delivery, 120),
      text(c.note, 2000),
      s(c.gift, 300),
      priced.currency,
      priced.subtotal,
      priced.shipping,
      priced.total,
      JSON.stringify(priced.items),
      JSON.stringify({ locale: locale(body.locale), method, page: s(body.page, 200) }),
      s(body.page, 200),
      s(session, 120),
    )
    .run();
  return true;
}

/**
 * Stripe's word that the money arrived.
 *
 * This, not the browser landing on the thank-you page, is what marks an order
 * paid — a shopper who closes the tab the moment the card clears still has a
 * paid order, and a shopper who bookmarks the success URL cannot manufacture
 * one. Stripe retries a webhook it did not get a 2xx for, so the handler has to
 * survive seeing the same event twice: the event id is a primary key, and the
 * second delivery finds the row already there and stops.
 */
async function handleStripeWebhook(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, reason: 'method' });
  const payload = await request.text();
  if (payload.length > MAX_BODY) return tooLarge();
  const verdict = await verifyStripeSignature(request.headers.get('stripe-signature'), payload, env.STRIPE_WEBHOOK_SECRET, Math.floor(Date.now() / 1000));
  if (!verdict.ok) {
    // 400 tells Stripe not to retry a request we will never accept, and the
    // reason stays out of the response: an attacker probing the endpoint learns
    // nothing about which half of the check they failed.
    console.error('stripe webhook rejected', verdict.reason);
    return json(400, { ok: false, reason: 'signature' });
  }

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return json(400, { ok: false, reason: 'bad-json' });
  }

  const d = await ensureSchema(env);
  /*
   * Claim the event before the work, so two deliveries racing each other cannot
   * both act on it — and give the claim back if the work fails. Keeping a claim
   * that outlived a failure was the subtler bug: Stripe retries a webhook for
   * three days, and answering 200 while the handler had thrown spent all three
   * days' worth of retries on an order nobody had recorded.
   */
  if (d && event.id) {
    const claimed = await d.prepare(`INSERT OR IGNORE INTO stripe_events (id, at, type) VALUES (?, ?, ?)`).bind(s(event.id, 80), nowIso(), s(event.type, 80)).run();
    if (!claimed?.meta?.changes) return json(200, { ok: true, duplicate: true });
  }

  try {
    if (event.type === 'checkout.session.completed') await onPaid(env, event.data?.object || {});
  } catch (err) {
    console.error('stripe paid', (err && err.stack) || err);
    if (d && event.id) await d.prepare(`DELETE FROM stripe_events WHERE id = ?`).bind(s(event.id, 80)).run().catch(() => {});
    // Anything but a 2xx makes Stripe come back. That is what should happen:
    // the alternative is money taken and nobody told.
    return json(500, { ok: false, reason: 'not-processed' });
  }
  return json(200, { ok: true });
}

async function onPaid(env, session) {
  // A session can complete with payment still pending for some asynchronous
  // methods; only a paid one is an order the floor should start picking.
  if (session.payment_status && session.payment_status !== 'paid') return;
  const id = s(session.client_reference_id || session.metadata?.order_ref, 40);
  const d = await ensureSchema(env);
  if (!d) throw new Error('no database to record the payment in');
  if (!id) throw new Error('paid session carries no order reference');

  await d
    .prepare(`UPDATE orders SET status = 'paid', paid_at = ?, stripe_intent = ? WHERE id = ? AND status <> 'paid'`)
    .bind(nowIso(), s(session.payment_intent, 120), id)
    .run();

  let row = await d.prepare(`SELECT * FROM orders WHERE id = ?`).bind(id).first();
  if (!row) {
    /*
     * Money with no order attached to it. Checkout refuses to hand out a
     * payment link it could not record, so this should be unreachable — but if
     * it ever happens, losing the sale silently is the one outcome worth
     * writing defensive code against. Stripe knows the total and the buyer's
     * e-mail, which is enough to raise a row a human can finish.
     */
    await d
      .prepare(
        `INSERT OR IGNORE INTO orders (id, created_at, type, status, name, email, currency, total, items_json, payload_json, paid_at, stripe_session, stripe_intent, admin_note)
         VALUES (?, ?, 'order', 'paid', '', ?, ?, ?, '[]', '{}', ?, ?, ?, ?)`,
      )
      .bind(
        id,
        nowIso(),
        s(session.customer_details?.email || session.customer_email, 160),
        currency((session.currency || 'eur').toUpperCase()),
        n((Number(session.amount_total) || 0) / 100),
        nowIso(),
        s(session.id, 120),
        s(session.payment_intent, 120),
        'RECOVERED: paid, but the order was never recorded at checkout. Contact the customer for the lines.',
      )
      .run();
    row = await d.prepare(`SELECT * FROM orders WHERE id = ?`).bind(id).first();
    await audit(env, 'order-recovered', id);
    if (!row) throw new Error(`could not record payment for ${id}`);
  }

  const order = { ...row, items: JSON.parse(row.items_json || '[]') };
  const body = {
    type: 'order',
    customer: { name: row.name, email: row.email, phone: row.phone, country: row.country, city: row.city, postcode: row.postcode, address: row.address, delivery: row.delivery, note: row.note, gift: row.gift },
    items: order.items.map((i) => ({ id: i.id, name: i.title || i.name, variant: i.variant, qty: i.qty, price: i.unit, total: i.line })),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    currency: row.currency,
    paid: true,
    locale: (() => {
      try {
        return locale(JSON.parse(row.payload_json || '{}').locale);
      } catch {
        return 'en';
      }
    })(),
  };

  /*
   * Telling people is best-effort and is recorded, so a retry of this webhook
   * does not send the same receipt twice. A mail provider being down must not
   * hold up the order, and it must not cost the customer a second e-mail when
   * the operations push is what brings Stripe back.
   */
  if (!row.notified_at) {
    const notice = render('order', body, id);
    await Promise.all([
      sendTelegram(env, `ОПЛАЧЕНО\n${notice}`).catch(() => false),
      sendEmail(env, `Оплачен заказ ${id}`, notice, row.email).catch(() => false),
      sendCustomerReceipt(env, body, id).catch(() => false),
    ]);
    await d.prepare(`UPDATE orders SET notified_at = ? WHERE id = ?`).bind(nowIso(), id).run().catch(() => {});
  }

  /*
   * The operations base is the one follow-up worth a retry: an order the floor
   * never hears about is an order that never ships. Throwing hands the problem
   * back to Stripe, which comes back over the next three days with the
   * notifications already marked done.
   */
  if (!row.ops_sent) {
    const sent = await pushToOps(env, order);
    await d.prepare(`UPDATE orders SET ops_sent = ? WHERE id = ?`).bind(sent ? 1 : 0, id).run().catch(() => {});
    await audit(env, 'order-paid', `${id} ops=${sent ? 'ok' : env.OPS_WEBHOOK_URL ? 'failed' : 'no-endpoint'}`);
    if (!sent && env.OPS_WEBHOOK_URL) throw new Error(`operations webhook refused order ${id}`);
  }
}

/* ------------------------------------------------------------------- admin API */

const ORDER_FIELDS = `id, created_at, type, status, name, email, phone, country, city, postcode, address, delivery, note, gift, currency, subtotal, shipping, total, items_json, admin_note, page`;

function orderRow(r) {
  let items = [];
  try {
    items = JSON.parse(r.items_json || '[]');
  } catch {
    items = [];
  }
  return { ...r, items, items_json: undefined };
}

async function adminOrders(request, env) {
  const url = new URL(request.url);
  const status = s(url.searchParams.get('status'), 20);
  const type = s(url.searchParams.get('type'), 20);
  const q = s(url.searchParams.get('q'), 80);
  const limit = Math.max(1, Math.min(200, Number(url.searchParams.get('limit')) || 50));
  const where = [];
  const args = [];
  if (ORDER_STATUSES.has(status)) where.push('status = ?'), args.push(status);
  if (TYPES.has(type)) where.push('type = ?'), args.push(type);
  if (q) {
    where.push('(id LIKE ? OR name LIKE ? OR email LIKE ?)');
    const like = `%${q}%`;
    args.push(like, like, like);
  }
  const sql = `SELECT ${ORDER_FIELDS} FROM orders ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT ?`;
  const rows = await db(env)
    .prepare(sql)
    .bind(...args, limit)
    .all();
  return json(200, { ok: true, orders: (rows.results || []).map(orderRow) });
}

/**
 * Orders are a record and normally only ever change status, but a test row or a
 * spam submission has to be removable or the list stops being trustworthy.
 */
async function adminOrderDelete(env, id) {
  const res = await db(env).prepare(`DELETE FROM orders WHERE id = ?`).bind(s(id, 40)).run();
  if (!res.meta || !res.meta.changes) return json(404, { ok: false, reason: 'not-found' });
  await audit(env, 'order.delete', String(id));
  return json(200, { ok: true });
}

async function adminOrderPatch(request, env, id) {
  const body = await readJson(request);
  const sets = [];
  const args = [];
  if (body.status !== undefined) {
    const st = s(body.status, 20);
    if (!ORDER_STATUSES.has(st)) return json(422, { ok: false, reason: 'status' });
    sets.push('status = ?'), args.push(st);
  }
  if (body.admin_note !== undefined) sets.push('admin_note = ?'), args.push(text(body.admin_note, 2000));
  if (!sets.length) return json(422, { ok: false, reason: 'nothing-to-update' });
  const res = await db(env)
    .prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...args, s(id, 40))
    .run();
  if (!res.meta || !res.meta.changes) return json(404, { ok: false, reason: 'not-found' });
  await audit(env, 'order.update', `${id} ${sets.join(',')}`);
  return json(200, { ok: true });
}

async function adminReviews(request, env) {
  const url = new URL(request.url);
  const status = s(url.searchParams.get('status'), 20);
  const where = REVIEW_STATUSES.has(status) ? `WHERE status = ?` : '';
  const stmt = db(env).prepare(`SELECT id, created_at, slug, rating, author, city, title, body, email, status, verified, reply, locale FROM reviews ${where} ORDER BY created_at DESC LIMIT 200`);
  const rows = await (where ? stmt.bind(status) : stmt).all();
  return json(200, { ok: true, reviews: rows.results || [] });
}

async function adminReviewPatch(request, env, id) {
  const rid = Number(id);
  if (!Number.isInteger(rid) || rid <= 0) return json(422, { ok: false, reason: 'id' });
  if (request.method === 'DELETE') {
    const res = await db(env).prepare(`DELETE FROM reviews WHERE id = ?`).bind(rid).run();
    if (!res.meta || !res.meta.changes) return json(404, { ok: false, reason: 'not-found' });
    await audit(env, 'review.delete', String(rid));
    return json(200, { ok: true });
  }
  const body = await readJson(request);
  const sets = [];
  const args = [];
  if (body.status !== undefined) {
    const st = s(body.status, 20);
    if (!REVIEW_STATUSES.has(st)) return json(422, { ok: false, reason: 'status' });
    sets.push('status = ?'), args.push(st);
  }
  if (body.verified !== undefined) sets.push('verified = ?'), args.push(body.verified ? 1 : 0);
  if (body.reply !== undefined) sets.push('reply = ?'), args.push(text(body.reply, 1000));
  if (body.body !== undefined) sets.push('body = ?'), args.push(text(body.body, 2000));
  if (!sets.length) return json(422, { ok: false, reason: 'nothing-to-update' });
  const res = await db(env)
    .prepare(`UPDATE reviews SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...args, rid)
    .run();
  if (!res.meta || !res.meta.changes) return json(404, { ok: false, reason: 'not-found' });
  await audit(env, 'review.update', `${rid} ${sets.join(',')}`);
  return json(200, { ok: true });
}

/** The owner can also write a review in the admin — for the ones that arrive by e-mail or in the shop. */
async function adminReviewCreate(request, env) {
  const body = await readJson(request);
  const slug = s(body.slug, 64);
  const rating = Math.round(Number(body.rating));
  const author = s(body.author, 60);
  const review = text(body.body, 2000);
  if (!SLUG_RE.test(slug)) return json(422, { ok: false, reason: 'slug' });
  if (!(rating >= 1 && rating <= 5)) return json(422, { ok: false, reason: 'rating' });
  if (author.length < 2 || review.length < 10) return json(422, { ok: false, reason: 'fields' });
  await db(env)
    .prepare(`INSERT INTO reviews (created_at, slug, rating, author, city, title, body, email, status, verified, locale) VALUES (?, ?, ?, ?, ?, ?, ?, '', 'approved', ?, ?)`)
    .bind(nowIso(), slug, rating, author, s(body.city, 60), s(body.title, 120), review, body.verified ? 1 : 0, locale(body.locale))
    .run();
  await audit(env, 'review.create', `${slug} ${rating}★ ${locale(body.locale)}`);
  return json(200, { ok: true });
}

async function adminProducts(request, env) {
  if (request.method === 'GET') {
    const rows = await db(env).prepare(`SELECT slug, price, compare_at, in_stock, hidden, badge, batch, note, updated_at FROM product_overrides ORDER BY slug`).all();
    return json(200, { ok: true, products: rows.results || [] });
  }
  const body = await readJson(request);
  const slug = s(body.slug, 64);
  if (!SLUG_RE.test(slug)) return json(422, { ok: false, reason: 'slug' });
  // An override row that says nothing is worse than no row: it hides the fact
  // that the product is running on its built-in values.
  const price = numOrNull(body.price);
  const compareAt = numOrNull(body.compare_at ?? body.compareAt);
  const inStock = boolOrNull(body.in_stock ?? body.inStock);
  const hidden = boolOrNull(body.hidden);
  const badge = s(body.badge, 40);
  const batch = s(body.batch, 60);
  const note = s(body.note, 200);
  const empty = price === null && compareAt === null && inStock === null && hidden === null && !badge && !batch && !note;
  if (empty) {
    await db(env).prepare(`DELETE FROM product_overrides WHERE slug = ?`).bind(slug).run();
    await audit(env, 'product.clear', slug);
    return json(200, { ok: true, cleared: true });
  }
  await db(env)
    .prepare(
      `INSERT INTO product_overrides (slug, price, compare_at, in_stock, hidden, badge, batch, note, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET price = excluded.price, compare_at = excluded.compare_at, in_stock = excluded.in_stock,
         hidden = excluded.hidden, badge = excluded.badge, batch = excluded.batch, note = excluded.note, updated_at = excluded.updated_at`,
    )
    .bind(slug, price, compareAt, inStock, hidden, badge, batch, note, nowIso())
    .run();
  await audit(env, 'product.update', slug);
  return json(200, { ok: true });
}

async function adminSettings(request, env) {
  if (request.method === 'GET') return json(200, { ok: true, settings: await readSettings(env) });
  const body = await readJson(request);
  const next = await writeSettings(env, body);
  await audit(env, 'settings.update', Object.keys(body).join(','));
  return json(200, { ok: true, settings: next });
}

/**
 * Removing a subscriber is not housekeeping, it is Article 17 of the GDPR: an
 * EU shop has to be able to erase someone on request.
 */
async function adminSubscriberDelete(request, env) {
  const email = s(new URL(request.url).searchParams.get('email'), 160);
  if (!EMAIL_RE.test(email)) return json(422, { ok: false, reason: 'email' });
  const res = await db(env).prepare(`DELETE FROM subscribers WHERE email = ?`).bind(email).run();
  if (!res.meta || !res.meta.changes) return json(404, { ok: false, reason: 'not-found' });
  // The address itself is the personal data, so the trail records that an
  // erasure happened without keeping a copy of what was erased.
  await audit(env, 'subscriber.delete', 'one address erased on request');
  return json(200, { ok: true });
}

async function adminSubscribers(request, env) {
  const rows = await db(env).prepare(`SELECT email, created_at, source FROM subscribers ORDER BY created_at DESC LIMIT 2000`).all();
  const list = rows.results || [];
  if (new URL(request.url).searchParams.get('format') === 'csv') {
    const csv = ['email,created_at,source', ...list.map((r) => `${r.email},${r.created_at},${r.source}`)].join('\n');
    return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="semers-subscribers.csv"', 'cache-control': 'no-store' } });
  }
  return json(200, { ok: true, subscribers: list });
}

async function adminStats(request, env) {
  const d = db(env);
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [totals, byStatus, recent, pending] = await Promise.all([
    d.prepare(`SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue FROM orders WHERE type = 'order'`).first(),
    d.prepare(`SELECT status, COUNT(*) AS c FROM orders WHERE type = 'order' GROUP BY status`).all(),
    d.prepare(`SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue FROM orders WHERE type = 'order' AND created_at >= ?`).bind(since).first(),
    d.prepare(`SELECT COUNT(*) AS c FROM reviews WHERE status = 'pending'`).first(),
  ]);
  return json(200, {
    ok: true,
    orders: Number(totals?.orders || 0),
    revenue: Math.round(Number(totals?.revenue || 0) * 100) / 100,
    last30: { orders: Number(recent?.orders || 0), revenue: Math.round(Number(recent?.revenue || 0) * 100) / 100 },
    byStatus: Object.fromEntries((byStatus.results || []).map((r) => [r.status, Number(r.c)])),
    pendingReviews: Number(pending?.c || 0),
  });
}

async function handleAdmin(request, env, path) {
  if (path === 'login') return handleLogin(request, env);
  if (path === 'logout') {
    // Signing out has to end the session server-side too; an expired cookie on
    // this device does nothing about a copy of the token anywhere else.
    await endSession(env, cookie(request, SESSION_COOKIE)).catch(() => {});
    return json(200, { ok: true }, { 'set-cookie': setCookie('', 0) });
  }
  if (path === 'session') {
    if (!env.ADMIN_PASSWORD) return json(200, { ok: false, configured: false });
    const live = await validSession(env, cookie(request, SESSION_COOKIE));
    return json(200, { ok: live, configured: true, database: !!db(env) });
  }

  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  await ensureSchema(env);

  const [head, id] = path.split('/');
  if (head === 'stats' && request.method === 'GET') return adminStats(request, env);
  if (head === 'orders') {
    if (request.method === 'GET' && !id) return adminOrders(request, env);
    if (request.method === 'PATCH' && id) return adminOrderPatch(request, env, id);
    if (request.method === 'DELETE' && id) return adminOrderDelete(env, id);
  }
  if (head === 'reviews') {
    if (request.method === 'GET' && !id) return adminReviews(request, env);
    if (request.method === 'POST' && !id) return adminReviewCreate(request, env);
    if ((request.method === 'PATCH' || request.method === 'DELETE') && id) return adminReviewPatch(request, env, id);
  }
  if (head === 'products' && (request.method === 'GET' || request.method === 'PUT')) return adminProducts(request, env);
  if (head === 'settings' && (request.method === 'GET' || request.method === 'PUT')) return adminSettings(request, env);
  if (head === 'subscribers' && request.method === 'GET') return adminSubscribers(request, env);
  if (head === 'subscribers' && request.method === 'DELETE') return adminSubscriberDelete(request, env);
  return json(404, { ok: false, reason: 'unknown-route' });
}

/* ---------------------------------------------------------------------- shell */

/** Languages that have their own 404 page; anything else falls back to English. */
const LOCALE_404 = { ru: '/ru/404/', lv: '/lv/404/' };

async function notFound(request, env) {
  if (env && env.ASSETS) {
    const url = new URL(request.url);
    // A reader who mistypes a URL under /ru/ is already lost; dropping them into
    // English at that moment makes it worse. The first path segment is the only
    // thing left to go on, so it is what picks the page.
    const first = url.pathname.split('/')[1];
    for (const candidate of [LOCALE_404[first], '/404.html']) {
      if (!candidate) continue;
      try {
        const page = await env.ASSETS.fetch(new URL(candidate, request.url));
        if (page.ok) return new Response(page.body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
      } catch {
        /* try the next candidate, then the plain response */
      }
    }
  }
  return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    try {
      if (path === '/api/order') return await handleOrder(request, env);
      if (path === '/api/checkout') return await handleCheckout(request, env);
      if (path === '/api/stripe/webhook') return await handleStripeWebhook(request, env);
      if (path === '/api/storefront') return await handleStorefront(request, env);
      if (path === '/api/reviews') {
        if (request.method === 'GET') return await handleReviewsGet(request, env);
        if (request.method === 'POST') return await handleReviewPost(request, env);
        return json(405, { ok: false, reason: 'method' });
      }
      if (path.startsWith('/api/admin/')) return await handleAdmin(request, env, path.slice('/api/admin/'.length));
      if (path.startsWith('/api/')) return json(404, { ok: false, reason: 'unknown-route' });
    } catch (err) {
      // A thrown handler must not return the platform's HTML error page to a
      // fetch() that is expecting JSON. What it must also not return is the
      // message: a D1 error names the table and the column it failed on, and
      // the caller here is the public internet.
      if (err && err.status) return json(err.status, { ok: false, reason: err.reason || 'bad-request' });
      console.error('semers worker', (err && err.stack) || err);
      return json(500, { ok: false, reason: 'server-error' });
    }
    return notFound(request, env);
  },
};
