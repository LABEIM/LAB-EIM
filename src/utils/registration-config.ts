import type { RecruitmentConfig, RegistrationPageConfigs } from './types';
import { DEFAULT_RECRUITMENT_DATES } from './constants';

export type { RegistrationPageConfigs };

/**
 * Helper to normalize and extract registration configuration defaults
 * for registration.astro view rendering.
 */
export function getRegistrationPageConfigs(
  config: Partial<RecruitmentConfig> | Record<string, any>
): RegistrationPageConfigs {
  const studentYears = config.studentYears || ["2022", "2023", "2024", "2025"];

  const docLimits = config.documentLimits || {
    ksmMb: 3,
    khsMb: 3,
    mlMb: 3,
    cvMb: 5,
    piMb: 3,
    totalMb: 15,
  };

  const piTemplateUrl = config.piTemplateUrl || "";
  const minReasonWords = config.minReasonWords ?? 30;

  const openDateStr = config.openDate || DEFAULT_RECRUITMENT_DATES.openDate;
  const deadlineStr = config.deadline || DEFAULT_RECRUITMENT_DATES.deadline;
  const extendedDeadlineStr = config.extendedDeadline || DEFAULT_RECRUITMENT_DATES.extendedDeadline;

  const contactPersons = config.contactPersons || [];

  const upcomingCfg = config.upcomingConfig || {
    title: "Recruitment Opening Soon!",
    subtitle: "Get your documents ready. Registration will officially open soon.",
    prepNotice: "Prepare the required files in advance so you can apply as soon as registration opens.",
  };

  const extendedCfg = config.extendedConfig || {
    bannerTitle: "Pendaftaran Diperpanjang! (Registration Extended)",
    bannerMessage: "Good news! The assistant registration deadline has been extended.",
  };

  const selectionCfg = config.selectionConfig || {
    title: "Document Screening In Progress",
    subtitle: "Our team is currently evaluating all submitted administrative documents.",
    message: "Thank you for registering! Document verification and administrative screening are underway.",
    estimatedAnnouncementDate: "26 Agustus 2026",
  };

  const selectionResultsCfg = config.selectionResultsConfig || {
    title: "Pengumuman Seleksi Berkas (Document Screening Results)",
    subtitle: "Check if you passed document screening and qualify for the Technical Test.",
    newsUrl: "/news/pengumuman-rekrutmen-2026",
    documentUrl: "",
  };

  const technicalTestCfg = config.technicalTestConfig || {
    title: "Technical Test Phase In Progress",
    subtitle: "Practical skills assessment and technical challenge in progress.",
    message: "Please check your registered email for your technical test instructions and submission brief.",
    scheduleInfo: "07 - 10 August 2026",
    locationInfo: "EIM Research Lab / Online Submission",
  };

  const technicalTestResultsCfg = config.technicalTestResultsConfig || {
    title: "Pengumuman Tes Teknikal (Technical Test Results)",
    subtitle: "Check if you passed the Technical Test and qualify for the Interview phase.",
    newsUrl: "/news/pengumuman-rekrutmen-2026",
    documentUrl: "",
  };

  const interviewCfg = config.interviewConfig || {
    title: "Interview Phase In Progress",
    subtitle: "Candidate interview sessions in progress with EIM Research Lab team.",
    message: "Please check your registered email for your assigned interview time slot and Zoom call details.",
    scheduleInfo: "12 - 15 August 2026",
    locationInfo: "EIM Research Lab / Online Zoom Room",
  };

  const finalSelectionCfg = config.finalSelectionConfig || {
    title: "Seleksi Akhir & Olah Nilai Sedang Berlangsung",
    subtitle: "Seluruh rangkaian seleksi dan sesi wawancara telah selesai.",
    message: "Terima kasih kepada seluruh kandidat yang telah mengikuti seluruh rangkaian seleksi. Tim EIM Research Lab saat ini sedang melakukan rekapitulasi nilai dan verifikasi kelulusan akhir. Pengumuman kelulusan akhir akan dipublikasikan pada 9 September 2026.",
    estimatedAnnouncementDate: "9 September 2026",
  };

  const announcementCfg = config.announcementConfig || {
    title: "Final Selection Announcement",
    subtitle: "Check your final selection status below. Congratulations to all accepted candidates!",
    newsUrl: "/news/pengumuman-rekrutmen-2026",
    documentUrl: "",
  };

  const closedCfg = config.closedConfig || {
    title: "Recruitment Period Ended",
    subtitle: "Assistant recruitment for this batch is officially closed.",
    message: "Thank you to everyone who applied. Follow our social media for future recruitment cycles!",
    nextBatchInfo: "Next recruitment expected in early 2027.",
  };

  const fallbackCfg = config.fallbackConfig || {
    title: "Sistem Pendaftaran Utama Sedang Pemeliharaan",
    subtitle: "Formulir pendaftaran web sedang mengalami kendala teknis atau pemeliharaan sistem. Gunakan formulir cadangan di bawah ini.",
    message: "Silakan isi formulir pendaftaran melalui Google Form resmi kami di bawah ini untuk melanjutkan pendaftaran.",
    formUrl: "https://forms.gle/sample-fallback-form",
    buttonText: "Buka Formulir Pendaftaran Cadangan (Google Form)",
  };

  const defaultFieldStates = {
    ksm: 'disabled' as const,
    khs: 'required' as const,
    ml: 'required' as const,
    cv: 'required' as const,
    pi: 'required' as const,
    nomor_telp: 'required' as const,
    angkatan: 'required' as const,
    divisi_2: 'required' as const,
    alasan_divisi_2: 'required' as const,
    bersedia_dipindah: 'required' as const,
    portofolio: 'required' as const,
  };

  const fieldStates = {
    ...defaultFieldStates,
    ...(config.fieldStates || {}),
  };

  const defaultSelectionSteps = [
    {
      id: "selection",
      enabled: true,
      title: "Seleksi Berkas",
      shortLabel: "Seleksi Berkas",
      icon: "fa-solid fa-file-lines",
      startDate: (config as any).selectionStartDate || DEFAULT_RECRUITMENT_DATES.deadline,
      endDate: (config as any).selectionEndDate || "2026-08-25T23:59:59",
      resultsDate: (config as any).selectionResultsDate || DEFAULT_RECRUITMENT_DATES.selectionResultsDate,
      templateType: "in_progress" as const,
      inProgressConfig: selectionCfg,
      resultsConfig: selectionResultsCfg,
    },
    {
      id: "technical_test",
      enabled: true,
      title: "Tes Teknikal",
      shortLabel: "Tes Teknikal",
      icon: "fa-solid fa-laptop-code",
      startDate: (config as any).technicalTestStartDate || DEFAULT_RECRUITMENT_DATES.technicalTestStartDate,
      endDate: (config as any).technicalTestEndDate || DEFAULT_RECRUITMENT_DATES.technicalTestEndDate,
      resultsDate: (config as any).technicalTestResultsDate || "2026-09-01T00:00:00",
      templateType: "in_progress" as const,
      inProgressConfig: technicalTestCfg,
      resultsConfig: technicalTestResultsCfg,
    },
    {
      id: "interview",
      enabled: true,
      title: "Tahap Wawancara",
      shortLabel: "Tahap Wawancara",
      icon: "fa-solid fa-comments",
      startDate: (config as any).interviewStartDate || DEFAULT_RECRUITMENT_DATES.interviewStartDate,
      endDate: (config as any).interviewEndDate || DEFAULT_RECRUITMENT_DATES.interviewEndDate,
      templateType: "in_progress" as const,
      inProgressConfig: interviewCfg,
    },
    {
      id: "final_selection",
      enabled: true,
      title: "Seleksi Akhir & Olah Nilai",
      shortLabel: "Seleksi Akhir",
      icon: "fa-solid fa-user-check",
      startDate: (config as any).interviewEndDate || DEFAULT_RECRUITMENT_DATES.interviewEndDate,
      endDate: (config as any).announcementDate || DEFAULT_RECRUITMENT_DATES.announcementDate,
      templateType: "info" as const,
      inProgressConfig: finalSelectionCfg,
    },
  ];


  const selectionSteps = (config.selectionSteps && config.selectionSteps.length > 0)
    ? config.selectionSteps
    : defaultSelectionSteps;

  return {
    studentYears,
    fieldStates,
    docLimits,
    piTemplateUrl,
    minReasonWords,
    openDateStr,
    deadlineStr,
    extendedDeadlineStr,
    contactPersons,
    upcomingCfg,
    extendedCfg,
    selectionCfg,
    selectionResultsCfg,
    technicalTestCfg,
    technicalTestResultsCfg,
    interviewCfg,
    finalSelectionCfg,
    announcementCfg,
    closedCfg,
    fallbackCfg,
    selectionSteps,
  };
}

