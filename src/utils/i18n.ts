export type Locale = 'id' | 'en';

export const DEFAULT_LOCALE: Locale = 'id';
export const LOCALES: Locale[] = ['id', 'en'];

/**
 * Determine locale from URL object or pathname string
 */
export function getLocaleFromUrl(url: URL | string): Locale {
  const pathname = typeof url === 'string' ? url : url.pathname;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0 && parts[0] === 'en') {
    return 'en';
  }
  return DEFAULT_LOCALE;
}

/**
 * Helper to build localized URL paths
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // Normalize path to start with '/'
  const normalized = path.startsWith('/') ? path : `/${path}`;

  // Strip existing locale prefix if any
  let cleanPath = normalized;
  if (cleanPath === '/en' || cleanPath.startsWith('/en/')) {
    cleanPath = cleanPath.slice(3) || '/';
  }

  if (locale === 'en') {
    return cleanPath === '/' ? '/en' : `/en${cleanPath}`;
  }
  return cleanPath;
}

/**
 * UI Translations dictionary
 */
export const uiTranslations: Record<Locale, Record<string, string>> = {
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.about': 'Tentang Kami',
    'nav.structure': 'Struktur',
    'nav.event': 'Kegiatan',
    'nav.news': 'Berita',
    'nav.register': 'Pendaftaran',

    // Common Buttons & Badges
    'btn.learnMore': 'Pelajari Selengkapnya',
    'btn.register': 'Daftar Sekarang',
    'btn.back': 'Kembali',
    'btn.search': 'Cari',
    'btn.close': 'Tutup',
    'badge.upcoming': 'Mendatang',
    'badge.ongoing': 'Berlangsung',
    'badge.completed': 'Selesai',

    // Footer
    'footer.description': 'Laboratorium Riset Enterprise Infrastructure Management Telkom University.',
    'footer.quickLinks': 'Tautan Cepat',
    'footer.contact': 'Kontak',
    'footer.location': 'Gedung TULT Lantai 8, Ruang TULT.08.09',
    'footer.university': 'Telkom University, Bandung, Indonesia',
    'footer.rights': 'Hak Cipta Dilindungi Undang-Undang.',

    // Registration & Selection Main
    'reg.title': 'Pendaftaran Asisten',
    'reg.statusCheck': 'Cek Hasil Seleksi',
    'reg.contactPerson': 'Narahubung',
    'reg.cpNotice': 'Memiliki pertanyaan seputar pendaftaran? Hubungi narahubung kami di bawah ini.',
    'reg.resultsTitle': 'Cek Status Seleksi Asisten',
    'reg.resultsPlaceholder': 'Masukkan NIM (contoh: 1202210001)',
    'reg.notFound': 'Data hasil seleksi untuk NIM tersebut tidak ditemukan.',
    'reg.screeningPassed': 'Lolos Seleksi Berkas',
    'reg.screeningFailed': 'Tidak Lolos Seleksi Berkas',
    'reg.technicalPassed': 'Lolos Tes Teknikal',
    'reg.technicalFailed': 'Tidak Lolos Tes Teknikal',
    'reg.statusAccepted': 'Diterima sebagai Asisten',
    'reg.statusWaitlist': 'Cadangan',
    'reg.statusRejected': 'Belum Diterima',

    // Form Field Labels & Hints
    'form.fullName': 'Nama Lengkap',
    'form.fullNamePlaceholder': 'Masukkan nama lengkap Anda',
    'form.nim': 'NIM (Nomor Induk Mahasiswa)',
    'form.nimPlaceholder': 'Contoh: 1202210001',
    'form.email': 'Email Student / Telkom University',
    'form.emailPlaceholder': 'nama@student.telkomuniversity.ac.id',
    'form.phone': 'Nomor WhatsApp / HP',
    'form.phonePlaceholder': 'Contoh: 081234567890',
    'form.classYear': 'Angkatan',
    'form.selectClassYear': '-- Pilih Angkatan --',
    'form.major': 'Program Studi',
    'form.selectMajor': '-- Pilih Program Studi --',
    'form.gpa': 'IPK Terakhir',
    'form.gpaPlaceholder': 'Contoh: 3.75',
    'form.div1': 'Pilihan Divisi 1',
    'form.selectDiv1': '-- Pilih Divisi Pilihan 1 --',
    'form.div2': 'Pilihan Divisi 2 (Opsional)',
    'form.selectDiv2': '-- Pilih Divisi Pilihan 2 --',
    'form.reason': 'Alasan Memilih Divisi',
    'form.reasonPlaceholder': 'Jelaskan motivasi dan alasan Anda memilih divisi tersebut (minimal 30 kata)...',
    'form.portfolioLink': 'Tautan Portofolio (Opsional / Khusus Medhum)',
    'form.portfolioPlaceholder': 'https://drive.google.com/... atau link Behance/GitHub',
    'form.motivationLetter': 'Surat Motivasi (Motivation Letter)',
    'form.cv': 'Curriculum Vitae (CV)',
    'form.ksm': 'Kartu Studi Mahasiswa (KSM)',
    'form.khs': 'Kartu Hasil Studi (KHS)',
    'form.pi': 'Pakta Integritas (PI)',
    'form.downloadPiTemplate': 'Unduh Template Pakta Integritas',
    'form.uploadNotice': 'Format berkas yang diperbolehkan: PDF, PNG, JPG. Perhatikan batas ukuran maksimum per berkas.',
    'form.termsAgree': 'Saya menyatakan bahwa seluruh data dan dokumen yang saya unggah adalah benar, valid, dan dapat dipertanggungjawabkan.',
    'form.submit': 'Kirim Pendaftaran',
    'form.submitting': 'Mengirim Pendaftaran...',
    'form.saveDraft': 'Simpan Draf',
    'form.draftSaved': 'Draf pendaftaran berhasil disimpan di browser Anda.',

    // Validation Messages
    'val.fullNameRequired': 'Nama lengkap wajib diisi.',
    'val.nimRequired': 'NIM wajib diisi.',
    'val.nimInvalid': 'NIM harus terdiri dari 10 digit angka.',
    'val.emailRequired': 'Email wajib diisi.',
    'val.emailInvalid': 'Format email student tidak valid.',
    'val.phoneRequired': 'Nomor WhatsApp wajib diisi.',
    'val.phoneInvalid': 'Nomor telepon/WhatsApp tidak valid.',
    'val.classRequired': 'Pilih angkatan Anda.',
    'val.majorRequired': 'Program studi wajib diisi.',
    'val.div1Required': 'Pilih Divisi Pilihan 1.',
    'val.reasonRequired': 'Alasan memilih divisi wajib diisi.',
    'val.reasonTooShort': 'Alasan memilih divisi minimal 30 kata.',
    'val.ksmRequired': 'Unggah dokumen KSM Anda.',
    'val.khsRequired': 'Unggah dokumen KHS Anda.',
    'val.mlRequired': 'Unggah Motivation Letter Anda.',
    'val.cvRequired': 'Unggah dokumen CV Anda.',
    'val.piRequired': 'Unggah Pakta Integritas yang telah ditandatangani.',
    'val.termsRequired': 'Anda harus menyetujui pernyataan keabsahan data.',
    'val.fileTooLarge': 'Ukuran file melebihi batas maksimum.',
    'val.fileInvalidExt': 'Format file tidak diperbolehkan.',

    // Stage Names
    'stage.upcoming': 'Segera Dibuka',
    'stage.open': 'Formulir Aktif',
    'stage.screening': 'Seleksi Berkas',
    'stage.screeningResults': 'Pengumuman Berkas',
    'stage.technicalTest': 'Tes Teknikal',
    'stage.technicalTestResults': 'Pengumuman Tes Teknikal',
    'stage.interview': 'Wawancara',
    'stage.announcement': 'Pengumuman Kelulusan',
    'stage.closed': 'Ditutup',
    'stage.fallback': 'Formulir Cadangan',

    // Home Page
    'home.heroTag': 'Enterprise Infrastructure Management',
    'home.heroTitle': 'Pusat Riset & Pengembangan Infrastruktur Digital',
    'home.heroDesc': 'Mengembangkan talenta digital di bidang Jaringan Komputer, Cloud Computing, Sistem Operasi, dan Keamanan Siber.',
    'home.latestNews': 'Berita Terkini',
    'home.upcomingEvents': 'Kegiatan Lab',
    'home.viewAllNews': 'Lihat Semua Berita',
    'home.viewAllEvents': 'Lihat Semua Kegiatan',

    // Structure Page
    'struct.title': 'Struktur Organisasi Lab',
    'struct.subtitle': 'Mengenal Pembina, Asisten, dan Divisi di EIM Research Lab.',
    'struct.divisions': 'Divisi Keanggotaan',
    'struct.members': 'Anggota & Asisten',
    'struct.allDivisions': 'Semua Divisi',

    // About Page
    'about.vision': 'Visi',
    'about.mission': 'Misi',
    'about.values': 'Nilai-Nilai Utama',

    // Events Page
    'events.title': 'Kegiatan & Acara',
    'events.subtitle': 'Ikuti workshop, studi banding, webinar, dan kegiatan EIM Research Lab.',
    'events.benefits': 'Manfaat Ikut',
    'events.requirements': 'Persyaratan',
    'events.organizer': 'Penyelenggara',
    'events.date': 'Tanggal Pelaksanaan',

    // News Page
    'news.title': 'Berita & Pengumuman',
    'news.subtitle': 'Informasi terbaru seputar kegiatan riset, prestasi, dan rekruitmen EIM Research Lab.',
    'news.author': 'Penulis',
    'news.date': 'Tanggal',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.structure': 'Structure',
    'nav.event': 'Events',
    'nav.news': 'News',
    'nav.register': 'Registration',

    // Common Buttons & Badges
    'btn.learnMore': 'Learn More',
    'btn.register': 'Register Now',
    'btn.back': 'Back',
    'btn.search': 'Search',
    'btn.close': 'Close',
    'badge.upcoming': 'Upcoming',
    'badge.ongoing': 'Ongoing',
    'badge.completed': 'Completed',

    // Footer
    'footer.description': 'Enterprise Infrastructure Management Research Laboratory, Telkom University.',
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.location': 'TULT Building 8th Floor, Room TULT.08.09',
    'footer.university': 'Telkom University, Bandung, Indonesia',
    'footer.rights': 'All Rights Reserved.',

    // Registration & Selection Main
    'reg.title': 'Assistant Registration',
    'reg.statusCheck': 'Check Selection Results',
    'reg.contactPerson': 'Contact Persons',
    'reg.cpNotice': 'Have questions about registration? Reach out to our contact persons below.',
    'reg.resultsTitle': 'Check Assistant Selection Status',
    'reg.resultsPlaceholder': 'Enter Student ID / NIM (e.g. 1202210001)',
    'reg.notFound': 'Selection result data for that Student ID was not found.',
    'reg.screeningPassed': 'Passed Document Screening',
    'reg.screeningFailed': 'Did Not Pass Document Screening',
    'reg.technicalPassed': 'Passed Technical Test',
    'reg.technicalFailed': 'Did Not Pass Technical Test',
    'reg.statusAccepted': 'Accepted as Assistant',
    'reg.statusWaitlist': 'Waitlist',
    'reg.statusRejected': 'Not Accepted',

    // Form Field Labels & Hints
    'form.fullName': 'Full Name',
    'form.fullNamePlaceholder': 'Enter your full name',
    'form.nim': 'NIM (Student ID)',
    'form.nimPlaceholder': 'e.g. 1202210001',
    'form.email': 'Student Email (Telkom University)',
    'form.emailPlaceholder': 'name@student.telkomuniversity.ac.id',
    'form.phone': 'WhatsApp / Phone Number',
    'form.phonePlaceholder': 'e.g. 081234567890',
    'form.classYear': 'Class Year',
    'form.selectClassYear': '-- Select Class Year --',
    'form.major': 'Major / Study Program',
    'form.selectMajor': '-- Select Major --',
    'form.gpa': 'Latest GPA / IPK',
    'form.gpaPlaceholder': 'e.g. 3.75',
    'form.div1': 'Division Choice 1',
    'form.selectDiv1': '-- Select Division Choice 1 --',
    'form.div2': 'Division Choice 2 (Optional)',
    'form.selectDiv2': '-- Select Division Choice 2 --',
    'form.reason': 'Reason for Choosing Division',
    'form.reasonPlaceholder': 'Explain your motivation and reasons for choosing the division (minimum 30 words)...',
    'form.portfolioLink': 'Portfolio Link (Optional / Medhum Only)',
    'form.portfolioPlaceholder': 'https://drive.google.com/... or Behance/GitHub link',
    'form.motivationLetter': 'Motivation Letter',
    'form.cv': 'Curriculum Vitae (CV)',
    'form.ksm': 'Student Study Card (KSM)',
    'form.khs': 'Academic Transcript (KHS)',
    'form.pi': 'Integrity Pact (PI)',
    'form.downloadPiTemplate': 'Download Integrity Pact Template',
    'form.uploadNotice': 'Allowed file formats: PDF, PNG, JPG. Please observe maximum file size limits.',
    'form.termsAgree': 'I declare that all data and documents uploaded are true, valid, and authentic.',
    'form.submit': 'Submit Application',
    'form.submitting': 'Submitting Application...',
    'form.saveDraft': 'Save Draft',
    'form.draftSaved': 'Registration draft successfully saved in your browser.',

    // Validation Messages
    'val.fullNameRequired': 'Full name is required.',
    'val.nimRequired': 'Student ID (NIM) is required.',
    'val.nimInvalid': 'NIM must be exactly 10 numeric digits.',
    'val.emailRequired': 'Email is required.',
    'val.emailInvalid': 'Invalid student email format.',
    'val.phoneRequired': 'WhatsApp number is required.',
    'val.phoneInvalid': 'Invalid phone/WhatsApp number.',
    'val.classRequired': 'Please select your class year.',
    'val.majorRequired': 'Major/Study Program is required.',
    'val.div1Required': 'Please select Division Choice 1.',
    'val.reasonRequired': 'Reason for choosing division is required.',
    'val.reasonTooShort': 'Reason for choosing division must be at least 30 words.',
    'val.ksmRequired': 'Please upload your KSM document.',
    'val.khsRequired': 'Please upload your KHS document.',
    'val.mlRequired': 'Please upload your Motivation Letter.',
    'val.cvRequired': 'Please upload your CV document.',
    'val.piRequired': 'Please upload your signed Integrity Pact.',
    'val.termsRequired': 'You must agree to the data authenticity declaration.',
    'val.fileTooLarge': 'File size exceeds the maximum allowed limit.',
    'val.fileInvalidExt': 'File format is not allowed.',

    // Stage Names
    'stage.upcoming': 'Opening Soon',
    'stage.open': 'Registration Form',
    'stage.screening': 'Document Screening',
    'stage.screeningResults': 'Screening Results',
    'stage.technicalTest': 'Technical Test',
    'stage.technicalTestResults': 'Technical Test Results',
    'stage.interview': 'Interview Phase',
    'stage.announcement': 'Final Announcement',
    'stage.closed': 'Recruitment Closed',
    'stage.fallback': 'Maintenance Form',

    // Home Page
    'home.heroTag': 'Enterprise Infrastructure Management',
    'home.heroTitle': 'Center for Digital Infrastructure Research & Development',
    'home.heroDesc': 'Developing digital talent in Computer Networks, Cloud Computing, Operating Systems, and Cybersecurity.',
    'home.latestNews': 'Latest News',
    'home.upcomingEvents': 'Lab Events',
    'home.viewAllNews': 'View All News',
    'home.viewAllEvents': 'View All Events',

    // Structure Page
    'struct.title': 'Lab Organizational Structure',
    'struct.subtitle': 'Meet the Advisors, Assistants, and Divisions at EIM Research Lab.',
    'struct.divisions': 'Membership Divisions',
    'struct.members': 'Members & Assistants',
    'struct.allDivisions': 'All Divisions',

    // About Page
    'about.vision': 'Vision',
    'about.mission': 'Mission',
    'about.values': 'Core Values',

    // Events Page
    'events.title': 'Events & Activities',
    'events.subtitle': 'Participate in workshops, benchmark visits, webinars, and EIM Research Lab activities.',
    'events.benefits': 'Key Benefits',
    'events.requirements': 'Requirements',
    'events.organizer': 'Organizer',
    'events.date': 'Event Date',

    // News Page
    'news.title': 'News & Announcements',
    'news.subtitle': 'Latest updates on research activities, achievements, and assistant recruitment at EIM Research Lab.',
    'news.author': 'Author',
    'news.date': 'Date',
  },
};

