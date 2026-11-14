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
