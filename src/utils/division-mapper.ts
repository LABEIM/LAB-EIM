import type { DivisionConfig } from './types';

export type { DivisionConfig };

// Global fallback synonyms mapping legacy English & Indonesian keys bidirectional
const FALLBACK_SYNONYMS: Record<string, string[]> = {
  core: ['inti', 'core'],
  inti: ['core', 'inti'],
  research: ['riset', 'research'],
  riset: ['research', 'riset'],
  community: ['pengmas', 'care', 'community'],
  pengmas: ['community', 'care', 'pengmas'],
  care: ['community', 'pengmas', 'care'],
  media: ['medhum', 'media', 'prc'],
  medhum: ['media', 'prc', 'medhum'],
  competition: ['lomba', 'competition'],
  lomba: ['competition', 'lomba'],
  pku: ['pku', 'pelatihan'],
};

/**
 * Builds a Map indexing divisions by ID, aliases, registrationValue, name,
 * and built-in fallback synonyms. Ensures 100% zero-failure resolution between
 * Keystatic configuration edits and member division records.
 */
export function buildDivisionMap(divisions: DivisionConfig[]): Map<string, DivisionConfig> {
  const map = new Map<string, DivisionConfig>();

  if (!Array.isArray(divisions)) return map;

  for (const div of divisions) {
    if (!div || !div.id) continue;

    const keysToIndex = new Set<string>();

    // 1. Canonical ID
    const canonicalId = div.id.trim().toLowerCase();
    keysToIndex.add(canonicalId);

    // 2. Registration Value
    if (div.registrationValue && typeof div.registrationValue === 'string') {
      keysToIndex.add(div.registrationValue.trim().toLowerCase());
    }

    // 3. Name & DisplayName
    if (div.name && typeof div.name === 'string') {
      keysToIndex.add(div.name.trim().toLowerCase());
    }

    // 4. Custom Aliases
    if (Array.isArray(div.aliases)) {
      for (const alias of div.aliases) {
        if (alias && typeof alias === 'string') {
          keysToIndex.add(alias.trim().toLowerCase());
        }
      }
    }

    // 5. Expand with FALLBACK_SYNONYMS for all collected keys
    const currentKeys = Array.from(keysToIndex);
    for (const key of currentKeys) {
      if (FALLBACK_SYNONYMS[key]) {
        for (const syn of FALLBACK_SYNONYMS[key]) {
          keysToIndex.add(syn);
        }
      }
    }

    // Index all resolved keys in the map
    for (const key of keysToIndex) {
      map.set(key, div);
    }
  }

  return map;
}

/**
 * Retrieves the division configuration matching an ID, alias, or legacy term.
 * Accepts an optional pre-built Map to optimize performance when looking up multiple items.
 */
export function getDivisionInfo(
  divIdOrAlias: string,
  divisions: DivisionConfig[] | Map<string, DivisionConfig>
): DivisionConfig | undefined {
  if (!divIdOrAlias) return undefined;
  const key = divIdOrAlias.trim().toLowerCase();
  const map = divisions instanceof Map ? divisions : buildDivisionMap(divisions);
  return map.get(key);
}

/**
 * Checks if a member's division matches the selected filter value.
 * Handles matching by ID or aliases bidirectionally.
 */
export function isDivisionMatch(
  memberDiv: string,
  filterVal: string,
  divisions: DivisionConfig[]
): boolean {
  if (!filterVal || filterVal === 'all') return true;
  if (!memberDiv) return false;

  const mKey = memberDiv.trim().toLowerCase();
  const fKey = filterVal.trim().toLowerCase();

  if (mKey === fKey) return true;

  const map = buildDivisionMap(divisions);
  const memberDivObj = getDivisionInfo(mKey, map);
  const filterDivObj = getDivisionInfo(fKey, map);

  if (memberDivObj && filterDivObj) {
    return memberDivObj.id.toLowerCase() === filterDivObj.id.toLowerCase();
  }

  // Fallback: check if member key is in fallback synonyms of filter key or vice-versa
  if (FALLBACK_SYNONYMS[fKey]?.includes(mKey)) return true;
  if (FALLBACK_SYNONYMS[mKey]?.includes(fKey)) return true;

  return false;
}

/**
 * Parses raw division data which may be an array or an object with a `.list` array property.
 */
export function parseDivisions(divisionsData: unknown): DivisionConfig[] {
  if (Array.isArray(divisionsData)) {
    return divisionsData as DivisionConfig[];
  }
  if (
    typeof divisionsData === 'object' &&
    divisionsData !== null &&
    'list' in divisionsData &&
    Array.isArray((divisionsData as Record<string, unknown>).list)
  ) {
    return (divisionsData as Record<string, unknown>).list as DivisionConfig[];
  }
  return [];
}
