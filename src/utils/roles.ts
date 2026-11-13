const ROLE_LABELS: Record<string, string> = {
  'EIM Lab Coordinator': 'Koordinator Lab EIM',
  'Secretary': 'Sekretaris',
  'Treasurer': 'Bendahara',
  'Research Coordinator': 'Koordinator Riset',
  'PKU Coordinator': 'Koordinator PKU',
  'Competition Coordinator': 'Koordinator Competition & Event',
  'Media & PR Coordinator': 'Koordinator Media & Humas',
  'Community Service Coordinator': 'Koordinator Pengabdian Masyarakat',
  'Staff': 'Staf',
};

/** Display label for a member role; unknown roles pass through unchanged. */
export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}
