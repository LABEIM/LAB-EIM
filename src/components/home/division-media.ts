/**
 * Activity photos per division — the image(s) shown next to each division's
 * explanation on the homepage. Use public URL paths (files under `public/`).
 *
 *   e.g. '/image/division/riset/activities/lab-session.avif'
 *
 * One or two entries render as the division's media panel; an empty array
 * shows a neutral placeholder until photos are added. This is the only place
 * to edit when the activity photos arrive.
 */
export const DIVISION_MEDIA: Record<string, string[]> = {
  inti: [],
  riset: [],
  pku: [],
  competition: [],
  media: [],
  care: [],
};
