/**
 * Order / lead intake — Vercel serverless function (Node runtime).
 *
 *   browser --POST JSON--> /api/order --> Telegram (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID)
 *                                     \-> e-mail via Resend (RESEND_API_KEY + ORDER_TO_EMAIL)
 *
 * Handles four payload types sent by src/scripts/site.ts:
 *   order      — cart checkout (items, totals, customer)
 *   newsletter — footer signup (email)
 *   contact    — contact page form
 *   wholesale  — B2B enquiry form
 *
 * Without any env configured the function answers 503 { ok:false, reason:'not-configured' }
 * and the browser falls back to a pre-filled mailto: link, so nothing is lost.
 * Payment is intentionally not here yet: this records an order request; the shop
 * confirms and sends a payment link. Swap in Stripe Checkout later (see README).
 */

export const config = { runtime: 'nodejs' };

const MAX_BODY = 64 * 1024;
const MAX_ITEMS = 60;
/** Telegram rejects messages over 4096 characters; keep the notification well under it. */
const MAX_TG = 4000;
const TYPES = new Set(['order', 'newsletter', 'contact', 'wholesale']);

/** Single-line field: control characters and line breaks are collapsed so a value cannot pose as one of our own lines. */
const s = (v, max = 400) => (typeof v === 'string' ? v.replace(/[\0-\x1f\x7f\u2028\u2029]+/g, ' ').trim().slice(0, max) : '');
/** Free-text field: keeps its line breaks, indented under the label for the same reason. */
const multi = (v, max) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(/[\0-\x09\x0b-\x1f\x7f\u2028\u2029]+/g, ' ').trim().slice(0, max).split('\n').join('\n    ') : '');
const n = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v) * 100) / 100 : 0);
const money = (v, cur = 'EUR') => `${n(v).toFixed(2)} ${cur}`;
/** Only an ISO-4217 code goes into the notification text; anything else the client sent falls back to EUR. */
const currency = (v) => (/^[A-Z]{3}$/.test(String(v || '')) ? v : 'EUR');
const escapeHtml = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

function ref() {
  const d = new Date();
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, '');
  // The alphabet drops the characters that get misread aloud or in handwriting
  // (0/O, 1/I), and the bytes are drawn the same way the Worker draws them so
  // the two deployments hand out references of the same shape.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(4));
  const rnd = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `SM-${ymd}-${rnd}`;
}

/* ------------------------------------------------------------- rate limiting */

/** Form submissions allowed from one caller per hour, and from one instance. */
const SUBMIT_MAX = 30;
const SUBMIT_WINDOW_MS = 60 * 60 * 1000;
const INSTANCE_MAX = 300;
/** ip -> timestamps inside the window. Bounded below so a spray cannot grow it. */
const hits = new Map();

/**
 * Only x-real-ip is trusted: Vercel sets it and a client cannot. x-forwarded-for
 * is appended to, not replaced, so its left-hand end is whatever the caller
 * wrote — a bucket the attacker picks is not a limit. Without the header
 * everything shares one bucket, which throttles harder rather than less.
 */
const clientIp = (req) => s(req.headers['x-real-ip'], 60) || 'no-edge-ip';

/**
 * The window lives in the instance's memory, because a serverless function has
 * no database to count against: a warm instance remembers, a cold one starts
 * empty. That is weaker than the Worker's D1 counter, and it is still the
 * difference between thirty an hour and as many as the sender cares to send —
 * this endpoint e-mails a receipt to whatever address it is handed, so an
 * unlimited one is a mail relay with the shop's domain on the envelope.
 */
function overLimit(ip) {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  let total = 0;
  for (const [k, times] of hits) {
    const live = times.filter((t) => now - t < SUBMIT_WINDOW_MS);
    if (live.length) hits.set(k, live);
    else hits.delete(k);
    total += live.length;
  }
  const mine = hits.get(ip) || [];
  if (mine.length >= SUBMIT_MAX || total >= INSTANCE_MAX) return true;
  mine.push(now);
  hits.set(ip, mine);
  return false;
}

async function readJson(req) {
  const asObject = (b) => (b && typeof b === 'object' && !Array.isArray(b) ? b : {});
  if (req.body && typeof req.body === 'object') return asObject(req.body);
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error('body too large');
  }
  return asObject(raw ? JSON.parse(raw) : {});
}

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

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text: text.slice(0, MAX_TG), disable_web_page_preview: true }),
  });
  return r.ok;
}

async function sendEmail(subject, text, replyTo) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_TO_EMAIL;
  if (!key || !to) return false;
  const from = process.env.ORDER_FROM_EMAIL || 'Semers Shop <shop@semers.org>';
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

async function sendCustomerReceipt(body, id, text) {
  const key = process.env.RESEND_API_KEY;
  const email = s(body?.customer?.email);
  if (!key || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return false;
  const from = process.env.ORDER_FROM_EMAIL || 'Semers Shop <shop@semers.org>';
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

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, reason: 'method' });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return res.status(400).json({ ok: false, reason: 'bad-json' });
  }

  const type = s(body.type, 20);
  if (!TYPES.has(type)) return res.status(400).json({ ok: false, reason: 'bad-type' });
  // Honeypot: pretend success. The checkout posts its fields under `customer`, the lead forms at the top level.
  // It answers before the limit is consulted, so a bot that trips it never
  // spends the allowance a real shopper might need.
  if (s(body.website) || s(body.customer?.website)) return res.status(200).json({ ok: true, ref: 'HP' });

  if (overLimit(clientIp(req))) return res.status(429).json({ ok: false, reason: 'too-many' });

  const email = s(type === 'order' ? body.customer?.email : body.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(422).json({ ok: false, reason: 'email' });
  if (type === 'order' && (!Array.isArray(body.items) || body.items.length === 0)) return res.status(422).json({ ok: false, reason: 'empty' });

  const id = ref();
  const text = render(type, body, id);
  const subject = text.split('\n')[0];

  // Each channel fails independently: a Telegram outage must not turn a delivered e-mail into a 500.
  const [tg, mail] = await Promise.all([sendTelegram(text).catch(() => false), sendEmail(subject, text, email).catch(() => false)]);
  if (!tg && !mail) return res.status(503).json({ ok: false, reason: 'not-configured' });
  // Awaited on purpose: serverless execution can be frozen as soon as the response is sent,
  // so a fire-and-forget receipt would often never leave the function.
  if (type === 'order') await sendCustomerReceipt(body, id, text).catch(() => false);

  return res.status(200).json({ ok: true, ref: id });
}
