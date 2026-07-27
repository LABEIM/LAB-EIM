export function initRegistrationTimers(container: HTMLElement) {
  const stage = container.getAttribute('data-stage') || "auto";
  const openDateStr = container.getAttribute('data-open-date') || "2026-08-13T00:00:00";
  const deadlineStr = container.getAttribute('data-deadline') || "2026-08-20T23:59:59";
  const extendedDeadlineStr = container.getAttribute('data-extended-deadline') || "";

  const OPEN_TIME = new Date(openDateStr).getTime();
  const DEADLINE_TIME = new Date(deadlineStr).getTime();
  const EXTENDED_TIME = extendedDeadlineStr ? new Date(extendedDeadlineStr).getTime() : 0;

  const nowMs = new Date().getTime();
  const isExtendedStage = stage === 'extended';
  const activeDeadline = (EXTENDED_TIME > 0 && (isExtendedStage || (nowMs >= DEADLINE_TIME && nowMs < EXTENDED_TIME)))
    ? EXTENDED_TIME 
    : DEADLINE_TIME;

  // Extended Banner Check
  const extendedBanner = document.getElementById('extended-banner');
  if (extendedBanner) {
    const isExtendedNow = stage === 'extended' || (stage === 'auto' && EXTENDED_TIME > 0 && new Date().getTime() >= DEADLINE_TIME && new Date().getTime() < EXTENDED_TIME);
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

  const updateTimers = () => {
    const now = new Date().getTime();

    if (uDaysEl) {
      const uDistance = OPEN_TIME - now;
      if (uDistance > 0) {
        uDaysEl.innerText = String(Math.floor(uDistance / (1000 * 60 * 60 * 24)));
        if (uHoursEl) uHoursEl.innerText = String(Math.floor((uDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        if (uMinutesEl) uMinutesEl.innerText = String(Math.floor((uDistance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        if (uSecondsEl) uSecondsEl.innerText = String(Math.floor((uDistance % (1000 * 60)) / 1000)).padStart(2, '0');
      } else {
        uDaysEl.innerText = "0";
        if (uHoursEl) uHoursEl.innerText = "00";
        if (uMinutesEl) uMinutesEl.innerText = "00";
        if (uSecondsEl) uSecondsEl.innerText = "00";
      }
    }

    if (daysEl) {
      const distance = activeDeadline - now;
      if (distance > 0) {
        daysEl.innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24)));
        if (hoursEl) hoursEl.innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        if (minutesEl) minutesEl.innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        if (secondsEl) secondsEl.innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
      } else {
        daysEl.innerText = "0";
        if (hoursEl) hoursEl.innerText = "00";
        if (minutesEl) minutesEl.innerText = "00";
        if (secondsEl) secondsEl.innerText = "00";
      }
    }
  };

  updateTimers();
  setInterval(updateTimers, 1000);
}
