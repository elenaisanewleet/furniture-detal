/**
 * Client script for every page. No framework: a small localStorage cart, the
 * slide-over drawer, product page interactions, shop filters, the bundle
 * builder, checkout and lead forms. Everything is keyed off data-attributes so
 * pages stay plain HTML.
 */

declare global {
  interface Window {
    SEMERS: {
      endpoint: string;
      freeFrom: number;
      email: string;
      whatsapp: string;
      currency: string;
      guarantee?: string;
      guaranteeOn?: boolean;
      tier1Qty?: number;
      tier1Pct?: number;
      tier2Qty?: number;
      tier2Pct?: number;
      tiersOn?: boolean;
      reviewsOn?: boolean;
      /** True once the shop can take a payment (Paysera is configured); set by /api/storefront, never baked into the page. */
      payments?: boolean;
      locale?: string;
      intl?: string;
      /** Runtime templates for the current locale; see src/i18n/ui.ts. */
      strings?: Record<string, string>;
    };
    semersCart: Cart;
  }
}

const CFG = window.SEMERS || {
  endpoint: '/api/order',
  // The layout always sets this from site.ts; the drawer carries the same number for the day it does not.
  freeFrom: Number(document.querySelector<HTMLElement>('[data-free-from]')?.dataset.freeFrom) || 0,
  email: '',
  whatsapp: '',
  currency: 'EUR',
  guarantee: '',
  guaranteeOn: false,
  tier1Qty: 0,
  tier1Pct: 0,
  tier2Qty: 0,
  tier2Pct: 0,
  tiersOn: false,
  payments: false,
  reviewsOn: false,
  locale: 'en',
  intl: 'en-IE',
  strings: {},
};
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const fmt = (n: number) => new Intl.NumberFormat(CFG.intl || 'en-IE', { style: 'currency', currency: CFG.currency || 'EUR' }).format(n);
/** Whole-euro amounts such as the free-shipping threshold read "€25" everywhere else on the site, so the drawer must not say "€25.00". */
const fmtWhole = (n: number) => (Number.isInteger(n) ? new Intl.NumberFormat(CFG.intl || 'en-IE', { style: 'currency', currency: CFG.currency || 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) : fmt(n));
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/**
 * Runtime strings for the language this page was rendered in, injected by the
 * layout. Read through S() so a key the dictionary has not filled in yet
 * degrades to readable English rather than "undefined" in the interface.
 */
const STR: Record<string, string> = CFG.strings || {};
const S = (key: string, fallback = '') => STR[key] || fallback;
/**
 * A count needs the noun in the form its language uses for that number, and
 * the three languages disagree about which numbers those are. The dictionary
 * ships one string per form the language has, named `{base}_{form}`, and the
 * browser's own rule picks between them.
 */
const PLURAL = new Intl.PluralRules(CFG.intl || 'en-IE');
const P = (base: string, n: number, fallback = '') =>
  STR[`${base}_${PLURAL.select(n)}`] || STR[`${base}_other`] || STR[`${base}_many`] || STR[`${base}_one`] || fallback;
/** Substitute {placeholders} in a runtime template. */
const interp = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_m, k) => String(vars[k] ?? ''));
/** Escape, then turn **text** into <strong>: the only markup a dictionary may introduce. */
const rich = (tpl: string) => esc(tpl).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

/* ------------------------------------------------------------------ toast */
let toastTimer = 0;
export function toast(msg: string, ms = 2600) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-on');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('is-on'), ms);
}

/** Screen-reader-only status line for cart changes (the visible toast is reserved for bigger moments). */
function announce(msg: string) {
  const el = $('#cart-live');
  if (!el) return;
  el.textContent = '';
  window.setTimeout(() => (el.textContent = msg), 30);
}

/* ------------------------------------------------------------------- cart */
export interface CartItem {
  id: string; // `${slug}:${variant}` or `bundle:<hash>`
  slug: string;
  name: string;
  variant: string;
  variantLabel: string;
  price: number;
  qty: number;
  image: string;
  weight: number;
  url: string;
  note?: string;
  /** Volume ladder applies to catalogue lines. Boxes built in the bundle builder already carry their own discount. */
  tier?: boolean;
}

/**
 * Volume ladder, newest values from /api/storefront and otherwise the ones the
 * page was built with. Pairs are [minimum quantity, percent off], best match wins.
 */
let TIERS: [number, number][] = [];
function readTiers(c: typeof CFG) {
  TIERS = c.tiersOn === false
    ? []
    : ([
        [Number(c.tier1Qty) || 0, Number(c.tier1Pct) || 0],
        [Number(c.tier2Qty) || 0, Number(c.tier2Pct) || 0],
      ].filter(([q, pct]) => q > 1 && pct > 0) as [number, number][]).sort((a, b) => a[0] - b[0]);
}
readTiers(CFG);

/** Percent off a single line at this quantity — 0 when the line is not eligible or no step is reached. */
function tierPct(item: { qty: number; tier?: boolean }) {
  if (item.tier === false || !TIERS.length) return 0;
  let pct = 0;
  for (const [minQty, p] of TIERS) if (item.qty >= minQty) pct = p;
  return pct;
}
/** Per-unit price after the ladder, rounded to the cent so the line total is what the customer is shown. */
function unitOf(item: { price: number; qty: number; tier?: boolean }) {
  const pct = tierPct(item);
  return pct ? Math.round(item.price * (100 - pct)) / 100 : item.price;
}
function lineOf(item: { price: number; qty: number; tier?: boolean }) {
  return Math.round(unitOf(item) * item.qty * 100) / 100;
}

const KEY = 'semers.cart.v1';

class Cart {
  items: CartItem[] = [];
  constructor() {
    this.load();
  }
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      // Stored JSON is untrusted (old versions, hand edits): keep only well-formed rows and clamp quantities.
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      this.items = (Array.isArray(parsed) ? parsed : [])
        .filter((i) => i && typeof i.id === 'string' && Number(i.qty) > 0 && Number.isFinite(Number(i.price)))
        .map((i) => ({ ...i, qty: Math.max(1, Math.min(99, Math.round(Number(i.qty)))), price: Number(i.price), tier: i.tier !== false }));
    } catch {
      this.items = [];
    }
  }
  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.items));
    } catch {
      /* private mode */
    }
    document.dispatchEvent(new CustomEvent('cart:change', { detail: this }));
  }
  add(item: Omit<CartItem, 'qty'>, qty = 1) {
    const q = Math.max(1, Math.round(qty) || 1); // "2.5" typed into the quantity field must not become a 2.5-bar order
    const ex = this.items.find((i) => i.id === item.id);
    if (ex) ex.qty = Math.min(99, ex.qty + q);
    else this.items.push({ ...item, qty: Math.min(99, q) });
    this.save();
  }
  setQty(id: string, qty: number) {
    const it = this.items.find((i) => i.id === id);
    if (!it) return;
    it.qty = Math.max(0, Math.min(99, Math.round(qty)));
    if (it.qty === 0) this.items = this.items.filter((i) => i.id !== id);
    this.save();
  }
  remove(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
    this.save();
  }
  clear() {
    this.items = [];
    this.save();
  }
  count() {
    return this.items.reduce((n, i) => n + i.qty, 0);
  }
  subtotal() {
    return this.items.reduce((n, i) => n + lineOf(i), 0);
  }
  weight() {
    return this.items.reduce((n, i) => n + i.qty * (i.weight || 0), 0);
  }
}

const cart = new Cart();
window.semersCart = cart;

/** Bundles sold as "ships free" regardless of the threshold (the Tasting Box badge and copy promise it). */
const FREE_SHIP_SLUGS = new Set(['tasting-box']);
function shipsFree(total: number) {
  return total >= CFG.freeFrom || cart.items.some((i) => FREE_SHIP_SLUGS.has(i.slug));
}
/**
 * Which delivery method is chosen, as a stable key.
 *
 * The visible label is prose and is translated, so matching on its text would
 * be a different test in every language — and, once it reaches the server, a
 * free-text field the browser fills in. The key on the input is the same in
 * all three languages and is the only thing sent up. Anywhere without the
 * checkout form (the cart page, the drawer) is priced as the parcel locker.
 */
type Method = 'locker' | 'courier';
function deliveryMethod(): Method {
  const r = $<HTMLInputElement>('form[data-checkout] input[name="delivery"]:checked');
  return r?.dataset.method === 'courier' ? 'courier' : 'locker';
}
/**
 * Delivery for a subtotal, by the rule the Worker charges (priceCart in
 * worker/server.js): free from the threshold or for a box sold as shipping
 * free, otherwise the chosen method's rate. The rates come from the element
 * that asks — data-shipping is the parcel-locker rate, data-courier the
 * courier's, both written from site.ts when the page was built.
 */
function shippingFor(total: number, rates: DOMStringMap): number {
  if (cart.count() === 0 || shipsFree(total)) return 0;
  const raw = deliveryMethod() === 'courier' ? rates.courier : rates.shipping;
  const rate = raw ? Number(raw) : NaN;
  return Number.isFinite(rate) && rate > 0 ? rate : 0;
}

/* ----------------------------------------------------------------- drawer */
const drawer = $('#cart');
let lastFocus: HTMLElement | null = null;

/**
 * Re-rendering a row list with innerHTML drops keyboard focus to <body>. Remember which row control
 * had it, run the render, then put focus back on the same control — or, if that row is gone, on the
 * same control of the row that took its place (APG pattern for deleting list items), else a fallback.
 */
