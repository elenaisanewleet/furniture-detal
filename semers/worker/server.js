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

async function readJson(request) {
  const asObject = (b) => (b && typeof b === 'object' && !Array.isArray(b) ? b : {});
  const raw = await request.text();
  if (raw.length > MAX_BODY) throw new Error('body too large');
  return asObject(raw ? JSON.parse(raw) : {});
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
      reply TEXT NOT NULL DEFAULT '')`,
    `CREATE INDEX IF NOT EXISTS reviews_slug ON reviews (slug, status, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS reviews_status ON reviews (status, created_at DESC)`,
    `CREATE TABLE IF NOT EXISTS product_overrides (
      slug TEXT PRIMARY KEY, price REAL, compare_at REAL, in_stock INTEGER, hidden INTEGER,
      badge TEXT, batch TEXT, note TEXT, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, created_at TEXT NOT NULL, source TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT NOT NULL, at TEXT NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS login_attempts_ip ON login_attempts (ip, at)`,
    `CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '')`,
    `CREATE INDEX IF NOT EXISTS audit_at ON audit (at DESC)`,
  ];
  for (const q of stmts) await d.prepare(q).run();
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
  announcementHref: '',
  announcementOn: false,
  freeFrom: 25,
  guarantee: 'Not what you hoped for? Tell us within 14 days and we refund the order — you keep the box.',
  guaranteeOn: true,
  tier1Qty: 3,
  tier1Pct: 5,
  tier2Qty: 6,
  tier2Pct: 10,
  tiersOn: true,
  reviewsOn: true,
};

function coerceSettings(raw) {
  const out = { ...SETTING_DEFAULTS };
  for (const [k, def] of Object.entries(SETTING_DEFAULTS)) {
    if (!(k in raw)) continue;
    const v = raw[k];
    if (typeof def === 'boolean') out[k] = v === true || v === 'true' || v === 1 || v === '1';
    else if (typeof def === 'number') out[k] = Number.isFinite(Number(v)) ? Number(v) : def;
    else out[k] = s(v, 300);
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

async function issueSession(env) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_S;
  const nonce = [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const body = `${exp}.${nonce}`;
  return `${body}.${await hmac(sessionSecret(env), body)}`;
}

async function validSession(env, token) {
  if (!token || !sessionSecret(env)) return false;
  const parts = String(token).split('.');
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return timingSafeEqual(sig, await hmac(sessionSecret(env), `${exp}.${nonce}`));
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

function clientIp(request) {
  return s(request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown', 60);
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
  } catch {
    return json(400, { ok: false, reason: 'bad-json' });
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
async function handleStorefront(request, env) {
  const settings = await readSettings(env);
  const out = { settings: { ...settings }, products: {}, reviews: {} };
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
  const rows = await d
    .prepare(`SELECT id, created_at, rating, author, city, title, body, verified, reply FROM reviews WHERE slug = ? AND status = 'approved' ORDER BY created_at DESC LIMIT 50`)
    .bind(slug)
    .all();
  const list = (rows.results || []).map((r) => ({
    id: r.id,
    date: String(r.created_at).slice(0, 10),
    rating: Number(r.rating),
    author: r.author,
    city: r.city || '',
    title: r.title || '',
    body: r.body,
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
  } catch {
    return json(400, { ok: false, reason: 'bad-json' });
  }
  if (s(body.website)) return json(200, { ok: true }); // honeypot
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
    .prepare(`INSERT INTO reviews (created_at, slug, rating, author, city, title, body, email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`)
    .bind(nowIso(), slug, rating, author, s(body.city, 60), s(body.title, 120), review, EMAIL_RE.test(email) ? email : '')
    .run();
  await audit(env, 'review.new', `${slug} ${rating}★`);
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

async function sendWelcome(env, email) {
  const key = env.RESEND_API_KEY;
  if (!key || !EMAIL_RE.test(email)) return false;
  const from = env.ORDER_FROM_EMAIL || 'Semers Shop <shop@semers.org>';
  const site = env.SITE_URL || 'https://semers-store.higgsfield.app';
  const lines = [
    'Thank you for subscribing.',
    '',
    'Here is what you have signed up for, and nothing else: a note when a new flavour',
    'lands, a note when something you liked is back in stock, and now and then a recipe.',
    'A few times a month at most, and one click unsubscribes.',
    '',
    'While you are here, the three people usually start with:',
    `· App'Lite Apple Bar — 99% baked apple, egg white, nothing else: ${site}/products/apple-bar-35g/`,
    `· Apple Meringue — the same apple, whipped and dried crisp: ${site}/products/apple-meringue-35g/`,
    `· Tasting Box — one of everything, so you can decide in one order: ${site}/products/tasting-box/`,
    '',
    `Or build your own box and take 10% off: ${site}/shop/build-your-box/`,
    '',
    '— Semers, Riga',
  ].join('\n');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [email], subject: 'Welcome to Semers', text: lines }),
  });
  return r.ok;
}

