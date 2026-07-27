export const DRAFT_KEY = 'eim_registration_draft';

export function initRegistrationDraft(
  formElement: HTMLFormElement | null,
  div1Select: HTMLSelectElement | null,
  div2Select: HTMLSelectElement | null,
  medhumPortoContainer: HTMLElement | null,
  medhumPortoInput: HTMLInputElement | null,
  portfolioTriggerList: string[]
) {
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

  // Portfolio Visibility Toggle
  const requiresPortfolio = (val: string) => portfolioTriggerList.includes(val.trim().toLowerCase());

  const toggleMedhumPorto = () => {
    const val1 = div1Select?.value || '';
    const val2 = div2Select?.value || '';
    if (requiresPortfolio(val1) || requiresPortfolio(val2)) {
      if (medhumPortoContainer) medhumPortoContainer.style.display = 'block';
      if (medhumPortoInput) medhumPortoInput.required = true;
    } else {
      if (medhumPortoContainer) medhumPortoContainer.style.display = 'none';
      if (medhumPortoInput) {
        medhumPortoInput.required = false;
        medhumPortoInput.value = '';
      }
    }
  };

  div1Select?.addEventListener('change', toggleMedhumPorto);
  div2Select?.addEventListener('change', toggleMedhumPorto);

  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  const showDraftToast = (msg: string, isError: boolean = false) => {
    if (!draftToast) return;
    if (draftToastText) draftToastText.innerText = msg;
    if (draftToastIcon) {
      draftToastIcon.className = isError 
        ? 'fa-solid fa-circle-exclamation draft-toast-icon' 
        : 'fa-solid fa-cloud-arrow-up draft-toast-icon';
      draftToastIcon.style.color = isError ? '#ff6b6b' : 'var(--accent-cyan)';
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
    }, 2500);
  };

  let saveDraftTimeout: ReturnType<typeof setTimeout> | null = null;

  const saveDraft = () => {
    if (!formElement) return;
    const nama = (document.getElementById('nama_lengkap') as HTMLInputElement)?.value || '';
    const nim = (document.getElementById('nim') as HTMLInputElement)?.value || '';
    const angkatan = (document.getElementById('angkatan') as HTMLSelectElement)?.value || '';
    const email = (document.getElementById('email') as HTMLInputElement)?.value || '';
    const telp = (document.getElementById('nomor_telp') as HTMLInputElement)?.value || '';
    const div1 = div1Select?.value || '';
    const alasan1 = (document.getElementById('alasan_divisi_1') as HTMLTextAreaElement)?.value || '';
    const div2 = div2Select?.value || '';
    const alasan2 = (document.getElementById('alasan_divisi_2') as HTMLTextAreaElement)?.value || '';
    const porto = medhumPortoInput?.value || '';
    const pindah = (document.getElementById('bersedia_dipindah') as HTMLSelectElement)?.value || '';

    const hasContent = !!(nama || nim || angkatan || email || telp || div1 || alasan1 || div2 || alasan2 || porto || pindah);

    if (!hasContent) {
      if (clearDraftBtn) clearDraftBtn.style.display = 'none';
      return;
    }

    const draft = {
      nama_lengkap: nama,
      nim,
      angkatan,
      email,
      nomor_telp: telp,
      divisi_1: div1,
      alasan_divisi_1: alasan1,
      divisi_2: div2,
      alasan_divisi_2: alasan2,
      portofolio_medhum: porto,
      bersedia_dipindah: pindah,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      if (clearDraftBtn) clearDraftBtn.style.display = 'inline-flex';
      
      if (saveDraftTimeout) clearTimeout(saveDraftTimeout);
      saveDraftTimeout = setTimeout(() => {
        showDraftToast(`Draft auto-saved at ${draft.savedAt}`);
      }, 400);
    } catch (e) {}
  };

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const draft = JSON.parse(saved);

      let count = 0;
      if (draft.nama_lengkap && document.getElementById('nama_lengkap')) { (document.getElementById('nama_lengkap') as HTMLInputElement).value = draft.nama_lengkap; count++; }
      if (draft.nim && document.getElementById('nim')) { (document.getElementById('nim') as HTMLInputElement).value = draft.nim; count++; }
      if (draft.angkatan && document.getElementById('angkatan')) { (document.getElementById('angkatan') as HTMLSelectElement).value = draft.angkatan; count++; }
      if (draft.email && document.getElementById('email')) { (document.getElementById('email') as HTMLInputElement).value = draft.email; count++; }
      if (draft.nomor_telp && document.getElementById('nomor_telp')) { (document.getElementById('nomor_telp') as HTMLInputElement).value = draft.nomor_telp; count++; }
      if (draft.divisi_1 && div1Select) { div1Select.value = draft.divisi_1; count++; }
      if (draft.alasan_divisi_1 && document.getElementById('alasan_divisi_1')) { (document.getElementById('alasan_divisi_1') as HTMLTextAreaElement).value = draft.alasan_divisi_1; count++; }
      if (draft.divisi_2 && div2Select) { div2Select.value = draft.divisi_2; count++; }
      if (draft.alasan_divisi_2 && document.getElementById('alasan_divisi_2')) { (document.getElementById('alasan_divisi_2') as HTMLTextAreaElement).value = draft.alasan_divisi_2; count++; }
      if (draft.portofolio_medhum && medhumPortoInput) { medhumPortoInput.value = draft.portofolio_medhum; count++; }
      if (draft.bersedia_dipindah && document.getElementById('bersedia_dipindah')) { (document.getElementById('bersedia_dipindah') as HTMLSelectElement).value = draft.bersedia_dipindah; count++; }
      
      toggleMedhumPorto();

      if (count > 0) {
        if (clearDraftBtn) clearDraftBtn.style.display = 'inline-flex';
        if (draftRestoredBanner) {
          draftRestoredBanner.style.display = 'flex';
          if (draftRestoredTime) draftRestoredTime.innerText = draft.savedAt || 'recently';
        }
      }
    } catch (e) {}
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      if (formElement) {
        formElement.reset();
        toggleMedhumPorto();
      }
      if (draftRestoredBanner) draftRestoredBanner.style.display = 'none';
      if (clearDraftBtn) clearDraftBtn.style.display = 'none';
      if (clearDraftModal) clearDraftModal.style.display = 'none';
      showDraftToast('Draft cleared', false);
    } catch (e) {}
  };

  formElement?.addEventListener('input', saveDraft);
  formElement?.addEventListener('change', saveDraft);
  restoreDraft();

  const openClearDraftModal = () => {
    if (clearDraftModal) clearDraftModal.style.display = 'flex';
  };

  const closeClearDraftModal = () => {
    if (clearDraftModal) clearDraftModal.style.display = 'none';
  };

  clearDraftBtn?.addEventListener('click', openClearDraftModal);
  bannerClearDraftBtn?.addEventListener('click', openClearDraftModal);
  cancelClearDraftBtn?.addEventListener('click', closeClearDraftModal);
  confirmClearDraftBtn?.addEventListener('click', clearDraft);

  return {
    toggleMedhumPorto,
    clearDraft,
    requiresPortfolio
  };
}
