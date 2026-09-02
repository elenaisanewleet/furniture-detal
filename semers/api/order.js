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
const TYPES = new Set(['order', 'newsletter', 'contact', 'wholesale']);

const s = (v, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const n = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v) * 100) / 100 : 0);
const money = (v, cur = 'EUR') => `${n(v).toFixed(2)} ${cur}`;
const escapeHtml = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

function ref() {
  const d = new Date();
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, '');
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SM-${ymd}-${rnd}`;
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error('body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

function render(type, body, id) {
  const lines = [];
  if (type === 'order') {
    const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
    const c = body.customer || {};
    lines.push(`🍏 NEW ORDER REQUEST ${id}`);
    lines.push('');
    for (const it of items) {
      const v = s(it.variant, 80);
      const note = s(it.note, 300);
      lines.push(`${n(it.qty)} × ${s(it.name, 120)}${v ? ` (${v})` : ''}${note ? ` — ${note}` : ''} = ${money(it.total, body.currency)}`);
    }
    lines.push('');
    lines.push(`Subtotal: ${money(body.subtotal, body.currency)}`);
    lines.push(`Shipping: ${n(body.shipping) ? money(body.shipping, body.currency) : 'free'}`);
    lines.push(`TOTAL: ${money(body.total, body.currency)}`);
    lines.push('');
    lines.push(`Name: ${s(c.name)}`);
    lines.push(`E-mail: ${s(c.email)}`);
    if (s(c.phone)) lines.push(`Phone: ${s(c.phone)}`);
    lines.push(`Address: ${[s(c.address), s(c.city), s(c.postcode), s(c.country)].filter(Boolean).join(', ')}`);
    if (s(c.delivery)) lines.push(`Delivery: ${s(c.delivery)}`);
    if (s(c.note, 1000)) lines.push(`Note: ${s(c.note, 1000)}`);
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
    if (s(body.message, 2000)) lines.push(`Message: ${s(body.message, 2000)}`);
  } else {
    lines.push(`✉️ Contact form ${id}`);
    lines.push(`Name: ${s(body.name)}`);
    lines.push(`E-mail: ${s(body.email)}`);
    if (s(body.topic)) lines.push(`Topic: ${s(body.topic)}`);
    lines.push(`Message: ${s(body.message, 2000)}`);
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
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
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
  if (s(body.website)) return res.status(200).json({ ok: true, ref: 'HP' }); // honeypot: pretend success

  const email = s(type === 'order' ? body.customer?.email : body.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(422).json({ ok: false, reason: 'email' });
  if (type === 'order' && (!Array.isArray(body.items) || body.items.length === 0)) return res.status(422).json({ ok: false, reason: 'empty' });

  const id = ref();
  const text = render(type, body, id);
  const subject = text.split('\n')[0];

  const [tg, mail] = await Promise.all([sendTelegram(text), sendEmail(subject, text, email)]);
  if (!tg && !mail) return res.status(503).json({ ok: false, reason: 'not-configured' });
  if (type === 'order') sendCustomerReceipt(body, id, text).catch(() => {});

  return res.status(200).json({ ok: true, ref: id });
}