function renderKeepingFocus(list: HTMLElement, render: () => void, fallback: () => HTMLElement | null | undefined) {
  const a = document.activeElement as HTMLElement | null;
  const row = a && list.contains(a) ? a.closest<HTMLElement>('.ci') : null;
  const idx = row ? $$<HTMLElement>('.ci', list).indexOf(row) : -1;
  const ctl = row ? ['data-inc', 'data-dec', 'data-rm'].find((k) => a!.hasAttribute(k)) : undefined;
  render();
  if (!row) return;
  const rows = $$<HTMLElement>('.ci', list);
  const target = rows.find((r) => r.dataset.id === row.dataset.id) || rows[Math.min(idx, rows.length - 1)];
  const el = target && ctl ? target.querySelector<HTMLElement>(`[${ctl}]`) : null;
  (el || fallback())?.focus();
}

function renderCart() {
  const list = $('#cart-items');
  const empty = $('#cart-empty');
  const count = $('#cart-count');
  const n = $('#cart-n');
  const sub = $('#cart-subtotal');
  const checkout = $<HTMLAnchorElement>('#cart-checkout');
  const total = cart.subtotal();
  const c = cart.count();

  // The pill always shows its number, 0 included, as the approved shop does.
  if (count) count.textContent = String(c);
  $('#cart-open')?.setAttribute('aria-label', c ? interp(P('openCart', c, 'Open cart, {n}'), { n: c }) : S('openCartEmpty', 'Open cart, empty'));
  if (n) n.textContent = c ? interp(P('cartCount', c, '· {n} items'), { n: c }) : '';
  if (sub) sub.textContent = fmt(total);
  if (checkout) checkout.classList.toggle('is-disabled', c === 0), checkout.setAttribute('aria-disabled', String(c === 0)), (checkout.tabIndex = c === 0 ? -1 : 0);
  if (empty) empty.hidden = c > 0;

  // free shipping progress
  const fill = $('#cart-ship-fill');
  const text = $('#cart-ship-text');
  if (fill && text) {
    const free = c > 0 && shipsFree(total);
    const left = free ? 0 : Math.max(0, CFG.freeFrom - total);
    fill.style.width = free ? '100%' : `${Math.min(100, (total / CFG.freeFrom) * 100)}%`;
    text.innerHTML =
      c === 0
        ? rich(interp(S('freeShippingOver', 'Free shipping on orders over **{from}**.'), { from: fmtWhole(CFG.freeFrom) }))
        : left > 0
          ? rich(interp(S('addMoreForFree', 'Add **{amount}** more for free shipping.'), { amount: fmt(left) }))
          : rich(S('unlockedFreeShipping', 'You’ve unlocked **free shipping**.'));
  }

  // Nudge toward the next volume step, the way the shipping bar nudges toward
  // free delivery: name the item, the number of packs and what it saves. Only
  // the closest one is shown — a list of every possible saving is noise.
  const tierText = $('#cart-tier-text');
  if (tierText) {
    let best: { item: CartItem; need: number; pct: number } | null = null;
    for (const i of cart.items) {
      if (i.tier === false) continue;
      const nextStep = TIERS.find(([minQty]) => i.qty < minQty);
      if (!nextStep) continue;
      const need = nextStep[0] - i.qty;
      if (!best || need < best.need) best = { item: i, need, pct: nextStep[1] };
    }
    tierText.hidden = !best;
    if (best) {
      tierText.innerHTML = rich(interp(S('nextTier', 'Add **{need}** more {name} to save **{pct}%** on that line.'), { need: best.need, name: best.item.name, pct: best.pct }));
    }
  }

  // cart-page suggestions never repeat something already in the box
  const inBoxNow = new Set(cart.items.map((i) => i.slug));
  $$<HTMLElement>('[data-cart-suggest] [data-product-card]').forEach((card) => {
    const add = card.querySelector<HTMLElement>('[data-add]');
    const slug = add ? parseAdd(add)?.slug : undefined;
    card.hidden = !!slug && inBoxNow.has(slug);
  });

  // quick adds under the progress bar: only while the box is not yet shipping free, never for items already in it
  const upsell = $('#cart-upsell');
  if (upsell) {
    const inBox = new Set(cart.items.map((i) => i.slug));
    let shown = 0;
    $$<HTMLElement>('[data-up-slug]', upsell).forEach((li) => {
      const hide = inBox.has(li.dataset.upSlug || '');
      li.hidden = hide;
      if (!hide) shown++;
    });
    upsell.hidden = c === 0 || shipsFree(total) || shown === 0;
  }

  if (list) {
    renderKeepingFocus(list, () => {
    list.innerHTML = cart.items
      .map(
        (i) => `
      <li class="ci" data-id="${esc(i.id)}">
        <a class="ci__img" href="${esc(i.url)}" aria-hidden="true" tabindex="-1"><img src="${esc(i.image)}" alt="" loading="lazy" width="72" height="72" /></a>
        <div>
          <div class="ci__name"><a href="${esc(i.url)}">${esc(i.name)}</a></div>
          <div class="ci__var">${esc(i.variantLabel)}${i.note ? ` · ${esc(i.note)}` : ''}</div>
          <div class="ci__ctl">
            <div class="qty" role="group" aria-label="${esc(interp(S('qtyOf', 'Quantity of {name}'), { name: i.name }))}">
              <button type="button" data-dec aria-label="${esc(interp(S('qtyDec', 'Decrease quantity of {name}'), { name: i.name }))}">−</button>
              <output aria-label="${esc(S('qtyLabel', 'Quantity'))}">${i.qty}</output>
              <button type="button" data-inc aria-label="${esc(interp(S('qtyInc', 'Increase quantity of {name}'), { name: i.name }))}">+</button>
            </div>
            <button type="button" class="ci__rm" data-rm aria-label="${esc(interp(S('removeItem', 'Remove {name}'), { name: i.name }))}">${esc(S('remove', 'Remove'))}</button>
          </div>
        </div>
        <div class="ci__price">${fmt(lineOf(i))}${tierPct(i) ? `<span class="ci__save">−${tierPct(i)}%</span>` : ''}</div>
      </li>`,
      )
      .join('');
    }, () => (drawer ? $<HTMLElement>('.drawer__close', drawer) : null));
  }

  // pages that mirror the cart (cart page / checkout summary)
  $$('[data-cart-summary]').forEach(renderSummary);

  // checkout: an empty box must not be a dead end at the bottom of a long form
  // (skipped once an order went through: the cart is cleared right before the redirect and must not flash "empty")
  // (also skipped while a submit is in flight, so a re-render from a delivery change or another tab cannot re-enable the button)
  const coForm = $<HTMLFormElement>('form[data-checkout]');
  const coBtn = coForm && !coForm.dataset.done && !coForm.dataset.busy ? coForm.querySelector<HTMLButtonElement>('[type="submit"]') : null;
  const coNote = coForm && !coForm.dataset.done ? $('[data-checkout-note]') : null;
  if (coBtn) coBtn.disabled = c === 0;
  if (coNote) {
    if (c === 0) {
      coNote.textContent = S('emptyBoxAtCheckout', 'Your box is empty — add something from the shop first.');
      coNote.hidden = false;
      coNote.classList.remove('notice--err', 'notice--ok');
      coNote.classList.add('notice');
      coNote.dataset.empty = '1';
    } else if (coNote.dataset.empty) {
      coNote.hidden = true;
      delete coNote.dataset.empty;
    }
  }
}

function renderSummary(root: HTMLElement) {
  const c = cart.count();
  const rows = $('[data-summary-rows]', root);
  const sub = $('[data-summary-subtotal]', root);
  const ship = $('[data-summary-shipping]', root);
  const tot = $('[data-summary-total]', root);
  const emptyEl = $('[data-summary-empty]', root);
  const full = $('[data-summary-full]', root);
  const total = cart.subtotal();
  const shipping = shippingFor(total, root.dataset);
  if (emptyEl) emptyEl.hidden = c > 0;
  if (full) full.hidden = c === 0;
  const cta = $<HTMLAnchorElement>('[data-summary-checkout]', root);
  if (cta) (cta.classList.toggle('is-disabled', c === 0), cta.setAttribute('aria-disabled', String(c === 0)), (cta.tabIndex = c === 0 ? -1 : 0));
  if (rows)
    renderKeepingFocus(
      rows,
      () => {
        rows.innerHTML = cart.items
          .map(
            (i) => `<li class="ci" data-id="${esc(i.id)}">
        <a class="ci__img" href="${esc(i.url)}" aria-label="${esc(i.name)}"><img src="${esc(i.image)}" alt="" width="72" height="72" loading="lazy" /></a>
        <div><div class="ci__name">${esc(i.name)}</div><div class="ci__var">${esc(i.variantLabel)}${i.note ? ` · ${esc(i.note)}` : ''}</div>
        <div class="ci__ctl"><div class="qty" role="group" aria-label="${esc(interp(S('qtyOf', 'Quantity of {name}'), { name: i.name }))}"><button type="button" data-dec aria-label="${esc(interp(S('qtyDec', 'Decrease quantity of {name}'), { name: i.name }))}">−</button><output aria-label="${esc(S('qtyLabel', 'Quantity'))}">${i.qty}</output><button type="button" data-inc aria-label="${esc(interp(S('qtyInc', 'Increase quantity of {name}'), { name: i.name }))}">+</button></div><button type="button" class="ci__rm" data-rm aria-label="${esc(interp(S('removeItem', 'Remove {name}'), { name: i.name }))}">${esc(S('remove', 'Remove'))}</button></div></div>
        <div class="ci__price">${fmt(lineOf(i))}${tierPct(i) ? `<span class="ci__save">−${tierPct(i)}%</span>` : ''}</div></li>`,
          )
          .join('');
      },
      // last row removed: the empty-state link, else the checkout button
      () => $<HTMLElement>('[data-summary-empty]:not([hidden]) a[href], [data-summary-checkout]', root),
    );
  if (sub) sub.textContent = fmt(total);
  if (ship) ship.textContent = c === 0 ? '—' : shipping === 0 ? S('free', 'Free') : fmt(shipping);
  if (tot) tot.textContent = fmt(total + shipping);
  const hidden = $<HTMLInputElement>('[data-cart-json]', root);
  if (hidden) hidden.value = JSON.stringify({ items: cart.items, subtotal: total, shipping, total: total + shipping });
}

