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
    };
    semersCart: Cart;
  }
}

const CFG = window.SEMERS || {
  endpoint: '/api/order',
  freeFrom: 25,
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
  reviewsOn: false,
};
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const fmt = (n: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: CFG.currency || 'EUR' }).format(n);
/** Whole-euro amounts such as the free-shipping threshold read "€25" everywhere else on the site, so the drawer must not say "€25.00". */
const fmtWhole = (n: number) => (Number.isInteger(n) ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: CFG.currency || 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) : fmt(n));
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

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
/** "Pick up in Riga" is offered as free on the checkout form, so the summary must not add postage to it. */
function pickupSelected() {
  const r = $<HTMLInputElement>('form[data-checkout] input[name="delivery"]:checked');
  return !!r && /pick ?up/i.test(r.value);
}
/** The flat rate below the free threshold only covers the Baltics; other EU destinations are quoted in the confirmation e-mail. */
const BALTICS = new Set(['Latvia', 'Lithuania', 'Estonia']);
function shippingQuoted() {
  const sel = $<HTMLSelectElement>('form[data-checkout] select[name="country"]');
  return !!sel && !BALTICS.has(sel.value);
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

  if (count) {
    count.textContent = String(c);
    count.hidden = c === 0;
  }
  $('#cart-open')?.setAttribute('aria-label', c ? `Open cart, ${c} item${c === 1 ? '' : 's'}` : 'Open cart, empty');
  if (n) n.textContent = c ? `· ${c} item${c === 1 ? '' : 's'}` : '';
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
    text.innerHTML = c === 0
      ? `Free shipping on orders over <strong>${fmtWhole(CFG.freeFrom)}</strong>.`
      : left > 0
        ? `Add <strong>${fmt(left)}</strong> more for free shipping.`
        : `You’ve unlocked <strong>free shipping</strong>.`;
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
      tierText.innerHTML = `Add <strong>${best.need}</strong> more ${esc(best.item.name)} to save <strong>${best.pct}%</strong> on that line.`;
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
            <div class="qty" role="group" aria-label="Quantity of ${esc(i.name)}">
              <button type="button" data-dec aria-label="Decrease quantity of ${esc(i.name)}">−</button>
              <output aria-label="Quantity">${i.qty}</output>
              <button type="button" data-inc aria-label="Increase quantity of ${esc(i.name)}">+</button>
            </div>
            <button type="button" class="ci__rm" data-rm aria-label="Remove ${esc(i.name)}">Remove</button>
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
      coNote.textContent = 'Your box is empty — add something from the shop first.';
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
  const free = c === 0 || pickupSelected() || shipsFree(total);
  const quoted = !free && shippingQuoted();
  const shipping = free || quoted ? 0 : Number(root.dataset.shipping || 3.9);
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
        <div class="ci__ctl"><div class="qty" role="group" aria-label="Quantity of ${esc(i.name)}"><button type="button" data-dec aria-label="Decrease quantity of ${esc(i.name)}">−</button><output aria-label="Quantity">${i.qty}</output><button type="button" data-inc aria-label="Increase quantity of ${esc(i.name)}">+</button></div><button type="button" class="ci__rm" data-rm aria-label="Remove ${esc(i.name)}">Remove</button></div></div>
        <div class="ci__price">${fmt(lineOf(i))}${tierPct(i) ? `<span class="ci__save">−${tierPct(i)}%</span>` : ''}</div></li>`,
          )
          .join('');
      },
      // last row removed: the empty-state link, else the checkout button
      () => $<HTMLElement>('[data-summary-empty]:not([hidden]) a[href], [data-summary-checkout]', root),
    );
  if (sub) sub.textContent = fmt(total);
  if (ship) ship.textContent = c === 0 ? '—' : quoted ? 'Quoted by e-mail' : shipping === 0 ? 'Free' : fmt(shipping);
  if (tot) tot.textContent = quoted ? `${fmt(total)} + shipping` : fmt(total + shipping);
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
    if (t.closest('[data-inc]')) cart.setQty(id, it.qty + 1), announce(`${it.name}: quantity ${it.qty}`);
    else if (t.closest('[data-dec]')) cart.setQty(id, it.qty - 1), announce(it.qty > 0 ? `${it.name}: quantity ${it.qty}` : `Removed ${it.name}`);
    else if (t.closest('[data-rm]')) cart.remove(id), announce(`Removed ${it.name}`);
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
  else toast(`Added ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} to your box`);
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
const revealEls = $$('[data-reveal]');
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
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
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

  /** `syncUrl` only on a user change: the initial call must not append ?flavour= to every product URL that gets shared or tracked. */
  const applyVariant = (input: HTMLInputElement, syncUrl = false) => {
    const price = Number(input.dataset.price);
    const label = input.dataset.label || '';
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

  thumbs.forEach((b) =>
    b.addEventListener('click', () => {
      if (mainImg) {
        mainImg.src = b.dataset.src || '';
        mainImg.alt = b.dataset.alt || '';
        mainImg.closest('[data-gal-wrap]')?.classList.toggle('is-contain', b.dataset.fit === 'contain');
      }
      thumbs.forEach((t) => t.setAttribute('aria-pressed', String(t === b)));
    }),
  );

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
  // Collection pages carry the collection in their path (/shop/pastila/); only the all-products page keeps it as ?collection=.
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
    // kcal 0 means "mixed box, see each item": it must sink to the end of "Lowest calories", not top it.
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
    if (countEl) countEl.textContent = `${visible} product${visible === 1 ? '' : 's'}`;
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
        .map((p, i) => `<li>${esc(p.name)} <button type="button" class="ci__rm" data-builder-rm="${i}" aria-label="Remove ${esc(p.name)}">remove</button></li>`)
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
        name: `Your ${size}-piece box`,
        variant: 'custom',
        variantLabel: `${Math.round(discount * 100)}% bundle discount`,
        price: Math.round(full * (1 - discount) * 100) / 100,
        image: builder.dataset.image || picks[0].image,
        weight: picks.reduce((n, p) => n + p.weight, 0),
        url: '/shop/build-your-box/',
        note,
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
    if (btn) (btn.disabled = true), (btn.dataset.label = btn.textContent || ''), (btn.textContent = 'Sending…');
    try {
      await post({ type, ...data, page: location.pathname });
      form.reset();
      const msg = form.dataset.success || 'Thanks — we’ll be in touch shortly.';
      if (note) (note.textContent = msg), note.classList.add('notice', 'notice--ok');
      toast(msg);
    } catch (err) {
      const subject = `${type} via semers.org`;
      const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
      const msg = `We could not send this automatically. Opening your e-mail app instead${CFG.email ? ` — or write to ${CFG.email}` : ''}.`;
      if (note) (note.textContent = msg), note.classList.add('notice', 'notice--err');
      toast(msg, 4000);
      mailtoFallback(subject, body);
    } finally {
      if (btn) (btn.disabled = false), (btn.textContent = btn.dataset.label || 'Send');
    }
  });
});

/* -------------------------------------------------------------- checkout */
const checkout = $<HTMLFormElement>('form[data-checkout]');
if (checkout) {
  // Pick-up needs no address: the block is hidden and its fields stop being required (a hidden required field would block reportValidity()).
  const addr = $('[data-address-fields]', checkout);
  const syncDelivery = () => {
    // Parcel lockers exist only in the Baltics: outside them the option is disabled and a courier takes over.
    const locker = $<HTMLInputElement>('input[name="delivery"][value^="Parcel locker"]', checkout);
    const courier = $<HTMLInputElement>('input[name="delivery"][value^="Courier"]', checkout);
    if (locker && courier) {
      const abroad = shippingQuoted();
      locker.disabled = abroad;
      locker.closest('label')?.classList.toggle('is-disabled', abroad);
      if (abroad && locker.checked) courier.checked = true;
    }
    const pickup = pickupSelected();
    if (addr) {
      addr.hidden = pickup;
      $$<HTMLInputElement>('input, select', addr).forEach((el) => {
        if (el.dataset.req === undefined) el.dataset.req = String(el.required);
        el.required = !pickup && el.dataset.req === 'true';
      });
    }
    renderCart();
  };
  // switching to pick-up (free), back to a courier, or to another country must update the summary column
  checkout.addEventListener('change', (e) => {
    const name = (e.target as HTMLInputElement).name;
    if (name === 'delivery' || name === 'country') syncDelivery();
  });
  syncDelivery();
  // The submit button carries an icon, so restore its markup rather than plain text.
  const submitBtn = checkout.querySelector<HTMLButtonElement>('[type="submit"]');
  const submitHtml = submitBtn?.innerHTML || 'Place order';
  const restoreBtn = () => {
    if (!submitBtn) return;
    submitBtn.disabled = cart.count() === 0;
    submitBtn.innerHTML = submitHtml;
  };
  checkout.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (checkout.dataset.busy) return; // one order at a time
    if (cart.count() === 0) {
      toast('Your box is empty — add something first.');
      return;
    }
    // The form carries `novalidate` (custom field styling), so constraint validation must be run here.
    if (!checkout.reportValidity()) return;
    const btn = checkout.querySelector<HTMLButtonElement>('[type="submit"]');
    const note = $('[data-checkout-note]');
    const data = formData(checkout);
    if (data.website) return;
    const total = cart.subtotal();
    const free = pickupSelected() || shipsFree(total);
    const quoted = !free && shippingQuoted();
    const shipping = free || quoted ? 0 : Number(checkout.dataset.shipping || 3.9);
    const order = {
      type: 'order',
      customer: data,
      items: cart.items.map((i) => ({ id: i.id, name: i.name, variant: [i.variantLabel, tierPct(i) ? `−${tierPct(i)}% for ${i.qty}` : ''].filter(Boolean).join(' · '), note: i.note, qty: i.qty, price: unitOf(i), total: lineOf(i) })),
      subtotal: Math.round(total * 100) / 100,
      shipping,
      shippingNote: quoted ? 'EU courier rate to be quoted by e-mail' : undefined,
      total: Math.round((total + shipping) * 100) / 100,
      currency: CFG.currency,
      page: location.pathname,
    };
    checkout.dataset.busy = '1';
    if (btn) (btn.disabled = true), (btn.textContent = 'Placing order…');
    try {
      const res = await post(order);
      checkout.dataset.done = '1';
      try {
        // The thank-you page shows a recap; the cart itself is cleared right after this.
        sessionStorage.setItem('semers.lastOrder', JSON.stringify({ ref: res.ref || '', items: order.items, subtotal: order.subtotal, shipping, shippingNote: order.shippingNote, total: order.total, delivery: String(data.delivery || ''), email: String(data.email || '') }));
      } catch {
        /* private mode: the recap is a nicety */
      }
      cart.clear();
      location.href = `/order/thank-you/?ref=${encodeURIComponent(res.ref || '')}`;
    } catch (err) {
      const reason = (err as { data?: { reason?: string } })?.data?.reason;
      if (reason === 'email' || reason === 'empty') {
        // The server rejected the request itself; opening a mailto here would send a broken order.
        const msg = reason === 'email' ? 'Please check the e-mail address and try again.' : 'Your box is empty — add something first.';
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
        `Shipping: ${quoted ? 'EU courier rate to be quoted' : shipping ? fmt(shipping) : 'free'}`,
        `Total: ${fmt(order.total)}${quoted ? ' + shipping' : ''}`,
        '',
        ...Object.entries(data).filter(([k, v]) => k !== 'website' && String(v).trim()).map(([k, v]) => `${k}: ${v}`),
      ].join('\n');
      const via = CFG.email ? ` (if nothing opened, write to ${CFG.email})` : '';
      const msg =
        reason === 'not-configured'
          ? `Online ordering is not live yet — we opened an e-mail with your order instead${via}. Your box is saved; we reply within one business day.`
          : `We could not place the order automatically — we opened an e-mail with your order instead${via}. Your box is saved; we reply within one business day.`;
      if (note) (note.textContent = msg), (note.hidden = false), note.classList.add('notice', 'notice--err');
      toast(msg, 5000);
      mailtoFallback('Order request via semers.org', body);
      restoreBtn();
    } finally {
      delete checkout.dataset.busy;
    }
  });
  // Back from the thank-you page can restore this page from the bfcache mid-"Placing order…": reset for a fresh attempt.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    delete checkout.dataset.done;
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
      toast('Copied');
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

function applyAnnouncement(text: string, href: string, on: boolean) {
  const bar = $('[data-announce]');
  const slot = $('[data-announce-text]');
  if (!bar || !slot) return;
  const show = !!(on && text);
  bar.hidden = !show;
  if (!show) return;
  slot.textContent = '';
  if (href) {
    const a = document.createElement('a');
    a.href = href;
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
      btn.setAttribute('aria-label', 'Sold out');
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
        b.textContent = 'Sold out';
      });
    const note = $('[data-guarantee]');
    if (note) note.textContent = 'This one is out of stock right now — write to us and we will tell you when the next batch is ready.';
  }
}

function applyStorefront(data: StorefrontData) {
  const st = data.settings || {};
  if (typeof st.freeFrom === 'number' && st.freeFrom > 0) CFG.freeFrom = st.freeFrom;
  CFG.tiersOn = st.tiersOn !== false;
  CFG.tier1Qty = Number(st.tier1Qty) || CFG.tier1Qty;
  CFG.tier1Pct = Number(st.tier1Pct) || CFG.tier1Pct;
  CFG.tier2Qty = Number(st.tier2Qty) || CFG.tier2Qty;
  CFG.tier2Pct = Number(st.tier2Pct) || CFG.tier2Pct;
  readTiers(CFG);

  applyAnnouncement(String(st.announcement || ''), String(st.announcementHref || ''), st.announcementOn === true);

  const promise = $('[data-guarantee]');
  const promiseText = $('[data-guarantee-text]');
  if (promise && promiseText) {
    if (st.guaranteeOn === false) promise.hidden = true;
    else if (st.guarantee) promiseText.textContent = String(st.guarantee);
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
      announce(`Quantity set to ${b.dataset.tierQty}`);
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

  const paint = (data: { count: number; avg: number; reviews: { date: string; rating: number; author: string; city: string; title: string; body: string; verified: boolean; reply: string }[] }) => {
    if (!data.count) {
      if (emptyNote) emptyNote.hidden = false;
      return;
    }
    if (emptyNote) emptyNote.hidden = true;
    if (summary) {
      summary.hidden = false;
      summary.innerHTML = `<span class="stars" aria-hidden="true">${stars(Math.round(data.avg))}</span> <strong>${data.avg.toFixed(1)}</strong> out of 5 · ${data.count} review${data.count === 1 ? '' : 's'}`;
    }
    list.innerHTML = data.reviews
      .map(
        (r) => `<article class="rev">
          <div class="rev__top">
            <span class="rev__stars" aria-label="${r.rating} out of 5">${stars(r.rating)}</span>
            <span class="rev__who">${esc(r.author)}</span>
            <span class="rev__meta">${esc([r.city, r.date].filter(Boolean).join(' · '))}</span>
            ${r.verified ? '<span class="rev__verified">Verified purchase</span>' : ''}
          </div>
          ${r.title ? `<p class="rev__title">${esc(r.title)}</p>` : ''}
          <p class="rev__body">${esc(r.body)}</p>
          ${r.reply ? `<p class="rev__reply"><strong>Semers:</strong> ${esc(r.reply)}</p>` : ''}
        </article>`,
      )
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
    fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`)
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
    if (btn) (btn.disabled = true), (btn.textContent = 'Sending…');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, slug, rating: Number(data.rating) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      if (note) (note.textContent = 'Thank you — we read every review before it appears, so give us a day.'), (note.hidden = false), note.classList.add('notice', 'notice--ok');
      toast('Review sent for approval');
    } catch {
      if (note) (note.textContent = 'That did not send. Please try again, or e-mail us and we will add it by hand.'), (note.hidden = false), note.classList.add('notice', 'notice--err');
    } finally {
      if (btn) (btn.disabled = false), (btn.textContent = 'Send review');
    }
  });
}

syncStorefront();
