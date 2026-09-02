/**
 * Client script for every page. No framework: a small localStorage cart, the
 * slide-over drawer, product page interactions, shop filters, the bundle
 * builder, checkout and lead forms. Everything is keyed off data-attributes so
 * pages stay plain HTML.
 */

declare global {
  interface Window {
    SEMERS: { endpoint: string; freeFrom: number; email: string; whatsapp: string; currency: string };
    semersCart: Cart;
  }
}

const CFG = window.SEMERS || { endpoint: '/api/order', freeFrom: 25, email: '', whatsapp: '', currency: 'EUR' };
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const fmt = (n: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: CFG.currency || 'EUR' }).format(n);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

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
      this.items = raw ? (JSON.parse(raw) as CartItem[]).filter((i) => i && i.id && i.qty > 0) : [];
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
    const ex = this.items.find((i) => i.id === item.id);
    if (ex) ex.qty = Math.min(99, ex.qty + qty);
    else this.items.push({ ...item, qty: Math.min(99, qty) });
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
    return this.items.reduce((n, i) => n + i.qty * i.price, 0);
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

/* ----------------------------------------------------------------- drawer */
const drawer = $('#cart');
let lastFocus: HTMLElement | null = null;

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
  if (n) n.textContent = c ? `· ${c} item${c === 1 ? '' : 's'}` : '';
  if (sub) sub.textContent = fmt(total);
  if (checkout) checkout.classList.toggle('is-disabled', c === 0), checkout.setAttribute('aria-disabled', String(c === 0));
  if (empty) empty.hidden = c > 0;

  // free shipping progress
  const fill = $('#cart-ship-fill');
  const text = $('#cart-ship-text');
  if (fill && text) {
    const free = c > 0 && shipsFree(total);
    const left = free ? 0 : Math.max(0, CFG.freeFrom - total);
    fill.style.width = free ? '100%' : `${Math.min(100, (total / CFG.freeFrom) * 100)}%`;
    text.innerHTML = c === 0
      ? `Free shipping on orders over <strong>${fmt(CFG.freeFrom)}</strong>.`
      : left > 0
        ? `Add <strong>${fmt(left)}</strong> more for free shipping.`
        : `You’ve unlocked <strong>free shipping</strong>.`;
  }

  if (list) {
    list.innerHTML = cart.items
      .map(
        (i) => `
      <li class="ci" data-id="${esc(i.id)}">
        <a class="ci__img" href="${esc(i.url)}"><img src="${esc(i.image)}" alt="" loading="lazy" width="72" height="72" /></a>
        <div>
          <div class="ci__name"><a href="${esc(i.url)}">${esc(i.name)}</a></div>
          <div class="ci__var">${esc(i.variantLabel)}${i.note ? ` · ${esc(i.note)}` : ''}</div>
          <div class="ci__ctl">
            <div class="qty" role="group" aria-label="Quantity">
              <button type="button" data-dec aria-label="Decrease">−</button>
              <output>${i.qty}</output>
              <button type="button" data-inc aria-label="Increase">+</button>
            </div>
            <button type="button" class="ci__rm" data-rm>Remove</button>
          </div>
        </div>
        <div class="ci__price">${fmt(i.price * i.qty)}</div>
      </li>`,
      )
      .join('');
  }

  // pages that mirror the cart (cart page / checkout summary)
  $$('[data-cart-summary]').forEach(renderSummary);
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
  const shipping = c === 0 || pickupSelected() || shipsFree(total) ? 0 : Number(root.dataset.shipping || 3.9);
  if (emptyEl) emptyEl.hidden = c > 0;
  if (full) full.hidden = c === 0;
  if (rows)
    rows.innerHTML = cart.items
      .map(
        (i) => `<li class="ci" data-id="${esc(i.id)}">
        <a class="ci__img" href="${esc(i.url)}"><img src="${esc(i.image)}" alt="" width="72" height="72" loading="lazy" /></a>
        <div><div class="ci__name">${esc(i.name)}</div><div class="ci__var">${esc(i.variantLabel)}${i.note ? ` · ${esc(i.note)}` : ''}</div>
        <div class="ci__ctl"><div class="qty" role="group" aria-label="Quantity"><button type="button" data-dec aria-label="Decrease">−</button><output>${i.qty}</output><button type="button" data-inc aria-label="Increase">+</button></div><button type="button" class="ci__rm" data-rm>Remove</button></div></div>
        <div class="ci__price">${fmt(i.price * i.qty)}</div></li>`,
      )
      .join('');
  if (sub) sub.textContent = fmt(total);
  if (ship) ship.textContent = c === 0 ? '—' : shipping === 0 ? 'Free' : fmt(shipping);
  if (tot) tot.textContent = fmt(total + shipping);
  const hidden = $<HTMLInputElement>('[data-cart-json]', root);
  if (hidden) hidden.value = JSON.stringify({ items: cart.items, subtotal: total, shipping, total: total + shipping });
}

