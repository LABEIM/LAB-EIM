import { countWords } from './validation';
import type { RegistrationContext } from './types';

export const DRAFT_KEY = 'eim_registration_draft';

export function evaluateConditionalFields(formElement: HTMLFormElement | null) {
  if (!formElement) return;
  const conditionalGroups = formElement.querySelectorAll<HTMLElement>('.is-conditional');
  conditionalGroups.forEach((group) => {
    const targetId = group.getAttribute('data-conditional-target-id');
    const operator = group.getAttribute('data-conditional-operator') || 'includes';
    const expectedValue = (group.getAttribute('data-conditional-value') || '').toLowerCase().trim();

    if (!targetId) return;

    const targetEl = formElement.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`#${targetId}, [name="${targetId}"]`);
    if (!targetEl) return;

    let currentVal = '';
    if (targetEl.type === 'checkbox' || targetEl.type === 'radio') {
      const checkedInputs = formElement.querySelectorAll<HTMLInputElement>(`[name="${targetId}"]:checked`);
      currentVal = Array.from(checkedInputs).map(i => i.value).join(', ').toLowerCase();
    } else {
      currentVal = targetEl.value.toLowerCase().trim();
    }

    let isMatch = false;
    if (operator === 'equals') {
      isMatch = currentVal === expectedValue;
    } else if (operator === 'not_equals') {
      isMatch = currentVal !== expectedValue;
    } else {
      isMatch = currentVal.includes(expectedValue);
    }

    if (isMatch) {
      group.classList.remove('is-hidden');
      group.style.display = 'block';
    } else {
      group.classList.add('is-hidden');
      group.style.display = 'none';
    }
  });
}

export function updateDynamicWordCounters(formElement: HTMLFormElement | null) {
  if (!formElement) return;
  const textareas = formElement.querySelectorAll<HTMLTextAreaElement>('textarea[data-min-words]');
  textareas.forEach((textarea) => {
    const minWords = parseInt(textarea.getAttribute('data-min-words') || '0', 10);
    if (minWords <= 0) return;

    const fieldId = textarea.id || textarea.name;
    const counterEl = document.getElementById(`counter_${fieldId}`);
    const countValEl = document.getElementById(`${fieldId}_count`);
    const wordCount = countWords(textarea.value);

    if (countValEl) {
      countValEl.innerText = wordCount.toString();
    } else if (counterEl) {
      const isEn = formElement.getAttribute('data-locale') === 'en';
      counterEl.innerText = `${wordCount} / ${minWords} ${isEn ? 'words' : 'kata'}`;
    }

    if (counterEl) {
      if (wordCount >= minWords) {
        counterEl.classList.remove('word-count-invalid');
        counterEl.classList.add('word-count-valid');
      } else {
        counterEl.classList.remove('word-count-valid');
        counterEl.classList.add('word-count-invalid');
      }
    }
  });
}

export function initFileInputListeners(formElement: HTMLFormElement | null) {
  if (!formElement) return;
  const fileInputs = formElement.querySelectorAll<HTMLInputElement>('input[type="file"]');
  fileInputs.forEach((fileInput) => {
    if (fileInput.getAttribute('data-file-bound') === 'true') return;
    fileInput.setAttribute('data-file-bound', 'true');
    fileInput.addEventListener('change', () => {
      const fieldId = fileInput.id || fileInput.name;
      const fileNameSpan = document.getElementById(`filename_${fieldId}`);
      if (fileNameSpan) {
        if (fileInput.files && fileInput.files.length > 0) {
          fileNameSpan.innerText = fileInput.files[0].name;
          fileNameSpan.classList.add('has-file');
        } else {
          const isEn = formElement.getAttribute('data-locale') === 'en';
          fileNameSpan.innerText = isEn ? 'No file chosen' : 'Belum ada berkas dipilih';
          fileNameSpan.classList.remove('has-file');
        }
      }
    });
  });
}

