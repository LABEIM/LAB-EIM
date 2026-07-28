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
  const stage = container.getAttribute('data-stage') || "auto";
  const openDateStr = container.getAttribute('data-open-date') || "2026-08-13T00:00:00";
  const deadlineStr = container.getAttribute('data-deadline') || "2026-08-20T23:59:59";
  const extendedDeadlineStr = container.getAttribute('data-extended-deadline') || "";

  const OPEN_TIME = new Date(openDateStr).getTime();
  const DEADLINE_TIME = new Date(deadlineStr).getTime();
  const EXTENDED_TIME = extendedDeadlineStr ? new Date(extendedDeadlineStr).getTime() : 0;

  const nowMs = Date.now();
  const isExtendedStage = stage === 'extended';
  const activeDeadline = (EXTENDED_TIME > 0 && (isExtendedStage || (nowMs >= DEADLINE_TIME && nowMs < EXTENDED_TIME)))
    ? EXTENDED_TIME 
    : DEADLINE_TIME;

  // Extended Banner Check
  const extendedBanner = document.getElementById('extended-banner');
  if (extendedBanner) {
    const isExtendedNow = stage === 'extended' || (stage === 'auto' && EXTENDED_TIME > 0 && Date.now() >= DEADLINE_TIME && Date.now() < EXTENDED_TIME);
    extendedBanner.style.display = isExtendedNow ? 'block' : 'none';
  }

  // Dynamic Countdown Timers
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  const uDaysEl = document.getElementById('u-timer-days');
  const uHoursEl = document.getElementById('u-timer-hours');
  const uMinutesEl = document.getElementById('u-timer-minutes');
  const uSecondsEl = document.getElementById('u-timer-seconds');

  const applyTimeDisplay = (
    time: TimeRemaining,
    dEl: HTMLElement | null,
    hEl: HTMLElement | null,
    mEl: HTMLElement | null,
    sEl: HTMLElement | null
  ) => {
    if (dEl) dEl.innerText = time.days;
    if (hEl) hEl.innerText = time.hours;
    if (mEl) mEl.innerText = time.minutes;
    if (sEl) sEl.innerText = time.seconds;
  };

  const updateTimers = () => {
    const currentMs = Date.now();

    if (uDaysEl) {
      applyTimeDisplay(formatTimeRemaining(OPEN_TIME, currentMs), uDaysEl, uHoursEl, uMinutesEl, uSecondsEl);
    }

    if (daysEl) {
      applyTimeDisplay(formatTimeRemaining(activeDeadline, currentMs), daysEl, hoursEl, minutesEl, secondsEl);
    }
  };

  updateTimers();
  const timerInterval = setInterval(updateTimers, 1000);

  return () => clearInterval(timerInterval);
}
