/**
 * The site's motion layer: word-by-word headline reveals, the drawn cursor,
 * a little parallax, card tilt and counters that count up.
 *
 * It used to be Lenis plus GSAP with ScrollTrigger — 49 KB gzipped — to do work
 * that IntersectionObserver and one rAF loop do for nothing. Smooth scrolling in
 * particular was a net loss: it takes the scroll away from the browser, so the
 * page answers a wheel or a trackpad a frame or two late and reads as lag, which
 * is exactly what it was blamed for. Scrolling is the browser's again.
 *
 * All of it is an enhancement. With reduced motion asked for, or on a touch
 * device, or with no JavaScript at all, the page is simply there. Nothing here
 * is needed to buy a bar.
 *
 * Exposed on window.semersMotion so the check scripts can turn it off before
 * they measure.
 */

declare global {
  interface Window {
    semersMotion?: { reduced: boolean; stop(): void };
  }
}

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const root = document.documentElement;

/** Everything that must be undone when a check script asks for stillness. */
const teardown: Array<() => void> = [];

/* ------------------------------------------------------------- the cursor */
/*
 * A dot exactly where the pointer is and a ring that arrives a beat later. Over
 * a link the ring grows; over anything carrying data-cursor it grows further and
 * prints the word — "view", "add" — so a card need not wear a button to say what
 * a click will do.
 */
if (finePointer && !reduced) {
  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="cursor__ring"><span class="cursor__label"></span></div><div class="cursor__dot"></div>';
  document.body.appendChild(el);
  const ring = el.querySelector<HTMLElement>('.cursor__ring')!;
  const dot = el.querySelector<HTMLElement>('.cursor__dot')!;
  const label = el.querySelector<HTMLElement>('.cursor__label')!;
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, shown = false, raf = 0;

  const onMove = (e: PointerEvent) => {
    x = e.clientX;
    y = e.clientY;
    if (!shown) {
      shown = true;
      root.classList.add('has-cursor');
      rx = x;
      ry = y;
    }
    const t = (e.target as Element | null)?.closest('a, button, summary, label, [data-cursor], input, select, textarea');
    const word = t?.getAttribute('data-cursor') || t?.closest('[data-cursor]')?.getAttribute('data-cursor');
    el.classList.toggle('is-link', !!t && !word);
    el.classList.toggle('is-label', !!word);
    if (word) label.textContent = word;
  };
  const down = () => el.classList.add('is-down');
  const up = () => el.classList.remove('is-down');
  const leave = () => root.classList.remove('has-cursor');
  const enter = () => shown && root.classList.add('has-cursor');

  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', down, { passive: true });
  addEventListener('pointerup', up, { passive: true });
  document.addEventListener('mouseleave', leave);
  document.addEventListener('mouseenter', enter);

  /* The ring eases towards the dot; the dot is exact. One rAF, two transforms. */
  const tick = () => {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  teardown.push(() => {
    cancelAnimationFrame(raf);
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerdown', down);
    removeEventListener('pointerup', up);
    document.removeEventListener('mouseleave', leave);
    document.removeEventListener('mouseenter', enter);
    root.classList.remove('has-cursor');
    el.remove();
  });
}

/* ---------------------------------------------------- words, one at a time */
/*
 * A headline marked data-words is split into words the CSS can stagger. The
 * split happens here rather than in the markup so the prose stays one string for
 * the translation pass; it runs after the page's text has been localised.
 */
for (const h of Array.from(document.querySelectorAll<HTMLElement>('[data-words]'))) {
  if (reduced) continue;
  const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  let i = 0;
  for (const node of nodes) {
    const parts = node.textContent!.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        continue;
      }
      const w = document.createElement('span');
      w.className = 'w';
      w.style.setProperty('--i', String(i++));
      w.textContent = part;
      frag.appendChild(w);
    }
    node.replaceWith(frag);
  }
}

/** Add a class the first time an element is seen, then stop watching it. */
function onceInView(els: Iterable<Element>, cls: string, threshold = 0.2) {
  const list = Array.from(els);
  if (!list.length) return;
  if (!('IntersectionObserver' in window)) {
    list.forEach((el) => el.classList.add(cls));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add(cls);
        io.unobserve(e.target);
      }
    },
    { threshold },
  );
  list.forEach((el) => io.observe(el));
  teardown.push(() => io.disconnect());
}

onceInView(document.querySelectorAll('[data-words]'), 'is-in');

/* --------------------------------------------------------------- parallax */
/*
 * An element with data-parallax="0.2" drifts a fifth as fast as the page. One
 * passive scroll listener, one rAF, and only the elements actually on screen are
 * touched — an IntersectionObserver keeps the rest out of the loop entirely.
 */
if (!reduced) {
  const all = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (all.length) {
    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target as HTMLElement);
          else visible.delete(e.target as HTMLElement);
        }
      },
      { rootMargin: '20% 0px' },
    );
    all.forEach((el) => io.observe(el));

    let queued = false;
    const paint = () => {
      queued = false;
      const h = innerHeight;
      for (const el of visible) {
        const k = Number(el.dataset.parallax || 0.15);
        const box = el.getBoundingClientRect();
        /* -1 when the element is entering at the bottom, +1 when it leaves at the top. */
        const progress = (box.top + box.height / 2 - h / 2) / (h / 2 + box.height / 2);
        el.style.transform = `translate3d(0, ${(progress * k * 40).toFixed(2)}%, 0)`;
      }
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    paint();
    teardown.push(() => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      io.disconnect();
      all.forEach((el) => (el.style.transform = ''));
    });
  }
}

/* ------------------------------------------------------ 3-D tilt on cards */
if (finePointer && !reduced) {
  for (const card of Array.from(document.querySelectorAll<HTMLElement>('[data-tilt]'))) {
    let raf = 0;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateY(-8px)`;
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
    });
  }
}

/* ----------------------------------------------- counters that count up */
for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-count]'))) {
  if (reduced || !('IntersectionObserver' in window)) continue;
  const target = Number(el.dataset.count);
  const prefix = el.dataset.countPrefix || '';
  const settled = el.textContent || '';
  if (!Number.isFinite(target)) continue;
  const io = new IntersectionObserver(
    (es) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const started = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - started) / 1100);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = k < 1 ? prefix + Math.round(target * eased) : settled;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    { threshold: 0.6 },
  );
  io.observe(el);
  teardown.push(() => io.disconnect());
}

/* ------------------------------------------------ lit while near the middle */
/*
 * Used by the story wall and the wholesale ladder: whichever element is crossing
 * the middle band of the screen wears `is-lit`. This is what ScrollTrigger's
 * toggleClass did, in one observer and no library.
 */
export function lit(selector = '[data-lit]', band = 38) {
  if (reduced || !('IntersectionObserver' in window)) return;
  const els = Array.from(document.querySelectorAll(selector));
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.classList.toggle('is-lit', e.isIntersecting);
    },
    { rootMargin: `-${band}% 0px -${band}% 0px` },
  );
  els.forEach((el) => io.observe(el));
  teardown.push(() => io.disconnect());
}

window.semersMotion = {
  reduced,
  stop() {
    while (teardown.length) teardown.pop()!();
  },
};

export { reduced };
