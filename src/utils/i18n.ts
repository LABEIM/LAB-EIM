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
    // Navigation (page-title call sites remain until each page task migrates them)
    'nav.event': 'Kegiatan',

    // Common Buttons & Badges
    'stats.dosen': 'Dosen',
    'stats.members': 'Anggota laboratorium',
    'stats.courses': 'Mata kuliah',
    'btn.learnMore': 'Pelajari Selengkapnya',
    'btn.details': 'Lihat Detail',
    'btn.register': 'Daftar Sekarang',
    'btn.back': 'Kembali',
    'btn.search': 'Cari',
    'btn.close': 'Tutup',
    'badge.upcoming': 'Mendatang',

    // Registration & Selection Main
    'reg.title': 'Pendaftaran Asisten',
    'reg.statusCheck': 'Cek Hasil Seleksi',
    'reg.heroPrimary': 'Lihat formulir',
    'reg.heroSecondary': 'Hubungi kami',
    'reg.period': 'Periode pendaftaran: {start} — {end}',
    'reg.contactPerson': 'Narahubung',
    'reg.cpNotice': 'Memiliki pertanyaan seputar pendaftaran? Hubungi narahubung kami di bawah ini.',
    'reg.resultsTitle': 'Cek Status Seleksi Asisten',
    'reg.resultsPlaceholder': 'Masukkan NIM (contoh: 102022300301)',
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
    'form.nimPlaceholder': 'Contoh: 102022300301',
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
    'form.div2': 'Pilihan Divisi 2',
    'form.selectDiv2': '-- Pilih Divisi Pilihan 2 --',
    'form.reason': 'Alasan Memilih Divisi',
    'form.reasonPlaceholder': 'Jelaskan motivasi dan alasan Anda memilih divisi tersebut...',
    'form.portfolioLink': 'Tautan Portofolio / Sertifikat',
    'form.portfolioPlaceholder': 'https://drive.google.com/... (Link Drive, Behance, GitHub, atau Sertifikat)',
    'form.motivationLetter': 'Surat Motivasi (Motivation Letter)',
    'form.cv': 'Curriculum Vitae (CV)',
    'form.ksm': 'Kartu Studi Mahasiswa (KSM)',
    'form.khs': 'Kartu Hasil Studi (KHS)',
    'form.pi': 'Pakta Integritas (PI)',
    'form.downloadPiTemplate': 'Unduh Template Pakta Integritas',
    'form.chooseFile': 'Pilih berkas',
    'form.noFile': 'Belum ada berkas',
    'form.requirementsTitle': 'Persyaratan:',
    'form.dataUse': 'Berkas dan data yang Anda kirim hanya digunakan untuk seleksi asisten EIM Lab.',
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

    // Courses Page (coordinator/sks/practicum keys owned by Task 13)
    'courses.practicumYes': 'Praktikum',
    'courses.practicumNo': 'Tanpa praktikum',
    'courses.coordinatorLabel': 'Koordinator mata kuliah',
    'courses.sksLabel': '{n} SKS',

    // Events Page
    'events.title': 'Kegiatan & Acara',
    'events.subtitle': 'Ikuti workshop, studi banding, webinar, dan kegiatan EIM Lab.',
    'events.metaDescription': 'Kegiatan EIM Lab — workshop, seminar, studi banding, dan program laboratorium.',
    'events.heroEyebrow': 'Kegiatan',
    'events.heroTitle': 'Kegiatan\nlaboratorium.',
    'events.heroDesc': 'Workshop, seminar, studi banding, dan program EIM Lab — lengkap dengan dokumentasinya.',
    'events.heroPrimary': 'Lihat kegiatan',
    'events.heroSecondary': 'Artikel',
    'events.heroMeta': '{events} kegiatan · {categories} kategori · terbaru {year}',
    'events.heroMetaEmpty': 'Belum ada kegiatan yang dipublikasikan.',
    'events.sectionNavLabel': 'Navigasi bagian halaman',
    'events.navDotList': 'Daftar',
    'events.listEyebrow': 'Daftar',
    'events.listTitle': 'Kegiatan kami.',
    'events.listIntro': 'Telusuri kegiatan EIM berdasarkan nama atau kategori, lalu buka detailnya untuk melihat dokumentasi.',
    'events.searchPlaceholder': 'Cari nama kegiatan, kategori, atau penyelenggara...',
    'events.listEmptyTitle': 'Belum ada kegiatan yang dipublikasikan.',
    'events.listEmptyDesc': 'Kegiatan akan tampil di sini setelah dipublikasikan.',
    'events.listNoMatchTitle': 'Kegiatan tidak ditemukan.',
    'events.listNoMatchDesc': 'Tidak ada kegiatan yang cocok dengan pencarian atau filter Anda. Coba kata kunci lain atau reset filter.',
    'events.backToList': 'Kembali ke kegiatan',
    'events.share': 'Bagikan',
    'events.organizerFallback': 'EIM Lab',
    'events.contact': 'Hubungi kami',
    'events.dateTbd': 'Tanggal menyusul',
    'events.relatedEyebrow': 'Kegiatan lain',
    'events.relatedTitle': 'Kegiatan lain dari EIM.',
    'events.relatedIntro': 'Kegiatan lain yang mungkin Anda minati.',
    'events.backToIndex': 'Kembali ke daftar kegiatan',
    'events.galleryEyebrow': 'Dokumentasi',
    'events.galleryTitle': 'Dokumentasi kegiatan.',
    'events.galleryAlt': 'Dokumentasi {title} {n}',
    'events.recapEmpty': 'Dokumentasi kegiatan ini belum tersedia.',

    // News Page
    'news.subtitle': 'Tulisan riset, publikasi, dan pengumuman dari EIM Lab.',
    'news.author': 'Penulis',
    'news.date': 'Tanggal',
    'news.featured': 'Artikel utama',
    'news.topics': 'Topik',
    'news.share': 'Bagikan',
    'news.backToList': 'Kembali ke artikel',
    'news.backToIndex': 'Kembali ke daftar artikel',
    'news.relatedEyebrow': 'Artikel lain',
    'news.relatedTitle': 'Baca juga.',
    'news.relatedIntro': 'Artikel lain dari EIM Lab yang mungkin Anda minati.',

    // News Index
    'news.galleryEyebrow': 'Dokumentasi',
    'news.galleryTitle': 'Foto artikel.',
    'news.contact': 'Hubungi kami',

    // Contact Page
    'contact.heroEyebrow': 'Kontak',
    'contact.heroPrimary': 'Detail kontak',
    'contact.heroSecondary': 'Daftar asisten',
    'contact.sectionNavLabel': 'Navigasi bagian halaman',
    'contact.navDotDetail': 'Detail',
    'contact.navDotMap': 'Lokasi',
    'contact.navDotSocial': 'Sosial',
    'contact.detailsEyebrow': 'Detail kontak',
    'contact.detailsTitle': 'Kanal komunikasi.',
    'contact.detailsIntro': 'Pertanyaan riset, kolaborasi, kunjungan, atau informasi rekrutmen — mulai dari salah satu kanal berikut.',
    'contact.emailAction': 'Kirim email',
    'contact.socialsEyebrow': 'Media sosial',
    'contact.socialsTitle': 'Ikuti kami.',
    'contact.socialsIntro': 'Perkembangan kegiatan riset, pelatihan, dan pengumuman rekrutmen terbaru di media sosial EIM.',
    'contact.routingNote': 'Rekrutmen, riset, kolaborasi, dan dokumen administrasi → email.',
    'contact.copyEmail': 'Salin email',
    'contact.copied': 'Tersalin!',
    'contact.copyFailed': 'Gagal menyalin',
    'contact.copySuccessStatus': 'Email disalin ke papan klip.',
    'contact.copyFailedStatus': 'Email gagal disalin.',
    'contact.picsTitle': 'Hubungi PIC kami.',
    'contact.picsSubtitle': 'Pilih PIC sesuai kebutuhan: rekrutmen dan kegiatan, atau riset dan kolaborasi.',
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