/**
 * Get translation with automatic fallback to Indonesian
 */
export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  if (uiTranslations[locale]?.[key]) {
    return uiTranslations[locale][key];
  }
  if (uiTranslations[DEFAULT_LOCALE]?.[key]) {
    return uiTranslations[DEFAULT_LOCALE][key];
  }
  return key;
}

/**
 * Helper function to deep merge data objects with Indonesian fallback
 */
export function mergeWithFallback<T extends Record<string, any>>(idData: T, enData?: Partial<T> | null): T {
  if (!enData) return idData;
  const result: any = Array.isArray(idData) ? [...idData] : { ...idData };

  for (const key of Object.keys(idData)) {
    const valEn = (enData as any)[key];
    const valId = (idData as any)[key];

    if (valEn !== undefined && valEn !== null && valEn !== '') {
      if (typeof valEn === 'object' && !Array.isArray(valEn) && typeof valId === 'object' && !Array.isArray(valId)) {
        result[key] = mergeWithFallback(valId, valEn);
      } else {
        result[key] = valEn;
      }
    }
  }
  return result as T;
}

// Statically load all data files using Vite import.meta.glob (works in browser, node, vercel, etc.)
const allDataFiles = import.meta.glob<Record<string, any>>('../data/**/*.json', { eager: true, import: 'default' });

