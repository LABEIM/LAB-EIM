import type { DocCheckItem, RegistrationContext } from './types';
import { validateRegistrationForm } from './validation';
import { DRAFT_KEY } from './draft';

export function initRegistrationSubmit(
  ctxOrForm: RegistrationContext | HTMLFormElement | null,
  submitBtnParam?: HTMLButtonElement | null,
  btnTextParam?: HTMLElement | null,
  alertErrorParam?: HTMLElement | null,
  alertSuccessParam?: HTMLElement | null,
  div1SelectParam?: HTMLSelectElement | null,
  div2SelectParam?: HTMLSelectElement | null,
  medhumPortoInputParam?: HTMLInputElement | null,
  requiresPortfolioParam?: (val: string) => boolean,
  clearDraftParam?: () => void,
  toggleMedhumPortoParam?: () => void
) {
  let formElement: HTMLFormElement | null = null;
  let submitBtn: HTMLButtonElement | null = null;
  let btnText: HTMLElement | null = null;
  let alertError: HTMLElement | null = null;
  let alertSuccess: HTMLElement | null = null;
  let div1Select: HTMLSelectElement | null = null;
  let div2Select: HTMLSelectElement | null = null;
  let medhumPortoInput: HTMLInputElement | null = null;
  let requiresPortfolio = (val: string) => val.toLowerCase().includes('medhum');
  let clearDraft = () => {};
  let toggleMedhumPorto = () => {};
  let ctxScriptUrl: string | undefined = undefined;
  let ctxSecretToken: string | undefined = undefined;

  if (ctxOrForm && 'container' in ctxOrForm) {
    const ctx = ctxOrForm as RegistrationContext;
    formElement = ctx.formElement;
    submitBtn = ctx.submitBtn;
    btnText = ctx.btnText;
    alertError = ctx.alertError;
    alertSuccess = ctx.alertSuccess;
    div1Select = ctx.div1Select;
    div2Select = ctx.div2Select;
    medhumPortoInput = ctx.medhumPortoInput;
    requiresPortfolio = (val: string) => ctx.portfolioTriggerList.includes(val.trim().toLowerCase());
    ctxScriptUrl = ctx.scriptUrl;
    ctxSecretToken = ctx.secretToken;
    if (clearDraftParam) clearDraft = clearDraftParam;
    if (toggleMedhumPortoParam) toggleMedhumPorto = toggleMedhumPortoParam;
  } else {
    formElement = ctxOrForm as HTMLFormElement | null;
    submitBtn = submitBtnParam || null;
    btnText = btnTextParam || null;
    alertError = alertErrorParam || null;
    alertSuccess = alertSuccessParam || null;
    div1Select = div1SelectParam || null;
    div2Select = div2SelectParam || null;
    medhumPortoInput = medhumPortoInputParam || null;
    if (requiresPortfolioParam) requiresPortfolio = requiresPortfolioParam;
    if (clearDraftParam) clearDraft = clearDraftParam;
    if (toggleMedhumPortoParam) toggleMedhumPorto = toggleMedhumPortoParam;
  }

  let isSubmitting = false;

  // Modal element references
  const progressModal = document.getElementById('registration-progress-modal') as HTMLElement | null;
  const modalIcon = document.getElementById('progress-modal-icon') as HTMLElement | null;
  const modalTitle = document.getElementById('progress-modal-title') as HTMLElement | null;
  const modalSubtitle = document.getElementById('progress-modal-subtitle') as HTMLElement | null;
  const progressDetail = document.getElementById('submit-progress-detail') as HTMLElement | null;
  const progressPercent = document.getElementById('submit-progress-percent') as HTMLElement | null;
  const progressBar = document.getElementById('submit-progress-bar') as HTMLElement | null;
  const modalActions = document.getElementById('progress-modal-actions') as HTMLElement | null;
  const modalCloseBtn = document.getElementById('modal-close-btn') as HTMLButtonElement | null;

  const isEn = formElement?.getAttribute('data-locale') === 'en' || window.location.pathname.startsWith('/en');

  const updateModalStage = (activeStage: number, percent: number, detailText: string) => {
    if (!progressModal) return;
    progressModal.classList.remove('is-hidden');
    progressModal.style.display = 'flex';
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
    if (alertError) {
      alertError.innerText = errorMsg;
      alertError.style.display = 'block';
    }
    if (!progressModal) return;
    progressModal.classList.remove('is-hidden');
    progressModal.style.display = 'flex';
    if (modalIcon) modalIcon.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #ff6b6b;"></i>`;
    if (modalTitle) modalTitle.innerText = isEn ? 'Submission Failed' : 'Pengiriman Gagal';
    if (modalSubtitle) modalSubtitle.innerText = isEn ? 'An error occurred while submitting your registration.' : 'Terjadi kendala saat mengirimkan pendaftaran Anda.';
    if (progressDetail) progressDetail.innerText = errorMsg;

    const item = document.getElementById(`stage-item-${failedStage}`);
    const icon = document.getElementById(`stage-${failedStage}-icon`);
    if (item) item.className = 'progress-stage-item stage-failed';
    if (icon) icon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;

    if (modalActions) modalActions.style.display = 'block';
    if (modalCloseBtn) modalCloseBtn.innerText = isEn ? 'Close & Edit Form' : 'Tutup & Periksa Form';
  };

  const showModalSuccess = (isRevision: boolean) => {
    const successMessage = isRevision 
      ? (isEn ? 'Your revised registration details [REVISI] have been recorded, and a confirmation email has been sent.' : 'Data revisi pendaftaran Anda [REVISI] telah tercatat. Email konfirmasi telah dikirimkan.')
      : (isEn ? 'Thank you! Your registration details have been recorded, and a confirmation email has been sent.' : 'Terima kasih! Data pendaftaran Anda telah tercatat. Email konfirmasi telah dikirimkan.');

    if (alertSuccess) {
      alertSuccess.innerText = successMessage;
      alertSuccess.style.display = 'block';
    }

    if (!progressModal) return;
    progressModal.classList.remove('is-hidden');
    progressModal.style.display = 'flex';

    const draftRestoredBanner = document.getElementById('draft-restored-banner');
    const clearDraftBtn = document.getElementById('clear-draft-btn');
    try {
      localStorage.removeItem(DRAFT_KEY);
      if (draftRestoredBanner) draftRestoredBanner.style.display = 'none';
      if (clearDraftBtn) clearDraftBtn.style.display = 'none';
    } catch (e) {}
    updateModalStage(5, 100, isRevision ? (isEn ? 'Revision completed successfully!' : 'Revisi berhasil dikirim!') : (isEn ? 'Registration completed successfully!' : 'Pendaftaran berhasil dikirim!'));
    if (modalIcon) modalIcon.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #20c997; font-size: 3rem;"></i>`;
    if (modalTitle) modalTitle.innerText = isRevision ? (isEn ? 'Revision Submitted!' : 'Revisi Berhasil Dikirim!') : (isEn ? 'Registration Successful!' : 'Pendaftaran Berhasil!');
    if (modalSubtitle) modalSubtitle.innerText = successMessage;

    if (modalActions) modalActions.style.display = 'block';
    if (modalCloseBtn) modalCloseBtn.innerText = isEn ? 'Done' : 'Selesai';
  };

  const hideProgressModal = () => {
    if (progressModal) {
      progressModal.classList.add('is-hidden');
      progressModal.style.display = 'none';
    }
    if (modalActions) modalActions.style.display = 'none';
  };

  modalCloseBtn?.addEventListener('click', hideProgressModal);

  formElement?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    if (submitBtn && btnText) {
      submitBtn.disabled = true;
      btnText.innerHTML = `${isEn ? 'Processing...' : 'Memproses...'} <i class="fa-solid fa-circle-notch fa-spin" style="margin-left: 8px;"></i>`;
    }

    if (alertError) alertError.style.display = 'none';
    if (alertSuccess) alertSuccess.style.display = 'none';

    // Show initial Progress Modal (Stage 1: Validation)
    if (progressModal) progressModal.style.display = 'flex';
    if (modalIcon) modalIcon.innerHTML = `<i class="fa-solid fa-cloud-arrow-up fa-bounce" style="color: var(--accent-cyan);"></i>`;
    if (modalTitle) modalTitle.innerText = isEn ? 'Submitting Registration' : 'Mengirim Pendaftaran';
    if (modalSubtitle) modalSubtitle.innerText = isEn ? 'Please stay on this page while we process your documents and transmit data.' : 'Mohon tetap di halaman ini selagi sistem memproses dokumen dan mengirim data.';
    if (modalActions) modalActions.style.display = 'none';

    updateModalStage(1, 5, isEn ? 'Validating candidate details & document inputs...' : 'Memvalidasi data calon asisten & masukan berkas...');

    const resetState = () => {
      isSubmitting = false;
      if (submitBtn && btnText) {
        submitBtn.disabled = false;
        btnText.innerHTML = `${isEn ? 'Submit Application' : 'Kirim Pendaftaran'} <i class="fa-solid fa-paper-plane" style="margin-left: 8px;"></i>`;
      }
    };

    const readFileAsBase64 = (file: File): Promise<{ base64: string; type: string; name: string }> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          const base64 = res.split(',')[1] || res;
          resolve({ base64, type: file.type, name: file.name });
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    };

    try {
      const containerEl = document.getElementById('registration-container');
      const nama_lengkap = (document.getElementById('nama_lengkap') as HTMLInputElement | null)?.value.trim() || '';
      const nim = (document.getElementById('nim') as HTMLInputElement | null)?.value.trim() || '';
      const angkatan = (document.getElementById('angkatan') as HTMLSelectElement | null)?.value.trim() || '';
      const email = (document.getElementById('email') as HTMLInputElement | null)?.value.trim() || '';
      const nomor_telp = (document.getElementById('nomor_telp') as HTMLInputElement | null)?.value.trim() || '';
      const divisi_1 = div1Select ? div1Select.value : ((document.getElementById('divisi_1') as HTMLSelectElement | null)?.value || '');
      const divisi_2 = div2Select ? div2Select.value : ((document.getElementById('divisi_2') as HTMLSelectElement | null)?.value || '');
      const alasan_divisi_1 = (document.getElementById('alasan_divisi_1') as HTMLTextAreaElement | null)?.value.trim() || '';
      const alasan_divisi_2 = (document.getElementById('alasan_divisi_2') as HTMLTextAreaElement | null)?.value.trim() || '';
      const portofolio_medhum = medhumPortoInput?.value.trim() || (document.getElementById('portofolio_medhum') as HTMLInputElement | null)?.value.trim() || '';
      const bersedia_dipindah = (document.getElementById('bersedia_dipindah') as HTMLSelectElement | null)?.value || '';

      const website_hp = (document.getElementById('website_hp') as HTMLInputElement | null)?.value || '';

      const fileKsmInput = document.getElementById('file_ksm') as HTMLInputElement | null;
      const fileKhsInput = document.getElementById('file_khs') as HTMLInputElement | null;
      const fileMlInput = document.getElementById('file_ml') as HTMLInputElement | null;
      const fileCvInput = document.getElementById('file_cv') as HTMLInputElement | null;
      const filePiInput = document.getElementById('file_pi') as HTMLInputElement | null;

      const docChecks: DocCheckItem[] = [
        { input: fileKsmInput, label: 'KSM', defaultMax: 3.0 },
        { input: fileKhsInput, label: 'KHS', defaultMax: 3.0 },
        { input: fileMlInput, label: 'Motivation Letter (ML)', defaultMax: 3.0 },
        { input: fileCvInput, label: 'Curriculum Vitae (CV)', defaultMax: 5.0 },
        { input: filePiInput, label: 'Pakta Integritas (PI)', defaultMax: 3.0 }
      ];

      const minWordsAttr = formElement?.getAttribute('data-min-words') || containerEl?.getAttribute('data-min-reason-words');
      const minReasonWords = minWordsAttr ? parseInt(minWordsAttr, 10) : 30;

      const validationResult = validateRegistrationForm(
        formElement,
        nim,
        nomor_telp,
        divisi_1,
        divisi_2,
        alasan_divisi_1,
        alasan_divisi_2,
        minReasonWords,
        portofolio_medhum,
        requiresPortfolio,
        docChecks
      );

      if (!validationResult.valid) {
        const msg = validationResult.errorMsg || (isEn ? 'Form validation error.' : 'Terjadi kesalahan validasi.');
        showModalError(msg, 1);
        resetState();
        return;
      }

      updateModalStage(2, 25, isEn ? 'Encoding documents to Base64...' : 'Mengodekan dokumen ke Base64...');

      const fileKsm = fileKsmInput?.files?.[0] ? await readFileAsBase64(fileKsmInput.files[0]) : null;
      const fileKhs = fileKhsInput?.files?.[0] ? await readFileAsBase64(fileKhsInput.files[0]) : null;
      const fileMl = fileMlInput?.files?.[0] ? await readFileAsBase64(fileMlInput.files[0]) : null;
      const fileCv = fileCvInput?.files?.[0] ? await readFileAsBase64(fileCvInput.files[0]) : null;
      const filePi = filePiInput?.files?.[0] ? await readFileAsBase64(filePiInput.files[0]) : null;

      updateModalStage(3, 60, isEn ? 'Transmitting payload to server...' : 'Mengirimkan berkas pendaftaran ke server...');

      const targetScriptUrl = ctxScriptUrl 
        || formElement?.getAttribute('data-script-url')
        || containerEl?.getAttribute('data-script-url')
        || (import.meta as any).env?.PUBLIC_GOOGLE_SHEET_SCRIPT_URL
        || 'https://script.google.com/macros/s/AKfycbz_SAMPLE_DEPLOYMENT_ID/exec';

      const secret_token = ctxSecretToken
        || formElement?.getAttribute('data-secret-token')
        || containerEl?.getAttribute('data-secret-token')
        || (import.meta as any).env?.PUBLIC_RECRUITMENT_SECRET
        || '';

      const payload = {
        nama_lengkap,
        nim,
        angkatan,
        email,
        nomor_telp,
        divisi_1,
        divisi_2,
        alasan_divisi_1,
        alasan_divisi_2,
        portofolio_medhum,
        bersedia_dipindah,
        website_hp,
        secret_token,
        timestamp: new Date().toISOString(),
        file_ksm: fileKsm ? { base64: fileKsm.base64, fileName: fileKsm.name, mimeType: fileKsm.type } : '',
        file_ksm_name: fileKsm ? fileKsm.name : '',
        file_ksm_type: fileKsm ? fileKsm.type : '',
        file_khs: fileKhs ? { base64: fileKhs.base64, fileName: fileKhs.name, mimeType: fileKhs.type } : '',
        file_khs_name: fileKhs ? fileKhs.name : '',
        file_khs_type: fileKhs ? fileKhs.type : '',
        file_ml: fileMl ? { base64: fileMl.base64, fileName: fileMl.name, mimeType: fileMl.type } : '',
        file_ml_name: fileMl ? fileMl.name : '',
        file_ml_type: fileMl ? fileMl.type : '',
        file_cv: fileCv ? { base64: fileCv.base64, fileName: fileCv.name, mimeType: fileCv.type } : '',
        file_cv_name: fileCv ? fileCv.name : '',
        file_cv_type: fileCv ? fileCv.type : '',
        file_pi: filePi ? { base64: filePi.base64, fileName: filePi.name, mimeType: filePi.type } : '',
        file_pi_name: filePi ? filePi.name : '',
        file_pi_type: filePi ? filePi.type : ''
      };

      updateModalStage(4, 85, isEn ? 'Processing on server & sending email...' : 'Memproses pendaftaran & mengirim email konfirmasi...');

      // Note: text/plain prevents browser CORS preflight OPTIONS request to Apps Script while allowing JSON payload parsing
      const response = await fetch(targetScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      let resJson: any = null;
      try {
        resJson = await response.json();
      } catch (jsonErr) {
        // If response is not JSON or opaque
      }

      if (resJson && resJson.result === 'error') {
        showModalError(resJson.error || (isEn ? 'Server error occurred during submission.' : 'Terjadi kesalahan pada server saat mengirimkan pendaftaran.'), 4);
        resetState();
        return;
      }

      const isRevision = Boolean(resJson && resJson.isRevision);
      showModalSuccess(isRevision);

      // Cleanly clear form fields, files, draft local storage, and word counters
      if (formElement) formElement.reset();
      [fileKsmInput, fileKhsInput, fileMlInput, fileCvInput, filePiInput].forEach(inp => {
        if (inp) inp.value = '';
      });
      clearDraft();
      toggleMedhumPorto();
      resetState();
    } catch (err: any) {
      console.error('Error during form submission:', err);
      showModalError(err.message || (isEn ? 'Network or server error during submission.' : 'Kendala jaringan atau server saat pengiriman.'), 3);
      resetState();
    }
  });
}