/** Everything outside the dialog becomes inert while it is open, so Tab and screen readers stay inside. */
function setInertOutside(on: boolean, keep: Element[]) {
  Array.from(document.body.children).forEach((el) => {
    if (el.tagName === 'SCRIPT' || keep.includes(el)) return;
    el.toggleAttribute('inert', on);
  });
}
export function openCart() {
  if (!drawer) return;
  closeNav();
  lastFocus = document.activeElement as HTMLElement;
  renderCart();
  drawer.hidden = false;
  document.body.style.overflow = 'hidden';
  setInertOutside(true, [drawer, $('#toast')!, $('#cart-live')!].filter(Boolean));
  $<HTMLElement>('.drawer__close', drawer)?.focus();
}
export function closeCart() {
  if (!drawer || drawer.hidden) return;
  drawer.hidden = true;
  document.body.style.overflow = '';
  setInertOutside(false, []);
  lastFocus?.focus();
}

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('#cart-open')) {
    e.preventDefault();
    openCart();
    return;
  }
  if (t.closest('[data-cart-close]')) {
    closeCart();
    return;
  }
  const row = t.closest<HTMLElement>('.ci');
  if (row) {
    const id = row.dataset.id!;
    const it = cart.items.find((i) => i.id === id);
    if (!it) return;
    if (t.closest('[data-inc]')) cart.setQty(id, it.qty + 1), announce(interp(S('qtyAnnounce', '{name}: quantity {qty}'), { name: it.name, qty: it.qty }));
    else if (t.closest('[data-dec]'))
      cart.setQty(id, it.qty - 1),
        announce(it.qty > 0 ? interp(S('qtyAnnounce', '{name}: quantity {qty}'), { name: it.name, qty: it.qty }) : interp(S('removed', 'Removed {name}'), { name: it.name }));
    else if (t.closest('[data-rm]')) cart.remove(id), announce(interp(S('removed', 'Removed {name}'), { name: it.name }));
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCart();
    closeNav();
    return;
  }
  // Wrap Tab inside the open cart dialog (the rest of the page is inert, so this is the only place focus can go).
  if (e.key === 'Tab' && drawer && !drawer.hidden) {
    const f = $$<HTMLElement>('a[href], button, input, select, textarea, [tabindex]', drawer).filter((el) => el.tabIndex >= 0 && !(el as HTMLButtonElement).disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1], cur = document.activeElement;
    if (e.shiftKey && (cur === first || !drawer.contains(cur))) (e.preventDefault(), last.focus());
    else if (!e.shiftKey && (cur === last || !drawer.contains(cur))) (e.preventDefault(), first.focus());
  }
});
document.addEventListener('cart:change', renderCart);
// Another tab changed the cart (the storage event only fires in the tabs that did not write).
window.addEventListener('storage', (e) => {
  if (e.key === KEY || e.key === null) {
    cart.load();
    renderCart();
  }
});

/* ------------------------------------------------------------ add to cart */
function parseAdd(el: HTMLElement): Omit<CartItem, 'qty'> | null {
  try {
    const d = JSON.parse(el.dataset.add || '{}');
    if (!d.slug) return null;
    return {
      id: d.id || `${d.slug}:${d.variant || 'default'}`,
      slug: d.slug,
      name: d.name,
      variant: d.variant || 'default',
      variantLabel: d.variantLabel || '',
      price: Number(d.price),
      image: d.image,
      weight: Number(d.weight || 0),
      url: d.url || `/products/${d.slug}/`,
      note: d.note,
      tier: d.tier !== false,
    };
  } catch {
    return null;
  }
}

document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-add]');
  if (!btn) return;
  e.preventDefault();
  const item = parseAdd(btn);
  if (!item) return;
  // The sticky buy bar sits outside [data-pdp] but must honour the same quantity field.
  const scope = btn.closest('[data-pdp]') || (btn.closest('[data-sticky-buy]') ? $('[data-pdp]') : null);
  const qtyEl = scope?.querySelector<HTMLInputElement>('[data-qty-input]');
  const qty = qtyEl ? Math.max(1, Number(qtyEl.value) || 1) : 1;
  cart.add(item, qty);
  btn.classList.add('is-done');
  window.setTimeout(() => btn.classList.remove('is-done'), 1200);
  if (btn.dataset.addOpen !== 'false') openCart();
  else toast(interp(S('addedToBox', 'Added {name} to your box'), { name: `${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''}` }));
  // A quick add inside the drawer hides its own row (the item is in the box now): hand focus to the next quick add, else Close.
  if (drawer && drawer.contains(btn) && btn.offsetParent === null) ($('#cart-upsell li:not([hidden]) [data-add]') || $('.drawer__close', drawer))?.focus();
});

/* -------------------------------------------------------------------- nav */
const navToggle = $('#nav-toggle');
const nav = $('#nav');
const scrim = $('#nav-scrim');
function openNav() {
  nav?.classList.add('is-open');
  navToggle?.setAttribute('aria-expanded', 'true');
  if (scrim) scrim.hidden = false;
  document.body.style.overflow = 'hidden';
  $$('main, footer, .crumbs').forEach((el) => el.setAttribute('inert', ''));
  window.setTimeout(() => $<HTMLElement>('.hdr__nav-close', nav || undefined)?.focus(), 30);
}
function closeNav() {
  if (!nav?.classList.contains('is-open')) return;
  nav.classList.remove('is-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  if (scrim) scrim.hidden = true;
  document.body.style.overflow = '';
  $$('main, footer, .crumbs').forEach((el) => el.removeAttribute('inert'));
  if (nav.contains(document.activeElement)) navToggle?.focus();
}
navToggle?.addEventListener('click', () => (nav?.classList.contains('is-open') ? closeNav() : openNav()));
scrim?.addEventListener('click', closeNav);
$$('[data-nav-close]').forEach((b) => b.addEventListener('click', closeNav));

/* ---------------------------------------------------------- sticky header */
const hdr = $('#hdr');
const onScroll = () => hdr?.classList.toggle('is-stuck', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ------------------------------------------------------------------ reveal */
// Both shapes of the same idea: a block that fades in, and a grid whose children fade in one after another.
const revealEls = $$('[data-reveal], [data-stagger]');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          (en.target as HTMLElement).classList.add('is-in');
          io.unobserve(en.target);
        }
      }
    },
    // Threshold zero: a block taller than the viewport (a legal page's body) can never reach an 8% ratio and would stay unrevealed for good.
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );
  revealEls.forEach((el) => io.observe(el));
} else revealEls.forEach((el) => el.classList.add('is-in'));

