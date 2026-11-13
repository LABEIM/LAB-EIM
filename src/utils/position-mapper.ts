import type { Position, PositionGroup, PositionSection } from './types';

export type { Position, PositionGroup, PositionSection } from './types';

const POSITION_GROUPS: PositionGroup[] = ['dosen', 'asisten', 'mahasiswa'];

/** Parse the Keystatic positions singleton into ordered positions. */
export function parsePositions(data: unknown): Position[] {
  const list = (data as { list?: unknown } | null | undefined)?.list;
  if (!Array.isArray(list)) return [];

  return list
    .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    .map((entry) => ({
      id: String(entry.id ?? '').trim(),
      label: String(entry.label ?? '').trim(),
      group: POSITION_GROUPS.includes(entry.group as PositionGroup)
        ? (entry.group as PositionGroup)
        : 'mahasiswa',
      order: Number(entry.order ?? 0),
    }))
    .filter((position) => position.id.length > 0 && position.label.length > 0)
    .sort((a, b) => a.order - b.order);
}

export function buildPositionIndex(positions: Position[]): Map<string, Position> {
  return new Map(positions.map((position) => [position.id, position]));
}

/** Display label for a position id; unknown ids pass through unchanged. */
export function positionLabel(index: Map<string, Position>, positionId: string): string {
  return index.get(positionId)?.label ?? positionId;
}

/** People grouped under their position, skipping positions nobody holds. */export function groupPeople<T extends { role: string }>(
  people: T[],
  positions: Position[],
): PositionSection<T>[] {
  const byPosition = new Map<string, T[]>();
  for (const person of people) {
    const list = byPosition.get(person.role);
    if (list) list.push(person);
    else byPosition.set(person.role, [person]);
  }

  return positions
    .map((position) => ({ position, people: byPosition.get(position.id) ?? [] }))
    .filter((section) => section.people.length > 0);
}

/** Count people per group; roles outside positions.json are not counted. */
export function countPeopleByGroup<T extends { role: string }>(
  people: T[],
  positions: Position[],
): Record<PositionGroup, number> {
  const index = buildPositionIndex(positions);
  const counts: Record<PositionGroup, number> = { dosen: 0, asisten: 0, mahasiswa: 0 };

  for (const person of people) {
    const position = index.get(person.role);
    if (position) counts[position.group] += 1;
  }

  return counts;
}

export interface ChartNode {
  position: Position;
  count: number;
  note?: string;
  children: ChartNode[];
}

/**
 * Fixed reporting hierarchy. Ketua Kelompok Keilmuan and Ka.Ur.Lab FRI are
 * faculty-level and intentionally absent; Asisten Praktikum lives on /courses.
 */
export const STRUCTURE_TREE: ReadonlyArray<{ id: string; children: readonly string[] }> = [
  { id: 'ketua-lab', children: ['wakil-ketua-lab'] },
  {
    id: 'wakil-ketua-lab',
    children: ['dosen-anggota', 'koordinator-matkul', 'koordinator-asisten'],
  },
  {
    id: 'koordinator-asisten',
    children: ['asisten-koordinator-praktikum', 'mahasiswa-anggota', 'tim-adhoc'],
  },
];
