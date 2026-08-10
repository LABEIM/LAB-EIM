export type Locale = 'id';

export const DEFAULT_LOCALE: Locale = 'id';
export const LOCALES: Locale[] = ['id'];

/**
 * Determine locale from URL object or pathname string (always 'id')
 */
export function getLocaleFromUrl(_url?: URL | string): Locale {
  return DEFAULT_LOCALE;
}

/**
 * Helper to build URL paths (ensures clean non-prefixed paths)
 */
export function getLocalizedPath(path: string, _locale?: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  let cleanPath = normalized;
  if (cleanPath === '/en' || cleanPath.startsWith('/en/')) {
    cleanPath = cleanPath.slice(3) || '/';
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
    'nav.contact': 'Kontak',
    'nav.joinUs': 'Join Us',

    // Common Buttons & Badges
    'btn.learnMore': 'Pelajari Selengkapnya',
    'btn.details': 'Lihat Detail',
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
    'form.nimPlaceholder': 'Contoh: 1020223001000',
    'form.email': 'Email',
    'form.emailPlaceholder': 'nama@example.com',
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
    'form.portfolioLink': 'Tautan Portofolio',
    'form.portfolioPlaceholder': 'https://drive.google.com/... atau link Behance/GitHub',
    'form.motivationLetter': 'Surat Motivasi (Motivation Letter)',
    'form.cv': 'Curriculum Vitae (CV)',
    'form.ksm': 'Kartu Studi Mahasiswa (KSM)',
    'form.khs': 'Kartu Hasil Studi (KHS)',
    'form.pi': 'Pakta Integritas (PI)',
    'form.downloadPiTemplate': 'Unduh Template Pakta Integritas',
    'form.uploadNotice': 'Format berkas yang diperbolehkan: {exts}. Perhatikan batas ukuran maksimum per berkas.',
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
};

/**
 * Get translation with automatic fallback to Indonesian
 */
export function t(key: string, locale: Locale = DEFAULT_LOCALE, params?: Record<string, string>): string {
  let str = uiTranslations[locale]?.[key] || uiTranslations[DEFAULT_LOCALE]?.[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return str;
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
