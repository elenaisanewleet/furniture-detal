/**
 * The site's motion layer: smooth scrolling, the drawn cursor, word-by-word
 * headline reveals, and the GSAP/ScrollTrigger pairing the set pieces build on.
 *
 * All of it is an enhancement. With reduced motion asked for, or on a touch
 * device, scrolling is the browser's own, the cursor is the system's, and the
 * headlines are simply there. Nothing here is needed to buy a bar.
 *
 * Exposed on window.semersMotion so the check scripts can stop the smoothing
 * before they measure scroll positions.
 */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

declare global {
  interface Window {
    semersMotion?: { lenis: Lenis | null; gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger; stop(): void };
  }
}

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const root = document.documentElement;

/* --------------------------------------------------------------- scrolling */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 1,
    // On touch, native scrolling is faster and never feels rubbery; Lenis only listens.
    syncTouch: false,
    anchors: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

window.semersMotion = {
  lenis,
  gsap,
  ScrollTrigger,
  stop() {
    lenis?.destroy();
    lenis = null;
  },
};

/* ------------------------------------------------------------ the cursor */
/*
 * A dot that is exactly where the pointer is and a ring that arrives a beat
 * later. Over a link the ring grows; over anything carrying data-cursor it
 * grows further and prints the word — "view", "add" — so a card does not need
 * a button to say what a click will do.
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
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, shown = false;

  addEventListener('pointermove', (e) => {
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
  }, { passive: true });
  addEventListener('pointerdown', () => el.classList.add('is-down'));
  addEventListener('pointerup', () => el.classList.remove('is-down'));
  document.addEventListener('mouseleave', () => root.classList.remove('has-cursor'));
  document.addEventListener('mouseenter', () => shown && root.classList.add('has-cursor'));

  gsap.ticker.add(() => {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
  });
}

/* ---------------------------------------------------- words, one at a time */
/*
 * A headline marked data-words is split into words the CSS can stagger. The
 * split happens here rather than in the markup so the prose stays one string
 * for the translation pass; it runs after the page's text has been localised.
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
const wordEls = document.querySelectorAll<HTMLElement>('[data-words]');
if (wordEls.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { (e.target as HTMLElement).classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: 0.2 });
  wordEls.forEach((el) => io.observe(el));
} else wordEls.forEach((el) => el.classList.add('is-in'));

/* ------------------------------------------------------------ parallax */
/* An element with data-parallax="0.2" drifts a fifth as fast as the page. Cheap, and it makes the photographs feel set back in the dark. */
if (!reduced) {
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))) {
    const k = Number(el.dataset.parallax || 0.15);
    gsap.fromTo(el, { yPercent: -k * 40 }, { yPercent: k * 40, ease: 'none', scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true } });
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
  const io = new IntersectionObserver((es) => {
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
  }, { threshold: 0.6 });
  io.observe(el);
}

export { gsap, ScrollTrigger, lenis, reduced };
