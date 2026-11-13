import type { CourseData, CourseModule, CourseView, Lecturer, Member } from './types';

/** Join course records with the people they reference, ordered by `order` then title. */
export function resolveCourses(
  entries: Array<{ id: string; data: CourseData }>,
  lecturers: Lecturer[],
  members: Member[],
): CourseView[] {
  const lecturerById = new Map(lecturers.map((lecturer) => [lecturer.id, lecturer]));
  const memberById = new Map(members.map((member) => [member.id, member]));

  return entries
    .map(({ id, data }) => {
      const assistantIds = [...new Set(data.assistantIds ?? [])];
      return {
        ...data,
        id,
        coordinator: lecturerById.get(data.coordinatorId) ?? null,
        assistants: assistantIds
          .map((assistantId) => memberById.get(assistantId))
          .filter((member): member is Member => Boolean(member)),
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

/**
 * Modules and assistants only exist for a practicum. A course without one
 * renders neither, even when stale data is still attached to it.
 */
export function courseHasContent(course: CourseView): {
  modules: CourseModule[];
  assistants: Member[];
} {
  if (!course.hasPracticum) return { modules: [], assistants: [] };
  return { modules: course.modules, assistants: course.assistants };
}

/**
 * Distinct practicum assistants across every practicum course, and how many of
 * them are student members (the same people, listed from the other end).
 */
export function summarizePracticumAssistants(
  courses: CourseData[],
  members: Member[],
): { distinctCount: number; memberCount: number } {
  const assistantIds = new Set<number>();
  for (const course of courses) {
    if (!course.hasPracticum) continue;
    for (const assistantId of course.assistantIds ?? []) assistantIds.add(assistantId);
  }

  // Every assistant is a member; count the ones the roster actually holds.
  const memberIds = new Set(
    members.filter((member) => assistantIds.has(member.id)).map((member) => member.id),
  );

  return { distinctCount: assistantIds.size, memberCount: memberIds.size };
}