/**
 * Helper to load localized JSON data from src/data/{filename}.json or src/data/{id,en}/{filename}.json
 */
export function getLocalizedJsonData<T extends Record<string, any>>(filename: string, locale: Locale = DEFAULT_LOCALE): T {
  const idKey = `../data/id/${filename}.json`;
  const enKey = `../data/en/${filename}.json`;
  const rootKey = `../data/${filename}.json`;

  const hasLocalized = Boolean(allDataFiles[idKey] || allDataFiles[enKey]);
  if (hasLocalized) {
    const idData: T = (allDataFiles[idKey] as T) || (allDataFiles[rootKey] as T) || ({} as T);
    if (locale === 'id') return idData;

    const enData: Partial<T> = (allDataFiles[enKey] as Partial<T>) || {};
    return mergeWithFallback(idData, enData);
  }

  if (allDataFiles[rootKey]) {
    return allDataFiles[rootKey] as T;
  }

  return {} as T;
}

/**
 * Filter collection entries by locale with fallback for missing entries in requested locale
 */
export function getCollectionEntriesForLocale<T extends { id: string }>(entries: T[], locale: Locale = DEFAULT_LOCALE): T[] {
  const localePrefix = `${locale}/`;
  const defaultPrefix = `${DEFAULT_LOCALE}/`;

  const targetEntriesMap = new Map<string, T>();
  const defaultEntriesMap = new Map<string, T>();
  const flatEntries: T[] = [];

  for (const entry of entries) {
    if (entry.id.startsWith(localePrefix)) {
      const cleanSlug = entry.id.replace(localePrefix, '');
      targetEntriesMap.set(cleanSlug, entry);
    } else if (entry.id.startsWith(defaultPrefix)) {
      const cleanSlug = entry.id.replace(defaultPrefix, '');
      defaultEntriesMap.set(cleanSlug, entry);
    } else {
      flatEntries.push(entry);
    }
  }

  if (targetEntriesMap.size === 0 && defaultEntriesMap.size === 0) {
    return entries;
  }

  const result: T[] = [...flatEntries];
  const allSlugs = new Set([...defaultEntriesMap.keys(), ...targetEntriesMap.keys()]);
  for (const slug of allSlugs) {
    const entry = targetEntriesMap.get(slug) || defaultEntriesMap.get(slug);
    if (entry) {
      result.push(entry);
    }
  }

  return result;
}

/**
 * Helper to clean entry slug for routing (strips 'id/' or 'en/' prefix)
 */
export function getCleanSlug(id: string): string {
  return id.replace(/^(id|en)\//, '');
}
