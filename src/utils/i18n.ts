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
    'nav.courses': 'Mata Kuliah',
    'nav.event': 'Kegiatan',
    'nav.news': 'Artikel',
    'nav.register': 'Pendaftaran',
    'nav.contact': 'Kontak',
    'nav.joinUs': 'Gabung EIM',

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
    'footer.quickLinks': 'Jelajahi',
    'footer.contact': 'Kontak',
    'footer.resources': 'Tautan',
    'footer.assets': 'Aset Brand & Email',
    'footer.linkHub': 'EIM Link Hub',
    'footer.location': 'Gedung TULT Lantai 8, Ruang TULT.08.09',
    'footer.university': 'Telkom University, Bandung, Indonesia',
    'footer.rights': 'Hak Cipta Dilindungi Undang-Undang.',
    'footer.backToTop': 'Kembali ke atas',

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
    'form.dataUse': 'Berkas dan data yang Anda kirim hanya digunakan untuk seleksi asisten EIM Research Lab.',
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
    'home.latestNews': 'Artikel Terkini',
    'home.upcomingEvents': 'Kegiatan Lab',
    'home.viewAllNews': 'Lihat Semua Artikel',
    'home.viewAllEvents': 'Lihat Semua Kegiatan',
    'home.noNews': 'Belum ada artikel terkini.',

    // Structure Page
    'struct.title': 'Struktur Organisasi Lab',
    'struct.metaDescription': 'Struktur organisasi EIM Research Lab: dosen, koordinator asisten, mahasiswa anggota, dan asisten praktikum.',
    'struct.heroEyebrow': 'Struktur organisasi',
    'struct.heroTitle': 'Satu lab,\nsatu tim.',
    'struct.heroDesc': 'Dosen, koordinator asisten, dan mahasiswa anggota yang menjalankan riset, praktikum, dan pengabdian di EIM Research Lab.',
    'struct.heroPrimary': 'Jelajahi bagan',
    'struct.heroSecondary': 'Gabung EIM',
    'struct.heroMeta': '{members} asisten & mahasiswa · {dosen} dosen · {positions} peran',
    'struct.sectionNavLabel': 'Navigasi bagian halaman',
    'struct.navDotChart': 'Bagan',
    'struct.navDotJoin': 'Gabung',
    'struct.navDotDosen': 'Dosen',
    'struct.navDotAsisten': 'Asisten',
    'struct.navDotMahasiswa': 'Mahasiswa',
    'struct.chartTitle': 'Bagan peran.',
    'struct.chartIntro': 'Struktur peran laboratorium, dari dosen sampai asisten praktikum. Detail anggota ada di bagian bawah halaman.',
    'struct.chartLabel': 'Bagan struktur: Dosen Ketua Laboratorium membawahi Dosen Wakil Ketua Laboratorium, yang membawahi Dosen Anggota Laboratorium, Koordinator Mata Kuliah, dan Koordinator Asisten Laboratorium. Koordinator Asisten Laboratorium membawahi Asisten Koordinator Praktikum dan Mahasiswa Anggota Laboratorium, dan Asisten Koordinator Praktikum membawahi Asisten Praktikum.',
    'struct.groupDosen': 'Dosen',
    'struct.groupAsisten': 'Asisten',
    'struct.groupMahasiswa': 'Mahasiswa',
    'struct.emptyPosition': 'Belum ada anggota',
    'struct.positionIntro': '{n} orang pada peran ini.',
    'struct.positionCount': '{n} orang',
    'struct.practicumAssistant': 'Asisten Praktikum',
    'struct.memberAssistantNote': '{n} dari {total} juga Asisten Praktikum',
    'struct.assistantMemberNote': '{n} di antaranya Mahasiswa Anggota',

    'home.coursesEyebrow': 'Pengajaran',
    'home.coursesTitle': 'Mata kuliah & praktikum.',
    'home.coursesIntro': 'Mata kuliah di bidang studi lab yang punya praktikum, beserta dosen koordinatornya.',
    'home.coursesLink': 'Lihat semua mata kuliah',
    'home.navDotCourses': 'Mata Kuliah',

    // Courses Page
    'courses.heroEyebrow': 'Pengajaran',
    'courses.heroTitle': 'Mata kuliah\ndan praktikum.',
    'courses.heroDesc': 'Daftar mata kuliah di bidang studi EIM Research Lab, lengkap dengan status praktikum, modul, dosen koordinator, dan asisten praktikumnya.',
    'courses.heroPrimary': 'Lihat daftar',
    'courses.metaDescription': 'Mata kuliah dan praktikum di bidang studi EIM Research Lab: modul, koordinator mata kuliah, dan asisten praktikum.',
    'courses.summary': '{n} mata kuliah · {p} dengan praktikum',
    'courses.listEyebrow': 'Katalog',
    'courses.listTitle': 'Daftar mata kuliah.',
    'courses.listIntro': 'Tiap entri memuat kode, SKS, status praktikum, dan dosen koordinator. Modul serta asisten praktikum ada di halaman detail mata kuliah.',
    'courses.practicumYes': 'Praktikum',
    'courses.practicumNo': 'Tanpa praktikum',
    'courses.modulesTitle': 'Modul praktikum',
    'courses.coordinatorLabel': 'Koordinator mata kuliah',
    'courses.assistantsLabel': 'Asisten praktikum',
    'courses.empty': 'Belum ada data mata kuliah.',
    'courses.sksLabel': '{n} SKS',
    'courses.backToList': 'Semua mata kuliah',
    'courses.noPracticumNote': 'Mata kuliah ini tidak memiliki praktikum, sehingga tidak ada modul maupun asisten praktikum.',
    'courses.detailDescription': '{title} di EIM Research Lab: status praktikum, modul, dosen koordinator, dan asisten praktikum.',
    'courses.sectionNavLabel': 'Navigasi bagian halaman',
    'courses.navDotList': 'Daftar',

    // About Page
    'about.vision': 'Visi',
    'about.mission': 'Misi',
    'about.values': 'Nilai-Nilai Utama',
    'about.heroEyebrow': 'Tentang Kami',
    'about.heroTitle': 'Kami mempelajari sistem\nyang menopang dunia digital.',
    'about.heroDesc': 'Enterprise Infrastructure Management Research Lab Telkom University — tempat riset, pembelajaran, dan kolaborasi di bidang infrastruktur enterprise.',
    'about.heroPrimary': 'Gabung EIM',
    'about.heroSecondary': 'Kenali tim',
    'about.heroMeta': 'Telkom University · Fakultas Rekayasa Industri · S1 Sistem Informasi',
    'about.profileEyebrow': 'Profil',
    'about.factsLabel': 'Identitas',
    'about.factName': 'Nama resmi',
    'about.factFaculty': 'Fakultas',
    'about.factProgram': 'Program studi',
    'about.factLocation': 'Lokasi',
    'about.factEmail': 'Surel',
    'about.factFacultyValue': 'Fakultas Rekayasa Industri',
    'about.factProgramValue': 'S1 Sistem Informasi',
    'about.statsLabel': 'EIM dalam angka',
    'about.statMembers': 'Anggota & asisten',
    'about.statCourses': 'Mata kuliah',
    'about.statFocus': 'Fokus riset',
    'about.teamLink': 'Lihat seluruh struktur',
    'about.ctaTitle': 'Ingin tumbuh bersama kami?',
    'about.ctaDesc': 'Pendaftaran asisten dibuka setiap periode. Untuk kolaborasi riset, kunjungan, atau pertanyaan lain, kami terbuka.',
    'about.ctaContact': 'Hubungi kami',
    'about.sectionNavLabel': 'Navigasi bagian halaman',
    'about.navDotProfile': 'Profil',
    'about.navDotStats': 'Angka',
    'about.navDotCta': 'Gabung',

    // Events Page
    'events.title': 'Kegiatan & Acara',
    'events.subtitle': 'Ikuti workshop, studi banding, webinar, dan kegiatan EIM Research Lab.',
    'events.metaDescription': 'Kegiatan EIM Research Lab — workshop, seminar, studi banding, dan program laboratorium.',
    'events.heroEyebrow': 'Kegiatan',
    'events.heroTitle': 'Kegiatan\nlaboratorium.',
    'events.heroDesc': 'Workshop, seminar, studi banding, dan program EIM Research Lab — lengkap dengan dokumentasinya.',
    'events.heroPrimary': 'Lihat kegiatan',
    'events.heroSecondary': 'Gabung EIM',
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
    'events.organizerFallback': 'EIM Research Lab',
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
    'news.title': 'Artikel',
    'news.subtitle': 'Tulisan riset, publikasi, dan pengumuman dari EIM Research Lab.',
    'news.author': 'Penulis',
    'news.date': 'Tanggal',
    'news.featured': 'Artikel utama',
    'news.topics': 'Topik',
    'news.share': 'Bagikan',
    'news.backToList': 'Kembali ke artikel',
    'news.backToIndex': 'Kembali ke daftar artikel',
    'news.relatedEyebrow': 'Artikel lain',
    'news.relatedTitle': 'Baca juga.',
    'news.relatedIntro': 'Artikel lain dari EIM Research Lab yang mungkin Anda minati.',

    // News Index
    'news.metaDescription': 'Artikel, publikasi, dan pengumuman dari EIM Research Lab.',
    'news.heroEyebrow': 'Artikel',
    'news.heroTitle': 'Catatan\ndari lab.',
    'news.heroDesc': 'Tulisan riset, publikasi, dan pengumuman dari EIM Research Lab.',
    'news.heroPrimary': 'Telusuri artikel',
    'news.heroSecondary': 'Lihat kegiatan',
    'news.heroMeta': '{articles} artikel · {categories} kategori · terbaru {year}',
    'news.heroMetaEmpty': 'Belum ada artikel yang dipublikasikan.',
    'news.sectionNavLabel': 'Navigasi bagian halaman',
    'news.navDotList': 'Daftar',
    'news.listEyebrow': 'Daftar',
    'news.listTitle': 'Semua artikel.',
    'news.listIntro': 'Telusuri tulisan, publikasi, dan pengumuman EIM berdasarkan judul atau kategori.',
    'news.searchPlaceholder': 'Cari judul artikel, penulis, atau kata kunci...',
    'news.listEmptyTitle': 'Belum ada artikel yang dipublikasikan.',
    'news.listEmptyDesc': 'Artikel akan tampil di sini setelah dipublikasikan.',
    'news.listNoMatchTitle': 'Artikel tidak ditemukan.',
    'news.listNoMatchDesc': 'Tidak ada artikel yang cocok dengan pencarian atau filter Anda. Coba kata kunci lain atau reset filter.',
    'news.contact': 'Hubungi kami',

    // Contact Page
    'contact.heroEyebrow': 'Kontak',
    'contact.heroPrimary': 'Email kami',
    'contact.heroSecondary': 'Buka Google Maps',
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

    // Home Page v2 [PLACEHOLDER — draft]
    'home.heroKicker': 'EIM Research Lab',
    'home.heroTitle': 'Riset infrastruktur\nuntuk dunia nyata.',
    'home.heroDesc': 'Laboratorium Enterprise Infrastructure Management Telkom University — jaringan, cloud, sistem operasi, keamanan siber.',
    'home.heroPrimary': 'Jelajahi lab',
    'home.heroSecondary': 'Tentang Kami',
    'home.revealCaption': 'Lebih dekat dengan EIM.',
    'home.revealPending': 'Video pengantar akan segera hadir.',
    'home.focusTitle': 'Fokus Riset & Laboratorium',
    'home.focusIntro': 'Empat penguasaan inti yang kami asah lewat riset dan praktik.',
    'home.focus1Title': 'Jaringan',
    'home.focus1Desc': 'Arsitektur, protokol routing & switching, dan optimasi infrastruktur komunikasi data skala enterprise.',
    'home.focus2Title': 'Cloud Computing',
    'home.focus2Desc': 'Layanan cloud, kontainerisasi (Docker, Kubernetes), virtualisasi server & jaringan, dan data center hibrida.',
    'home.focus3Title': 'Sistem Operasi',
    'home.focus3Desc': 'Linux, administrasi server, otomasi sistem, dan pengelolaan infrastruktur berbasis OS.',
    'home.focus4Title': 'Keamanan Siber',
    'home.focus4Desc': 'Keamanan jaringan, analisis kerentanan, pengujian penetrasi, dan perlindungan aset informasi digital.',
    'home.vmTitle': 'Visi & Misi',
    'home.divisionPhoto': 'Foto kegiatan {name}',
    'home.sectionNavLabel': 'Navigasi bagian halaman',
    'home.navDotMedia': 'Media',
    'home.navDotFocus': 'Fokus',
    'home.navDotVision': 'Visi & Misi',
    'home.navDotEvents': 'Kegiatan',
    'home.navDotArticles': 'Artikel',
    'home.newsIntro': 'Tulisan riset dan catatan terbaru dari lab.',
    'home.eventsTitle': 'Kegiatan Terkini',
    'home.eventsIntro': 'Workshop, seminar, kompetisi, dan pengabdian yang kami jalankan.',
    'home.eventsEmpty': 'Belum ada kegiatan yang dipublikasikan.',
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
