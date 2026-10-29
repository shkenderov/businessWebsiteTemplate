/**
 * Scroll reveal + counters. Runs in both styles.
 *
 * Elements are tagged from JS, so a page without JS shows everything at once.
 * Siblings get a small stagger. Counters (data-count) count up when they
 * come into view. Under prefers-reduced-motion the CSS makes reveals
 * instant and counters jump straight to the final value.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function tagReveals() {
  const selector = [
    'main section h2',
    'main section article',
    'main section li',
    'main section form',
    'main section aside',
    'main section dl > div',
    'main section .reveal',
  ].join(',');
  const groups = new Map<Element, number>();
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    if (el.hasAttribute('data-reveal') || el.closest('[data-reveal]') !== null && el.closest('[data-reveal]') !== el) {
      // already tagged, or inside a tagged ancestor (avoid double motion)
      if (el.hasAttribute('data-reveal')) return;
    }
    const parent = el.parentElement ?? document.body;
    const i = groups.get(parent) ?? 0;
    groups.set(parent, i + 1);
    el.setAttribute('data-reveal', '');
    if (i > 0) el.style.setProperty('--reveal-delay', `${Math.min(i, 8) * 70}ms`);
  });
}

function formatNumber(n: number, decimals: number) {
  return n.toLocaleString('bg-BG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function runCounter(el: HTMLElement) {
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.decimals ?? 0);
  if (!Number.isFinite(target)) return;
  if (reduced) { el.textContent = formatNumber(target, decimals); return; }
  const duration = 1100;
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = formatNumber(target * eased, decimals);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initMotion() {
  tagReveals();
  const counted = new WeakSet<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add('is-in');
        el.querySelectorAll<HTMLElement>('[data-count]').forEach((c) => {
          if (counted.has(c)) return;
          counted.add(c);
          runCounter(c);
        });
        if (el.hasAttribute('data-count') && !counted.has(el)) { counted.add(el); runCounter(el); }
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  // counters that are not inside a reveal (e.g. header) still count
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((c) => {
    if (!c.closest('[data-reveal]')) io.observe(c);
  });
}
