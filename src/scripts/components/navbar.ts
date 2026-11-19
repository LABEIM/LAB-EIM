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
  const menuLabels = {
    open: navbar?.getAttribute('data-label-menu-open') || '',
    close: navbar?.getAttribute('data-label-menu-close') || '',
  };

  function setOpen(open: boolean): void {
    toggle.classList.toggle('active', open);
    links.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open ? menuLabels.close : menuLabels.open) {
      toggle.setAttribute('aria-label', open ? menuLabels.close : menuLabels.open);
    }
    document.documentElement.classList.toggle('nav-open', open);
    document
      .querySelectorAll<HTMLElement>('main, footer, #global-announcement-banner, .logo-container')
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
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key !== 'Tab') return;

    // Keep focus between the sheet links and the close button; everything
    // else on the page is inert while the sheet is open.
    const stops: HTMLElement[] = Array.from(links.querySelectorAll<HTMLElement>('a'));
    stops.push(toggle);
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen()) setOpen(false);
  });
}
