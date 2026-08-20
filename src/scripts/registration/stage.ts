import type { RecruitmentStage, SelectionStepConfig } from '../../utils/types';
import { parseGlobalDateStr, GLOBAL_SITE_TIMEZONE_OFFSET } from '../../utils/date';

let cachedServerTimeOffset: number | null = null;
let isFetchingServerTime = false;

function parseDateWithOffset(dateStr?: string, offset: string = GLOBAL_SITE_TIMEZONE_OFFSET): number {
  return parseGlobalDateStr(dateStr, offset);
}

/**
 * Calculates recruitment stage from dates, status override, dynamic pipeline steps, and current timestamp.
 */
export function calculateStageFromDates(
  config: {
    status?: string;
    autoCloseAfterDeadline?: boolean | string;
    timezoneOffset?: string;
    upcomingStartDate?: string;
    openDate?: string;
    deadline?: string;
    extendedDeadline?: string;
    selectionResultsDate?: string;
    technicalTestStartDate?: string;
    technicalTestEndDate?: string;
    interviewStartDate?: string;
    interviewEndDate?: string;
    announcementDate?: string;
    selectionSteps?: SelectionStepConfig[];
  },
  nowMs: number = Date.now()
): RecruitmentStage | string {
  const rawStatus = config.status || 'auto';
  const offset = config.timezoneOffset || GLOBAL_SITE_TIMEZONE_OFFSET;
  const rawSteps = config.selectionSteps || [];

  if (rawStatus !== 'auto') {
    const matchedStep = rawSteps.find((s) => rawStatus === s.id || rawStatus === `${s.id}_results`);
    if (matchedStep && matchedStep.enabled === false) {
      const stepIdx = rawSteps.findIndex((s) => s.id === matchedStep.id);
      let fallbackStage = '';
      for (let i = stepIdx - 1; i >= 0; i--) {
        if (rawSteps[i].enabled !== false) {
          fallbackStage = rawSteps[i].resultsDate ? `${rawSteps[i].id}_results` : rawSteps[i].id;
          break;
        }
      }
      if (fallbackStage) {
        return fallbackStage;
      }
    } else {
      return rawStatus;
    }
  }

  const upcomingStartTime = parseDateWithOffset(config.upcomingStartDate, offset);
  const openTime = parseDateWithOffset(config.openDate, offset);
  const deadlineTime = parseDateWithOffset(config.deadline, offset);
  const extendedTime = parseDateWithOffset(config.extendedDeadline, offset);
  const announcementTime = parseDateWithOffset(config.announcementDate, offset);

  if (upcomingStartTime > 0 && nowMs < upcomingStartTime) {
    return 'closed';
  } else if (openTime > 0 && nowMs < openTime) {
    return 'upcoming';
  } else if (deadlineTime > 0 && nowMs < deadlineTime) {
    return 'open';
  } else if (extendedTime > 0 && deadlineTime > 0 && extendedTime > deadlineTime && nowMs >= deadlineTime && nowMs < extendedTime) {
    return 'extended';
  }

  const autoClose = config.autoCloseAfterDeadline !== undefined
    ? (config.autoCloseAfterDeadline === true || config.autoCloseAfterDeadline === 'true')
    : true;

  const enabledSteps = rawSteps.filter((s) => s.enabled !== false);

  if (enabledSteps.length > 0) {
    // Check if we are in the window between registration deadline and first step start date
    const firstStep = enabledSteps[0];
    const firstStepStartTime = firstStep.startDate ? parseDateWithOffset(firstStep.startDate, offset) : 0;

    if (firstStepStartTime > 0 && nowMs < firstStepStartTime) {
      return 'closed';
    }

    for (let i = 0; i < enabledSteps.length; i++) {
      const step = enabledSteps[i];
      const stepStartTime = step.startDate ? parseDateWithOffset(step.startDate, offset) : 0;
      const stepEndTime = step.endDate ? parseDateWithOffset(step.endDate, offset) : 0;
      const stepResultsTime = step.resultsDate ? parseDateWithOffset(step.resultsDate, offset) : 0;

      if (stepEndTime > 0 && nowMs <= stepEndTime) {
        if (stepStartTime > 0 && nowMs < stepStartTime && i > 0) {
          const prevStep = enabledSteps[i - 1];
          return prevStep.resultsDate ? `${prevStep.id}_results` : prevStep.id;
        }
        return step.id;
      }

      if (stepResultsTime > 0 && nowMs < stepResultsTime) {
        return `${step.id}_results`;
      }

      const nextStep = enabledSteps[i + 1];
      if (nextStep && nextStep.startDate) {
        const nextStartTime = parseDateWithOffset(nextStep.startDate, offset);
        if (nowMs < nextStartTime) {
          return `${step.id}_results`;
        }
      }
    }
  } else {
    // When no selection steps are enabled
    if (announcementTime > 0 && nowMs >= announcementTime) {
      return 'announcement';
    }
    if (autoClose) {
      return 'closed';
    }
  }

  if (announcementTime > 0 && nowMs >= announcementTime) {
    return 'announcement';
  }

  return announcementTime > 0 && nowMs < announcementTime
    ? (enabledSteps.length > 0 ? `${enabledSteps[enabledSteps.length - 1].id}_results` : 'closed')
    : 'announcement';
}

