import { syncRegistrationStage, syncServerTimeOffset, getEffectiveNowMs } from './stage';
import { parseGlobalDateStr, GLOBAL_SITE_TIMEZONE_OFFSET } from '../../utils/date';

export interface TimeRemaining {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isExpired: boolean;
}

export function formatTimeRemaining(targetTimeMs: number, nowMs: number): TimeRemaining {
  const distance = targetTimeMs - nowMs;
  if (distance <= 0) {
    return { days: '0', hours: '00', minutes: '00', seconds: '00', isExpired: true };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    days: String(days),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    isExpired: false
  };
}

export function initRegistrationTimers(container: HTMLElement): () => void {
  // Initial synchronous stage check
  syncRegistrationStage(container);

  // Background Cloudflare Edge Server Time sync
  syncServerTimeOffset().then(() => {
    syncRegistrationStage(container);
  });

  // Dynamic Countdown Timers helper
  const applyTimeDisplay = (
    time: TimeRemaining,
    daysQuery: string,
    hoursQuery: string,
    minutesQuery: string,
    secondsQuery: string
  ) => {
    document.querySelectorAll<HTMLElement>(daysQuery).forEach((el) => (el.innerText = time.days));
    document.querySelectorAll<HTMLElement>(hoursQuery).forEach((el) => (el.innerText = time.hours));
    document.querySelectorAll<HTMLElement>(minutesQuery).forEach((el) => (el.innerText = time.minutes));
    document.querySelectorAll<HTMLElement>(secondsQuery).forEach((el) => (el.innerText = time.seconds));
  };

  const updateTimers = () => {
    // Recalculate dynamic stage on tick (handles live transition when timer expires)
    const currentStage = syncRegistrationStage(container);
    const currentMs = getEffectiveNowMs();

    const timezoneOffset = container.getAttribute('data-timezone-offset') || GLOBAL_SITE_TIMEZONE_OFFSET;
    const openDateStr = container.getAttribute('data-open-date') || "2026-08-13T00:00:00";
    const deadlineStr = container.getAttribute('data-deadline') || "2026-08-20T23:59:59";
    const extendedDeadlineStr = container.getAttribute('data-extended-deadline') || "";

    const openTime = parseGlobalDateStr(openDateStr, timezoneOffset);
    const deadlineTime = parseGlobalDateStr(deadlineStr, timezoneOffset);
    const extendedTime = extendedDeadlineStr ? parseGlobalDateStr(extendedDeadlineStr, timezoneOffset) : 0;

    const isExtendedStage = currentStage === 'extended';
    const activeDeadline = (extendedTime > 0 && (isExtendedStage || (currentMs >= deadlineTime && currentMs < extendedTime)))
      ? extendedTime 
      : deadlineTime;

    applyTimeDisplay(
      formatTimeRemaining(openTime, currentMs),
      '#u-timer-days',
      '#u-timer-hours',
      '#u-timer-minutes',
      '#u-timer-seconds'
    );

    applyTimeDisplay(
      formatTimeRemaining(activeDeadline, currentMs),
      '#timer-days, #f-timer-days',
      '#timer-hours, #f-timer-hours',
      '#timer-minutes, #f-timer-minutes',
      '#timer-seconds, #f-timer-seconds'
    );
  };

  updateTimers();
  const timerInterval = setInterval(updateTimers, 1000);

  return () => clearInterval(timerInterval);
}

