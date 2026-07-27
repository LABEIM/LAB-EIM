import type { DocCheckItem } from './validation';
import { validateRegistrationForm } from './validation';
import { DRAFT_KEY } from './draft';

export function initRegistrationSubmit(
  formElement: HTMLFormElement | null,
  submitBtn: HTMLButtonElement | null,
  btnText: HTMLElement | null,
  alertError: HTMLElement | null,
  alertSuccess: HTMLElement | null,
  div1Select: HTMLSelectElement | null,
  div2Select: HTMLSelectElement | null,
  medhumPortoInput: HTMLInputElement | null,
  requiresPortfolio: (val: string) => boolean,
  clearDraft: () => void,
  toggleMedhumPorto: () => void
) {
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
    const draftRestoredBanner = document.getElementById('draft-restored-banner');
    const clearDraftBtn = document.getElementById('clear-draft-btn');
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

    const docChecks: DocCheckItem[] = [
      { input: fileKsmInput, label: 'KSM', defaultMax: 3.0 },
      { input: fileKhsInput, label: 'KHS', defaultMax: 3.0 },
      { input: fileMlInput, label: 'Motivation Letter (ML)', defaultMax: 3.0 },
      { input: fileCvInput, label: 'Curriculum Vitae (CV)', defaultMax: 5.0 },
      { input: filePiInput, label: 'Pakta Integritas (PI)', defaultMax: 3.0 }
    ];

    const validationResult = validateRegistrationForm(
      formElement,
      nim,
      nomor_telp,
      divisi_1,
      divisi_2,
      portofolio_medhum,
      requiresPortfolio,
      docChecks
    );

    if (!validationResult.valid) {
      const msg = validationResult.errorMsg || 'Validation error.';
      if (alertError) { alertError.innerText = msg; alertError.style.display = 'block'; }
      showModalError(msg, 1);
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
