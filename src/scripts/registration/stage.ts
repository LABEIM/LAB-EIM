import type { RecruitmentStage } from '../../utils/types';
import { parseGlobalDateStr, GLOBAL_SITE_TIMEZONE_OFFSET } from '../../utils/date';

let cachedServerTimeOffset: number | null = null;
let isFetchingServerTime = false;

function parseDateWithOffset(dateStr?: string, offset: string = GLOBAL_SITE_TIMEZONE_OFFSET): number {
  return parseGlobalDateStr(dateStr, offset);
}

/**
 * Calculates recruitment stage from dates and current timestamp.
 */
export function calculateStageFromDates(
  config: {
    status?: string;
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
  },
  nowMs: number = Date.now()
): RecruitmentStage {
  const rawStatus = config.status || 'auto';
  const offset = config.timezoneOffset || '+07:00';

  const validStages: RecruitmentStage[] = [
    'closed', 'upcoming', 'open', 'extended', 'selection',
    'selection_results', 'technical_test', 'technical_test_results',
    'interview', 'announcement'
  ];

  if (rawStatus !== 'auto' && validStages.includes(rawStatus as RecruitmentStage)) {
    return rawStatus as RecruitmentStage;
  }

  const upcomingStartTime = parseDateWithOffset(config.upcomingStartDate, offset);
  const openTime = parseDateWithOffset(config.openDate, offset);
  const deadlineTime = parseDateWithOffset(config.deadline, offset);
  const extendedTime = parseDateWithOffset(config.extendedDeadline, offset);
  const selectionResultsTime = parseDateWithOffset(config.selectionResultsDate, offset);
  const technicalTestStartTime = parseDateWithOffset(config.technicalTestStartDate, offset);
  const technicalTestEndTime = parseDateWithOffset(config.technicalTestEndDate, offset);
  const interviewStartTime = parseDateWithOffset(config.interviewStartDate, offset);
  const interviewEndTime = parseDateWithOffset(config.interviewEndDate, offset);
  const announcementTime = parseDateWithOffset(config.announcementDate, offset);

  if (upcomingStartTime > 0 && nowMs < upcomingStartTime) {
    return 'closed';
  } else if (openTime > 0 && nowMs < openTime) {
    return 'upcoming';
  } else if (deadlineTime > 0 && nowMs < deadlineTime) {
    return 'open';
  } else if (extendedTime > 0 && nowMs < extendedTime) {
    return 'extended';
  } else if (selectionResultsTime > 0 && nowMs < selectionResultsTime) {
    return 'selection';
  } else if (technicalTestStartTime > 0 && nowMs < technicalTestStartTime) {
    return 'selection_results';
  } else if (technicalTestEndTime > 0 && nowMs <= technicalTestEndTime) {
    return 'technical_test';
  } else if (interviewStartTime > 0 && nowMs < interviewStartTime) {
    return 'technical_test_results';
  } else if (interviewEndTime > 0 && nowMs <= interviewEndTime) {
    return 'interview';
  } else if (announcementTime > 0 && nowMs >= announcementTime) {
    return 'announcement';
  } else {
    return 'closed';
  }
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
  const config = {
    status,
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
  };

  const activeStage = calculateStageFromDates(config, getEffectiveNowMs());
  container.setAttribute('data-stage', activeStage);

  const stageViewMap: Record<string, string> = {
    upcoming: 'view-upcoming',
    open: 'view-open',
    extended: 'view-open',
    selection: 'view-screening',
    selection_results: 'view-screening-results',
    technical_test: 'view-technical-test',
    technical_test_results: 'view-technical-test-results',
    interview: 'view-interview',
    announcement: 'view-announcement',
    closed: 'view-closed',
    fallback: 'view-fallback',
  };

  const activeViewId = stageViewMap[activeStage] || 'view-closed';

  const viewIds = [
    'view-upcoming',
    'view-open',
    'view-screening',
    'view-screening-results',
    'view-technical-test',
    'view-technical-test-results',
    'view-interview',
    'view-announcement',
    'view-closed',
    'view-fallback',
  ];

  viewIds.forEach((viewId) => {
    const el = document.getElementById(viewId);
    if (el) {
      if (viewId === activeViewId) {
        el.classList.remove('is-hidden');
      } else {
        el.classList.add('is-hidden');
      }
    }
  });

  const extendedBanner = document.getElementById('extended-banner');
  if (extendedBanner) {
    extendedBanner.classList.toggle('is-hidden', activeStage !== 'extended');
    extendedBanner.style.display = activeStage === 'extended' ? 'block' : 'none';
  }

  return activeStage;
}
