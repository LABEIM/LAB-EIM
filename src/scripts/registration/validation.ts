export interface DocCheckItem {
  input: HTMLInputElement | null;
  label: string;
  defaultMax: number;
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
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
  if (!/^\d{9,15}$/.test(nim)) {
    return { valid: false, errorMsg: 'Please enter a valid numeric NIM (9 to 15 digits)!' };
  }

  const cleanPhone = nomor_telp.replace(/\s+/g, '');
  if (!/^(08|\+?628)\d{7,11}$/.test(cleanPhone)) {
    return { valid: false, errorMsg: 'Please enter a valid Indonesian phone number starting with 08 or +628!' };
  }

  if (divisi_1 === divisi_2) {
    return { valid: false, errorMsg: 'Division Choice 1 and Division Choice 2 cannot be the same!' };
  }

  const words1 = countWords(alasan_divisi_1);
  if (words1 < minReasonWords) {
    return {
      valid: false,
      errorMsg: `Reason for Choosing Division 1 must contain at least ${minReasonWords} words (currently ${words1} ${words1 === 1 ? 'word' : 'words'}).`
    };
  }

  const words2 = countWords(alasan_divisi_2);
  if (words2 < minReasonWords) {
    return {
      valid: false,
      errorMsg: `Reason for Choosing Division 2 must contain at least ${minReasonWords} words (currently ${words2} ${words2 === 1 ? 'word' : 'words'}).`
    };
  }

  if ((requiresPortfolio(divisi_1) || requiresPortfolio(divisi_2)) && !portofolio_medhum) {
    return { valid: false, errorMsg: 'Please provide your portfolio URL link!' };
  }

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

  for (const item of docChecks) {
    if (item.input) {
      const maxMb = getFileInputMaxMb(item.input, item.defaultMax);
      const err = validateFileInput(item.input, item.label, maxMb);
      if (err) {
        return { valid: false, errorMsg: err };
      }
    }
  }

  // Use formElement safely instead of undeclared form
  const formMaxTotalAttr = formElement?.getAttribute('data-max-total-mb');
  const maxTotalMb = formMaxTotalAttr ? parseFloat(formMaxTotalAttr) : 15.0;
  const MAX_TOTAL_BYTES = maxTotalMb * 1024 * 1024;
  if (totalBytes > MAX_TOTAL_BYTES) {
    return {
      valid: false,
      errorMsg: `Total size of all uploaded files (${(totalBytes / (1024 * 1024)).toFixed(2)}MB) exceeds ${maxTotalMb}MB limit. Please compress your files.`
    };
  }

  return { valid: true };
}
