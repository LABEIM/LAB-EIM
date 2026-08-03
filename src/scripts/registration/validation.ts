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

export function validateSingleFile(
  fileInput: HTMLInputElement,
  label: string,
  maxMb: number,
  isEn: boolean = false
): { valid: boolean; errorMsg?: string; fileSize: number } {
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
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

  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
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
  divisi_2: string,
  alasan_divisi_1: string,
  alasan_divisi_2: string,
  minReasonWords: number,
  portofolio_medhum: string,
  requiresPortfolio: (val: string) => boolean,
  docChecks: DocCheckItem[]
): { valid: boolean; errorMsg?: string } {
  const isEn = formElement?.getAttribute('data-locale') === 'en';

  if (!validateNim(nim)) {
    return {
      valid: false,
      errorMsg: isEn
        ? 'Please enter a valid numeric NIM (9 to 15 digits)!'
        : 'Masukkan NIM berupa angka yang valid (9 sampai 15 digit)!'
    };
  }

  if (!validatePhone(nomor_telp)) {
    return {
      valid: false,
      errorMsg: isEn
        ? 'Please enter a valid phone number starting with 08 or +628!'
        : 'Masukkan nomor WhatsApp/telepon yang valid diawali 08 atau +628!'
    };
  }

  if (divisi_1 === divisi_2) {
    return {
      valid: false,
      errorMsg: isEn
        ? 'Division Choice 1 and Division Choice 2 cannot be the same!'
        : 'Divisi Pilihan 1 dan Divisi Pilihan 2 tidak boleh sama!'
    };
  }

  const words1 = countWords(alasan_divisi_1);
  if (words1 < minReasonWords) {
    return {
      valid: false,
      errorMsg: isEn
        ? `Reason for Choosing Division 1 must contain at least ${minReasonWords} words (currently ${words1} words).`
        : `Alasan Memilih Divisi 1 minimal ${minReasonWords} kata (saat ini ${words1} kata).`
    };
  }

  const words2 = countWords(alasan_divisi_2);
  if (words2 < minReasonWords) {
    return {
      valid: false,
      errorMsg: isEn
        ? `Reason for Choosing Division 2 must contain at least ${minReasonWords} words (currently ${words2} words).`
        : `Alasan Memilih Divisi 2 minimal ${minReasonWords} kata (saat ini ${words2} kata).`
    };
  }

  if ((requiresPortfolio(divisi_1) || requiresPortfolio(divisi_2)) && !portofolio_medhum) {
    return {
      valid: false,
      errorMsg: isEn
        ? 'Please provide your portfolio URL link!'
        : 'Mohon sertakan tautan URL portofolio Anda!'
    };
  }

  let totalBytes = 0;
  const getFileInputMaxMb = (fileInput: HTMLInputElement | null, defaultMax: number): number => {
    if (!fileInput) return defaultMax;
    const attr = fileInput.getAttribute('data-max-mb');
    return attr ? parseFloat(attr) : defaultMax;
  };

  for (const item of docChecks) {
    if (item.input) {
      const maxMb = getFileInputMaxMb(item.input, item.defaultMax);
      const res = validateSingleFile(item.input, item.label, maxMb, isEn);
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
