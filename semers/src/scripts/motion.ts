/**
 * The site's motion layer: a little parallax and counters that count up, on
 * the content pages that still use them. The drawn cursor, the card tilt and
 * the word-by-word headlines went with the dark site: the shop is plain, and
 * a headline is there when the page paints.
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

/** Everything that must be undone when a check script asks for stillness. */
const teardown: Array<() => void> = [];

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
