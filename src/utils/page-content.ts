export function sectionOn(section?: { enabled?: boolean }): boolean {
  return section?.enabled !== false;
}