/* ------------------------------------------------------------ product page */
const pdp = $('[data-pdp]');
if (pdp) {
  // Only the elements that belong to this product: skip the related-product
  // cards (they carry their own data-price / data-add) and the variant radios.
  const notCard = (el: Element) => !el.closest('[data-product-card]') && !el.matches('input');
  const priceEls = $$('[data-price]').filter(notCard);
  const nameEls = $$('[data-variant-name]').filter(notCard);
  const gtinEl = $('[data-gtin]', pdp);
  const addBtns = $$('[data-add]').filter(notCard);
  const mainImg = $<HTMLImageElement>('[data-gal-main]', pdp);
  const thumbs = $$<HTMLButtonElement>('[data-gal-thumb]', pdp);
  const qtyIn = $<HTMLInputElement>('[data-qty-input]', pdp);

  const showThumb = (b: HTMLButtonElement) => {
    if (mainImg) {
      mainImg.src = b.dataset.src || '';
      mainImg.alt = b.dataset.alt || '';
      mainImg.closest('[data-gal-wrap]')?.classList.toggle('is-contain', b.dataset.fit === 'contain');
    }
    thumbs.forEach((t) => t.setAttribute('aria-pressed', String(t === b)));
  };

  /** `syncUrl` only on a user change: the initial call must not append ?flavour= to every product URL that gets shared or tracked. */
  const applyVariant = (input: HTMLInputElement, syncUrl = false) => {
    const price = Number(input.dataset.price);
    const label = input.dataset.label || '';
    // A flavour with its own pack photograph shows it, as picking its thumbnail would.
    const own = input.dataset.src ? thumbs.find((t) => t.dataset.src === input.dataset.src) : undefined;
    if (own) showThumb(own);
    priceEls.forEach((el) => (el.textContent = fmt(price)));
    nameEls.forEach((el) => (el.textContent = label));
    if (gtinEl) gtinEl.textContent = input.dataset.gtin || '—';
    addBtns.forEach((b) => {
      try {
        const d = JSON.parse(b.dataset.add || '{}');
        d.variant = input.value;
        d.variantLabel = label;
        d.price = price;
        d.id = `${d.slug}:${input.value}`;
        b.dataset.add = JSON.stringify(d);
      } catch {
        /* ignore */
      }
    });
    if (syncUrl) {
      const url = new URL(location.href);
      url.searchParams.set('flavour', input.value);
      history.replaceState(null, '', url);
    }
  };
  const radios = $$<HTMLInputElement>('[data-variant]', pdp);
  radios.forEach((r) => r.addEventListener('change', () => applyVariant(r, true)));
  const preset = new URL(location.href).searchParams.get('flavour');
  const initial = radios.find((r) => r.value === preset) || radios.find((r) => r.checked) || radios[0];
  if (initial) {
    initial.checked = true;
    applyVariant(initial);
  }

  thumbs.forEach((b) => b.addEventListener('click', () => showThumb(b)));

  const clampQty = (v: number) => Math.max(1, Math.min(99, Math.round(v) || 1));
  pdp.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (!qtyIn) return;
    if (t.closest('[data-qty-inc]')) qtyIn.value = String(clampQty(Number(qtyIn.value) + 1));
    if (t.closest('[data-qty-dec]')) qtyIn.value = String(clampQty(Number(qtyIn.value) - 1));
  });
  qtyIn?.addEventListener('change', () => (qtyIn.value = String(clampQty(Number(qtyIn.value)))));

  // sticky buy bar appears once the main buy button has scrolled above the viewport;
  // aria-hidden follows visibility so its button is never exposed while it is off-screen.
  // A plain scroll check rather than an IntersectionObserver: on phones the buy row starts below the
  // fold, and an instant jump past it (hash link, back-navigation restoring the scroll position)
  // never intersects, so the observer would never fire and the bar would stay hidden.
  const bar = $('[data-sticky-buy]');
  const anchor = $('[data-buy-anchor]', pdp);
  if (bar && anchor) {
    const syncBar = () => {
      const on = anchor.getBoundingClientRect().bottom < 0;
      bar.classList.toggle('is-visible', on);
      bar.setAttribute('aria-hidden', String(!on));
    };
    syncBar();
    window.addEventListener('scroll', syncBar, { passive: true });
    window.addEventListener('resize', syncBar);
    window.addEventListener('pageshow', syncBar);
  }
}

/* -------------------------------------------------------------- shop page */
const shop = $('[data-shop]');
if (shop) {
  const cards = $$<HTMLElement>('[data-product-card]', shop);
  const grid = $('[data-shop-grid]', shop);
  const countEl = $('[data-shop-count]', shop);
  const emptyEl = $('[data-shop-empty]', shop);
  const sortSel = $<HTMLSelectElement>('[data-sort]', shop);
  const searchIn = $<HTMLInputElement>('[data-search]', shop);
  const state = { collection: shop.dataset.collection || 'all', diet: new Set<string>(), q: '', sort: 'featured' };

  const url = new URL(location.href);
  state.q = (url.searchParams.get('q') || '').trim().toLowerCase();
  if (searchIn && state.q) searchIn.value = state.q;
  // Filters and sort live in the URL too, so a filtered view can be shared and survives back navigation.
  const collections = new Set($$<HTMLElement>('[data-filter-collection]', shop).map((b) => b.dataset.filterCollection));
  const diets = new Set($$<HTMLElement>('[data-filter-diet]', shop).map((b) => b.dataset.filterDiet));
  // Collection pages carry the collection in their path (/shop/meringues/); only the all-products page keeps it as ?collection=.
  const pathCollection = (shop.dataset.collection || 'all') !== 'all';
  const c0 = url.searchParams.get('collection');
  if (c0 && collections.has(c0) && !pathCollection) state.collection = c0;
  (url.searchParams.get('diet') || '').split(',').filter((d) => diets.has(d)).forEach((d) => state.diet.add(d));
  const s0 = url.searchParams.get('sort');
  if (sortSel && s0 && Array.from(sortSel.options).some((o) => o.value === s0)) (state.sort = s0), (sortSel.value = s0);
  const syncUrl = () => {
    const u = new URL(location.href);
    const set = (k: string, v: string) => (v ? u.searchParams.set(k, v) : u.searchParams.delete(k));
    set('q', state.q);
    set('collection', state.collection === 'all' || pathCollection ? '' : state.collection);
    set('diet', [...state.diet].join(','));
    set('sort', state.sort === 'featured' ? '' : state.sort);
    if (u.href !== location.href) history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
  };

  const apply = () => {
    let visible = 0;
    const arr = cards.slice();
    // A card with no kcal figure (none declared, or a mixed box) must sink to the end of "Lowest calories", not top it.
    // The shop pages do not offer that sort while most products have no declared figure; the case stays for when they do.
    const key = (c: HTMLElement) => ({ price: Number(c.dataset.price), order: Number(c.dataset.order), name: c.dataset.name || '', best: c.dataset.best === '1' ? 0 : 1, kcal: Number(c.dataset.kcal) || Infinity });
    arr.sort((a, b) => {
      const A = key(a), B = key(b);
      switch (state.sort) {
        case 'price-asc': return A.price - B.price;
        case 'price-desc': return B.price - A.price;
        case 'name': return A.name.localeCompare(B.name);
        case 'kcal': return A.kcal - B.kcal;
        default: return A.best - B.best || A.order - B.order;
      }
    });
    arr.forEach((c) => {
      const okC = state.collection === 'all' || c.dataset.collection === state.collection;
      const diets = (c.dataset.diet || '').split(' ');
      const okD = [...state.diet].every((d) => diets.includes(d));
      const hay = `${c.dataset.name} ${c.dataset.collection} ${c.dataset.flavours} ${c.dataset.hook} ${c.dataset.diet}`.toLowerCase();
      const okQ = !state.q || hay.includes(state.q);
      const show = okC && okD && okQ;
      c.hidden = !show;
      if (show) visible++;
      grid?.appendChild(c);
    });
    if (countEl) countEl.textContent = interp(P('productCount', visible, '{n} products'), { n: visible });
    if (emptyEl) emptyEl.hidden = visible > 0;
    $$('[data-filter-collection]', shop).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filterCollection === state.collection)));
    $$('[data-filter-diet]', shop).forEach((b) => b.setAttribute('aria-pressed', String(state.diet.has(b.dataset.filterDiet!))));
    syncUrl();
  };

  shop.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const c = t.closest<HTMLElement>('[data-filter-collection]');
    if (c) {
      e.preventDefault();
      state.collection = c.dataset.filterCollection!;
      apply();
    }
    const d = t.closest<HTMLElement>('[data-filter-diet]');
    if (d) {
      const k = d.dataset.filterDiet!;
      state.diet.has(k) ? state.diet.delete(k) : state.diet.add(k);
      apply();
    }
    if (t.closest('[data-filter-reset]')) {
      state.collection = 'all';
      state.diet.clear();
      state.q = '';
      if (searchIn) searchIn.value = '';
      apply();
    }
  });
  sortSel?.addEventListener('change', () => {
    state.sort = sortSel.value;
    apply();
  });
  searchIn?.addEventListener('input', () => {
    state.q = searchIn.value.trim().toLowerCase();
    apply();
  });
  searchIn?.closest('form')?.addEventListener('submit', (e) => e.preventDefault());
  apply();
}

/* --------------------------------------------------------- bundle builder */
const builder = $('[data-builder]');
if (builder) {
  const size = Number(builder.dataset.size || 6);
  const discount = Number(builder.dataset.discount || 0.1);
  const picks: { id: string; name: string; price: number; image: string; weight: number }[] = [];
  const slots = $$('[data-builder-slot]', builder);
  const countEl = $('[data-builder-count]', builder);
  const priceEl = $('[data-builder-price]', builder);
  const wasEl = $('[data-builder-was]', builder);
  const addBtn = $<HTMLButtonElement>('[data-builder-add]', builder);
  const listEl = $('[data-builder-list]', builder);

  const render = () => {
    slots.forEach((s, i) => {
      const p = picks[i];
      s.classList.toggle('is-filled', !!p);
      s.innerHTML = p ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" />` : '';
    });
    const full = picks.reduce((n, p) => n + p.price, 0);
    const price = full * (1 - discount);
    if (countEl) countEl.textContent = `${picks.length} / ${size}`;
    if (priceEl) priceEl.textContent = fmt(price);
    if (wasEl) wasEl.textContent = picks.length ? fmt(full) : '';
    if (addBtn) addBtn.disabled = picks.length !== size;
    if (listEl)
      listEl.innerHTML = picks
        .map((p, i) => `<li>${esc(p.name)} <button type="button" class="ci__rm" data-builder-rm="${i}" aria-label="${esc(interp(S('removeItem', 'Remove {name}'), { name: p.name }))}">${esc(S('removeSmall', 'remove'))}</button></li>`)
        .join('');
    $$('[data-builder-pick]', builder).forEach((b) => ((b as HTMLButtonElement).disabled = picks.length >= size));
  };

  builder.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const pick = t.closest<HTMLElement>('[data-builder-pick]');
    if (pick && picks.length < size) {
      picks.push({ id: pick.dataset.id!, name: pick.dataset.name!, price: Number(pick.dataset.price), image: pick.dataset.image!, weight: Number(pick.dataset.weight || 0) });
      render();
    }
    const rm = t.closest<HTMLElement>('[data-builder-rm]');
    if (rm) {
      picks.splice(Number(rm.dataset.builderRm), 1);
      render();
    }
    if (t.closest('[data-builder-add]') && picks.length === size) {
      const counts = new Map<string, number>();
      picks.forEach((p) => counts.set(p.name, (counts.get(p.name) || 0) + 1));
      const note = [...counts].map(([n, c]) => `${c}× ${n}`).join(', ');
      const full = picks.reduce((n, p) => n + p.price, 0);
      const key = picks.map((p) => p.id).sort().join('+');
      cart.add({
        id: `bundle:${key}`,
        slug: 'build-your-box',
        name: interp(S('nPieceBox', 'Your {size}-piece box'), { size }),
        variant: 'custom',
        variantLabel: interp(S('bundleDiscount', '{pct}% bundle discount'), { pct: Math.round(discount * 100) }),
        price: Math.round(full * (1 - discount) * 100) / 100,
        image: builder.dataset.image || picks[0].image,
        weight: picks.reduce((n, p) => n + p.weight, 0),
        url: '/shop/build-your-box/',
        note,
        // The box carries its own discount; the volume ladder does not stack on it, here or in the Worker.
        tier: false,
      });
      picks.length = 0;
      render();
      openCart();
    }
  });
  render();
}

