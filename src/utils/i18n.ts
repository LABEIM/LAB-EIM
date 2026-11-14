export type Locale = 'id';

export const DEFAULT_LOCALE: Locale = 'id';
export const LOCALES: Locale[] = ['id'];

/**
 * Determine locale from URL object or pathname string (always 'id')
 */
export function getLocaleFromUrl(_url?: URL | string): Locale {
  return DEFAULT_LOCALE;
}

/**
 * Helper to build URL paths (ensures clean non-prefixed paths)
 */
export function getLocalizedPath(path: string, _locale?: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  let cleanPath = normalized;
  if (cleanPath === '/en' || cleanPath.startsWith('/en/')) {
    cleanPath = cleanPath.slice(3) || '/';
  }
  return cleanPath;
}

/**
 * Helper function to deep merge data objects with Indonesian fallback
 */
export function mergeWithFallback<T extends Record<string, any>>(idData: T, enData?: Partial<T> | null): T {
  if (!enData) return idData;
  const result: any = Array.isArray(idData) ? [...idData] : { ...idData };

  for (const key of Object.keys(idData)) {
    const valEn = (enData as any)[key];
    const valId = (idData as any)[key];

    if (valEn !== undefined && valEn !== null && valEn !== '') {
      if (typeof valEn === 'object' && !Array.isArray(valEn) && typeof valId === 'object' && !Array.isArray(valId)) {
        result[key] = mergeWithFallback(valId, valEn);
      } else {
        result[key] = valEn;
      }
    }
  }
  return result as T;
}

// Statically load all data files using Vite import.meta.glob (works in browser, node, vercel, etc.)
const allDataFiles = import.meta.glob<Record<string, any>>('../data/**/*.json', { eager: true, import: 'default' });

/**
 * Helper to load localized JSON data from src/data/{filename}.json or src/data/{id,en}/{filename}.json
 */
export function getLocalizedJsonData<T extends Record<string, any>>(filename: string, locale: Locale = DEFAULT_LOCALE): T {
  const idKey = `../data/id/${filename}.json`;
  const enKey = `../data/en/${filename}.json`;
  const rootKey = `../data/${filename}.json`;

  const hasLocalized = Boolean(allDataFiles[idKey] || allDataFiles[enKey]);
  if (hasLocalized) {
    const idData: T = (allDataFiles[idKey] as T) || (allDataFiles[rootKey] as T) || ({} as T);
    if (locale === 'id') return idData;

    const enData: Partial<T> = (allDataFiles[enKey] as Partial<T>) || {};
    return mergeWithFallback(idData, enData);
  }

  if (allDataFiles[rootKey]) {
    return allDataFiles[rootKey] as T;
  }

  return {} as T;
}

/**
 * Filter collection entries by locale with fallback for missing entries in requested locale
 */
export function getCollectionEntriesForLocale<T extends { id: string }>(entries: T[], locale: Locale = DEFAULT_LOCALE): T[] {
  const localePrefix = `${locale}/`;
  const defaultPrefix = `${DEFAULT_LOCALE}/`;

  const targetEntriesMap = new Map<string, T>();
  const defaultEntriesMap = new Map<string, T>();
  const flatEntries: T[] = [];

  for (const entry of entries) {
    if (entry.id.startsWith(localePrefix)) {
      const cleanSlug = entry.id.replace(localePrefix, '');
      targetEntriesMap.set(cleanSlug, entry);
    } else if (entry.id.startsWith(defaultPrefix)) {
      const cleanSlug = entry.id.replace(defaultPrefix, '');
      defaultEntriesMap.set(cleanSlug, entry);
    } else {
      flatEntries.push(entry);
    }
  }

  if (targetEntriesMap.size === 0 && defaultEntriesMap.size === 0) {
    return entries;
  }

  const result: T[] = [...flatEntries];
  const allSlugs = new Set([...defaultEntriesMap.keys(), ...targetEntriesMap.keys()]);
  for (const slug of allSlugs) {
    const entry = targetEntriesMap.get(slug) || defaultEntriesMap.get(slug);
    if (entry) {
      result.push(entry);
    }
  }

  return result;
}

/**
 * Helper to clean entry slug for routing (strips 'id/' or 'en/' prefix)
 */
export function getCleanSlug(id: string): string {
  return id.replace(/^(id|en)\//, '');
}