export function initRegistrationDraft(
  ctxOrForm: RegistrationContext | HTMLFormElement | null,
  _div1SelectParam?: HTMLSelectElement | null,
  _div2SelectParam?: HTMLSelectElement | null,
  _medhumPortoContainerParam?: HTMLElement | null,
  _medhumPortoInputParam?: HTMLInputElement | null,
  portfolioTriggerListParam?: string[]
) {
  let formElement: HTMLFormElement | null = null;
  let portfolioTriggerList: string[] = ['medhum', 'media', 'prc'];

  if (ctxOrForm && 'container' in ctxOrForm) {
    const ctx = ctxOrForm as RegistrationContext;
    formElement = ctx.formElement;
    portfolioTriggerList = ctx.portfolioTriggerList;
  } else {
    formElement = ctxOrForm as HTMLFormElement | null;
    portfolioTriggerList = portfolioTriggerListParam || portfolioTriggerList;
  }

  const isEn = formElement?.getAttribute('data-locale') === 'en' || window.location.pathname.startsWith('/en');

  const draftToast = document.getElementById('draft-toast');
  const draftToastIcon = document.getElementById('draft-toast-icon');
  const draftToastText = document.getElementById('draft-toast-text');
  const draftRestoredBanner = document.getElementById('draft-restored-banner');
  const draftRestoredTime = document.getElementById('draft-restored-time');
  const clearDraftBtn = document.getElementById('clear-draft-btn');
  const bannerClearDraftBtn = document.getElementById('banner-clear-draft-btn');
  const clearDraftModal = document.getElementById('clear-draft-modal');
  const cancelClearDraftBtn = document.getElementById('cancel-clear-draft-btn');
  const confirmClearDraftBtn = document.getElementById('confirm-clear-draft-btn');

  let toastTimeout: any = null;
  let saveDraftTimeout: any = null;

  const showDraftToast = (msg: string, isSuccess: boolean = true) => {
    if (!draftToast) return;
    if (draftToastText) draftToastText.innerText = msg;
    if (draftToastIcon) {
      draftToastIcon.className = isSuccess
        ? 'fa-solid fa-cloud-arrow-up draft-toast-icon'
        : 'fa-solid fa-circle-exclamation draft-toast-icon';
      draftToastIcon.style.color = isSuccess ? 'var(--accent-cyan)' : '#ff6b6b';
    }
    draftToast.style.display = 'flex';
    draftToast.classList.remove('toast-hidden');
    draftToast.classList.add('toast-visible');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      draftToast.classList.remove('toast-visible');
      draftToast.classList.add('toast-hidden');
      setTimeout(() => {
        if (draftToast.classList.contains('toast-hidden')) {
          draftToast.style.display = 'none';
        }
      }, 300);
    }, 3000);
  };

  const saveDraft = () => {
    if (!formElement) return;
    const draftData: Record<string, string> = {};
    const inputs = formElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([type="file"]):not([type="submit"]):not(.reg-honeypot-input), textarea, select'
    );

    let hasValue = false;
    inputs.forEach((input) => {
      const key = input.id || input.name;
      if (!key) return;

      if (input.type === 'checkbox') {
        const cb = input as HTMLInputElement;
        if (cb.checked) {
          draftData[key] = (draftData[key] ? draftData[key] + ',' : '') + cb.value;
          hasValue = true;
        }
      } else if (input.type === 'radio') {
        const rb = input as HTMLInputElement;
        if (rb.checked) {
          draftData[key] = rb.value;
          hasValue = true;
        }
      } else if (input.value && input.value.trim().length > 0) {
        draftData[key] = input.value;
        hasValue = true;
      }
    });

    if (!hasValue) {
      if (clearDraftBtn) clearDraftBtn.style.display = 'none';
      return;
    }

    draftData['savedAt'] = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      if (clearDraftBtn) clearDraftBtn.style.display = 'inline-flex';

      if (saveDraftTimeout) clearTimeout(saveDraftTimeout);
      saveDraftTimeout = setTimeout(() => {
        showDraftToast(isEn ? `Draft auto-saved at ${draftData.savedAt}` : `Draf tersimpan otomatis pukul ${draftData.savedAt}`);
      }, 400);
    } catch (e) { }
  };

  const handleFormInput = () => {
    saveDraft();
    updateDynamicWordCounters(formElement);
    evaluateConditionalFields(formElement);
  };

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved && formElement) {
        const draft = JSON.parse(saved);
        let count = 0;

        Object.keys(draft).forEach((key) => {
          if (key === 'savedAt') return;
          const val = draft[key];
          const el = formElement!.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${key}, [name="${key}"]`);
          if (el) {
            if (el.type === 'checkbox' || el.type === 'radio') {
              const group = formElement!.querySelectorAll<HTMLInputElement>(`[name="${key}"]`);
              const vals = val.split(',');
              group.forEach(item => {
                if (vals.includes(item.value)) {
                  item.checked = true;
                  count++;
                }
              });
            } else {
              el.value = val;
              count++;
            }
          }
        });

        evaluateConditionalFields(formElement);

        if (count > 0) {
          if (clearDraftBtn) clearDraftBtn.style.display = 'inline-flex';
          if (draftRestoredBanner) {
            draftRestoredBanner.style.display = 'flex';
            if (draftRestoredTime) draftRestoredTime.innerText = draft.savedAt || (isEn ? 'recently' : 'baru saja');
          }
        }
      }
    } catch (e) { }
    updateDynamicWordCounters(formElement);
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      if (formElement) {
        formElement.reset();
        evaluateConditionalFields(formElement);
      }
      if (draftRestoredBanner) draftRestoredBanner.style.display = 'none';
      if (clearDraftBtn) clearDraftBtn.style.display = 'none';
      if (clearDraftModal) clearDraftModal.style.display = 'none';
      showDraftToast(isEn ? 'Draft cleared' : 'Draf berhasil dihapus', false);
    } catch (e) { }
    updateDynamicWordCounters(formElement);
  };

  if (formElement) {
    if (formElement.getAttribute('data-draft-bound') !== 'true') {
      formElement.setAttribute('data-draft-bound', 'true');
      formElement.addEventListener('input', handleFormInput);
      formElement.addEventListener('change', handleFormInput);
    }
    initFileInputListeners(formElement);
    evaluateConditionalFields(formElement);
  }

  restoreDraft();

  const openClearDraftModal = () => {
    if (clearDraftModal) clearDraftModal.style.display = 'flex';
  };

  const closeClearDraftModal = () => {
    if (clearDraftModal) clearDraftModal.style.display = 'none';
  };

  if (clearDraftBtn && clearDraftBtn.getAttribute('data-draft-btn-bound') !== 'true') {
    clearDraftBtn.setAttribute('data-draft-btn-bound', 'true');
    clearDraftBtn.addEventListener('click', openClearDraftModal);
  }
  if (bannerClearDraftBtn && bannerClearDraftBtn.getAttribute('data-draft-btn-bound') !== 'true') {
    bannerClearDraftBtn.setAttribute('data-draft-btn-bound', 'true');
    bannerClearDraftBtn.addEventListener('click', openClearDraftModal);
  }
  if (cancelClearDraftBtn && cancelClearDraftBtn.getAttribute('data-draft-btn-bound') !== 'true') {
    cancelClearDraftBtn.setAttribute('data-draft-btn-bound', 'true');
    cancelClearDraftBtn.addEventListener('click', closeClearDraftModal);
  }
  if (confirmClearDraftBtn && confirmClearDraftBtn.getAttribute('data-draft-btn-bound') !== 'true') {
    confirmClearDraftBtn.setAttribute('data-draft-btn-bound', 'true');
    confirmClearDraftBtn.addEventListener('click', clearDraft);
  }

  return {
    toggleMedhumPorto: () => evaluateConditionalFields(formElement),
    clearDraft,
    requiresPortfolio: (val: string) => portfolioTriggerList.includes(val.trim().toLowerCase()),
    updateWordCounters: () => updateDynamicWordCounters(formElement)
  };
}
