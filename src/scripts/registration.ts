import resultsData from '../data/recruitment_results.json';

export function initRegistrationScript() {
  const container = document.getElementById('registration-container');
  if (!container) return;

  const stage = container.getAttribute('data-stage') || "auto";
  const openDateStr = container.getAttribute('data-open-date') || "2026-08-13T00:00:00";
  const deadlineStr = container.getAttribute('data-deadline') || "2026-08-20T23:59:59";
  const extendedDeadlineStr = container.getAttribute('data-extended-deadline') || "";
  const medhumTriggerVal = container.getAttribute('data-medhum-val') || "Medhum";
  const portfolioTriggerRaw = container.getAttribute('data-portfolio-trigger-vals') || medhumTriggerVal;
  const portfolioTriggerList = portfolioTriggerRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  const OPEN_TIME = new Date(openDateStr).getTime();
  const DEADLINE_TIME = new Date(deadlineStr).getTime();
  const EXTENDED_TIME = extendedDeadlineStr ? new Date(extendedDeadlineStr).getTime() : 0;

  const nowMs = new Date().getTime();
  const isExtendedStage = stage === 'extended';
  const activeDeadline = (EXTENDED_TIME > 0 && (isExtendedStage || (nowMs >= DEADLINE_TIME && nowMs < EXTENDED_TIME)))
    ? EXTENDED_TIME 
    : DEADLINE_TIME;

  // Form Elements
  const formElement = document.getElementById('pendaftaran-form') as HTMLFormElement | null;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement | null;
  const btnText = document.getElementById('btn-text');

  const alertError = document.getElementById('status-alert-error') as HTMLElement | null;
  const alertSuccess = document.getElementById('status-alert-success') as HTMLElement | null;

  const div1Select = document.getElementById('divisi_1') as HTMLSelectElement | null;
  const div2Select = document.getElementById('divisi_2') as HTMLSelectElement | null;
  const medhumPortoContainer = document.getElementById('container-medhum-porto') as HTMLElement | null;
  const medhumPortoInput = document.getElementById('portofolio_medhum') as HTMLInputElement | null;

  // Extended Banner Check
  const extendedBanner = document.getElementById('extended-banner');
  if (extendedBanner) {
    const isExtendedNow = stage === 'extended' || (stage === 'auto' && EXTENDED_TIME > 0 && new Date().getTime() >= DEADLINE_TIME && new Date().getTime() < EXTENDED_TIME);
    extendedBanner.style.display = isExtendedNow ? 'block' : 'none';
  }

  // 1. Dynamic Countdown Timers
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  const uDaysEl = document.getElementById('u-timer-days');
  const uHoursEl = document.getElementById('u-timer-hours');
  const uMinutesEl = document.getElementById('u-timer-minutes');
  const uSecondsEl = document.getElementById('u-timer-seconds');

  const updateTimers = () => {
    const now = new Date().getTime();

    if (uDaysEl) {
      const uDistance = OPEN_TIME - now;
      if (uDistance > 0) {
        uDaysEl.innerText = String(Math.floor(uDistance / (1000 * 60 * 60 * 24)));
        if (uHoursEl) uHoursEl.innerText = String(Math.floor((uDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        if (uMinutesEl) uMinutesEl.innerText = String(Math.floor((uDistance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        if (uSecondsEl) uSecondsEl.innerText = String(Math.floor((uDistance % (1000 * 60)) / 1000)).padStart(2, '0');
      } else {
        uDaysEl.innerText = "0";
        if (uHoursEl) uHoursEl.innerText = "00";
        if (uMinutesEl) uMinutesEl.innerText = "00";
        if (uSecondsEl) uSecondsEl.innerText = "00";
      }
    }

    if (daysEl) {
      const distance = activeDeadline - now;
      if (distance > 0) {
        daysEl.innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24)));
        if (hoursEl) hoursEl.innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        if (minutesEl) minutesEl.innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        if (secondsEl) secondsEl.innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
      } else {
        daysEl.innerText = "0";
        if (hoursEl) hoursEl.innerText = "00";
        if (minutesEl) minutesEl.innerText = "00";
        if (secondsEl) secondsEl.innerText = "00";
      }
    }
  };

  updateTimers();
  setInterval(updateTimers, 1000);

  // 2. Portfolio Visibility Toggle
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

  // 3. Document Screening Results Lookup
  const searchScreeningInput = document.getElementById('search-screening-nim-input') as HTMLInputElement | null;
  const searchScreeningBtn = document.getElementById('search-screening-nim-btn');
  const searchScreeningResultBox = document.getElementById('search-screening-result-box');

  const executeScreeningSearch = () => {
    if (!searchScreeningInput || !searchScreeningResultBox) return;
    const query = searchScreeningInput.value.trim().toLowerCase();
    if (!query) {
      searchScreeningResultBox.style.display = 'block';
      searchScreeningResultBox.style.background = 'rgba(255, 107, 107, 0.1)';
      searchScreeningResultBox.style.color = '#ff6b6b';
      searchScreeningResultBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM to search.';
      return;
    }
    const match = (resultsData.candidates || []).find((c: any) => c.nim && String(c.nim).toLowerCase() === query);
    searchScreeningResultBox.style.display = 'block';
    if (match) {
      const isPassed = match.screeningStatus === 'passed';
      searchScreeningResultBox.style.background = isPassed ? 'rgba(32, 201, 151, 0.12)' : 'rgba(255, 255, 255, 0.05)';
      searchScreeningResultBox.style.border = `1px solid ${isPassed ? '#20c997' : 'var(--border-color)'}`;
      searchScreeningResultBox.style.color = isPassed ? '#20c997' : 'var(--text-secondary)';
      searchScreeningResultBox.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 6px;">
          ${isPassed ? '🎉 PASSED DOCUMENT SCREENING' : 'ℹ️ Document Screening Status'}
        </div>
        <div style="color: var(--text-primary); font-size: 1.05rem;">${match.name} (${match.nim})</div>
        <p style="margin-top: 8px; font-size: 0.9rem;">
          ${isPassed ? 'Congratulations! You have qualified for the Technical Test phase. Please check your email for technical test details.' : (match.notes || 'Thank you for applying. Keep striving for future opportunities.')}
        </p>
      `;
    } else {
      searchScreeningResultBox.style.background = 'rgba(255, 255, 255, 0.05)';
      searchScreeningResultBox.style.color = 'var(--text-secondary)';
      searchScreeningResultBox.innerHTML = `No screening result record found for NIM "<strong>${query}</strong>".`;
    }
  };

  searchScreeningBtn?.addEventListener('click', executeScreeningSearch);
  searchScreeningInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeScreeningSearch(); });

  // 4. Technical Test Results Lookup
  const searchTechInput = document.getElementById('search-tech-nim-input') as HTMLInputElement | null;
  const searchTechBtn = document.getElementById('search-tech-nim-btn');
  const searchTechResultBox = document.getElementById('search-tech-result-box');

  const executeTechSearch = () => {
    if (!searchTechInput || !searchTechResultBox) return;
    const query = searchTechInput.value.trim().toLowerCase();
    if (!query) {
      searchTechResultBox.style.display = 'block';
      searchTechResultBox.style.background = 'rgba(255, 107, 107, 0.1)';
      searchTechResultBox.style.color = '#ff6b6b';
      searchTechResultBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM to search.';
      return;
    }
    const match = (resultsData.candidates || []).find((c: any) => c.nim && String(c.nim).toLowerCase() === query);
    searchTechResultBox.style.display = 'block';
    if (match) {
      const isPassed = match.technicalTestStatus === 'passed';
      searchTechResultBox.style.background = isPassed ? 'rgba(32, 201, 151, 0.12)' : 'rgba(255, 255, 255, 0.05)';
      searchTechResultBox.style.border = `1px solid ${isPassed ? '#20c997' : 'var(--border-color)'}`;
      searchTechResultBox.style.color = isPassed ? '#20c997' : 'var(--text-secondary)';
      searchTechResultBox.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 6px;">
          ${isPassed ? '🎉 PASSED TECHNICAL TEST' : 'ℹ️ Technical Test Status'}
        </div>
        <div style="color: var(--text-primary); font-size: 1.05rem;">${match.name} (${match.nim})</div>
        <p style="margin-top: 8px; font-size: 0.9rem;">
          ${isPassed ? 'Congratulations! You have qualified for the Interview phase. Please check your email for interview schedule details.' : (match.notes || 'Thank you for participating in the technical test.')}
        </p>
      `;
    } else {
      searchTechResultBox.style.background = 'rgba(255, 255, 255, 0.05)';
      searchTechResultBox.style.color = 'var(--text-secondary)';
      searchTechResultBox.innerHTML = `No technical test result record found for NIM "<strong>${query}</strong>".`;
    }
  };

  searchTechBtn?.addEventListener('click', executeTechSearch);
  searchTechInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeTechSearch(); });

  // 5. Final Selection Results Lookup
  const searchInput = document.getElementById('search-nim-input') as HTMLInputElement | null;
  const searchBtn = document.getElementById('search-nim-btn');
  const resultBox = document.getElementById('search-result-box');

  const executeNimSearch = () => {
    if (!searchInput || !resultBox) return;
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      resultBox.style.display = 'block';
      resultBox.style.background = 'rgba(255, 107, 107, 0.1)';
      resultBox.style.color = '#ff6b6b';
      resultBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM or name to search.';
      return;
    }

    const match = (resultsData.candidates || []).find((c: any) => 
      (c.nim && String(c.nim).toLowerCase() === query) || 
      (c.name && c.name.toLowerCase().includes(query))
    );

    resultBox.style.display = 'block';
    if (match) {
      const matchObj = match as Record<string, any>;
      const isAccepted = match.finalStatus === 'accepted' || matchObj.status === 'accepted';
      if (isAccepted) {
        resultBox.style.background = 'rgba(32, 201, 151, 0.12)';
        resultBox.style.border = '1px solid rgba(32, 201, 151, 0.4)';
        resultBox.style.color = '#20c997';
        resultBox.innerHTML = `
          <div style="font-size: 1.5rem; margin-bottom: 8px;"><i class="fa-solid fa-circle-check"></i> CONGRATULATIONS!</div>
          <div style="font-size: 1.1rem; font-weight: bold; color: var(--text-primary);">${match.name} (${match.nim})</div>
          <div style="margin-top: 4px; font-size: 0.95rem; color: var(--accent-cyan);">Division: <strong>${match.division}</strong></div>
          <p style="margin-top: 10px; font-size: 0.9rem; color: var(--text-secondary);">${match.notes || 'You have been accepted as an assistant at EIM Research Lab.'}</p>
        `;
      } else {
        resultBox.style.background = 'rgba(0, 240, 255, 0.08)';
        resultBox.style.border = '1px solid rgba(0, 240, 255, 0.3)';
        resultBox.style.color = 'var(--accent-cyan)';
        resultBox.innerHTML = `
          <div style="font-size: 1.2rem; margin-bottom: 6px;"><i class="fa-solid fa-info-circle"></i> Status: ${(match.finalStatus || matchObj.status || 'evaluated').toUpperCase()}</div>
          <div style="font-weight: bold; color: var(--text-primary);">${match.name} (${match.nim})</div>
          <p style="margin-top: 8px; font-size: 0.9rem; color: var(--text-secondary);">${match.notes || 'Thank you for participating in this recruitment cycle.'}</p>
        `;
      }
    } else {
      resultBox.style.background = 'rgba(255, 255, 255, 0.05)';
      resultBox.style.color = 'var(--text-secondary)';
      resultBox.innerHTML = `No matching candidate record found for "<strong>${query}</strong>".`;
    }
  };

  searchBtn?.addEventListener('click', executeNimSearch);
  searchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeNimSearch(); });

  // 6. Registration Form Draft Management & Floating Toast
  let isSubmitting = false;
  const DRAFT_KEY = 'eim_registration_draft';

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

  let saveDraftTimeout: any = null;

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

  // Clear Draft Confirmation Modal Handlers
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

  // Modal element references & progress management helpers
  const progressModal = document.getElementById('registration-progress-modal') as HTMLElement | null;
  const modalIcon = document.getElementById('progress-modal-icon') as HTMLElement | null;
  const modalTitle = document.getElementById('progress-modal-title') as HTMLElement | null;
  const modalSubtitle = document.getElementById('progress-modal-subtitle') as HTMLElement | null;
  const progressDetail = document.getElementById('submit-progress-detail') as HTMLElement | null;
  const progressPercent = document.getElementById('submit-progress-percent') as HTMLElement | null;
  const progressBar = document.getElementById('submit-progress-bar') as HTMLElement | null;
  const modalActions = document.getElementById('progress-modal-actions') as HTMLElement | null;
  const modalCloseBtn = document.getElementById('modal-close-btn') as HTMLButtonElement | null;

  // Teleport fixed overlays to document.body so position: fixed covers full browser viewport
  if (clearDraftModal && clearDraftModal.parentElement !== document.body) {
    document.body.appendChild(clearDraftModal);
  }
  if (draftToast && draftToast.parentElement !== document.body) {
    document.body.appendChild(draftToast);
  }
  if (progressModal && progressModal.parentElement !== document.body) {
    document.body.appendChild(progressModal);
  }

  const updateModalStage = (activeStage: number, percent: number, detailText: string) => {
    if (!progressModal) return;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.innerText = `${percent}%`;
    if (progressDetail) progressDetail.innerText = detailText;

    for (let i = 1; i <= 4; i++) {
      const item = document.getElementById(`stage-item-${i}`);
      const icon = document.getElementById(`stage-${i}-icon`);
      if (!item || !icon) continue;

      if (i < activeStage) {
        item.className = 'progress-stage-item stage-completed';
        icon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
      } else if (i === activeStage) {
        item.className = 'progress-stage-item stage-active';
        icon.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
      } else {
        item.className = 'progress-stage-item stage-pending';
        icon.innerHTML = `<i class="fa-regular fa-circle"></i>`;
      }
    }
  };

  const showModalError = (errorMsg: string, failedStage: number = 1) => {
    if (!progressModal) return;
    if (modalIcon) modalIcon.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #ff6b6b;"></i>`;
    if (modalTitle) modalTitle.innerText = 'Submission Failed';
    if (modalSubtitle) modalSubtitle.innerText = 'An error occurred while submitting your registration.';
    if (progressDetail) progressDetail.innerText = errorMsg;

    const item = document.getElementById(`stage-item-${failedStage}`);
    const icon = document.getElementById(`stage-${failedStage}-icon`);
    if (item) item.className = 'progress-stage-item stage-failed';
    if (icon) icon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;

    if (modalActions) modalActions.style.display = 'block';
    if (modalCloseBtn) modalCloseBtn.innerText = 'Close & Edit Form';
  };

  const showModalSuccess = (isRevision: boolean) => {
    if (!progressModal) return;
    try {
      localStorage.removeItem(DRAFT_KEY);
      if (draftRestoredBanner) draftRestoredBanner.style.display = 'none';
      if (clearDraftBtn) clearDraftBtn.style.display = 'none';
    } catch (e) {}
    updateModalStage(5, 100, isRevision ? 'Revision completed successfully!' : 'Registration completed successfully!');
    if (modalIcon) modalIcon.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #20c997; font-size: 3rem;"></i>`;
    if (modalTitle) modalTitle.innerText = isRevision ? 'Revision Submitted!' : 'Registration Successful!';
    if (modalSubtitle) modalSubtitle.innerText = isRevision 
      ? 'Your revised registration details [REVISI] have been recorded, and a confirmation email has been sent.'
      : 'Thank you! Your registration details have been recorded, and a confirmation email has been sent.';

    if (modalActions) modalActions.style.display = 'block';
    if (modalCloseBtn) modalCloseBtn.innerText = 'Done';
  };

  const hideProgressModal = () => {
    if (progressModal) progressModal.style.display = 'none';
    if (modalActions) modalActions.style.display = 'none';
  };

  modalCloseBtn?.addEventListener('click', hideProgressModal);

  formElement?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    if (submitBtn && btnText) {
      submitBtn.disabled = true;
      btnText.innerHTML = `Processing... <i class="fa-solid fa-circle-notch fa-spin" style="margin-left: 8px;"></i>`;
    }

    if (alertError) alertError.style.display = 'none';
    if (alertSuccess) alertSuccess.style.display = 'none';

    // Show initial Progress Modal (Stage 1: Validation)
    if (progressModal) progressModal.style.display = 'flex';
    if (modalIcon) modalIcon.innerHTML = `<i class="fa-solid fa-cloud-arrow-up fa-bounce" style="color: var(--accent-cyan);"></i>`;
    if (modalTitle) modalTitle.innerText = 'Submitting Registration';
    if (modalSubtitle) modalSubtitle.innerText = 'Please stay on this page while we process your documents and transmit data.';
    if (modalActions) modalActions.style.display = 'none';

    updateModalStage(1, 5, 'Validating candidate details & document inputs...');

    const resetState = () => {
      isSubmitting = false;
      if (submitBtn && btnText) {
        submitBtn.disabled = false;
        btnText.innerHTML = `Submit Registration <i class="fa-solid fa-paper-plane" style="margin-left: 8px;"></i>`;
      }
    };

    const nama_lengkap = (document.getElementById('nama_lengkap') as HTMLInputElement).value.trim();
    const nim = (document.getElementById('nim') as HTMLInputElement).value.trim();
    const angkatan = (document.getElementById('angkatan') as HTMLSelectElement).value.trim();
    const email = (document.getElementById('email') as HTMLInputElement).value.trim();
    const nomor_telp = (document.getElementById('nomor_telp') as HTMLInputElement).value.trim();
    const divisi_1 = div1Select ? div1Select.value : '';
    const divisi_2 = div2Select ? div2Select.value : '';
    const alasan_divisi_1 = (document.getElementById('alasan_divisi_1') as HTMLTextAreaElement).value.trim();
    const alasan_divisi_2 = (document.getElementById('alasan_divisi_2') as HTMLTextAreaElement).value.trim();
    const portofolio_medhum = medhumPortoInput?.value.trim() || '';
    const bersedia_dipindah = (document.getElementById('bersedia_dipindah') as HTMLSelectElement).value;

    const fileKsmInput = document.getElementById('file_ksm') as HTMLInputElement | null;
    const fileKhsInput = document.getElementById('file_khs') as HTMLInputElement | null;
    const fileMlInput = document.getElementById('file_ml') as HTMLInputElement | null;
    const fileCvInput = document.getElementById('file_cv') as HTMLInputElement | null;
    const filePiInput = document.getElementById('file_pi') as HTMLInputElement | null;

    if (!/^\d{9,15}$/.test(nim)) {
      const msg = 'Please enter a valid numeric NIM (9 to 15 digits)!';
      if (alertError) { alertError.innerText = msg; alertError.style.display = 'block'; }
      showModalError(msg, 1);
      resetState();
      return;
    }

    const cleanPhone = nomor_telp.replace(/\s+/g, '');
    if (!/^(08|\+?628)\d{7,11}$/.test(cleanPhone)) {
      const msg = 'Please enter a valid Indonesian phone number starting with 08 or +628!';
      if (alertError) { alertError.innerText = msg; alertError.style.display = 'block'; }
      showModalError(msg, 1);
      resetState();
      return;
    }

    if (divisi_1 === divisi_2) {
      const msg = 'Division Choice 1 and Division Choice 2 cannot be the same!';
      if (alertError) { alertError.innerText = msg; alertError.style.display = 'block'; }
      showModalError(msg, 1);
      resetState();
      return;
    }

    if ((requiresPortfolio(divisi_1) || requiresPortfolio(divisi_2)) && !portofolio_medhum) {
      const msg = 'Please provide your portfolio URL link!';
      if (alertError) { alertError.innerText = msg; alertError.style.display = 'block'; }
      showModalError(msg, 1);
      resetState();
      return;
    }

    // Validate file sizes
    let totalBytes = 0;
    const getFileInputMaxMb = (fileInput: HTMLInputElement | null, defaultMax: number): number => {
      if (!fileInput) return defaultMax;
      const attr = fileInput.getAttribute('data-max-mb');
      return attr ? parseFloat(attr) : defaultMax;
    };

    const validateFileInput = (fileInput: HTMLInputElement, label: string, maxMb: number): string | null => {
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) return null;
      const file = fileInput.files[0];
      if (file.size === 0) {
        return `File ${label} is empty (0 bytes). Please upload a valid non-empty document.`;
      }
      totalBytes += file.size;
      const maxBytes = maxMb * 1024 * 1024;
      if (file.size > maxBytes) {
        return `File ${label} exceeds maximum size limit of ${maxMb}MB. (${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
      }
      const allowedExts = ['pdf', 'png', 'jpg', 'jpeg'];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedExts.includes(fileExt)) {
        return `File ${label} must be a valid PDF, PNG, JPG, or JPEG file.`;
      }
      return null;
    };

    const docChecks = [
      { input: fileKsmInput, label: 'KSM', defaultMax: 3.0 },
      { input: fileKhsInput, label: 'KHS', defaultMax: 3.0 },
      { input: fileMlInput, label: 'Motivation Letter (ML)', defaultMax: 3.0 },
      { input: fileCvInput, label: 'Curriculum Vitae (CV)', defaultMax: 5.0 },
      { input: filePiInput, label: 'Pakta Integritas (PI)', defaultMax: 3.0 }
    ];

    for (const item of docChecks) {
      if (item.input) {
        const maxMb = getFileInputMaxMb(item.input, item.defaultMax);
        const err = validateFileInput(item.input, item.label, maxMb);
        if (err) {
          if (alertError) { alertError.innerText = err; alertError.style.display = 'block'; }
          showModalError(err, 1);
          resetState();
          return;
        }
      }
    }

    const formMaxTotalAttr = form?.getAttribute('data-max-total-mb');
    const maxTotalMb = formMaxTotalAttr ? parseFloat(formMaxTotalAttr) : 15.0;
    const MAX_TOTAL_BYTES = maxTotalMb * 1024 * 1024;
    if (totalBytes > MAX_TOTAL_BYTES) {
      const err = `Total size of all uploaded files (${(totalBytes / (1024 * 1024)).toFixed(2)}MB) exceeds ${maxTotalMb}MB limit. Please compress your files.`;
      if (alertError) { alertError.innerText = err; alertError.style.display = 'block'; }
      showModalError(err, 1);
      resetState();
      return;
    }

    updateModalStage(1, 15, 'Validation passed! Preparing to encode files...');

    // Stage 2: Encoding Base64 Files
    updateModalStage(2, 18, 'Encoding uploaded files...');

    let loadedFilesCount = 0;
    const fileListToRead = docChecks.filter(d => d.input && d.input.files && d.input.files.length > 0);
    const totalFilesToRead = fileListToRead.length;

    const fileToBase64WithProgress = (fileInput: HTMLInputElement | null, docLabel: string): Promise<{ fileName: string; mimeType: string; base64: string } | null> => {
      return new Promise((resolve) => {
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
          resolve(null);
          return;
        }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          loadedFilesCount++;
          const percent = Math.min(40, 18 + Math.round((loadedFilesCount / (totalFilesToRead || 1)) * 22));
          updateModalStage(2, percent, `Encoded document ${loadedFilesCount}/${totalFilesToRead} (${docLabel})`);
          resolve({
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            base64: reader.result as string
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    };

    try {
      const scriptURL = ((import.meta as any).env?.PUBLIC_GOOGLE_SHEET_SCRIPT_URL || '').replace(/^['"]|['"]$/g, '').trim();
      if (!scriptURL) {
        throw new Error('Google Sheets URL has not been configured in the .env file.');
      }

      const website_hp = (document.getElementById('website_hp') as HTMLInputElement)?.value || '';
      const secret_token = ((import.meta as any).env?.PUBLIC_RECRUITMENT_SECRET || '').replace(/^['"]|['"]$/g, '').trim();

      const [ksmObj, khsObj, mlObj, cvObj, piObj] = await Promise.all([
        fileToBase64WithProgress(fileKsmInput, 'KSM'),
        fileToBase64WithProgress(fileKhsInput, 'KHS'),
        fileToBase64WithProgress(fileMlInput, 'ML'),
        fileToBase64WithProgress(fileCvInput, 'CV'),
        fileToBase64WithProgress(filePiInput, 'PI')
      ]);

      const payload: Record<string, any> = {
        'Nama Lengkap': nama_lengkap,
        'NIM': nim,
        'Angkatan': angkatan,
        'Email': email,
        'Nomor Telepon': nomor_telp,
        'Divisi 1': divisi_1,
        'Alasan Divisi 1': alasan_divisi_1,
        'Divisi 2': divisi_2,
        'Alasan Divisi 2': alasan_divisi_2,
        'Portofolio MedHum': portofolio_medhum,
        'Bersedia Dipindah Divisi': bersedia_dipindah,
        'website_hp': website_hp,
        'secret_token': secret_token
      };

      if (ksmObj) payload['ksm'] = ksmObj;
      if (khsObj) payload['khs'] = khsObj;
      if (mlObj) payload['ml'] = mlObj;
      if (cvObj) payload['cv'] = cvObj;
      if (piObj) payload['pi'] = piObj;

      // Stage 3: Transmitting Payload via XHR with Upload Progress
      updateModalStage(3, 40, 'Starting data transmission to server...');

      const jsonPayloadString = JSON.stringify(payload);

      const responseData: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', scriptURL, true);
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');

        if (xhr.upload) {
          xhr.upload.addEventListener('progress', (evt) => {
            if (evt.lengthComputable && evt.total > 0) {
              const uploadRatio = evt.loaded / evt.total;
              const currentPercent = 40 + Math.round(uploadRatio * 48); // 40% to 88%
              const loadedMb = (evt.loaded / (1024 * 1024)).toFixed(2);
              const totalMb = (evt.total / (1024 * 1024)).toFixed(2);
              updateModalStage(3, currentPercent, `Uploading payload: ${loadedMb} MB / ${totalMb} MB (${Math.round(uploadRatio * 100)}%)`);
            }
          });
        }

        xhr.onload = () => {
          // Stage 4: Processing on server
          updateModalStage(4, 92, 'Server received data. Processing entry & sending confirmation email...');
          let parsedData = null;
          try {
            parsedData = JSON.parse(xhr.responseText);
          } catch (err) {
            // Response parsing fallback
          }
          resolve(parsedData);
        };

        xhr.onerror = () => {
          reject(new Error('Network transmission error. Please check your internet connection.'));
        };

        xhr.ontimeout = () => {
          reject(new Error('Request timed out. Please try again.'));
        };

        xhr.send(jsonPayloadString);
      });

      if (responseData && responseData.result === 'error') {
        const errText = responseData.error || 'Failed to submit registration. Please try again.';
        if (alertError) { alertError.innerText = errText; alertError.style.display = 'block'; }
        showModalError(errText, 4);
        return;
      }

      clearDraft();
      const isRevision = Boolean(responseData && responseData.isRevision);
      if (alertSuccess) {
        alertSuccess.innerText = isRevision
          ? 'Revised registration successfully submitted! Your updated details [REVISI] have been recorded, and a confirmation email has been sent.'
          : 'Registration successfully submitted! A confirmation email has been sent to your email address.';
        alertSuccess.style.display = 'block';
      }

      showModalSuccess(isRevision);
      formElement.reset();
      toggleMedhumPorto();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const errMsg = err.message || 'Failed to submit. Please try again later.';
      if (alertError) {
        alertError.innerText = errMsg;
        alertError.style.display = 'block';
      }
      showModalError(errMsg, 3);
    } finally {
      resetState();
    }
  });
}



