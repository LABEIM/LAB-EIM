import { calculateStageFromDates, getEffectiveNowMs, updateGlobalAnnouncementBanner } from './registration/stage';
import { STAGE_ACTION_CONFIG } from '../utils/constants';

/**
 * Synchronizes the Navbar CTA button (Kontak vs Join Us) dynamically based on current recruitment stage.
 */
export function syncNavbarCTA(activeStage: string): void {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const ctaLink = navbar.querySelector<HTMLAnchorElement>('.nav-cta');
  if (!ctaLink) return;

  const joinLabel = navbar.getAttribute('data-join-label') || 'Join Us';
  const contactLabel = navbar.getAttribute('data-contact-label') || 'Kontak';
  const joinHref = navbar.getAttribute('data-join-href') || '/registration';
  const contactHref = navbar.getAttribute('data-contact-href') || '/contact';

  const isRecruitmentActive = activeStage === 'open' || activeStage === 'extended' || activeStage === 'fallback';

  const targetHref = isRecruitmentActive ? joinHref : contactHref;
  const targetLabel = isRecruitmentActive ? joinLabel : contactLabel;

  ctaLink.setAttribute('href', targetHref);

  const span = ctaLink.querySelector('span');
  if (span) {
    span.textContent = targetLabel;
  } else {
    ctaLink.textContent = targetLabel;
  }

  if (isRecruitmentActive) {
    ctaLink.classList.add('nav-cta-join');
    ctaLink.classList.remove('nav-cta-contact');
  } else {
    ctaLink.classList.add('nav-cta-contact');
    ctaLink.classList.remove('nav-cta-join');
  }

  // Active state matching against window.location.pathname
  const pathname = window.location.pathname;
  let cleanPath = pathname;
  if (cleanPath === '/en' || cleanPath.startsWith('/en/')) {
    cleanPath = cleanPath.slice(3) || '/';
  }
  if (cleanPath.endsWith('/') && cleanPath.length > 1) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const rawActiveHref = isRecruitmentActive ? '/registration' : '/contact';
  if (cleanPath.startsWith(rawActiveHref)) {
    ctaLink.classList.add('active');
  } else {
    ctaLink.classList.remove('active');
  }
}

/**
 * Synchronizes the Homepage Hero recruitment action button text, icon, and href dynamically.
 */
export function syncHeroRecruitmentBtn(activeStage: string): void {
  const heroBtn = document.getElementById('hero-recruitment-btn') as HTMLAnchorElement | null;
  if (!heroBtn) return;

  let actionConfig = (STAGE_ACTION_CONFIG as Record<string, any>)[activeStage];
  if (!actionConfig) {
    if (activeStage.endsWith('_results')) {
      actionConfig = { label: 'Check Selection Results', icon: 'fa-square-poll-vertical' };
    } else if (activeStage !== 'closed') {
      actionConfig = { label: 'Check Selection Phase Info', icon: 'fa-info-circle' };
    } else {
      actionConfig = { label: 'Recruitment Information', icon: 'fa-info-circle' };
    }
  }

  const span = heroBtn.querySelector('.hero-btn-text') || heroBtn.querySelector('span');
  const icon = heroBtn.querySelector('i');

  if (span) {
    span.textContent = actionConfig.label;
  }
  if (icon && actionConfig.icon) {
    icon.className = `fa-solid ${actionConfig.icon}`;
  }

  const joinHref = heroBtn.getAttribute('data-join-href') || '/registration';
  heroBtn.setAttribute('href', joinHref);
}

/**
 * Main global synchronization runner. Synchronizes Navbar CTA, Announcement Banner, and Hero Button across all site pages.
 */
export function initGlobalStageSync(overrideStage?: string): string {
  const configEl = document.getElementById('navbar') || document.getElementById('global-announcement-banner') || document.getElementById('registration-container');

  let activeStage = overrideStage;

  if (!activeStage && configEl) {
    const status = configEl.getAttribute('data-status') || 'auto';
    const timezoneOffset = configEl.getAttribute('data-timezone-offset') || '+07:00';

    let selectionSteps: any[] = [];
    try {
      const rawStepsStr = configEl.getAttribute('data-selection-steps');
      if (rawStepsStr) {
        selectionSteps = JSON.parse(rawStepsStr);
      }
    } catch (e) {}

    const config = {
      status,
      timezoneOffset,
      upcomingStartDate: configEl.getAttribute('data-upcoming-start-date') || undefined,
      openDate: configEl.getAttribute('data-open-date') || undefined,
      deadline: configEl.getAttribute('data-deadline') || undefined,
      extendedDeadline: configEl.getAttribute('data-extended-deadline') || undefined,
      selectionResultsDate: configEl.getAttribute('data-selection-results-date') || undefined,
      technicalTestStartDate: configEl.getAttribute('data-technical-test-start-date') || undefined,
      technicalTestEndDate: configEl.getAttribute('data-technical-test-end-date') || undefined,
      interviewStartDate: configEl.getAttribute('data-interview-start-date') || undefined,
      interviewEndDate: configEl.getAttribute('data-interview-end-date') || undefined,
      announcementDate: configEl.getAttribute('data-announcement-date') || undefined,
      selectionSteps,
    };

    activeStage = calculateStageFromDates(config, getEffectiveNowMs());
  }

  const stageToApply = activeStage || 'open';

  syncNavbarCTA(stageToApply);
  updateGlobalAnnouncementBanner(stageToApply);
  syncHeroRecruitmentBtn(stageToApply);

  return stageToApply;
}

if (typeof window !== 'undefined') {
  window.addEventListener('eim:stage-changed', ((e: CustomEvent) => {
    if (e && e.detail && e.detail.stage) {
      initGlobalStageSync(e.detail.stage);
    }
  }) as EventListener);
}
