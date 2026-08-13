import siteData from '../data/site.json';

export const GLOBAL_SITE_TIMEZONE = siteData.timezone || 'Asia/Jakarta';
export const GLOBAL_SITE_TIMEZONE_OFFSET = siteData.timezoneOffset || '+07:00';

/**
 * Safely parses any ISO date string for the website.
 * Automatically appends the global site timezone offset (+07:00) if no offset is present.
 */
export function parseGlobalDateStr(
  dateStr?: string | null,
  fallbackOffset: string = GLOBAL_SITE_TIMEZONE_OFFSET
): number {
  if (!dateStr) return 0;
  let normalized = dateStr.trim();
  if (!normalized) return 0;

  // Append timezone offset if format is YYYY-MM-DDTHH:mm:ss or YYYY-MM-DD HH:mm:ss without timezone offset
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}$/.test(normalized)) {
    normalized += fallbackOffset;
  }
  const timestamp = new Date(normalized).getTime();
  return isNaN(timestamp) ? 0 : timestamp;
}

/**
 * Formats a date string, Date object, or timestamp using the site's global timezone (e.g., Asia/Jakarta).
 */
export function formatGlobalDate(
  dateInput?: Date | string | number | null,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'id-ID',
  timeZone: string = GLOBAL_SITE_TIMEZONE
): string {
  if (!dateInput) return '';

  let dateObj: Date;
  if (typeof dateInput === 'string') {
    const ms = parseGlobalDateStr(dateInput);
    if (ms === 0) return dateInput;
    dateObj = new Date(ms);
  } else if (typeof dateInput === 'number') {
    dateObj = new Date(dateInput);
  } else {
    dateObj = dateInput;
  }

  if (isNaN(dateObj.getTime())) return String(dateInput);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (e) {
    return dateObj.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
