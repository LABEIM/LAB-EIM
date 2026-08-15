import type { RegistrationContext } from './types';
import { validateRegistrationForm } from './validation';

export function initRegistrationSubmit(
  ctxOrForm: RegistrationContext | HTMLFormElement | null,
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
    ctxScriptUrl = ctx.scriptUrl;
    ctxSecretToken = ctx.secretToken;
    if (clearDraftParam) clearDraft = clearDraftParam;
    if (toggleMedhumPortoParam) toggleMedhumPorto = toggleMedhumPortoParam;
  } else {
    formElement = ctxOrForm as HTMLFormElement | null;
    submitBtn = (document.getElementById('submit-btn') as HTMLButtonElement | null) || null;
    btnText = document.getElementById('btn-text');
    alertError = document.getElementById('status-alert-error');
    alertSuccess = document.getElementById('status-alert-success');
    div1Select = (document.getElementById('divisi_1') as HTMLSelectElement | null) || null;
    div2Select = (document.getElementById('divisi_2') as HTMLSelectElement | null) || null;
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

  const showModalError = (errorMessage: string, activeStage: number = 1) => {
    if (!progressModal) return;
    updateModalStage(activeStage, activeStage === 1 ? 5 : activeStage === 2 ? 25 : activeStage === 3 ? 60 : 85, isEn ? 'Validation / Submission Error' : 'Gagal memproses pendaftaran');

    const failedItem = document.getElementById(`stage-item-${activeStage}`);
    const failedIcon = document.getElementById(`stage-${iIcon(activeStage)}`);
    if (failedItem) failedItem.className = 'progress-stage-item stage-failed';
    if (failedIcon) failedIcon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;

    if (modalIcon) modalIcon.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #ff6b6b;"></i>`;
    if (modalTitle) modalTitle.innerText = isEn ? 'Submission Failed' : 'Pendaftaran Gagal';
    if (modalSubtitle) modalSubtitle.innerText = errorMessage;

    if (modalActions) {
      modalActions.classList.remove('is-hidden');
      modalActions.style.display = 'block';
    }
    if (modalCloseBtn) modalCloseBtn.innerText = isEn ? 'Close & Fix Issues' : 'Tutup & Perbaiki Isian';
  };

  const iIcon = (stg: number) => stg;

  const showModalSuccess = (isRevision: boolean = false) => {
    if (!progressModal) return;
    updateModalStage(4, 100, isEn ? 'Registration successfully submitted & confirmed!' : 'Pendaftaran berhasil dikirim & terkonfirmasi!');

    for (let i = 1; i <= 4; i++) {
      const item = document.getElementById(`stage-item-${i}`);
      const icon = document.getElementById(`stage-${i}-icon`);
      if (item) item.className = 'progress-stage-item stage-completed';
      if (icon) icon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
    }

    if (modalIcon) modalIcon.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-cyan);"></i>`;

    const successMessage = isRevision
      ? (isEn ? 'Your updated registration data & files have been recorded.' : 'Data perbaikan & berkas terbaru Anda telah berhasil kami catat.')
      : (isEn ? 'Thank you! Your registration has been submitted. Check your email for confirmation.' : 'Terima kasih! Pendaftaran Anda telah diterima. Cek email Anda untuk konfirmasi.');

    if (modalTitle) modalTitle.innerText = isRevision ? (isEn ? 'Revision Submitted!' : 'Revisi Berhasil Dikirim!') : (isEn ? 'Registration Successful!' : 'Pendaftaran Berhasil!');
    if (modalSubtitle) modalSubtitle.innerText = successMessage;

    if (modalActions) {
      modalActions.classList.remove('is-hidden');
      modalActions.style.display = 'block';
    }
    if (modalCloseBtn) modalCloseBtn.innerText = isEn ? 'Done' : 'Selesai';
  };

  const hideProgressModal = () => {
    if (progressModal) {
      progressModal.classList.add('is-hidden');
      progressModal.style.display = 'none';
    }
    if (modalActions) {
      modalActions.classList.add('is-hidden');
      modalActions.style.display = 'none';
    }
  };

  if (formElement) {
    if (formElement.getAttribute('data-submit-bound') === 'true') return;
    formElement.setAttribute('data-submit-bound', 'true');
  }

  modalCloseBtn?.addEventListener('click', hideProgressModal);

  formElement?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const website_hp = (document.getElementById('website_hp') as HTMLInputElement | null)?.value.trim() || '';
    if (website_hp !== '') {
      showModalSuccess(false);
      if (formElement) formElement.reset();
      clearDraft();
      toggleMedhumPorto();
      isSubmitting = false;
      if (submitBtn && btnText) {
        submitBtn.disabled = false;
        btnText.innerHTML = `${isEn ? 'Submit Application' : 'Kirim Pendaftaran'} <i class="fa-solid fa-paper-plane" style="margin-left: 8px;"></i>`;
      }
      return;
    }

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
    if (modalActions) {
      modalActions.classList.add('is-hidden');
      modalActions.style.display = 'none';
    }

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
      const nim = (document.getElementById('nim') as HTMLInputElement | null)?.value.trim() || '';
      const nomor_telp = (document.getElementById('nomor_telp') as HTMLInputElement | null)?.value.trim() || '';
      const divisi_1 = div1Select ? div1Select.value : ((document.getElementById('divisi_1') as HTMLSelectElement | null)?.value || '');
      const divisi_2 = div2Select ? div2Select.value : ((document.getElementById('divisi_2') as HTMLSelectElement | null)?.value || '');

      const validationResult = validateRegistrationForm(
        formElement,
        nim,
        nomor_telp,
        divisi_1,
        divisi_2
      );

      if (!validationResult.valid) {
        const msg = validationResult.errorMsg || (isEn ? 'Form validation error.' : 'Terjadi kesalahan validasi.');
        showModalError(msg, 1);
        resetState();
        return;
      }

      updateModalStage(2, 25, isEn ? 'Encoding documents to Base64...' : 'Mengodekan dokumen ke Base64...');

      // Dynamic payload building for non-file fields
      const payload: Record<string, any> = {
        website_hp,
        timestamp: new Date().toISOString()
      };

      if (formElement) {
        const nonFileInputs = formElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
          'input:not([type="file"]):not([type="submit"]):not(.reg-honeypot-input), textarea, select'
        );
        nonFileInputs.forEach((input) => {
          const key = input.id || input.name;
          if (!key) return;

          if (input.type === 'checkbox') {
            const cb = input as HTMLInputElement;
            if (cb.checked) {
              payload[key] = (payload[key] ? payload[key] + ', ' : '') + cb.value;
            }
          } else if (input.type === 'radio') {
            const rb = input as HTMLInputElement;
            if (rb.checked) {
              payload[key] = rb.value;
            }
          } else {
            payload[key] = input.value;
          }
        });

        // Dynamic Base64 encoding for file upload fields
        const fileInputs = formElement.querySelectorAll<HTMLInputElement>('input[type="file"]');
        for (let i = 0; i < fileInputs.length; i++) {
          const fileInput = fileInputs[i];
          if (fileInput.closest('.is-hidden')) continue;
          const key = fileInput.id || fileInput.name;
          if (!key) continue;

          if (fileInput.files && fileInput.files.length > 0) {
            const encodedFile = await readFileAsBase64(fileInput.files[0]);
            payload[key] = {
              base64: encodedFile.base64,
              fileName: encodedFile.name,
              mimeType: encodedFile.type
            };
            payload[`${key}_name`] = encodedFile.name;
            payload[`${key}_type`] = encodedFile.type;
          } else {
            payload[key] = '';
            payload[`${key}_name`] = '';
            payload[`${key}_type`] = '';
          }
        }
      }

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

      payload['secret_token'] = secret_token;

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
      if (formElement) {
        formElement.reset();
        formElement.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach(inp => {
          inp.value = '';
        });
      }
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
