/**
 * Right-rail section navigation (homepage, desktop).
 * Marks the section currently crossing the upper-middle of the viewport and
 * keeps the jump links in sync with native anchor scrolling.
 */

export function initSectionNav(): void {
  const nav = document.querySelector<HTMLElement>('.eim-section-nav');
  if (!nav) return;

  const entries = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[data-section]'))
    .map((link) => {
      const id = link.dataset.section;
      const el = id ? document.getElementById(id) : null;
      return el ? { link, el } : null;
    })
    .filter((entry): entry is { link: HTMLAnchorElement; el: HTMLElement } => entry !== null);

  if (entries.length === 0) return;

  let queued = false;

  function update(): void {
    queued = false;
    const marker = window.innerHeight * 0.45;

    // None yet while the visitor is still on the hero: leave every dot
    // inactive instead of falsely claiming the first section.
    let current: { link: HTMLAnchorElement; el: HTMLElement } | null = null;
    for (const entry of entries) {
      if (entry.el.getBoundingClientRect().top <= marker) current = entry;
    }

    for (const entry of entries) {
      const active = entry === current;
      entry.link.classList.toggle('is-active', active);
      if (active) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    }
  }

  function schedule(): void {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}