/* ---------------------------------------------------------------- forms */
async function post(payload: Record<string, unknown>) {
  const res = await fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  let data: { ok?: boolean; ref?: string; reason?: string } = {};
  try {
    data = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok || !data.ok) throw Object.assign(new Error(data.reason || `HTTP ${res.status}`), { data, status: res.status });
  return data;
}

function formData(form: HTMLFormElement) {
  const o: Record<string, unknown> = {};
  new FormData(form).forEach((v, k) => (o[k] = typeof v === 'string' ? v.trim() : v));
  return o;
}

function mailtoFallback(subject: string, body: string) {
  if (!CFG.email) return;
  location.href = `mailto:${CFG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

$$<HTMLFormElement>('form[data-form]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = form.dataset.form!;
    const btn = form.querySelector<HTMLButtonElement>('[type="submit"]');
    const note = form.querySelector<HTMLElement>('[data-form-note]') || (form.nextElementSibling?.matches('[data-form-note]') ? (form.nextElementSibling as HTMLElement) : null);
    const data = formData(form);
    if (data.website) return; // honeypot
    if (btn) (btn.disabled = true), (btn.dataset.label = btn.textContent || ''), (btn.textContent = S('sending', 'Sending…'));
    try {
      await post({ type, ...data, page: location.pathname, locale: CFG.locale || 'en' });
      form.reset();
      const msg = form.dataset.success || S('contactSuccess', 'Thanks — we’ll be in touch shortly.');
      if (note) (note.textContent = msg), note.classList.add('notice', 'notice--ok');
      toast(msg);
    } catch (err) {
      const subject = `${type} via semers.org`;
      const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
      const msg = interp(S('mailFallback', 'We could not send this automatically. Opening your e-mail app instead{via}.'), { via: CFG.email ? ` — ${CFG.email}` : '' });
      if (note) (note.textContent = msg), note.classList.add('notice', 'notice--err');
      toast(msg, 4000);
      mailtoFallback(subject, body);
    } finally {
      if (btn) (btn.disabled = false), (btn.textContent = btn.dataset.label || 'Send');
    }
  });
});

/* --------------------------------------------------------- parcel lockers */

interface Locker {
  id: string;
  name: string;
  city: string;
  address: string;
  country: string;
}

/** Lower case with the accents gone, so "riga" finds Rīga and "siauliai" finds Šiauliai. */
const fold = (v: string) => v.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
/** A list longer than this is a wall; the status line says how many more there are. */
const LOCKER_MAX = 8;

/**
 * The Omniva parcel-locker picker: a combobox over /api/lockers.
 *
 * Type a city or a street and the matching lockers in the chosen country list
 * under the field; arrow keys move through them, Enter or a click chooses one,
 * Escape closes the list, and a polite live region says how many matched. The
 * choice fills three hidden fields — the address line "Omniva: <name> (<id>)",
 * the locker id and its city — which is all the order needs.
 *
 * If the list cannot be loaded, the picker gives way to a plain text field and
 * a short note, so a locker can still be named in words; the shop checks it
 * before sending. An order never waits on Omniva's feed.
 */
function lockerPicker(form: HTMLFormElement) {
  const root = $('[data-locker-fields]', form);
  const q = root ? $<HTMLInputElement>('[data-locker-q]', root) : null;
  const list = root ? $<HTMLUListElement>('[data-locker-list]', root) : null;
  if (!root || !q || !list) return null;
  const status = $('[data-locker-status]', root);
  const chosenEl = $('[data-locker-chosen]', root);
  const picker = $('[data-locker-picker]', root);
  const manual = $('[data-locker-manual]', root);
  const manualIn = $<HTMLInputElement>('[data-locker-text]', root);
  const hidden = [$<HTMLInputElement>('[data-locker-address]', root), $<HTMLInputElement>('[data-locker-id]', root), $<HTMLInputElement>('[data-locker-city]', root)];
  const [hAddress, hId, hCity] = hidden;

  let all: Locker[] | null = null;
  let failed = false;
  let loading = false;
  let on = false;
  let country = '';
  let chosen: Locker | null = null;
  let shown: Locker[] = [];
  let cursor = -1;

  const say = (msg: string) => {
    if (status) status.textContent = msg;
  };

  /** Which fields exist for the form right now: the picker's, the fallback's, or none. */
  const apply = () => {
    const typed = on && failed;
    const picking = on && !failed;
    if (picker) picker.hidden = typed;
    if (manual) manual.hidden = !typed;
    q.disabled = !picking;
    if (manualIn) (manualIn.disabled = !typed), (manualIn.required = typed);
    hidden.forEach((el) => el && (el.disabled = !(picking && chosen)));
    // The hidden fields cannot be `required`, so the visible one carries the rule.
    q.setCustomValidity(picking && !chosen ? S('lockerChoose', 'Choose a parcel locker from the list.') : '');
  };

  const close = () => {
    list.hidden = true;
    q.setAttribute('aria-expanded', 'false');
    q.removeAttribute('aria-activedescendant');
    cursor = -1;
  };

  const highlight = (i: number) => {
    cursor = i;
    const opts = $$<HTMLElement>('[role="option"]', list);
    opts.forEach((li, k) => li.setAttribute('aria-selected', String(k === i)));
    const el = opts[i];
    if (el) {
      q.setAttribute('aria-activedescendant', el.id);
      el.scrollIntoView({ block: 'nearest' });
    } else q.removeAttribute('aria-activedescendant');
  };

  const search = () => {
    if (!all) return;
    const typedText = q.value.trim();
    const terms = fold(typedText).split(/\s+/).filter(Boolean);
    if (!terms.length) {
      shown = [];
      list.innerHTML = '';
      close();
      say('');
      return;
    }
    const hits = all.filter((l) => (!country || l.country === country) && terms.every((t) => fold(`${l.name} ${l.city} ${l.address}`).includes(t)));
    shown = hits.slice(0, LOCKER_MAX);
    list.innerHTML = shown
      .map(
        (l, i) =>
          `<li class="co-locker__opt" role="option" id="co-locker-opt-${i}" aria-selected="false" data-i="${i}"><strong>${esc(l.name)}</strong><span>${esc([l.address, l.city].filter(Boolean).join(', '))}</span></li>`,
      )
      .join('');
    list.hidden = !shown.length;
    q.setAttribute('aria-expanded', String(shown.length > 0));
    q.removeAttribute('aria-activedescendant');
    cursor = -1;
    say(
      !hits.length
        ? interp(S('lockersNone', 'No parcel locker matches “{q}”. Try a city or a street name.'), { q: typedText })
        : hits.length > LOCKER_MAX
          ? interp(S('lockersMore', 'Showing the first {shown} of {n}. Type more to narrow the list.'), { shown: LOCKER_MAX, n: hits.length })
          : interp(S('lockersFound', 'Parcel lockers found: {n}'), { n: hits.length }),
    );
  };

  const choose = (l: Locker) => {
    chosen = l;
    q.value = l.name;
    if (hAddress) hAddress.value = `Omniva: ${l.name} (${l.id})`;
    if (hId) hId.value = l.id;
    if (hCity) hCity.value = l.city;
    if (chosenEl) {
      chosenEl.innerHTML = `<span class="muted">${esc(S('lockerYours', 'Your parcel locker:'))}</span> <strong>${esc(l.name)}</strong> <span>${esc([l.address, l.city].filter(Boolean).join(', '))} · ${esc(l.id)}</span>`;
      chosenEl.hidden = false;
    }
    close();
    say(interp(S('lockerChosen', 'Chosen: {name}.'), { name: l.name }));
    apply();
  };

  const clear = () => {
    chosen = null;
    hidden.forEach((el) => el && (el.value = ''));
    if (chosenEl) (chosenEl.hidden = true), (chosenEl.textContent = '');
    apply();
  };

  const load = () => {
    if (all || failed || loading) return;
    loading = true;
    say(S('lockersLoading', 'Loading parcel lockers…'));
    fetch('/api/lockers', { headers: { accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: unknown) => {
        const rows = (Array.isArray(d) ? d : []).filter((l): l is Locker => !!l && typeof l.id === 'string' && typeof l.name === 'string' && typeof l.country === 'string');
        if (!rows.length) throw new Error('no lockers');
        all = rows.map((l) => ({ id: l.id, name: l.name, city: String(l.city || ''), address: String(l.address || ''), country: l.country }));
        say('');
        if (!chosen && q.value.trim() && document.activeElement === q) search();
      })
      .catch(() => {
        failed = true;
        close();
        say(S('lockersFailed', 'The list of parcel lockers did not load. Type the locker’s name or address instead — we check it before sending.'));
        apply();
      })
      .finally(() => (loading = false));
  };

  q.addEventListener('input', () => {
    if (chosen && q.value !== chosen.name) clear();
    search();
  });
  q.addEventListener('focus', () => {
    if (!chosen && q.value.trim()) search();
  });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (list.hidden) search();
      if (shown.length) highlight((cursor + 1) % shown.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (shown.length) highlight(cursor <= 0 ? shown.length - 1 : cursor - 1);
    } else if (e.key === 'Enter') {
      // Enter chooses the highlighted locker (or the only one) instead of submitting the form.
      const pick = !list.hidden ? shown[cursor >= 0 ? cursor : shown.length === 1 ? 0 : -1] : undefined;
      if (pick) (e.preventDefault(), choose(pick));
    } else if (e.key === 'Escape' && !list.hidden) {
      // Stop here: the page's own Escape closes the cart drawer and the menu.
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  });
  q.addEventListener('blur', () => window.setTimeout(close, 150));
  // Choosing with the pointer must not take focus out of the field first.
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    const l = li ? shown[Number(li.dataset.i)] : undefined;
    if (l) choose(l);
  });

  return {
    /** Called whenever the method or the country changes. */
    sync(isOn: boolean, code: string) {
      on = isOn;
      if (code !== country) {
        country = code;
        // A locker in another country is not one this parcel can go to.
        if (chosen && chosen.country !== code) (q.value = ''), clear();
        if (all && document.activeElement === q) search();
        else close();
      }
      if (on) load();
      apply();
    },
    /** The chosen locker as the order recap names it. */
    label: () => (chosen ? chosen.name : manualIn && !manualIn.disabled ? manualIn.value.trim() : ''),
  };
}

/* -------------------------------------------------------------- checkout */

/** What the shopper is told when the server refuses the checkout, by the reason it gave. */
function refusal(reason: string | undefined, id?: string) {
  if (reason === 'email') return S('checkEmail', 'Please check the e-mail address and try again.');
  if (reason === 'empty') return S('boxEmptyAdd', 'Your cart is empty — add something first.');
  if (reason === 'address' || reason === 'country' || reason === 'method') return S('checkAddress', 'Please check the delivery details and try again.');
  // A product taken off sale since it went into the cart: name it, so the fix is obvious.
  if ((reason === 'unknown-item' || reason === 'unavailable' || reason === 'price') && id) {
    const item = cart.items.find((i) => i.id === id);
    if (item) return interp(S('itemGone', '“{name}” is no longer available. Remove it from your cart and try again.'), { name: item.name });
  }
  return S('somethingWrong', 'Something went wrong. Please try again.');
}

const checkout = $<HTMLFormElement>('form[data-checkout]');
if (checkout) {
  const lockers = lockerPicker(checkout);
  const addr = $('[data-address-fields]', checkout);
  const lockerBox = $('[data-locker-fields]', checkout);
  const countrySel = $<HTMLSelectElement>('select[name="country"]', checkout);
  const picked = () => countrySel?.selectedOptions[0];

  /** Show a block of fields or take it out of the form: hidden, and disabled so it is neither sent nor validated. */
  const toggle = (block: HTMLElement | null, show: boolean) => {
    if (!block) return;
    block.hidden = !show;
    $$<HTMLInputElement>('input, select, textarea', block).forEach((el) => (el.disabled = !show));
  };

  const syncDelivery = () => {
    // Parcel lockers exist only in the Baltics: elsewhere the option is disabled and the courier takes over.
    const locker = $<HTMLInputElement>('input[data-method="locker"]', checkout);
    const courier = $<HTMLInputElement>('input[data-method="courier"]', checkout);
    const lockerHere = picked()?.dataset.locker === '1';
    if (locker && courier) {
      locker.disabled = !lockerHere;
      locker.closest('label')?.classList.toggle('is-disabled', !lockerHere);
      if (!lockerHere && locker.checked) courier.checked = true;
    }
    const method = deliveryMethod();
    toggle(addr, method === 'courier');
    if (lockerBox) lockerBox.hidden = method !== 'locker';
    lockers?.sync(method === 'locker', picked()?.dataset.code || '');
    renderCart();
  };
  // A change of method or of country changes the fields and the postage in the summary column.
  checkout.addEventListener('change', (e) => {
    const name = (e.target as HTMLInputElement).name;
    if (name === 'delivery' || name === 'country') syncDelivery();
  });
  syncDelivery();

  /** The method as the recap on the thank-you page names it, in the page's language. */
  const deliveryLabel = () => {
    const r = $<HTMLInputElement>('input[name="delivery"]:checked', checkout);
    const title = r?.closest('label')?.querySelector('strong')?.textContent?.trim() || String(r?.value || '');
    const where = deliveryMethod() === 'locker' ? lockers?.label() : '';
    return where ? `${title}: ${where}` : title;
  };

  // The submit button carries an icon, so restore its markup rather than plain text.
  const submitBtn = checkout.querySelector<HTMLButtonElement>('[type="submit"]');
  const submitHtml = submitBtn?.innerHTML || 'Place order';
  const restoreBtn = () => {
    if (!submitBtn) return;
    submitBtn.disabled = cart.count() === 0;
    // paintCheckout keeps the original label on the element, so restoring after
    // a failed attempt gives back "Pay for the order" where that is the truth.
    if (!submitBtn.dataset.label) submitBtn.dataset.label = submitHtml;
    paintCheckout();
  };
  checkout.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (checkout.dataset.busy) return; // one order at a time
    if (cart.count() === 0) {
      toast(S('boxEmptyAdd', 'Your cart is empty — add something first.'));
      return;
    }
    // The form carries `novalidate` (custom field styling), so constraint validation must be run here.
    if (!checkout.reportValidity()) return;
    const btn = checkout.querySelector<HTMLButtonElement>('[type="submit"]');
    const note = $('[data-checkout-note]');
    const data = formData(checkout);
    if (data.website) return;
    const method = deliveryMethod();
    const total = cart.subtotal();
    const shipping = shippingFor(total, checkout.dataset);
    const order = {
      type: 'order',
      customer: data,
      method,
      items: cart.items.map((i) => ({
        id: i.id,
        name: i.name,
        variant: [i.variantLabel, tierPct(i) ? interp(S('tierLine', '−{pct}% for {qty}'), { pct: tierPct(i), qty: i.qty }) : ''].filter(Boolean).join(' · '),
        note: i.note,
        qty: i.qty,
        price: unitOf(i),
        total: lineOf(i),
      })),
      subtotal: Math.round(total * 100) / 100,
      shipping,
      total: Math.round((total + shipping) * 100) / 100,
      currency: CFG.currency,
      page: location.pathname, locale: CFG.locale || 'en',
    };
    const recap = (ref: string) => {
      try {
        // The thank-you page shows a recap; it stays until the tab closes.
        sessionStorage.setItem('semers.lastOrder', JSON.stringify({ ref, items: order.items, subtotal: order.subtotal, shipping, total: order.total, delivery: deliveryLabel(), email: String(data.email || '') }));
      } catch {
        /* private mode: the recap is a nicety */
      }
    };
    const fail = (msg: string) => {
      if (note) (note.textContent = msg), (note.hidden = false), note.classList.add('notice', 'notice--err');
      toast(msg, 5000);
      delete checkout.dataset.busy;
      restoreBtn();
    };
    checkout.dataset.busy = '1';
    if (btn) (btn.disabled = true), (btn.textContent = CFG.payments ? S('openingPayment', 'Opening secure payment…') : S('placingOrder', 'Placing order…'));

    /*
     * Payment. Only the line ids, the quantities and the delivery key go up:
     * the server prices the cart again from the published catalogue, so the
     * totals shown above are what the customer was shown, not what they will
     * be charged — and the two are the same number by construction rather than
     * by trust.
     *
     * The cart is deliberately NOT cleared here. Paysera's cancel link comes
     * back to /cart/, and a shopper who hesitates on the payment page must
     * find their box still packed. The thank-you page empties it on paid=1.
     */
    if (CFG.payments) {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer: data, method, items: cart.items.map((i) => ({ id: i.id, qty: i.qty })), locale: CFG.locale || 'en', page: location.pathname }),
        });
        const paid = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string; ref?: string; reason?: string; id?: string };
        if (paid.ok && paid.url) {
          recap(paid.ref || '');
          location.href = paid.url;
          return;
        }
        // A stale flag — the keys were removed since this page loaded — is the
        // one failure worth falling through for: the order-request path still
        // works and the sale is not lost. Anything else is said out loud,
        // because a shopper who thinks they paid and did not is the worst
        // outcome this form can produce.
        if (paid.reason !== 'not-configured') {
          fail(refusal(paid.reason, paid.id));
          return;
        }
        CFG.payments = false;
        paintCheckout();
      } catch {
        fail(S('somethingWrong', 'Something went wrong. Please try again.'));
        return;
      }
    }

    try {
      const res = await post(order);
      checkout.dataset.done = '1';
      recap(res.ref || '');
      cart.clear();
      location.href = `/order/thank-you/?ref=${encodeURIComponent(res.ref || '')}`;
    } catch (err) {
      const reason = (err as { data?: { reason?: string } })?.data?.reason;
      if (reason === 'email' || reason === 'empty') {
        // The server rejected the request itself; opening a mailto here would send a broken order.
        const msg = refusal(reason);
        if (note) (note.textContent = msg), (note.hidden = false), note.classList.add('notice', 'notice--err');
        toast(msg, 4000);
        restoreBtn();
        return;
      }
      const lines = order.items.map((i) => `${i.qty} × ${i.name}${i.variant ? ` (${i.variant})` : ''}${i.note ? ` — ${i.note}` : ''} = ${fmt(i.total)}`);
      const body = [
        'New order request from semers.org',
        '',
        ...lines,
        '',
        `Subtotal: ${fmt(order.subtotal)}`,
        `Shipping: ${shipping ? fmt(shipping) : 'free'}`,
        `Total: ${fmt(order.total)}`,
        `Delivery: ${method === 'courier' ? 'Courier' : 'Omniva parcel locker'}`,
        '',
        ...Object.entries(data).filter(([k, v]) => k !== 'website' && String(v).trim()).map(([k, v]) => `${k}: ${v}`),
        // The shop reads this draft, so it is written in English — but the
        // language the customer was reading is the language to reply in.
        `Language: ${(CFG.locale || 'en').toUpperCase()}`,
      ].join('\n');
      const via = CFG.email ? interp(S('mailtoVia', ' (if nothing opened, write to {email})'), { email: CFG.email }) : '';
      const msg = interp(
        reason === 'not-configured'
          ? S('orderMailNotLive', 'Online ordering is not live yet — we opened an e-mail with your order instead{via}. Your box is saved; we reply within one business day.')
          : S('orderMailFailed', 'We could not place the order automatically — we opened an e-mail with your order instead{via}. Your box is saved; we reply within one business day.'),
        { via },
      );
      if (note) (note.textContent = msg), (note.hidden = false), note.classList.add('notice', 'notice--err');
      toast(msg, 5000);
      mailtoFallback('Order request via semers.org', body);
      restoreBtn();
    } finally {
      delete checkout.dataset.busy;
    }
  });
  // Back from the thank-you page (or from Paysera) can restore this page from the bfcache mid-submit: reset for a fresh attempt.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    delete checkout.dataset.done;
    delete checkout.dataset.busy;
    restoreBtn();
    cart.load();
    renderCart();
  });
}

/* ----------------------------------------------------------------- misc */
$$('[data-copy]').forEach((b) =>
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy || '');
      toast(S('copied', 'Copied'));
    } catch {
      /* ignore */
    }
  }),
);

$$('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));

renderCart();
export {};

/* ------------------------------------------------- storefront settings & reviews */

/**
 * Everything below is the runtime half of the admin: one request that tells the
 * built page what the owner has changed since it was built — the announcement
 * strip, the free-shipping threshold, the volume ladder, the promise beside the
 * button, per-product prices and availability, and the reviews for this product.
 *
 * The page is already correct without it: every value has a build-time default,
 * so a slow or failed request leaves the shop exactly as it shipped.
 */
interface StorefrontOverride {
  price: number | null;
  compareAt: number | null;
  inStock: boolean | null;
  hidden: boolean | null;
  badge: string;
  batch: string;
  note: string;
}
interface StorefrontData {
  settings: Record<string, string | number | boolean>;
  /** Whether the Worker can take a payment. The button must not promise a payment page that is not there. */
  payments?: boolean;
  products: Record<string, StorefrontOverride>;
  reviews: Record<string, { count: number; avg: number }>;
}

const STORE_KEY = 'semers.storefront.v1';

/** Rewrite a [data-add] payload in place, keeping every field we did not mean to touch. */
function patchAdd(el: HTMLElement, patch: Record<string, unknown>) {
  try {
    el.dataset.add = JSON.stringify({ ...JSON.parse(el.dataset.add || '{}'), ...patch });
  } catch {
    /* a payload we cannot parse is one we must not rewrite */
  }
}

/**
 * The owner writes one setting per language. A language left blank falls back
 * to English, which is better than an empty banner and honest about what was
 * actually written.
 */
function forLocale(st: Record<string, unknown>, key: string): string {
  const suffix = CFG.locale === 'ru' ? 'Ru' : CFG.locale === 'lv' ? 'Lv' : '';
  return String((suffix && st[key + suffix]) || st[key] || '');
}

/**
 * The owner types a path like "/shop/". The build's link pass cannot reach a
 * link that does not exist until the settings arrive, so the locale is applied
 * here, by the same rules: an absolute path that is not already localised, not
 * an asset and not a file.
 */
function localeHref(href: string): string {
  if (!CFG.locale || CFG.locale === 'en') return href;
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (href === `/${CFG.locale}` || href.startsWith(`/${CFG.locale}/`)) return href;
  if (/^\/(api|_astro|fonts|img|admin)\//.test(href)) return href;
  if (href.slice(1).split(/[/?#]/)[0].includes('.')) return href;
  return `/${CFG.locale}${href}`;
}

/**
 * The banner href arrives over the network, so it is checked here as well as in
 * the Worker that stores it. Setting `a.href` to a `javascript:` URL is script
 * execution, and a cached response or a second writer is enough to make that
 * matter — the check costs one line and does not depend on the other one.
 */
function safeHref(href: string): string {
  if (!href || href.startsWith('//')) return '';
  if (href.startsWith('/')) return href;
  return /^(https?:\/\/|mailto:|tel:)/i.test(href) ? href : '';
}

function applyAnnouncement(text: string, rawHref: string, on: boolean) {
  const bar = $('[data-announce]');
  const slot = $('[data-announce-text]');
  if (!bar || !slot) return;
  const show = !!(on && text);
  bar.hidden = !show;
  if (!show) return;
  slot.textContent = '';
  const href = safeHref(rawHref);
  if (href) {
    const a = document.createElement('a');
    a.href = localeHref(href);
    a.textContent = text;
    slot.appendChild(a);
  } else {
    slot.textContent = text;
  }
}

function applyOverrideToCards(products: Record<string, StorefrontOverride>) {
  $$<HTMLElement>('[data-product-card][data-slug]').forEach((card) => {
    const o = products[card.dataset.slug || ''];
    if (!o) return;
    if (o.hidden) {
      card.remove();
      return;
    }
    if (o.price != null) {
      const el = $('[data-card-price]', card);
      if (el) el.textContent = fmt(o.price);
      card.dataset.price = String(o.price);
      const add = card.querySelector<HTMLElement>('[data-add]');
      if (add) patchAdd(add, { price: o.price });
    }
    const cmp = $<HTMLElement>('[data-card-compare]', card);
    if (cmp && o.compareAt != null) (cmp.textContent = fmt(o.compareAt)), (cmp.hidden = false);
    const btn = card.querySelector<HTMLButtonElement>('[data-add]');
    if (btn && o.inStock === false) {
      btn.disabled = true;
      btn.setAttribute('aria-label', S('soldOut', 'Sold out'));
      card.classList.add('is-soldout');
    }
  });
}

function applyOverrideToPdp(pdpEl: HTMLElement, o: StorefrontOverride) {
  const notCard = (el: Element) => !el.closest('[data-product-card]') && !el.matches('input');
  if (o.price != null) {
    // The radios carry the price the variant picker reads, so they have to move
    // with the displayed price or the next flavour click would undo the override.
    $$<HTMLInputElement>('[data-variant]', pdpEl).forEach((r) => (r.dataset.price = String(o.price)));
    $$('[data-price]').filter(notCard).forEach((el) => (el.textContent = fmt(o.price as number)));
    $$('[data-add]').filter(notCard).forEach((el) => patchAdd(el, { price: o.price }));
    $$<HTMLElement>('[data-tier]', pdpEl).forEach((b) => {
      const unit = $('[data-tier-unit]', b);
      const pct = Number(b.dataset.tierPct) || 0;
      if (unit) unit.textContent = fmt(Math.round((o.price as number) * (100 - pct)) / 100);
    });
  }
  if (o.batch) {
    const li = $('[data-batch]');
    const txt = $('[data-batch-text]');
    if (li && txt) (txt.textContent = o.batch), (li.hidden = false);
  }
  if (o.inStock === false) {
    $$<HTMLButtonElement>('[data-add]')
      .filter(notCard)
      .forEach((b) => {
        b.disabled = true;
        b.textContent = S('soldOut', 'Sold out');
      });
    // A dead button is a lost visit, so the out-of-stock notice (with the shop's
    // e-mail address; nothing on the page collects one) takes its place. The
    // ladder and the promise are about buying now, so they go away with the button.
    const notice = $('[data-restock]');
    if (notice) notice.hidden = false;
    $('[data-tiers]')?.setAttribute('hidden', '');
    const promise = $('[data-guarantee]');
    if (promise) promise.hidden = true;
  }
}

/**
 * The checkout button says what will actually happen.
 *
 * Whether payments are live is a property of the deployment, not of the page,
 * so the built HTML says "Place order" and this repaints it once
 * /api/storefront answers. The original label and note are kept on the
 * elements because the page was rendered in the reader's language and
 * re-deriving them here would not be.
 */
function paintCheckout() {
  const btn = $<HTMLButtonElement>('form[data-checkout] [type="submit"]');
  if (btn) {
    if (!btn.dataset.label) btn.dataset.label = btn.innerHTML;
    if (CFG.payments) btn.textContent = S('payOrder', 'Pay for the order');
    else btn.innerHTML = btn.dataset.label;
  }
  const note = $('[data-pay-note]');
  if (note) {
    if (note.dataset.label === undefined) note.dataset.label = note.textContent || '';
    note.textContent = CFG.payments ? S('payHandoff', 'You will pay on Paysera’s secure page. We never see your card or bank details.') : note.dataset.label;
  }
}

function applyStorefront(data: StorefrontData) {
  const st = data.settings || {};
  CFG.payments = data.payments === true;
  paintCheckout();
  if (typeof st.freeFrom === 'number' && st.freeFrom > 0) CFG.freeFrom = st.freeFrom;
  CFG.tiersOn = st.tiersOn !== false;
  CFG.tier1Qty = Number(st.tier1Qty) || CFG.tier1Qty;
  CFG.tier1Pct = Number(st.tier1Pct) || CFG.tier1Pct;
  CFG.tier2Qty = Number(st.tier2Qty) || CFG.tier2Qty;
  CFG.tier2Pct = Number(st.tier2Pct) || CFG.tier2Pct;
  readTiers(CFG);

  applyAnnouncement(forLocale(st, 'announcement'), String(st.announcementHref || ''), st.announcementOn === true);

  const promise = $('[data-guarantee]');
  const promiseText = $('[data-guarantee-text]');
  if (promise && promiseText) {
    if (st.guaranteeOn === false) promise.hidden = true;
    else {
      const text = forLocale(st, 'guarantee');
      if (text) promiseText.textContent = text;
    }
  }

  applyOverrideToCards(data.products || {});
  const pdpEl = $('[data-pdp][data-slug]');
  if (pdpEl) {
    const o = (data.products || {})[pdpEl.dataset.slug || ''];
    if (o) applyOverrideToPdp(pdpEl, o);
  }
  renderCart();
}

async function syncStorefront() {
  // The last good answer paints immediately; the network call then corrects it.
  try {
    const cached = sessionStorage.getItem(STORE_KEY);
    if (cached) applyStorefront(JSON.parse(cached) as StorefrontData);
  } catch {
    /* a bad cache entry is not worth a broken page */
  }
  try {
    const res = await fetch('/api/storefront', { headers: { accept: 'application/json' } });
    if (!res.ok) return;
    const data = (await res.json()) as StorefrontData;
    applyStorefront(data);
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch {
      /* private mode */
    }
  } catch {
    /* offline or no worker: the built-in values already on the page are correct */
  }
}

/* ------------------------------------------------------------- pdp: volume ladder */

const ladder = $('[data-tiers]');
if (ladder) {
  const qtyIn = $<HTMLInputElement>('[data-qty-input]');
  const buttons = $$<HTMLButtonElement>('[data-tier]', ladder);

  /** The ladder highlights the step the current quantity has actually reached. */
  const sync = () => {
    const q = Math.max(1, Number(qtyIn?.value) || 1);
    let best = buttons[0];
    for (const b of buttons) if (q >= (Number(b.dataset.tierQty) || 1)) best = b;
    buttons.forEach((b) => {
      b.classList.toggle('is-on', b === best);
      b.setAttribute('aria-pressed', String(b === best));
    });
  };

  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      if (qtyIn) qtyIn.value = String(Number(b.dataset.tierQty) || 1);
      sync();
      announce(interp(S('qtySetTo', 'Quantity set to {n}'), { n: b.dataset.tierQty || '' }));
    }),
  );
  qtyIn?.addEventListener('input', sync);
  document.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-qty-inc], [data-qty-dec]')) sync();
  });

  // Prices on the ladder follow the flavour the shopper picked.
  $$<HTMLInputElement>('[data-variant]').forEach((r) =>
    r.addEventListener('change', () => {
      const base = Number(r.dataset.price);
      if (!Number.isFinite(base)) return;
      buttons.forEach((b) => {
        const unit = $('[data-tier-unit]', b);
        const pct = Number(b.dataset.tierPct) || 0;
        if (unit) unit.textContent = fmt(Math.round(base * (100 - pct)) / 100);
      });
    }),
  );
  sync();
}

/* ------------------------------------------------------------------ pdp: reviews */

const reviewsEl = $('[data-reviews]');
if (reviewsEl) {
  const slug = $('[data-pdp]')?.dataset.slug || '';
  const list = $('[data-review-list]', reviewsEl)!;
  const summary = $('[data-review-summary]', reviewsEl);
  const emptyNote = $('[data-review-empty]', reviewsEl);
  const stars = (r: number) => '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);

  const paint = (data: { count: number; avg: number; reviews: { date: string; rating: number; author: string; city: string; title: string; body: string; verified: boolean; reply: string; locale?: string }[] }) => {
    if (!data.count) {
      if (emptyNote) emptyNote.hidden = false;
      return;
    }
    if (emptyNote) emptyNote.hidden = true;
    if (summary) {
      summary.hidden = false;
      summary.innerHTML =
        `<span class="stars" aria-hidden="true">${stars(Math.round(data.avg))}</span> ` +
        rich(interp(P('reviewsSummary', data.count, '**{avg}** out of 5 · {count} reviews'), { avg: data.avg.toFixed(1), count: data.count }));
    }
    /*
     * A review written in another language is still shown — three languages
     * would otherwise mean three near-empty product pages — but it is marked as
     * what it is. The lang attribute is the honest way to do that: a screen
     * reader switches voice for it, and a browser offers to translate it.
     */
    const LANG_NAME: Record<string, string> = { en: 'English', ru: 'Русский', lv: 'Latviski' };
    list.innerHTML = data.reviews
      .map((r) => {
        const lang = r.locale || 'en';
        const foreign = lang !== (CFG.locale || 'en');
        return `<article class="rev"${foreign ? ` lang="${esc(lang)}"` : ''}>
          <div class="rev__top">
            <span class="rev__stars" aria-label="${esc(interp(S('outOfFive', '{n} out of 5'), { n: r.rating }))}">${stars(r.rating)}</span>
            <span class="rev__who">${esc(r.author)}</span>
            <span class="rev__meta">${esc([r.city, r.date].filter(Boolean).join(' · '))}</span>
            ${r.verified ? `<span class="rev__verified">${esc(S('verifiedPurchase', 'Verified purchase'))}</span>` : ''}
            ${foreign ? `<span class="rev__lang" lang="${esc(lang)}">${esc(LANG_NAME[lang] || lang)}</span>` : ''}
          </div>
          ${r.title ? `<p class="rev__title">${esc(r.title)}</p>` : ''}
          <p class="rev__body">${esc(r.body)}</p>
          ${r.reply ? `<p class="rev__reply"><strong>${esc(S('semersReply', 'Semers:'))}</strong> ${esc(r.reply)}</p>` : ''}
        </article>`;
      })
      .join('');

    // Structured data for the rating is only ever emitted from reviews that
    // exist and are approved — an invented AggregateRating is a manual penalty.
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'AggregateRating',
      itemReviewed: { '@type': 'Product', name: document.querySelector('h1')?.textContent?.trim() || slug },
      ratingValue: data.avg,
      reviewCount: data.count,
      bestRating: 5,
      worstRating: 1,
    });
    document.head.appendChild(ld);
  };

  if (slug) {
    const noReviews = () => {
      if (emptyNote) emptyNote.hidden = false;
    };
    fetch(`/api/reviews?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(CFG.locale || 'en')}`)
      .then((r) => (r.ok ? r.json() : null))
      // A missing endpoint and an empty product read the same to a shopper:
      // there is nothing to show yet, and the invitation to be first still stands.
      .then((d) => (d ? paint(d) : noReviews()))
      .catch(noReviews);
  }

  const form = $<HTMLFormElement>('[data-review-form]', reviewsEl);
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const note = $('[data-review-note]', reviewsEl);
    const btn = form.querySelector<HTMLButtonElement>('[type="submit"]');
    const data = formData(form);
    if (data.website) return;
    if (btn) (btn.disabled = true), (btn.dataset.label = btn.textContent || ''), (btn.textContent = S('sending', 'Sending…'));
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, slug, rating: Number(data.rating), locale: CFG.locale || 'en' }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      if (note) (note.textContent = S('reviewThanks', 'Thank you — we read every review before it appears, so give us a day.')), (note.hidden = false), note.classList.add('notice', 'notice--ok');
      toast(S('reviewSent', 'Review sent for approval'));
    } catch {
      if (note) (note.textContent = S('reviewFailed', 'That did not send. Please try again, or e-mail us and we will add it by hand.')), (note.hidden = false), note.classList.add('notice', 'notice--err');
    } finally {
      if (btn) (btn.disabled = false), (btn.textContent = btn.dataset.label || btn.textContent || '');
    }
  });
}

syncStorefront();
