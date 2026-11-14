export function sectionOn(section?: { enabled?: boolean }): boolean {
  return section?.enabled !== false;
}

/**
 * Zero-padded ordinal for the section at `index`, counting only the sections
 * before it that are actually visible, so hiding a middle section leaves no gap.
 */
export function sectionNumber(visible: boolean[], index: number): string {
  return String(visible.slice(0, index).filter(Boolean).length + 1).padStart(2, '0');
}

/**
 * Split the word-count template into the text around the live `{count}` span.
 * `{min}` may sit before `{count}`, so it is filled across the whole template first.
 */
export function splitWordCount(template: string, min: number): { prefix: string; suffix: string } {
  const [prefix, suffix] = template.replaceAll('{min}', String(min)).split('{count}');
  return { prefix: prefix ?? '', suffix: suffix ?? '' };
}
