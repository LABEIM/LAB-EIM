import { initGlobalStageSync } from '../global-stage-sync';

export function initNavbar(): void {
  initGlobalStageSync();

  const navbar = document.getElementById('navbar');
  let ticking = false;

  function updateScrolled(): void {
    ticking = false;
    navbar?.classList.toggle('scrolled', window.scrollY > 24);

    // Progress hairline. Chromium drives it with a CSS scroll timeline; this
    // custom property is the fallback for browsers without one (Safari < 26,
    // Firefox), and the animation simply overrides it where supported.
    if (navbar) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      navbar.style.setProperty('--nav-progress', progress.toFixed(4));
    }
  }

  function onScroll(): void {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrolled);
  }

  requestAnimationFrame(updateScrolled);
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggleQuery = document.getElementById('nav-toggle') as HTMLButtonElement | null;
  const linksQuery = document.getElementById('nav-links');
  if (!toggleQuery || !linksQuery) return;
  // Non-nullable aliases for the hoisted closures below.
  const toggle: HTMLButtonElement = toggleQuery;
  const links: HTMLElement = linksQuery;

  const isOpen = (): boolean => toggle.getAttribute('aria-expanded') === 'true';

  function setOpen(open: boolean): void {
    toggle.classList.toggle('active', open);
    links.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    document.documentElement.classList.toggle('nav-open', open);
    document
      .querySelectorAll<HTMLElement>('main, footer, #global-announcement-banner')
      .forEach((el) => {
        el.inert = open;
      });

    if (open) {
      links.querySelector<HTMLElement>('a')?.focus();
    } else if (document.activeElement && links.contains(document.activeElement)) {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      setOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen()) setOpen(false);
  });
}
