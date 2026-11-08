/**
 * Homepage progressive enhancement — Indonesian stage labels for the hero CTA.
 *
 * The shared `global-stage-sync` writes labels from `STAGE_ACTION_CONFIG`
 * (English, icon-font based) because it serves every page. On the homepage the
 * CTA must speak Indonesian, so this module re-applies the label/href from the
 * static `STAGE_LABELS` map AFTER the shared sync runs. Registration order
 * guarantees this is the final write on load and on `eim:stage-changed`.
 */
import { STAGE_LABELS } from '../utils/constants';

type StageLabel = { label: string; href: string };

/** Only same-origin, root-relative paths may become the CTA's href. */
function safeHref(href: string): string {
  return href.startsWith('/') && !href.startsWith('//') ? href : '/registration';
}

export function initHomeCTA(initialStage: string): void {
  const btn = document.getElementById('hero-recruitment-btn') as HTMLAnchorElement | null;
  if (!btn) return;

  const resolve = (stage: string): StageLabel | undefined =>
    STAGE_LABELS[stage] ?? (stage === 'closed' ? STAGE_LABELS.closed : STAGE_LABELS.selection);

  const apply = (stage: string): void => {
    const entry = resolve(stage);
    if (!entry) return;
    btn.setAttribute('href', safeHref(entry.href));
    const text = btn.querySelector('.hero-btn-text');
    if (text) text.textContent = entry.label;
  };

  apply(initialStage);

  window.addEventListener('eim:stage-changed', (event) => {
    const detail = (event as CustomEvent<{ stage?: string }>).detail;
    if (detail?.stage) apply(String(detail.stage));
  });
}
