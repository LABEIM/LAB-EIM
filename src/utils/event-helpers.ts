import type { CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { getCleanSlug, getLocalizedPath, t } from './i18n';
import { formatGlobalDate, parseGlobalDateStr } from './date';

export type EventEntry = CollectionEntry<'events'>;

/** All non-blank image URLs for an event: poster first, then gallery images. */
export function getEventImages(event: EventEntry): string[] {
  const poster = (event.data.poster ?? '').trim();
  const images = (event.data.image ?? []).map((src) => src.trim()).filter(Boolean);
  return Array.from(new Set([poster, ...images].filter(Boolean)));
}

/** Cover image: poster, then the first gallery image, then null. */
export function getEventCover(event: EventEntry): string | null {
  return getEventImages(event)[0] ?? null;
}

/** Trimmed, deduped documentation images for the event story (poster excluded). */
function getStoryImages(event: EventEntry): string[] {
  const images = (event.data.image ?? []).map((src) => src.trim()).filter(Boolean);
  return Array.from(new Set(images));
}

/** Story cover: first documentation image, then the poster, then null. */
export function getEventStoryCover(event: EventEntry): string | null {
  const first = getStoryImages(event)[0];
  if (first) return first;
  return (event.data.poster ?? '').trim() || null;
}

/** Story gallery: documentation images, excluding the exact story cover. */
export function getEventStoryGallery(event: EventEntry): string[] {
  const cover = getEventStoryCover(event);
  return getStoryImages(event).filter((src) => src !== cover);
}

export function getEventHref(event: EventEntry, locale: Locale): string {
  return getLocalizedPath(`/event/${getCleanSlug(event.id)}`, locale);
}

/** Parsed event date in milliseconds; 0 for missing or invalid dates. */
export function getEventDateMs(event: EventEntry): number {
  return parseGlobalDateStr(event.data.event_date);
}

/** Formatted event date in the site timezone, or the "date TBD" label. */
export function getEventDateLabel(event: EventEntry, locale: Locale): string {
  const ms = getEventDateMs(event);
  return ms === 0 ? t('events.dateTbd', locale) : formatGlobalDate(ms);
}

export function getEventSearchText(event: EventEntry): string {
  return [event.data.title, event.data.category, event.data.description, event.data.organizer]
    .map((value) => (value ?? '').trim())
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Newest first by default; invalid dates always sort last. */
export function compareEventDates(
  a: EventEntry,
  b: EventEntry,
  direction: 'asc' | 'desc' = 'desc'
): number {
  const timeA = getEventDateMs(a);
  const timeB = getEventDateMs(b);
  if (timeA === 0 && timeB === 0) return 0;
  if (timeA === 0) return 1;
  if (timeB === 0) return -1;
  return direction === 'asc' ? timeA - timeB : timeB - timeA;
}