export function openCart() {
  if (!drawer) return;
  lastFocus = document.activeElement as HTMLElement;
  renderCart();
  drawer.hidden = false;
  document.body.style.overflow = 'hidden';
  $<HTMLElement>('.drawer__close', drawer)?.focus();
}
export function closeCart() {
  if (!drawer || drawer.hidden) return;
  drawer.hidden = true;
  document.body.style.overflow = '';
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
    if (t.closest('[data-inc]')) cart.setQty(id, it.qty + 1);
    else if (t.closest('[data-dec]')) cart.setQty(id, it.qty - 1);
    else if (t.closest('[data-rm]')) cart.remove(id);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCart();
    closeNav();
  }
});
document.addEventListener('cart:change', renderCart);

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
  const qtyEl = btn.closest('[data-pdp]')?.querySelector<HTMLInputElement>('[data-qty-input]');
  const qty = qtyEl ? Math.max(1, Number(qtyEl.value) || 1) : 1;
  cart.add(item, qty);
  btn.classList.add('is-done');
  window.setTimeout(() => btn.classList.remove('is-done'), 1200);
  if (btn.dataset.addOpen !== 'false') openCart();
  else toast(`Added ${item.name} to your box`);
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
}
function closeNav() {
  if (!nav?.classList.contains('is-open')) return;
  nav.classList.remove('is-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  if (scrim) scrim.hidden = true;
  document.body.style.overflow = '';
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

  const applyVariant = (input: HTMLInputElement) => {
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
    const url = new URL(location.href);
    url.searchParams.set('flavour', input.value);
    history.replaceState(null, '', url);
  };
  const radios = $$<HTMLInputElement>('[data-variant]', pdp);
  radios.forEach((r) => r.addEventListener('change', () => applyVariant(r)));
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

  pdp.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (!qtyIn) return;
    if (t.closest('[data-qty-inc]')) qtyIn.value = String(Math.min(99, Number(qtyIn.value) + 1));
    if (t.closest('[data-qty-dec]')) qtyIn.value = String(Math.max(1, Number(qtyIn.value) - 1));
  });

  // sticky buy bar appears once the main buy button scrolls out of view
  const bar = $('[data-sticky-buy]');
  const anchor = $('[data-buy-anchor]', pdp);
  if (bar && anchor && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => bar.classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0), { threshold: 0 }).observe(anchor);
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

  const apply = () => {
    let visible = 0;
    const arr = cards.slice();
    const key = (c: HTMLElement) => ({ price: Number(c.dataset.price), order: Number(c.dataset.order), name: c.dataset.name || '', best: c.dataset.best === '1' ? 0 : 1, kcal: Number(c.dataset.kcal || 0) });
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
      const hay = `${c.dataset.name} ${c.dataset.collection} ${c.dataset.flavours} ${c.dataset.hook}`.toLowerCase();
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
        .map((p, i) => `<li>${esc(p.name)} <button type="button" class="ci__rm" data-builder-rm="${i}">remove</button></li>`)
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
    const note = form.querySelector<HTMLElement>('[data-form-note]') || form.nextElementSibling?.matches('[data-form-note]') ? (form.nextElementSibling as HTMLElement) : null;
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
      const msg = 'We could not send this automatically. Opening your e-mail app instead…';
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
  // switching to pick-up (free) or back to a courier must update the summary column
  checkout.addEventListener('change', (e) => {
    if ((e.target as HTMLInputElement).name === 'delivery') renderCart();
  });
  checkout.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.count() === 0) {
      toast('Your box is empty — add something first.');
      return;
    }
    const btn = checkout.querySelector<HTMLButtonElement>('[type="submit"]');
    const note = $('[data-checkout-note]');
    const data = formData(checkout);
    if (data.website) return;
    const total = cart.subtotal();
    const shipping = pickupSelected() || shipsFree(total) ? 0 : Number(checkout.dataset.shipping || 3.9);
    const order = {
      type: 'order',
      customer: data,
      items: cart.items.map((i) => ({ id: i.id, name: i.name, variant: i.variantLabel, note: i.note, qty: i.qty, price: i.price, total: Math.round(i.qty * i.price * 100) / 100 })),
      subtotal: Math.round(total * 100) / 100,
      shipping,
      total: Math.round((total + shipping) * 100) / 100,
      currency: CFG.currency,
      page: location.pathname,
    };
    if (btn) (btn.disabled = true), (btn.textContent = 'Placing order…');
    try {
      const res = await post(order);
      cart.clear();
      location.href = `/order/thank-you/?ref=${encodeURIComponent(res.ref || '')}`;
    } catch (err) {
      const lines = order.items.map((i) => `${i.qty} × ${i.name}${i.variant ? ` (${i.variant})` : ''}${i.note ? ` — ${i.note}` : ''} = ${fmt(i.total)}`);
      const body = [
        'New order request from semers.org',
        '',
        ...lines,
        '',
        `Subtotal: ${fmt(order.subtotal)}`,
        `Shipping: ${shipping ? fmt(shipping) : 'free'}`,
        `Total: ${fmt(order.total)}`,
        '',
        ...Object.entries(data).filter(([k]) => k !== 'website').map(([k, v]) => `${k}: ${v}`),
      ].join('\n');
      const msg = 'Online ordering is not live yet — we opened an e-mail with your order instead. We reply within one business day.';
      if (note) (note.textContent = msg), (note.hidden = false), note.classList.add('notice', 'notice--err');
      toast(msg, 5000);
      mailtoFallback('Order request via semers.org', body);
      if (btn) (btn.disabled = false), (btn.textContent = 'Place order');
    }
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
