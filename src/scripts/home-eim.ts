/**
 * Homepage progressive enhancement — Indonesian stage labels for the hero CTA.
 *
 * The shared `global-stage-sync` writes labels from `STAGE_ACTION_CONFIG`
 * (English, icon-font based) because it serves every page. On the homepage the
 * CTA must speak Indonesian, so this module re-applies the label/href from the
 * `data-stage-labels` attribute AFTER the shared sync runs. Registration order
 * guarantees this is the final write on load and on `eim:stage-changed`.
 */
import { STAGE_LABELS } from '../utils/constants';

type StageLabelMap = Record<string, { label: string; href: string }>;

export function initHomeCTA(initialStage: string): void {
  const btn = document.getElementById('hero-recruitment-btn') as HTMLAnchorElement | null;
  if (!btn) return;

  let labels: StageLabelMap = { ...STAGE_LABELS };
  try {
    const raw = btn.getAttribute('data-stage-labels');
    if (raw) labels = JSON.parse(raw) as StageLabelMap;
  } catch {
    /* Malformed attribute — the static map remains the source. */
  }

  const resolve = (stage: string): { label: string; href: string } | undefined =>
    labels[stage] ?? (stage === 'closed' ? labels.closed : labels.selection);

  const apply = (stage: string): void => {
    const entry = resolve(stage);
    if (!entry) return;
    btn.setAttribute('href', entry.href);
    const text = btn.querySelector('.hero-btn-text');
    if (text) text.textContent = entry.label;
  };

  apply(initialStage);

  window.addEventListener('eim:stage-changed', (event) => {
    const detail = (event as CustomEvent<{ stage?: string }>).detail;
    if (detail?.stage) apply(String(detail.stage));
  });
}
