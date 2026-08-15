import type { DocCheckItem } from './types';
export type { DocCheckItem };

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateNim(nim: string): boolean {
  return /^\d{9,15}$/.test(nim);
}

export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\s+/g, '');
  return /^(08|\+?628)\d{7,11}$/.test(cleanPhone);
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateSingleFile(
  fileInput: HTMLInputElement,
  label: string,
  maxMb: number,
  isEn: boolean = false
): { valid: boolean; errorMsg?: string; fileSize: number } {
  if (!fileInput) {
    return { valid: true, fileSize: 0 };
  }

  const isRequired = fileInput.hasAttribute('required') || fileInput.required;
  if (!fileInput.files || fileInput.files.length === 0) {
    if (isRequired) {
      return {
        valid: false,
        errorMsg: isEn
          ? `File ${label} is required. Please select a document to upload.`
          : `Berkas ${label} wajib diunggah. Mohon pilih dokumen pendaftaran Anda.`,
        fileSize: 0
      };
    }
    return { valid: true, fileSize: 0 };
  }

  const file = fileInput.files[0];
  if (file.size === 0) {
    return {
      valid: false,
      errorMsg: isEn
        ? `File ${label} is empty (0 bytes). Please upload a valid non-empty document.`
        : `Berkas ${label} kosong (0 byte). Mohon unggah dokumen yang valid.`,
      fileSize: 0
    };
  }

  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      errorMsg: isEn
        ? `File ${label} exceeds maximum size limit of ${maxMb}MB. (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
        : `Ukuran berkas ${label} melebihi batas maksimum ${maxMb}MB. (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      fileSize: file.size
    };
  }

  const inputExtsAttr = fileInput.getAttribute('data-allowed-exts') || 'pdf, png, jpg, jpeg';
  const itemAllowedExts = inputExtsAttr
    .split(',')
    .map(ext => ext.trim().toLowerCase().replace(/^\./, ''))
    .filter(Boolean);

  const fileExt = file.name.split('.').pop()?.trim().toLowerCase() || '';
  if (itemAllowedExts.length > 0 && !itemAllowedExts.includes(fileExt)) {
    return {
      valid: false,
      errorMsg: isEn
        ? `File ${label} has invalid format (.${fileExt}). Allowed formats for ${label}: ${itemAllowedExts.map(e => '.' + e).join(', ')}`
        : `Format berkas ${label} tidak valid (.${fileExt}). Format yang diperbolehkan: ${itemAllowedExts.map(e => '.' + e).join(', ')}`,
      fileSize: file.size
    };
  }

  return { valid: true, fileSize: file.size };
}

export function validateRegistrationForm(
  formElement: HTMLFormElement | null,
  nim: string,
  nomor_telp: string,
  divisi_1: string,
  divisi_2: string
): { valid: boolean; errorMsg?: string } {
  const isEn = formElement?.getAttribute('data-locale') === 'en';
  const container = formElement?.closest('#registration-container');
  const formType = container?.getAttribute('data-form-type') || 'recruitment';

  if (formElement && !formElement.checkValidity()) {
    formElement.reportValidity();
    return {
      valid: false,
      errorMsg: isEn
        ? 'Please fill in all required form fields correctly!'
        : 'Mohon lengkapi seluruh isian formulir yang wajib diisi dengan benar!'
    };
  }

  // Dynamic email inputs validation
  if (formElement) {
    const emailInputs = formElement.querySelectorAll<HTMLInputElement>('input[type="email"], #email');
    for (let i = 0; i < emailInputs.length; i++) {
      const emailVal = emailInputs[i].value.trim();
      if (emailVal && !validateEmail(emailVal)) {
        return {
          valid: false,
          errorMsg: isEn
            ? 'Please enter a valid email address!'
            : 'Masukkan alamat email yang valid!'
        };
      }
    }
  }

  // Validate NIM only if in recruitment mode or if explicit numeric NIM validation is required
  if (nim && formType === 'recruitment' && !validateNim(nim)) {
    return {
      valid: false,
      errorMsg: isEn
        ? 'Please enter a valid numeric NIM (9 to 15 digits)!'
        : 'Masukkan NIM berupa angka yang valid (9 sampai 15 digit)!'
    };
  }

  // Validate phone number
  if (nomor_telp && formType === 'recruitment' && !validatePhone(nomor_telp)) {
    return {
      valid: false,
      errorMsg: isEn
        ? 'Please enter a valid phone number starting with 08 or +628!'
        : 'Masukkan nomor WhatsApp/telepon yang valid diawali 08 atau +628!'
    };
  }

  // Validate division choices uniqueness only if both division 1 & 2 are present and selected
  if (divisi_1 && divisi_2 && divisi_1 === divisi_2) {
    return {
      valid: false,
      errorMsg: isEn
        ? 'Division Choice 1 and Division Choice 2 cannot be the same!'
        : 'Divisi Pilihan 1 dan Divisi Pilihan 2 tidak boleh sama!'
    };
  }

  // Validate all dynamic textareas with minWords requirement
  if (formElement) {
    const textareas = formElement.querySelectorAll<HTMLTextAreaElement>('textarea[data-min-words]');
    for (let i = 0; i < textareas.length; i++) {
      const ta = textareas[i];
      // Skip hidden/conditional textareas
      if (ta.closest('.is-hidden')) continue;
      const minW = parseInt(ta.getAttribute('data-min-words') || '0', 10);
      if (minW > 0 && (ta.required || ta.value.trim().length > 0)) {
        const words = countWords(ta.value);
        if (words < minW) {
          const fieldLabel = ta.closest('.form-group')?.querySelector('.form-label')?.textContent?.replace('*', '').trim() || ta.name || ta.id;
          return {
            valid: false,
            errorMsg: isEn
              ? `${fieldLabel} must contain at least ${minW} words (currently ${words} words).`
              : `${fieldLabel} minimal ${minW} kata (saat ini ${words} kata).`
          };
        }
      }
    }
  }

  let totalBytes = 0;

  // Validate dynamic file inputs in form
  if (formElement) {
    const fileInputs = formElement.querySelectorAll<HTMLInputElement>('input[type="file"]');
    for (let i = 0; i < fileInputs.length; i++) {
      const fileInput = fileInputs[i];
      if (fileInput.closest('.is-hidden')) continue;
      const maxMbAttr = fileInput.getAttribute('data-max-mb');
      const maxMb = maxMbAttr ? parseFloat(maxMbAttr) : 2.0;
      const label = fileInput.closest('.form-group')?.querySelector('.form-label')?.textContent?.replace('*', '').trim() || fileInput.id;
      const res = validateSingleFile(fileInput, label, maxMb, isEn);
      if (!res.valid) {
        return { valid: false, errorMsg: res.errorMsg };
      }
      totalBytes += res.fileSize;
    }
  }

  const formMaxTotalAttr = formElement?.getAttribute('data-max-total-mb');
  const maxTotalMb = formMaxTotalAttr ? parseFloat(formMaxTotalAttr) : 15.0;
  const MAX_TOTAL_BYTES = maxTotalMb * 1024 * 1024;
  if (totalBytes > MAX_TOTAL_BYTES) {
    return {
      valid: false,
      errorMsg: isEn
        ? `Total size of all uploaded files (${(totalBytes / (1024 * 1024)).toFixed(2)}MB) exceeds ${maxTotalMb}MB limit. Please compress your files.`
        : `Total ukuran seluruh berkas (${(totalBytes / (1024 * 1024)).toFixed(2)}MB) melebihi batas ${maxTotalMb}MB. Mohon kompres berkas Anda.`
    };
  }

  return { valid: true };
}

