import type { RegistrationContext } from './registration/types';
import { initRegistrationTimers } from './registration/timer';
import { initRegistrationSearch } from './registration/search';
import { initRegistrationDraft } from './registration/draft';
import { initRegistrationSubmit } from './registration/submit';

export function initRegistrationScript() {
  const container = document.getElementById('registration-container');
  if (!container) return;

  const formElement = document.getElementById('pendaftaran-form') as HTMLFormElement | null;
  const minWordsAttr = formElement?.getAttribute('data-min-words') || container.getAttribute('data-min-reason-words');
  const minReasonWords = minWordsAttr ? parseInt(minWordsAttr, 10) : 30;

  const medhumTriggerVal = container.getAttribute('data-medhum-val') || "Medhum";
  const portfolioTriggerRaw = container.getAttribute('data-portfolio-trigger-vals') || medhumTriggerVal;
  const portfolioTriggerList = portfolioTriggerRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  // Modals & Overlay Teleportation
  const clearDraftModal = document.getElementById('clear-draft-modal');
  const draftToast = document.getElementById('draft-toast');
  const progressModal = document.getElementById('registration-progress-modal');

  if (clearDraftModal && clearDraftModal.parentElement !== document.body) {
    document.body.appendChild(clearDraftModal);
  }
  if (draftToast && draftToast.parentElement !== document.body) {
    document.body.appendChild(draftToast);
  }
  if (progressModal && progressModal.parentElement !== document.body) {
    document.body.appendChild(progressModal);
  }

  // Construct typed Context Object
  const ctx: RegistrationContext = {
    container,
    formElement,
    submitBtn: document.getElementById('submit-btn') as HTMLButtonElement | null,
    btnText: document.getElementById('btn-text'),
    alertError: document.getElementById('status-alert-error'),
    alertSuccess: document.getElementById('status-alert-success'),
    div1Select: document.getElementById('divisi_1') as HTMLSelectElement | null,
    div2Select: document.getElementById('divisi_2') as HTMLSelectElement | null,
    medhumPortoContainer: document.getElementById('container-medhum-porto'),
    medhumPortoInput: document.getElementById('portofolio_medhum') as HTMLInputElement | null,
    clearDraftModal,
    draftToast,
    progressModal,
    portfolioTriggerList,
    minReasonWords
  };

  // Initialize Sub-modules
  initRegistrationTimers(container);
  initRegistrationSearch();

  const { toggleMedhumPorto, clearDraft, requiresPortfolio } = initRegistrationDraft(ctx);

  initRegistrationSubmit(
    ctx,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    requiresPortfolio,
    clearDraft,
    toggleMedhumPorto
  );
}
