/**
 * Scroll-driven media reveal.
 *
 * A CSS view timeline cannot animate a `position: sticky` element — the
 * element's viewport progress never changes, so `animation-timeline: view()`
 * on it produces a constant value. Drive the scale from the stage's scroll
 * position instead; this works in every browser and stays transform-only.
 */

const MIN_SCALE = 0.62;
/* Growth window measured against the viewport: starts when the stage top is
   65% down the screen and completes when it is 30% down — the media is at full
   size before the section has finished sliding in. */
const START_RATIO = 0.65;
const END_RATIO = 0.3;

export function initMediaReveal(): void {
  const stageQuery = document.querySelector<HTMLElement>('.e-reveal-stage');
  const figureQuery = document.querySelector<HTMLElement>('.e-reveal-stage-figure');
  if (!stageQuery || !figureQuery || stageQuery.classList.contains('is-pending')) return;
  // Non-nullable aliases for the hoisted closures below.
  const stage: HTMLElement = stageQuery;
  const figure: HTMLElement = figureQuery;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;

  function update(): void {
    queued = false;
    if (reduce.matches) {
      figure.style.transform = '';
      return;
    }
    const vh = window.innerHeight;
    const rect = stage.getBoundingClientRect();
    const start = vh * START_RATIO;
    const end = vh * END_RATIO;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
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