async function sendCustomerReceipt(env, body, id, text) {
  const key = env.RESEND_API_KEY;
  const email = s(body?.customer?.email);
  if (!key || !email || !EMAIL_RE.test(email)) return false;
  const from = env.ORDER_FROM_EMAIL || 'Semers Shop <shop@semers.org>';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `We received your order request ${id}`,
      text: `Thank you. We have your order request ${id}. We will confirm availability and send a payment link within one business day.\n\n${text}\n\n— Semers, Riga`,
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
  } catch {
    return json(400, { ok: false, reason: 'bad-json' });
  }

  const type = s(body.type, 20);
  if (!TYPES.has(type)) return json(400, { ok: false, reason: 'bad-type' });
  if (s(body.website) || s(body.customer?.website)) return json(200, { ok: true, ref: 'HP' });

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
  if (type === 'order') await sendCustomerReceipt(env, body, id, text).catch(() => false);
  if (type === 'newsletter') await sendWelcome(env, email).catch(() => false);
  return json(200, { ok: true, ref: id });
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
  const stmt = db(env).prepare(`SELECT id, created_at, slug, rating, author, city, title, body, email, status, verified, reply FROM reviews ${where} ORDER BY created_at DESC LIMIT 200`);
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
    .prepare(`INSERT INTO reviews (created_at, slug, rating, author, city, title, body, email, status, verified) VALUES (?, ?, ?, ?, ?, ?, ?, '', 'approved', ?)`)
    .bind(nowIso(), slug, rating, author, s(body.city, 60), s(body.title, 120), review, body.verified ? 1 : 0)
    .run();
  await audit(env, 'review.create', `${slug} ${rating}★`);
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
  if (path === 'logout') return json(200, { ok: true }, { 'set-cookie': setCookie('', 0) });
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
  }
  if (head === 'reviews') {
    if (request.method === 'GET' && !id) return adminReviews(request, env);
    if (request.method === 'POST' && !id) return adminReviewCreate(request, env);
    if ((request.method === 'PATCH' || request.method === 'DELETE') && id) return adminReviewPatch(request, env, id);
  }
  if (head === 'products' && (request.method === 'GET' || request.method === 'PUT')) return adminProducts(request, env);
  if (head === 'settings' && (request.method === 'GET' || request.method === 'PUT')) return adminSettings(request, env);
  if (head === 'subscribers' && request.method === 'GET') return adminSubscribers(request, env);
  return json(404, { ok: false, reason: 'unknown-route' });
}

/* ---------------------------------------------------------------------- shell */

async function notFound(request, env) {
  if (env && env.ASSETS) {
    try {
      const page = await env.ASSETS.fetch(new URL('/404.html', request.url));
      if (page.ok) return new Response(page.body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    } catch {
      /* fall through to the plain response */
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
      // fetch() that is expecting JSON.
      return json(500, { ok: false, reason: 'server-error', detail: String((err && err.message) || err).slice(0, 200) });
    }
    return notFound(request, env);
  },
};
