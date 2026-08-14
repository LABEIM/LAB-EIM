import { initGlobalStageSync } from '../global-stage-sync';

export function initNavbar(): void {
  initGlobalStageSync();
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  
  // Initial check wrapped in requestAnimationFrame to avoid forced reflows during page parsing
  requestAnimationFrame(() => {
    handleScroll();
  });
  window.addEventListener('scroll', handleScroll);

  // Handle mobile menu toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  navToggle?.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks?.classList.toggle('active');
  });

  // Close menu on link click
  const links = navLinks?.querySelectorAll('a');
  links?.forEach(link => {
    link.addEventListener('click', () => {
      navToggle?.classList.remove('active');
      navLinks?.classList.remove('active');
    });
  });
}
