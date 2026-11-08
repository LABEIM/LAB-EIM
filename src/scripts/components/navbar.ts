import { initGlobalStageSync } from '../global-stage-sync';

export function initNavbar(): void {
  initGlobalStageSync();

  const navbar = document.getElementById('navbar');
  let ticking = false;

  function updateScrolled(): void {
    ticking = false;
    navbar?.classList.toggle('scrolled', window.scrollY > 24);
  }

  function onScroll(): void {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrolled);
  }

  requestAnimationFrame(updateScrolled);
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.getElementById('nav-toggle') as HTMLButtonElement | null;
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

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