/**
 * Reads Cloudflare Edge HTTP Date header to calibrate client time against server time.
 */
export async function syncServerTimeOffset(): Promise<number> {
  if (cachedServerTimeOffset !== null) return cachedServerTimeOffset;
  if (isFetchingServerTime) return 0;

  isFetchingServerTime = true;
  try {
    const response = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
    const dateHeader = response.headers.get('Date');
    if (dateHeader) {
      const serverMs = new Date(dateHeader).getTime();
      if (!isNaN(serverMs)) {
        cachedServerTimeOffset = serverMs - Date.now();
        isFetchingServerTime = false;
        return cachedServerTimeOffset;
      }
    }
  } catch (e) {
    // Secondary fallback to external time API below
  }

  // Secondary Fallback: Query public World Time API (Asia/Jakarta)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Jakarta', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.datetime) {
        const serverMs = new Date(data.datetime).getTime();
        if (!isNaN(serverMs)) {
          cachedServerTimeOffset = serverMs - Date.now();
          isFetchingServerTime = false;
          return cachedServerTimeOffset;
        }
      }
    }
  } catch (e) {
    // Fallback to local clock on fetch failure
  }

  isFetchingServerTime = false;
  cachedServerTimeOffset = 0;
  return 0;
}

/**
 * Returns current effective timestamp (calibrated by Cloudflare Server Time if available).
 */
export function getEffectiveNowMs(): number {
  return Date.now() + (cachedServerTimeOffset || 0);
}

/**
 * Synchronizes view visibility based on real-time stage evaluation.
 */
export function syncRegistrationStage(container: HTMLElement): RecruitmentStage {
  const status = container.getAttribute('data-status') || 'auto';
  const timezoneOffset = container.getAttribute('data-timezone-offset') || '+07:00';
  const autoCloseAttr = container.getAttribute('data-auto-close-after-deadline');
  const autoCloseAfterDeadline = autoCloseAttr !== null ? autoCloseAttr === 'true' : true;

  let selectionSteps: SelectionStepConfig[] = [];
  try {
    const rawStepsStr = container.getAttribute('data-selection-steps');
    if (rawStepsStr) {
      selectionSteps = JSON.parse(rawStepsStr);
    }
  } catch (e) {}

  const config = {
    status,
    autoCloseAfterDeadline,
    timezoneOffset,
    upcomingStartDate: container.getAttribute('data-upcoming-start-date') || undefined,
    openDate: container.getAttribute('data-open-date') || undefined,
    deadline: container.getAttribute('data-deadline') || undefined,
    extendedDeadline: container.getAttribute('data-extended-deadline') || undefined,
    selectionResultsDate: container.getAttribute('data-selection-results-date') || undefined,
    technicalTestStartDate: container.getAttribute('data-technical-test-start-date') || undefined,
    technicalTestEndDate: container.getAttribute('data-technical-test-end-date') || undefined,
    interviewStartDate: container.getAttribute('data-interview-start-date') || undefined,
    interviewEndDate: container.getAttribute('data-interview-end-date') || undefined,
    announcementDate: container.getAttribute('data-announcement-date') || undefined,
    selectionSteps,
  };

  const activeStage = calculateStageFromDates(config, getEffectiveNowMs());
  container.setAttribute('data-stage', activeStage);

  let activeViewId = 'view-closed';

  if (activeStage === 'upcoming') {
    activeViewId = 'view-upcoming';
  } else if (activeStage === 'open' || activeStage === 'extended') {
    activeViewId = 'view-open';
  } else if (activeStage === 'announcement') {
    activeViewId = 'view-announcement';
  } else if (activeStage === 'closed') {
    activeViewId = 'view-closed';
  } else if (activeStage === 'fallback') {
    activeViewId = 'view-fallback';
  } else {
    const dynTarget = `view-${activeStage.replace('_results', '-results')}`;
    const hypTarget = dynTarget.replace(/_/g, '-');
    const undTarget = dynTarget.replace(/-/g, '_');
    const dynElement = document.getElementById(dynTarget) || document.getElementById(hypTarget) || document.getElementById(undTarget);
    if (dynElement) {
      activeViewId = dynElement.id;
    } else {
      const legacyMap: Record<string, string> = {
        selection: 'view-selection',
        selection_results: 'view-selection-results',
        technical_test: 'view-technical-test',
        technical_test_results: 'view-technical-test-results',
        interview: 'view-interview',
      };
      activeViewId = legacyMap[activeStage] || 'view-closed';
    }
  }

  const allViews = document.querySelectorAll<HTMLElement>('[id^="view-"]');
  allViews.forEach((el) => {
    if (el.id === activeViewId) {
      el.classList.remove('is-hidden');
    } else {
      el.classList.add('is-hidden');
    }
  });

  const extendedBanner = document.getElementById('extended-banner');
  if (extendedBanner) {
    extendedBanner.classList.toggle('is-hidden', activeStage !== 'extended');
    extendedBanner.style.display = activeStage === 'extended' ? 'block' : 'none';
  }

  updateGlobalAnnouncementBanner(activeStage);
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('eim:stage-changed', { detail: { stage: activeStage } }));
    } catch (e) {}
  }

  return activeStage;
}

