import { initRegistrationTimers } from './registration/timer';
import { initRegistrationSearch } from './registration/search';
import { initRegistrationDraft } from './registration/draft';
import { initRegistrationSubmit } from './registration/submit';

export function initRegistrationScript() {
  const container = document.getElementById('registration-container');
  if (!container) return;

  const medhumTriggerVal = container.getAttribute('data-medhum-val') || "Medhum";
  const portfolioTriggerRaw = container.getAttribute('data-portfolio-trigger-vals') || medhumTriggerVal;
  const portfolioTriggerList = portfolioTriggerRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  // Form & Alert Elements
  const formElement = document.getElementById('pendaftaran-form') as HTMLFormElement | null;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement | null;
  const btnText = document.getElementById('btn-text');

  const alertError = document.getElementById('status-alert-error') as HTMLElement | null;
  const alertSuccess = document.getElementById('status-alert-success') as HTMLElement | null;

  const div1Select = document.getElementById('divisi_1') as HTMLSelectElement | null;
  const div2Select = document.getElementById('divisi_2') as HTMLSelectElement | null;
  const medhumPortoContainer = document.getElementById('container-medhum-porto') as HTMLElement | null;
  const medhumPortoInput = document.getElementById('portofolio_medhum') as HTMLInputElement | null;

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

  // Initialize Sub-modules
  initRegistrationTimers(container);
  initRegistrationSearch();

  const { toggleMedhumPorto, clearDraft, requiresPortfolio } = initRegistrationDraft(
    formElement,
    div1Select,
    div2Select,
    medhumPortoContainer,
    medhumPortoInput,
    portfolioTriggerList
  );

  initRegistrationSubmit(
    formElement,
    submitBtn,
    btnText,
    alertError,
    alertSuccess,
    div1Select,
    div2Select,
    medhumPortoInput,
    requiresPortfolio,
    clearDraft,
    toggleMedhumPorto
  );
}
