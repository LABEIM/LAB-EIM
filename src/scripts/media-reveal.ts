/**
 * Scroll-driven media reveal.
 *
 * A CSS view timeline cannot animate a `position: sticky` element — the
 * element's viewport progress never changes, so `animation-timeline: view()`
 * on it produces a constant value. Drive the scale from the stage's scroll
 * position instead; this works in every browser and stays transform-only.
 */

const MIN_SCALE = 0.62;
const RANGE_START = 0.1;
const RANGE_END = 0.9;

export function initMediaReveal(): void {
  const stage = document.querySelector<HTMLElement>('.e-reveal-stage');
  const figure = document.querySelector<HTMLElement>('.e-reveal-stage-figure');
  if (!stage || !figure) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;

  function update(): void {
    queued = false;
    if (reduce.matches) {
      figure.style.transform = '';
      return;
    }
    const rect = stage.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    if (travel <= 0) {
      figure.style.transform = '';
      return;
    }
    const raw = Math.min(1, Math.max(0, -rect.top / travel));
    const progress = Math.min(
      1,
      Math.max(0, (raw - RANGE_START) / (RANGE_END - RANGE_START))
    );
    const scale = MIN_SCALE + (1 - MIN_SCALE) * progress;
    figure.style.transform = `scale(${scale.toFixed(3)})`;
  }

  function schedule(): void {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  reduce.addEventListener('change', schedule);
  update();
}