export function updateGlobalAnnouncementBanner(stage: string): void {
  const banner = document.getElementById('global-announcement-banner');
  if (!banner) return;

  const bannerId = banner.getAttribute('data-banner-id') || 'default';
  if (typeof localStorage !== 'undefined') {
    try {
      if (localStorage.getItem('eim_announcement_dismissed_' + bannerId) === 'true') {
        banner.style.display = 'none';
        document.body.classList.remove('has-announcement-banner');
        return;
      }
    } catch (e) {}
  }

  const badgeIcon = banner.querySelector('.announcement-badge i');
  const badgeText = banner.querySelector('.badge-text');
  const messageText = banner.querySelector('.announcement-text');
  const ctaSpan = banner.querySelector('.announcement-cta span');

  let alertType = 'recruitment';
  let iconClass = 'fa-solid fa-bullhorn';
  let bText = 'REKRUTMEN';
  let msg = 'Pendaftaran Asisten EIM Research Lab sedang berlangsung!';
  let cta = 'Lihat Informasi';
  let isVisible = true;

  if (stage === 'open') {
    alertType = 'recruitment';
    iconClass = 'fa-solid fa-user-plus';
    bText = 'REKRUTMEN DIBUKA';
    msg = 'Pendaftaran Asisten EIM Research Lab telah resmi dibuka!';
    cta = 'Daftar Sekarang';
  } else if (stage === 'extended') {
    alertType = 'recruitment';
    iconClass = 'fa-solid fa-clock-rotate-left';
    bText = 'DIPERPANJANG';
    msg = 'Pendaftaran Asisten EIM Research Lab diperpanjang!';
    cta = 'Daftar Sekarang';
  } else if (stage === 'upcoming') {
    alertType = 'recruitment';
    iconClass = 'fa-solid fa-calendar-check';
    bText = 'SEGERA DIBUKA';
    msg = 'Pendaftaran Asisten EIM Research Lab akan segera dibuka!';
    cta = 'Lihat Persyaratan';
  } else if (stage === 'announcement') {
    alertType = 'success';
    iconClass = 'fa-solid fa-trophy';
    bText = 'HASIL AKHIR';
    msg = 'Pengumuman Akhir Kelulusan Asisten EIM Research Lab!';
    cta = 'Lihat Pengumuman';
  } else if (stage.endsWith('_results') || stage === 'selection_results' || stage === 'technical_test_results') {
    alertType = 'success';
    iconClass = 'fa-solid fa-bullhorn';
    bText = 'PENGUMUMAN';
    msg = 'Pengumuman hasil seleksi rekrutmen asisten telah dibuka!';
    cta = 'Cek Status';
  } else if (stage === 'closed') {
    isVisible = false;
  } else {
    alertType = 'recruitment';
    iconClass = 'fa-solid fa-spinner';
    bText = 'TAHAP SELEKSI';
    msg = 'Tahap seleksi rekrutmen asisten sedang berlangsung!';
    cta = 'Lihat Informasi';
  }

  if (!isVisible) {
    banner.style.display = 'none';
    document.body.classList.remove('has-announcement-banner');
  } else {
    banner.style.display = '';
    banner.className = `global-announcement-bar theme-${alertType}`;
    document.body.classList.add('has-announcement-banner');
    if (badgeIcon) badgeIcon.className = iconClass;
    if (badgeText) badgeText.textContent = bText;
    if (messageText) messageText.textContent = msg;
    if (ctaSpan) ctaSpan.textContent = cta;
  }
}
