import { config, fields, collection, singleton } from '@keystatic/core';
import positionsData from './src/data/positions.json';
import lecturersData from './src/data/lecturers.json';

const lecturerOptions = lecturersData.list.map((lecturer) => ({
  label: lecturer.name || lecturer.id,
  value: lecturer.id,
}));

const positionOptions = positionsData.list.map((position) => ({
  label: position.label,
  value: position.id,
}));
const defaultPosition =
  positionOptions.find((option) => option.value === 'mahasiswa-anggota')?.value ??
  positionOptions[0]?.value ??
  '';
const positionField = fields.select({
  label: 'Position',
  options: positionOptions,
  defaultValue: defaultPosition,
});

const contactPersonsField = fields.array(
  fields.object({
    name: fields.text({ label: 'Contact Person Name' }),
    role: fields.text({ label: 'Role / Division Label (e.g. CP Information & Selection)' }),
    platform: fields.select({
      label: 'Contact Platform',
      options: [
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'LINE', value: 'line' },
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
      ],
      defaultValue: 'whatsapp',
    }),
    contactId: fields.text({ label: 'Contact ID / Phone Number / Handle (e.g. 081234567890 or @id)' }),
    link: fields.text({ label: 'Direct Clickable Contact Link (must start with https://, mailto: or tel:, e.g. https://wa.me/6281234567890)' }),
  }),
  {
    label: 'Contact Persons List',
    itemLabel: props => `${props.fields.name.value || 'Contact Person'} (${props.fields.role.value || ''})`,
  }
);

const registrationSchema = {
  status: fields.text({
    label: 'Recruitment Stage Status Override',
    description: 'Set to "auto" for automatic date-based calculation. Default lifecycle phases: "upcoming", "open", "extended", "final_selection", "announcement", "closed", "fallback". You can also override to any selection phase defined under Dynamic Selection Pipeline Steps by using its Step Identifier Key (e.g., "selection", "technical_test", "fgd", "interview"). To trigger a step\'s results announcement phase, append "_results" to its Step Identifier Key (e.g., "selection_results", "technical_test_results", "interview_results").',
    defaultValue: 'auto',
  }),
  autoCloseAfterDeadline: fields.checkbox({
    label: 'Auto-Close Form After Deadline',
    description: 'Automatically switch recruitment stage to Closed (view-closed) once the deadline passes.',
    defaultValue: true,
  }),




  timezoneOffset: fields.text({ label: 'Timezone Offset (e.g., +07:00 for WIB, +08:00 for WITA, +09:00 for WIT)', defaultValue: '+07:00' }),
  upcomingStartDate: fields.text({ label: 'Upcoming / Opening Soon Start Date (ISO format: YYYY-MM-DDTHH:mm:ss)', defaultValue: '2026-08-01T00:00:00' }),
  openDate: fields.text({ label: 'Opening Date (ISO format: YYYY-MM-DDTHH:mm:ss)', defaultValue: '2026-08-13T00:00:00' }),
  deadline: fields.text({ label: 'Initial Deadline Date (ISO format)', defaultValue: '2026-08-20T23:59:59' }),
  extendedDeadline: fields.text({ label: 'Extended Deadline Date (Optional ISO format)', defaultValue: '2026-08-23T23:59:59' }),
  announcementDate: fields.text({ label: 'Final Announcement Start Date (ISO format)', defaultValue: '2026-09-09T00:00:00' }),

  title: fields.text({ label: 'Form Section Title', defaultValue: 'Assistant Registration Form', validation: { isRequired: true } }),
  subtitle: fields.text({ label: 'Form Section Subtitle', defaultValue: 'Complete the form below with valid and correct information.' }),
  formDescriptionTitle: fields.text({ label: 'Form Description Header Title', defaultValue: 'Requirements:' }),
  formDescription: fields.text({ label: 'Form Description Introductory Paragraph (Optional)', multiline: true, defaultValue: '' }),
  formDescriptionItems: fields.array(fields.text({ label: 'Description Item / Requirement Point' }), {
    label: 'Form Description & Requirements List Items',
    itemLabel: props => props.value,
  }),
  labels: fields.object(
    {
      fullName: fields.text({ label: 'Label nama lengkap', validation: { isRequired: true } }),
      fullNamePlaceholder: fields.text({ label: 'Placeholder nama lengkap', validation: { isRequired: true } }),
      nim: fields.text({ label: 'Label NIM', validation: { isRequired: true } }),
      nimPlaceholder: fields.text({ label: 'Placeholder NIM', validation: { isRequired: true } }),
      email: fields.text({ label: 'Label email', validation: { isRequired: true } }),
      emailPlaceholder: fields.text({ label: 'Placeholder email', validation: { isRequired: true } }),
      phone: fields.text({ label: 'Label nomor WhatsApp / HP', validation: { isRequired: true } }),
      phonePlaceholder: fields.text({ label: 'Placeholder nomor WhatsApp / HP', validation: { isRequired: true } }),
      classYear: fields.text({ label: 'Label angkatan', validation: { isRequired: true } }),
      selectClassYear: fields.text({ label: 'Pilihan awal dropdown angkatan', validation: { isRequired: true } }),
      div1: fields.text({ label: 'Label divisi pilihan 1', validation: { isRequired: true } }),
      selectDiv1: fields.text({ label: 'Pilihan awal dropdown divisi 1', validation: { isRequired: true } }),
      div2: fields.text({ label: 'Label divisi pilihan 2', validation: { isRequired: true } }),
      selectDiv2: fields.text({ label: 'Pilihan awal dropdown divisi 2', validation: { isRequired: true } }),
      reason: fields.text({ label: 'Label alasan memilih divisi', description: 'Dipakai untuk alasan divisi 1 dan 2, diikuti nomor divisi.', validation: { isRequired: true } }),
      reasonPlaceholder: fields.text({ label: 'Placeholder alasan memilih divisi', validation: { isRequired: true } }),
      portfolioLink: fields.text({ label: 'Label tautan portofolio', validation: { isRequired: true } }),
      portfolioPlaceholder: fields.text({ label: 'Placeholder tautan portofolio', validation: { isRequired: true } }),
      ksm: fields.text({ label: 'Label Kartu Studi Mahasiswa (KSM)', validation: { isRequired: true } }),
      khs: fields.text({ label: 'Label Kartu Hasil Studi (KHS)', validation: { isRequired: true } }),
      ml: fields.text({ label: 'Label surat motivasi', validation: { isRequired: true } }),
      cv: fields.text({ label: 'Label Curriculum Vitae (CV)', validation: { isRequired: true } }),
      pi: fields.text({ label: 'Label Pakta Integritas (PI)', validation: { isRequired: true } }),
      downloadPiTemplate: fields.text({ label: 'Label tautan unduh template PI', validation: { isRequired: true } }),
      chooseFile: fields.text({ label: 'Label pilih berkas', validation: { isRequired: true } }),
      noFile: fields.text({ label: 'Label belum ada berkas', validation: { isRequired: true } }),
      requirementsTitle: fields.text({ label: 'Judul kartu persyaratan (cadangan)', validation: { isRequired: true } }),
      dataUse: fields.text({ label: 'Keterangan penggunaan data', validation: { isRequired: true } }),
      submit: fields.text({ label: 'Label tombol kirim', validation: { isRequired: true } }),
      submitting: fields.text({ label: 'Label saat mengirim', validation: { isRequired: true } }),
      sendingTitle: fields.text({ label: 'Judul modal saat mengirim', validation: { isRequired: true } }),
      closeError: fields.text({ label: 'Label tombol tutup saat gagal', validation: { isRequired: true } }),
      done: fields.text({ label: 'Label tombol selesai saat berhasil', validation: { isRequired: true } }),
      saveDraft: fields.text({ label: 'Label tombol simpan draf', validation: { isRequired: true } }),
      draftSaved: fields.text({ label: 'Label draf tersimpan', validation: { isRequired: true } }),
      draftRestored: fields.text({
        label: 'Teks draf dipulihkan',
        description: 'Gunakan {time} untuk waktu penyimpanan draf.',
        validation: { isRequired: true },
      }),
      clearDraft: fields.text({ label: 'Label tombol hapus draf', validation: { isRequired: true } }),
      legendPersonal: fields.text({ label: 'Judul bagian data diri', validation: { isRequired: true } }),
      legendDivision: fields.text({ label: 'Judul bagian pemilihan divisi', validation: { isRequired: true } }),
      timerDays: fields.text({ label: 'Satuan hitung mundur hari', validation: { isRequired: true } }),
      timerHours: fields.text({ label: 'Satuan hitung mundur jam', validation: { isRequired: true } }),
      timerMinutes: fields.text({ label: 'Satuan hitung mundur menit', validation: { isRequired: true } }),
      timerSeconds: fields.text({ label: 'Satuan hitung mundur detik', validation: { isRequired: true } }),
      resultsPlaceholder: fields.text({ label: 'Placeholder pencarian NIM', validation: { isRequired: true } }),
    },
    {
      label: 'Label kolom formulir',
      description: 'Teks label dan placeholder pada formulir pendaftaran. Pesan validasi tetap di kode.',
    }
  ),
  heroTag: fields.text({ label: 'Hero Tag', defaultValue: 'Assistant Recruitment', validation: { isRequired: true } }),
  heroTitle: fields.text({ label: 'Hero Title', defaultValue: 'Assistant Lab Registration', validation: { isRequired: true } }),
  heroDescription: fields.text({ label: 'Hero Description', defaultValue: 'Join us and become a part of EIM Lab. Develop your potential in IT infrastructure, networks, and technology research.' }),
  heroPeriod: fields.text({ label: 'Hero periode pendaftaran', description: 'Gunakan {start} dan {end} untuk tanggal mulai dan batas akhir.', validation: { isRequired: true } }),
  heroPrimaryLabel: fields.text({ label: 'Label tombol utama hero', validation: { isRequired: true } }),
  heroSecondaryLabel: fields.text({ label: 'Label tombol sekunder hero', validation: { isRequired: true } }),
  studentYears: fields.array(fields.text({ label: 'Year' }), {
    label: 'Eligible Student Years',
    itemLabel: props => props.value,
  }),
  portfolioDivisionTriggerValues: fields.text({
    label: 'Portfolio Division Trigger Values',
    description: 'Comma-separated division names that require portfolio links (e.g. Medhum, Front-End, Design)',
    defaultValue: 'Medhum'
  }),
  piTemplateUrl: fields.text({ label: 'Pakta Integritas (PI) Template Link', defaultValue: 'https://bit.ly/Template-PI-EIM' }),
  minReasonWords: fields.number({ label: 'Minimum Word Count for Reason for Choosing Division', defaultValue: 30 }),
  fieldStates: fields.object({
    ksm: fields.select({
      label: 'Kartu Studi Mahasiswa (KSM)',
      options: [
        { label: 'Required (Wajib)', value: 'required' },
        { label: 'Optional (Opsional)', value: 'optional' },
        { label: 'Disabled (Disembunyikan)', value: 'disabled' },
      ],
      defaultValue: 'disabled',
    }),
    khs: fields.select({
      label: 'Kartu Hasil Studi (KHS)',
      options: [
        { label: 'Required (Wajib)', value: 'required' },
        { label: 'Optional (Opsional)', value: 'optional' },
        { label: 'Disabled (Disembunyikan)', value: 'disabled' },
      ],
      defaultValue: 'required',
    }),
    ml: fields.select({
      label: 'Motivation Letter (ML)',
      options: [
        { label: 'Required (Wajib)', value: 'required' },
        { label: 'Optional (Opsional)', value: 'optional' },
        { label: 'Disabled (Disembunyikan)', value: 'disabled' },
      ],
      defaultValue: 'required',
    }),
    cv: fields.select({
      label: 'Curriculum Vitae (CV)',
      options: [
        { label: 'Required (Wajib)', value: 'required' },
        { label: 'Optional (Opsional)', value: 'optional' },
        { label: 'Disabled (Disembunyikan)', value: 'disabled' },
      ],
      defaultValue: 'required',
    }),
    pi: fields.select({
      label: 'Pakta Integritas (PI)',
      options: [
        { label: 'Required (Wajib)', value: 'required' },
        { label: 'Optional (Opsional)', value: 'optional' },
        { label: 'Disabled (Disembunyikan)', value: 'disabled' },
      ],
      defaultValue: 'required',
    }),
    nomor_telp: fields.select({
      label: 'Nomor Telepon / WhatsApp',
      options: [
        { label: 'Required (Wajib)', value: 'required' },
        { label: 'Optional (Opsional)', value: 'optional' },
        { label: 'Disabled (Disembunyikan)', value: 'disabled' },
      ],
      defaultValue: 'required',
    }),
    angkatan: fields.select({
      label: 'Angkatan Mahasiswa',
      options: [
        { label: 'Required (Wajib)', value: 'required' },
        { label: 'Optional (Opsional)', value: 'optional' },
        { label: 'Disabled (Disembunyikan)', value: 'disabled' },
      ],
      defaultValue: 'required',
    }),
    divisi_2: fields.select({
      label: 'Pilihan Divisi Kedua',
      options: [
        { label: 'Required (Wajib)', value: 'required' },
        { label: 'Optional (Opsional)', value: 'optional' },
        { label: 'Disabled (Disembunyikan)', value: 'disabled' },
      ],
      defaultValue: 'required',
    }),
    alasan_divisi_2: fields.select({
      label: 'Alasan Memilih Divisi Kedua',
      options: [
        { label: 'Required (Wajib)', value: 'required' },
        { label: 'Optional (Opsional)', value: 'optional' },
        { label: 'Disabled (Disembunyikan)', value: 'disabled' },
      ],
      defaultValue: 'required',
    }),
    bersedia_dipindah: fields.select({
      label: 'Bersedia Dipindahkan Divisi',
      options: [
        { label: 'Required (Wajib)', value: 'required' },
        { label: 'Optional (Opsional)', value: 'optional' },
        { label: 'Disabled (Disembunyikan)', value: 'disabled' },
      ],
      defaultValue: 'required',
    }),
    portofolio: fields.select({
      label: 'Tautan Portofolio / Sertifikat',
      options: [
        { label: 'Required for specific divisions & Optional for others', value: 'required' },
        { label: 'Required ONLY for specific divisions & Hidden for others', value: 'only_trigger' },
        { label: 'Optional for all divisions', value: 'optional' },
        { label: 'Disabled', value: 'disabled' },
      ],
      defaultValue: 'required',
    }),
  }),
  allowedFileExtensions: fields.object({
    ksm: fields.text({ label: 'KSM Allowed Extensions', description: 'e.g. pdf, png, jpg, jpeg', defaultValue: 'pdf, png, jpg, jpeg' }),
    khs: fields.text({ label: 'KHS Allowed Extensions', description: 'e.g. pdf, png, jpg, jpeg', defaultValue: 'pdf, png, jpg, jpeg' }),
    ml: fields.text({ label: 'Motivation Letter Allowed Extensions', description: 'e.g. pdf, png, jpg, jpeg', defaultValue: 'pdf, png, jpg, jpeg' }),
    cv: fields.text({ label: 'CV Allowed Extensions', description: 'e.g. pdf, png, jpg, jpeg', defaultValue: 'pdf, png, jpg, jpeg' }),
    pi: fields.text({ label: 'Pakta Integritas Allowed Extensions', description: 'e.g. pdf, png, jpg, jpeg', defaultValue: 'pdf, png, jpg, jpeg' }),
  }),
  documentLimits: fields.object({
    ksmMb: fields.number({ label: 'KSM File Limit (MB)', defaultValue: 2 }),
    khsMb: fields.number({ label: 'KHS File Limit (MB)', defaultValue: 2 }),
    mlMb: fields.number({ label: 'Motivation Letter File Limit (MB)', defaultValue: 2 }),
    cvMb: fields.number({ label: 'CV File Limit (MB)', defaultValue: 3 }),
    piMb: fields.number({ label: 'Pakta Integritas File Limit (MB)', defaultValue: 2 }),
    totalMb: fields.number({ label: 'Total Submission Batch File Limit (MB)', defaultValue: 15 }),
  }),
  upcomingConfig: fields.object({
    title: fields.text({ label: 'Upcoming Section Title', defaultValue: 'Recruitment Opening Soon!', validation: { isRequired: true } }),
    subtitle: fields.text({ label: 'Upcoming Subtitle', defaultValue: 'Get your documents ready. Registration will officially open soon.' }),
    prepNotice: fields.text({ label: 'Preparation Notice', defaultValue: 'Prepare the required files in advance so you can apply as soon as registration opens.' }),
  }),
  extendedConfig: fields.object({
    bannerTitle: fields.text({ label: 'Extended Banner Title', defaultValue: 'Pendaftaran Diperpanjang! (Registration Extended)', validation: { isRequired: true } }),
    bannerMessage: fields.text({ label: 'Extended Banner Message', defaultValue: 'Good news! The assistant registration deadline has been extended. Don\'t miss this opportunity to submit your application.' }),
  }),
  finalSelectionConfig: fields.object({
    title: fields.text({ label: 'Final Selection In Progress Title', defaultValue: 'Seleksi Akhir & Olah Nilai Sedang Berlangsung', validation: { isRequired: true } }),
    subtitle: fields.text({ label: 'Final Selection Subtitle', defaultValue: 'Seluruh rangkaian seleksi dan sesi wawancara telah selesai.' }),
    message: fields.text({ label: 'Notice Message', multiline: true, defaultValue: 'Terima kasih kepada seluruh kandidat yang telah mengikuti seluruh rangkaian seleksi. Tim EIM Lab saat ini sedang melakukan rekapitulasi nilai dan verifikasi kelulusan akhir. Pengumuman kelulusan akhir akan dipublikasikan pada 9 September 2026.' }),
    estimatedAnnouncementDate: fields.text({ label: 'Estimated Announcement Date Text', defaultValue: '9 September 2026' }),
  }),
  announcementConfig: fields.object({
    title: fields.text({ label: 'Final Announcement Title', defaultValue: 'Final Selection Announcement', validation: { isRequired: true } }),
    subtitle: fields.text({ label: 'Final Announcement Subtitle', defaultValue: 'Check your final selection status below. Congratulations to all accepted candidates!' }),
    acceptedMessage: fields.text({ label: 'Default Accepted Candidate Note / Message', multiline: true, defaultValue: 'Selamat! Anda diterima menjadi asisten di EIM Lab.' }),
    waitlistMessage: fields.text({ label: 'Default Waitlist Candidate Note / Message', multiline: true, defaultValue: 'Anda masuk dalam daftar cadangan (Waitlist) asisten EIM Lab.' }),
    rejectedMessage: fields.text({ label: 'Default Rejected Candidate Note / Message', multiline: true, defaultValue: 'Terima kasih telah mengikuti seluruh rangkaian rekrutmen asisten EIM Lab.' }),
    newsUrl: fields.text({ label: 'Official News Post URL', defaultValue: '/news/pengumuman-rekrutmen-2026' }),
    documentUrl: fields.text({ label: 'PDF Document Link (Optional)', defaultValue: '' }),
  }),

  closedConfig: fields.object({
    title: fields.text({ label: 'Closed Title', defaultValue: 'Recruitment Period Ended', validation: { isRequired: true } }),
    subtitle: fields.text({ label: 'Closed Subtitle', defaultValue: 'Assistant recruitment for this batch is officially closed.' }),
    message: fields.text({ label: 'Closed Message', defaultValue: 'Thank you to everyone who applied. Follow our social media for future recruitment cycles!' }),
    nextBatchInfo: fields.text({ label: 'Next Batch Info', defaultValue: 'Next recruitment expected in early 2027.' }),
  }),
  fallbackConfig: fields.object({
    title: fields.text({ label: 'Fallback Section Title', defaultValue: 'Sistem Pendaftaran Utama Sedang Pemeliharaan', validation: { isRequired: true } }),
    subtitle: fields.text({ label: 'Fallback Subtitle', defaultValue: 'Formulir pendaftaran web sedang mengalami kendala teknis atau pemeliharaan sistem. Gunakan formulir cadangan di bawah ini.' }),
    message: fields.text({ label: 'Fallback Message', defaultValue: 'Silakan isi formulir pendaftaran melalui Google Form resmi kami di bawah ini untuk melanjutkan pendaftaran.' }),
    formUrl: fields.text({ label: 'External Backup Form URL (Google Form)', defaultValue: 'https://forms.gle/sample-fallback-form' }),
    buttonText: fields.text({ label: 'Fallback Button Text', defaultValue: 'Buka Formulir Pendaftaran Cadangan (Google Form)' }),
  }),
  selectionSteps: fields.array(
    fields.object({
      id: fields.text({ label: 'Step Identifier Key (e.g. selection, technical_test, fgd, interview)', defaultValue: 'custom_step' }),
      enabled: fields.checkbox({ label: 'Enable this Selection Step (Uncheck to skip/disable step)', defaultValue: true }),
      title: fields.text({ label: 'Full Step Title (e.g. Tes Teknikal & Case Study)', defaultValue: 'New Selection Step', validation: { isRequired: true } }),
      shortLabel: fields.text({ label: 'Timeline Bar Short Label (e.g. Tes Teknikal)', defaultValue: 'Step' }),
      icon: fields.text({ label: 'FontAwesome Icon Class (e.g. fa-solid fa-code)', defaultValue: 'fa-solid fa-clipboard-list' }),
      startDate: fields.text({ label: 'Start Date (ISO format: YYYY-MM-DDTHH:mm:ss)', defaultValue: '2026-08-25T00:00:00' }),
      endDate: fields.text({ label: 'End Date (ISO format: YYYY-MM-DDTHH:mm:ss)', defaultValue: '2026-08-28T23:59:59' }),
      resultsDate: fields.text({ label: 'Results Announcement Date (Optional ISO format)', defaultValue: '' }),
      templateType: fields.select({
        label: 'Step View Template',
        options: [
          { label: 'In-Progress / Task Details View', value: 'in_progress' },
          { label: 'Results Announcement View', value: 'results' },
          { label: 'Informational Notice View', value: 'info' },
        ],
        defaultValue: 'in_progress',
      }),
      inProgressConfig: fields.object({
        title: fields.text({ label: 'In-Progress Section Title', defaultValue: 'Step In Progress', validation: { isRequired: true } }),
        subtitle: fields.text({ label: 'In-Progress Subtitle', defaultValue: 'Candidate evaluation in progress.' }),
        message: fields.text({ label: 'Notice Message', multiline: true, defaultValue: 'Please check your email/WhatsApp group for details.' }),
        scheduleInfo: fields.text({ label: 'Schedule Info (Optional)', defaultValue: '' }),
        locationInfo: fields.text({ label: 'Location / Platform Info (Optional)', defaultValue: '' }),
      }),
      resultsConfig: fields.object({
        title: fields.text({ label: 'Results Section Title', defaultValue: 'Step Results Announcement', validation: { isRequired: true } }),
        subtitle: fields.text({ label: 'Results Subtitle', defaultValue: 'Check if you passed this step.' }),
        passedMessage: fields.text({ label: 'Default Passed / Accepted Candidate Note', multiline: true, defaultValue: 'Selamat! Anda dinyatakan lolos pada tahap ini. Cek WhatsApp Group rekrutmen untuk informasi lebih lanjut.' }),
        waitlistMessage: fields.text({ label: 'Default Waitlist Candidate Note (Optional)', multiline: true, defaultValue: 'Anda masuk dalam daftar cadangan (Waitlist).' }),
        failedMessage: fields.text({ label: 'Default Failed / Rejected Candidate Note', multiline: true, defaultValue: 'Terima kasih telah mengikuti tahap seleksi ini.' }),
        newsUrl: fields.text({ label: 'Official News Post URL (Optional)', defaultValue: '' }),
        documentUrl: fields.text({ label: 'PDF Document Link (Optional)', defaultValue: '' }),
      }),


    }),
    {
      label: 'Dynamic Selection Pipeline Steps',
      itemLabel: props => `${props.fields.enabled.value ? '✓' : '✗'} ${props.fields.shortLabel.value || 'Step'} (${props.fields.id.value || 'id'})`,
    }
  ),
  contactPersons: contactPersonsField,
};

const recruitmentResultsSchema = {
  batch: fields.text({ label: 'Batch Title', defaultValue: 'Recruitment Assistant 2026' }),
  publishedDate: fields.text({ label: 'Published Date', defaultValue: '2026-08-01' }),
  bulkImportText: fields.text({
    label: 'Bulk Spreadsheet Paste (Copy & paste table rows directly from Google Sheets / Excel)',
    multiline: true,
    description: 'Supported column order: NIM | Division (optional/empty if in-progress) | [Step 1 Status] | [Step 2 Status] | ... | Final Selection Status (accepted/waitlist/rejected) | Notes (optional). Columns dynamically map to active steps defined under Dynamic Selection Pipeline Steps in Registration Settings. Values: "passed" or "failed". Separated by Tabs or Commas.',

  }),
  candidates: fields.array(
    fields.object({
      nim: fields.text({ label: 'NIM' }),
      division: fields.text({ label: 'Division Name (Optional: Leave blank if still in process or undetermined)' }),
      stageStatuses: fields.array(
        fields.object({
          stepId: fields.text({ label: 'Step Identifier Key (e.g. selection, technical_test, fgd, interview)' }),
          status: fields.select({
            label: 'Status',
            options: [
              { label: 'Passed (Lolos)', value: 'passed' },
              { label: 'Failed (Tidak Lolos)', value: 'failed' },
              { label: 'Pending / In Progress', value: 'pending' },
            ],
            defaultValue: 'passed',
          }),
          notes: fields.text({ label: 'Step Specific Note / Feedback (Optional)', multiline: true }),
        }),
        {
          label: 'Stage / Step Statuses (Dynamic Selection Pipeline Steps)',
          itemLabel: props => `${props.fields.stepId.value || 'step'}: ${props.fields.status.value || 'passed'}`,
        }
      ),

      finalStatus: fields.select({
        label: 'Final Selection Status',
        options: [
          { label: 'Pending / In Progress (Belum Ditentukan / Sedang Berjalan)', value: 'pending' },
          { label: 'Accepted (Diterima)', value: 'accepted' },
          { label: 'Waitlist (Cadangan)', value: 'waitlist' },
          { label: 'Rejected (Tidak Diterima)', value: 'rejected' },
        ],
        defaultValue: 'pending',
      }),
      notes: fields.text({ label: 'Custom Notes / Feedback', multiline: true }),
    }),
    {
      label: 'Candidate List',
      itemLabel: props => props.fields.nim.value ? `NIM: ${props.fields.nim.value}` : 'Candidate',
    }
  ),
};


export default config({
  storage: import.meta.env.PROD ? { kind: 'cloud' } : { kind: 'local' },
  cloud: { project: 'eimlab/lab-eim' },
  collections: {
    news: collection({
      label: 'News',
      slugField: 'title',
      path: 'src/content/news/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        category: fields.text({ label: 'Category' }),
        author: fields.text({ label: 'Author', defaultValue: 'Admin EIM' }),
        news_date: fields.date({ label: 'Date' }),
        featured: fields.checkbox({ label: 'Pin as Featured News', defaultValue: false }),
        // Preview-only flag: must survive an editor save, so it stays non-editable.
        audit: fields.ignored(),
        excerpt: fields.text({ label: 'Excerpt / Short Summary', multiline: true }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: props => props.value,
        }),
        image: fields.array(fields.text({ label: 'Image URL' }), {
          label: 'Images',
          itemLabel: props => props.value,
        }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
          options: { image: { directory: 'public/image/content', publicPath: '/image/content/' } },
        }),
      },
    }),
    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'src/content/events/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        category: fields.text({ label: 'Category' }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Ongoing', value: 'ongoing' },
            { label: 'Completed', value: 'completed' },
          ],
          defaultValue: 'upcoming',
        }),
        event_date: fields.date({ label: 'Event Date' }),
        description: fields.text({ label: 'Short Description', multiline: true }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
          options: { image: { directory: 'public/image/content', publicPath: '/image/content/' } },
        }),
        link: fields.text({ label: 'Link (Optional)' }),
        poster: fields.text({ label: 'Poster / Banner Image URL (Optional)' }),
        image: fields.array(fields.text({ label: 'Image URL' }), {
          label: 'Images',
          itemLabel: props => props.value,
        }),
        icon: fields.text({ label: 'FontAwesome Icon class (e.g., fa-building-columns)' }),
        organizer: fields.text({ label: 'Organizer', defaultValue: 'EIM Lab' }),
        benefits: fields.array(fields.text({ label: 'Benefit' }), {
          label: 'Benefits',
          itemLabel: props => props.value,
        }),
        requirements: fields.array(fields.text({ label: 'Requirement' }), {
          label: 'Requirements',
          itemLabel: props => props.value,
        }),
        // Preview-only flag: must survive an editor save, so it stays non-editable.
        audit: fields.ignored(),
      },
    }),
    courses: collection({
      label: 'Courses',
      slugField: 'title',
      path: 'src/content/courses/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        code: fields.text({ label: 'Course Code' }),
        sks: fields.integer({ label: 'SKS' }),
        semester: fields.integer({
          label: 'Semester (optional)',
          validation: { isRequired: false },
        }),
        hasPracticum: fields.checkbox({ label: 'Has practicum', defaultValue: false }),
        modules: fields.array(
          fields.object({
            title: fields.text({ label: 'Module title' }),
            topics: fields.text({ label: 'Topics', multiline: true }),
          }),
          {
            label: 'Practicum modules',
            itemLabel: (props) => props.fields.title.value || 'Module',
          }
        ),
        coordinatorId: fields.select({
          label: 'Course coordinator',
          options: lecturerOptions,
          defaultValue: lecturerOptions[0]?.value ?? '',
        }),
        assistantIds: fields.array(fields.integer({ label: 'Member ID' }), {
          label: 'Practicum assistants',
          itemLabel: (props) => String(props.value),
        }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
        content: fields.markdoc({ label: 'Description', extension: 'md' }),
      },
    }),
  },
  singletons: {
    page_home: singleton({
      label: 'Beranda',
      path: 'src/data/pages/home',
      format: { data: 'json' },
      schema: {
        meta: fields.object(
          {
            title: fields.text({
              label: 'Judul halaman',
              description: 'Tampil di tab browser dan hasil pencarian.',
              validation: { isRequired: true },
            }),
            description: fields.text({
              label: 'Deskripsi meta',
              description: 'Biarkan kosong untuk memakai deskripsi bawaan situs.',
              multiline: true,
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            reveal: fields.text({ label: 'Label titik media', validation: { isRequired: true } }),
            focus: fields.text({ label: 'Label titik fokus', validation: { isRequired: true } }),
            vision: fields.text({ label: 'Label titik visi & misi', validation: { isRequired: true } }),
            courses: fields.text({ label: 'Label titik mata kuliah', validation: { isRequired: true } }),
            events: fields.text({ label: 'Label titik kegiatan', validation: { isRequired: true } }),
            articles: fields.text({ label: 'Label titik artikel', validation: { isRequired: true } }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        hero: fields.object(
          {
            kicker: fields.text({ label: 'Teks kecil di atas judul', description: 'Juga dipakai sebagai teks alternatif logo.' }),
            lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
              label: 'Judul utama',
              description: 'Satu item per baris, maksimal tiga baris.',
              validation: { length: { min: 1, max: 3 } },
              itemLabel: (props) => props.value,
            }),
            description: fields.text({ label: 'Deskripsi', multiline: true }),
            primaryLabel: fields.text({ label: 'Label tombol utama', validation: { isRequired: true } }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua', validation: { isRequired: true } }),
          },
          { label: 'Hero' }
        ),
        reveal: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            caption: fields.text({ label: 'Keterangan media' }),
            pending: fields.text({ label: 'Teks saat media belum tersedia' }),
            pendingCta: fields.text({ label: 'Label tautan saat media belum tersedia', validation: { isRequired: true } }),
            mediaKind: fields.select({
              label: 'Jenis media',
              description: 'Pilih "Tanpa media" untuk menampilkan teks pengantar di tempat media.',
              options: [
                { label: 'Tanpa media', value: 'none' },
                { label: 'Gambar', value: 'image' },
                { label: 'Video', value: 'video' },
              ],
              defaultValue: 'none',
            }),
            image: fields.image({
              label: 'Gambar pengantar',
              description: 'Dipakai saat jenis media "Gambar".',
              directory: 'public/assets/media',
              publicPath: '/assets/media/',
            }),
            backgroundUrl: fields.text({
              label: 'Tautan video latar',
              description:
                'Tautan khusus untuk video latar (loop): YouTube, Vimeo, atau berkas video langsung (.mp4/.webm). Untuk berkas yang ikut diunggah ke situs, tulis path-nya, mis. /assets/media/intro.mp4; untuk berkas di luar situs, tempel tautan https R2/CDN. Encode dulu berkasnya: ffmpeg -i raw.mp4 -an -vf "scale=1920:-2" -c:v libx264 -crf 23 -preset slow -movflags +faststart intro.mp4 (target 6–10 detik, 2–4 MB). Bila kosong, tautan pemutar dipakai sebagai latar.',
            }),
            poster: fields.image({
              label: 'Poster video',
              description: 'Gambar yang tampil sebelum video diputar.',
              directory: 'public/assets/media',
              publicPath: '/assets/media/',
            }),
            videoUrl: fields.text({
              label: 'Tautan video eksternal',
              description:
                'Tempel tautan YouTube, Vimeo, atau Google Drive untuk pemutar saat video diklik. Tautan berkas video langsung (.mp4/.webm) dipakai sebagai latar bila tautan latar kosong. Untuk Google Drive, pastikan berkas dibagikan publik.',
            }),
            imageUrl: fields.text({
              label: 'Tautan gambar eksternal',
              description: 'Tempel tautan gambar eksternal (https). Diutamakan di atas gambar yang diunggah.',
            }),
            mediaAlt: fields.text({
              label: 'Teks alternatif media',
              description: 'Wajib diisi saat jenis media bukan "Tanpa media".',
            }),
          },
          { label: 'Media pengantar' }
        ),
        focus: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            rows: fields.array(
              fields.object({
                title: fields.text({ label: 'Judul baris' }),
                description: fields.text({ label: 'Deskripsi baris', multiline: true }),
              }),
              {
                label: 'Baris fokus',
                itemLabel: (props) => props.fields.title.value || 'Baris',
              }
            ),
          },
          { label: 'Fokus riset & laboratorium' }
        ),
        visiMisi: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({
              label: 'Judul bagian',
              description: 'Isi visi, misi, dan nilai dibaca dari halaman Tentang Kami.',
              validation: { isRequired: true },
            }),
          },
          { label: 'Visi & misi' }
        ),
        numbers: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label bagian' }),
            dosenValue: fields.integer({
              label: 'Nilai dosen (opsional)',
              description: 'Kosongkan agar dihitung otomatis dari data posisi.',
              validation: { isRequired: false },
            }),
            membersValue: fields.integer({
              label: 'Nilai anggota laboratorium (opsional)',
              description: 'Kosongkan agar dihitung otomatis dari data anggota.',
              validation: { isRequired: false },
            }),
            coursesValue: fields.integer({
              label: 'Nilai mata kuliah (opsional)',
              description: 'Kosongkan agar dihitung otomatis dari data mata kuliah.',
              validation: { isRequired: false },
            }),
          },
          { label: 'Laboratorium dalam angka', description: 'Label statistik diambil dari Navbar, Footer & Brand.' }
        ),
        courses: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            link: fields.text({ label: 'Label tautan ke daftar mata kuliah' }),
          },
          { label: 'Mata kuliah' }
        ),
        events: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            empty: fields.text({ label: 'Teks saat belum ada kegiatan', multiline: true }),
            viewAll: fields.text({ label: 'Label tautan semua kegiatan', validation: { isRequired: true } }),
          },
          { label: 'Kegiatan' }
        ),
        news: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            empty: fields.text({ label: 'Teks saat belum ada artikel', multiline: true }),
            viewAll: fields.text({ label: 'Label tautan semua artikel', validation: { isRequired: true } }),
          },
          { label: 'Artikel' }
        ),
        cta: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
          },
          { label: 'Ajakan bergabung', description: 'Teksnya diatur di Navbar, Footer & Brand.' }
        ),
      },
    }),
    page_structure: singleton({
      label: 'Struktur',
      path: 'src/data/pages/structure',
      format: { data: 'json' },
      schema: {
        meta: fields.object(
          {
            title: fields.text({
              label: 'Judul halaman',
              description: 'Tampil di tab browser dan hasil pencarian.',
              validation: { isRequired: true },
            }),
            description: fields.text({
              label: 'Deskripsi meta',
              description: 'Tampil di hasil pencarian.',
              multiline: true,
              validation: { isRequired: true },
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            chart: fields.text({ label: 'Label titik bagan', validation: { isRequired: true } }),
            join: fields.text({ label: 'Label titik gabung', validation: { isRequired: true } }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        groups: fields.object(
          {
            dosen: fields.text({ label: 'Label kelompok dosen', validation: { isRequired: true } }),
            asisten: fields.text({ label: 'Label kelompok asisten', validation: { isRequired: true } }),
            mahasiswa: fields.text({ label: 'Label kelompok mahasiswa', validation: { isRequired: true } }),
          },
          { label: 'Label kelompok peran', description: 'Dipakai di bagan dan di judul tiap peran.' }
        ),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
              label: 'Judul utama',
              description: 'Satu item per baris, maksimal tiga baris.',
              validation: { length: { min: 1, max: 3 } },
              itemLabel: (props) => props.value,
            }),
            description: fields.text({ label: 'Deskripsi', multiline: true, validation: { isRequired: true } }),
            meta: fields.text({
              label: 'Teks kecil di bawah tombol',
              description: 'Jumlah anggota, dosen, dan peran diisi otomatis. Jangan hapus {members}, {dosen}, atau {positions}.',
              validation: { isRequired: true },
            }),
            primaryLabel: fields.text({ label: 'Label tombol utama', validation: { isRequired: true } }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua', validation: { isRequired: true } }),
          },
          { label: 'Hero' }
        ),
        chart: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true, validation: { isRequired: true } }),
            ariaLabel: fields.text({
              label: 'Label bagan untuk pembaca layar',
              description: 'Menjelaskan susunan peran dari ketua laboratorium sampai asisten praktikum. Perbarui teks ini setiap kali nama peran di positions.json berubah.',
              multiline: true,
              validation: { isRequired: true },
            }),
            memberAssistantNote: fields.text({
              label: 'Catatan asisten praktikum',
              description: 'Jumlah diisi otomatis. Jangan hapus {n} atau {total}.',
              validation: { isRequired: true },
            }),
            practicumAssistant: fields.text({ label: 'Nama peran asisten praktikum', validation: { isRequired: true } }),
            emptyPosition: fields.text({ label: 'Teks saat peran belum berisi orang', validation: { isRequired: true } }),
            positionCount: fields.text({
              label: 'Teks jumlah orang',
              description: 'Jumlah diisi otomatis. Jangan hapus {n}.',
              validation: { isRequired: true },
            }),
          },
          { label: 'Bagan peran' }
        ),
        roles: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            positionIntro: fields.text({
              label: 'Paragraf pengantar tiap peran',
              description: 'Jumlah orang diisi otomatis. Jangan hapus {n}.',
              validation: { isRequired: true },
            }),
          },
          { label: 'Daftar peran', description: 'Peran dan anggotanya dibaca dari data posisi, anggota, dan dosen.' }
        ),
        cta: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
          },
          { label: 'Ajakan bergabung', description: 'Teksnya diatur di Navbar, Footer & Brand.' }
        ),
      },
    }),
    page_courses: singleton({
      label: 'Mata Kuliah',
      path: 'src/data/pages/courses',
      format: { data: 'json' },
      schema: {
        meta: fields.object(
          {
            title: fields.text({
              label: 'Judul halaman',
              description: 'Tampil di tab browser dan hasil pencarian.',
              validation: { isRequired: true },
            }),
            description: fields.text({
              label: 'Deskripsi meta',
              description: 'Tampil di hasil pencarian.',
              multiline: true,
              validation: { isRequired: true },
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            list: fields.text({ label: 'Label titik daftar', validation: { isRequired: true } }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
              label: 'Judul utama',
              description: 'Satu item per baris, maksimal tiga baris.',
              validation: { length: { min: 1, max: 3 } },
              itemLabel: (props) => props.value,
            }),
            description: fields.text({ label: 'Deskripsi', multiline: true, validation: { isRequired: true } }),
            summary: fields.text({
              label: 'Ringkasan jumlah di bawah tombol',
              description: 'Jumlah diisi otomatis. Jangan hapus {n} (jumlah mata kuliah) atau {p} (jumlah dengan praktikum).',
              validation: { isRequired: true },
            }),
            primaryLabel: fields.text({ label: 'Label tombol utama', validation: { isRequired: true } }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua', validation: { isRequired: true } }),
          },
          { label: 'Hero', description: 'Markup hero ada langsung di halaman Mata Kuliah.' }
        ),
        list: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true, validation: { isRequired: true } }),
            emptyTitle: fields.text({ label: 'Judul saat belum ada mata kuliah', multiline: true, validation: { isRequired: true } }),
            empty: fields.text({ label: 'Penjelasan saat belum ada mata kuliah', multiline: true, validation: { isRequired: true } }),
          },
          { label: 'Daftar mata kuliah', description: 'Entri daftar dibaca dari koleksi Courses.' }
        ),
      },
    }),
    page_courseDetail: singleton({
      label: 'Detail Mata Kuliah',
      path: 'src/data/pages/course-detail',
      format: { data: 'json' },
      schema: {
        meta: fields.object(
          {
            title: fields.text({
              label: 'Judul halaman',
              description: 'Diapit judul mata kuliah di tab browser dan hasil pencarian.',
              validation: { isRequired: true },
            }),
            description: fields.text({
              label: 'Deskripsi meta',
              description: 'Tampil di hasil pencarian. Jangan hapus {title}.',
              multiline: true,
              validation: { isRequired: true },
            }),
          },
          { label: 'Meta halaman' }
        ),
        description: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
          },
          { label: 'Deskripsi mata kuliah', description: 'Isi deskripsi dibaca dari koleksi Courses.' }
        ),
        modules: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            heading: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
          },
          { label: 'Modul praktikum', description: 'Daftar modul dibaca dari koleksi Courses.' }
        ),
        assistants: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            heading: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            note: fields.text({
              label: 'Catatan tanpa praktikum',
              description: 'Tampil saat mata kuliah tidak memiliki praktikum.',
              multiline: true,
              validation: { isRequired: true },
            }),
          },
          { label: 'Asisten praktikum', description: 'Daftar asisten dibaca dari koleksi Courses dan Members.' }
        ),
        backLink: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label tautan kembali ke daftar', validation: { isRequired: true } }),
          },
          { label: 'Tautan kembali', description: 'Tautan diarahkan ke halaman Mata Kuliah.' }
        ),
      },
    }),
    page_news: singleton({
      label: 'Artikel',
      path: 'src/data/pages/news',
      format: { data: 'json' },
      schema: {
        meta: fields.object(
          {
            title: fields.text({
              label: 'Judul halaman',
              description: 'Tampil di tab browser dan hasil pencarian.',
              validation: { isRequired: true },
            }),
            description: fields.text({
              label: 'Deskripsi meta',
              description: 'Tampil di hasil pencarian.',
              multiline: true,
              validation: { isRequired: true },
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            list: fields.text({ label: 'Label titik daftar', validation: { isRequired: true } }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
              label: 'Judul utama',
              description: 'Satu item per baris, maksimal tiga baris.',
              validation: { length: { min: 1, max: 3 } },
              itemLabel: (props) => props.value,
            }),
            description: fields.text({ label: 'Deskripsi', multiline: true, validation: { isRequired: true } }),
            meta: fields.text({
              label: 'Teks kecil di bawah tombol',
              description: 'Jumlah artikel, kategori, dan tahun diisi otomatis. Jangan hapus {articles}, {categories}, atau {year}.',
              validation: { isRequired: true },
            }),
            metaEmpty: fields.text({
              label: 'Teks saat belum ada artikel',
              description: 'Tampil menggantikan jumlah artikel saat koleksi kosong.',
              multiline: true,
              validation: { isRequired: true },
            }),
            primaryLabel: fields.text({ label: 'Label tombol utama', validation: { isRequired: true } }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua', validation: { isRequired: true } }),
          },
          { label: 'Hero' }
        ),
        list: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true, validation: { isRequired: true } }),
            emptyTitle: fields.text({ label: 'Judul saat belum ada artikel', multiline: true, validation: { isRequired: true } }),
            emptyDesc: fields.text({ label: 'Penjelasan saat belum ada artikel', multiline: true, validation: { isRequired: true } }),
            noMatchTitle: fields.text({ label: 'Judul saat pencarian tidak ditemukan', multiline: true, validation: { isRequired: true } }),
            noMatchDesc: fields.text({ label: 'Penjelasan saat pencarian tidak ditemukan', multiline: true, validation: { isRequired: true } }),
            searchPlaceholder: fields.text({ label: 'Teks placeholder kolom pencarian', validation: { isRequired: true } }),
            contactLabel: fields.text({ label: 'Label tautan hubungi kontak', validation: { isRequired: true } }),
            item: fields.text({
              label: 'Nama jenis konten',
              description: 'Dipakai di teks hasil filter, misalnya "Artikel".',
              validation: { isRequired: true },
            }),
          },
          { label: 'Daftar artikel', description: 'Entri daftar dibaca dari koleksi News. Label filter diambil dari Navbar, Footer & Brand.' }
        ),
      },
    }),
    page_newsDetail: singleton({
      label: 'Detail Artikel',
      path: 'src/data/pages/news-detail',
      format: { data: 'json' },
      schema: {
        meta: fields.object(
          {
            title: fields.text({
              label: 'Sufiks judul halaman',
              description: 'Ditambahkan setelah judul artikel di tab browser dan hasil pencarian.',
              validation: { isRequired: true },
            }),
            description: fields.text({
              label: 'Deskripsi meta',
              description: 'Tampil di hasil pencarian saat artikel belum memiliki ringkasan. Jangan hapus {title}.',
              multiline: true,
              validation: { isRequired: true },
            }),
          },
          { label: 'Meta halaman' }
        ),
        hero: fields.object(
          {
            backLabel: fields.text({
              label: 'Label tautan kembali di bagian atas',
              description: 'Tautan diarahkan ke halaman Artikel, di sebelah tombol bagikan.',
              validation: { isRequired: true },
            }),
          },
          { label: 'Bagian atas artikel', description: 'Tanpa tombol tampil/sembunyi; judul artikel dibaca dari koleksi News.' }
        ),
        author: fields.text({ label: 'Label penulis', validation: { isRequired: true } }),
        topics: fields.text({ label: 'Label topik', validation: { isRequired: true } }),
        body: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
          },
          { label: 'Isi artikel', description: 'Teks artikel, foto sampul, dan daftar topik dibaca dari koleksi News.' }
        ),
        gallery: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
          },
          { label: 'Galeri foto', description: 'Foto dibaca dari koleksi News, tidak termasuk foto sampul.' }
        ),
        related: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true, validation: { isRequired: true } }),
          },
          { label: 'Artikel terkait', description: 'Daftar artikel dibaca dari koleksi News.' }
        ),
        backLink: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label tautan kembali ke daftar', validation: { isRequired: true } }),
          },
          { label: 'Tautan kembali di akhir halaman', description: 'Tautan diarahkan ke halaman Artikel.' }
        ),
        share: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label tombol bagikan', validation: { isRequired: true } }),
          },
          { label: 'Tombol bagikan', description: 'Tombol di bagian atas halaman.' }
        ),
      },
    }),
    page_events: singleton({
      label: 'Kegiatan',
      path: 'src/data/pages/events',
      format: { data: 'json' },
      schema: {
        meta: fields.object(
          {
            title: fields.text({
              label: 'Judul halaman',
              description: 'Tampil di tab browser dan hasil pencarian.',
              validation: { isRequired: true },
            }),
            description: fields.text({
              label: 'Deskripsi meta',
              description: 'Tampil di hasil pencarian.',
              multiline: true,
              validation: { isRequired: true },
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            list: fields.text({ label: 'Label titik daftar', validation: { isRequired: true } }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
              label: 'Judul utama',
              description: 'Satu item per baris, maksimal tiga baris.',
              validation: { length: { min: 1, max: 3 } },
              itemLabel: (props) => props.value,
            }),
            description: fields.text({ label: 'Deskripsi', multiline: true, validation: { isRequired: true } }),
            meta: fields.text({
              label: 'Teks kecil di bawah tombol',
              description: 'Jumlah kegiatan, kategori, dan tahun diisi otomatis. Jangan hapus {events}, {categories}, atau {year}.',
              validation: { isRequired: true },
            }),
            metaEmpty: fields.text({
              label: 'Teks saat belum ada kegiatan',
              description: 'Tampil menggantikan jumlah kegiatan saat koleksi kosong.',
              multiline: true,
              validation: { isRequired: true },
            }),
            primaryLabel: fields.text({ label: 'Label tombol utama', validation: { isRequired: true } }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua', validation: { isRequired: true } }),
          },
          { label: 'Hero' }
        ),
        list: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true, validation: { isRequired: true } }),
            emptyTitle: fields.text({ label: 'Judul saat belum ada kegiatan', multiline: true, validation: { isRequired: true } }),
            emptyDesc: fields.text({ label: 'Penjelasan saat belum ada kegiatan', multiline: true, validation: { isRequired: true } }),
            noMatchTitle: fields.text({ label: 'Judul saat pencarian tidak ditemukan', multiline: true, validation: { isRequired: true } }),
            noMatchDesc: fields.text({ label: 'Penjelasan saat pencarian tidak ditemukan', multiline: true, validation: { isRequired: true } }),
            searchPlaceholder: fields.text({ label: 'Teks placeholder kolom pencarian', validation: { isRequired: true } }),
            contactLabel: fields.text({ label: 'Label tautan hubungi kontak', validation: { isRequired: true } }),
            item: fields.text({
              label: 'Nama jenis konten',
              description: 'Dipakai di teks hasil filter, misalnya "Kegiatan".',
              validation: { isRequired: true },
            }),
          },
          { label: 'Daftar kegiatan', description: 'Entri daftar dibaca dari koleksi Events. Label filter diambil dari Navbar, Footer & Brand.' }
        ),
      },
    }),
    page_eventDetail: singleton({
      label: 'Detail Kegiatan',
      path: 'src/data/pages/event-detail',
      format: { data: 'json' },
      schema: {
        meta: fields.object(
          {
            title: fields.text({
              label: 'Sufiks judul halaman',
              description: 'Ditambahkan setelah judul kegiatan di tab browser dan hasil pencarian.',
              validation: { isRequired: true },
            }),
          },
          { label: 'Meta halaman', description: 'Deskripsi meta dibaca dari ringkasan kegiatan di koleksi Events.' }
        ),
        hero: fields.object(
          {
            backLabel: fields.text({
              label: 'Label tautan kembali di bagian atas',
              description: 'Tautan diarahkan ke halaman Kegiatan, di sebelah tombol bagikan.',
              validation: { isRequired: true },
            }),
          },
          { label: 'Bagian atas kegiatan', description: 'Tanpa tombol tampil/sembunyi; judul, tanggal, ringkasan, dan foto dibaca dari koleksi Events.' }
        ),
        story: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
          },
          { label: 'Cerita kegiatan', description: 'Isi cerita dibaca dari koleksi Events.' }
        ),
        gallery: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            empty: fields.text({
              label: 'Teks saat dokumentasi kosong',
              description: 'Tampil saat kegiatan tidak memiliki cerita maupun foto dokumentasi.',
              multiline: true,
              validation: { isRequired: true },
            }),
          },
          { label: 'Galeri dokumentasi', description: 'Foto dibaca dari koleksi Events, tidak termasuk foto sampul.' }
        ),
        related: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true, validation: { isRequired: true } }),
          },
          { label: 'Kegiatan terkait', description: 'Daftar kegiatan dibaca dari koleksi Events.' }
        ),
        backLink: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label tautan kembali ke daftar', validation: { isRequired: true } }),
          },
          { label: 'Tautan kembali di akhir halaman', description: 'Tautan diarahkan ke halaman Kegiatan.' }
        ),
        share: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label tombol bagikan', validation: { isRequired: true } }),
          },
          { label: 'Tombol bagikan', description: 'Tombol di bagian atas halaman.' }
        ),
      },
    }),
    chrome: singleton({
      label: 'Navbar, Footer & Brand',
      path: 'src/data/chrome',
      format: { data: 'json' },
      schema: {
        nav: fields.object(
          {
            home: fields.text({ label: 'Menu Beranda', validation: { isRequired: true } }),
            about: fields.text({ label: 'Menu Tentang Kami', validation: { isRequired: true } }),
            structure: fields.text({ label: 'Menu Struktur', validation: { isRequired: true } }),
            courses: fields.text({ label: 'Menu Mata Kuliah', validation: { isRequired: true } }),
            event: fields.text({ label: 'Menu Kegiatan', validation: { isRequired: true } }),
            news: fields.text({ label: 'Menu Artikel', validation: { isRequired: true } }),
            register: fields.text({ label: 'Menu Pendaftaran', validation: { isRequired: true } }),
            contact: fields.text({ label: 'Menu Kontak', validation: { isRequired: true } }),
            joinUs: fields.text({ label: 'Tombol Gabung EIM', validation: { isRequired: true } }),
          },
          { label: 'Menu navigasi' }
        ),
        footer: fields.object(
          {
            description: fields.text({ label: 'Deskripsi footer', multiline: true, validation: { isRequired: true } }),
            quickLinks: fields.text({ label: 'Judul tautan cepat', validation: { isRequired: true } }),
            contact: fields.text({ label: 'Judul kontak', validation: { isRequired: true } }),
            resources: fields.text({ label: 'Judul tautan', validation: { isRequired: true } }),
            assets: fields.text({ label: 'Teks aset brand', validation: { isRequired: true } }),
            linkHub: fields.text({ label: 'Teks EIM Link Hub', validation: { isRequired: true } }),
            rights: fields.text({ label: 'Teks hak cipta', validation: { isRequired: true } }),
            backToTop: fields.text({ label: 'Teks kembali ke atas', validation: { isRequired: true } }),
          },
          { label: 'Footer' }
        ),
        cta: fields.object(
          {
            title: fields.text({ label: 'Judul ajakan bergabung', validation: { isRequired: true } }),
            description: fields.text({ label: 'Deskripsi ajakan bergabung', multiline: true, validation: { isRequired: true } }),
            contactLabel: fields.text({ label: 'Label tombol kontak', validation: { isRequired: true } }),
          },
          { label: 'Ajakan bergabung' }
        ),
        brand: fields.object(
          {
            logoHorizontal: fields.image({
              label: 'Logo horizontal',
              directory: 'public/assets/brand',
              publicPath: '/assets/brand/',
              validation: { isRequired: true },
            }),
            logoIcon: fields.image({
              label: 'Ikon logo',
              directory: 'public/assets/brand',
              publicPath: '/assets/brand/',
              validation: { isRequired: true },
            }),
          },
          { label: 'Logo' }
        ),
        labels: fields.object(
          {
            upcoming: fields.text({ label: 'Label mendatang', validation: { isRequired: true } }),
            details: fields.text({ label: 'Label lihat detail', validation: { isRequired: true } }),
            statsDosen: fields.text({ label: 'Label statistik dosen', validation: { isRequired: true } }),
            statsMembers: fields.text({ label: 'Label statistik anggota', validation: { isRequired: true } }),
            statsCourses: fields.text({ label: 'Label statistik mata kuliah', validation: { isRequired: true } }),
            organizerFallback: fields.text({ label: 'Label penyelenggara cadangan', validation: { isRequired: true } }),
            sectionNav: fields.text({ label: 'Label navigasi bagian halaman', validation: { isRequired: true } }),
            coordinator: fields.text({ label: 'Label koordinator mata kuliah', validation: { isRequired: true } }),
            sks: fields.text({ label: 'Label SKS', description: 'Gunakan {n} untuk jumlah SKS.', validation: { isRequired: true } }),
            practicumYes: fields.text({ label: 'Label dengan praktikum', validation: { isRequired: true } }),
            practicumNo: fields.text({ label: 'Label tanpa praktikum', validation: { isRequired: true } }),
            featured: fields.text({ label: 'Label artikel utama', validation: { isRequired: true } }),
            search: fields.text({ label: 'Label pencarian', validation: { isRequired: true } }),
            close: fields.text({ label: 'Label tutup', validation: { isRequired: true } }),
            vision: fields.text({ label: 'Label visi', description: 'Dipakai di Beranda dan Tentang Kami.', validation: { isRequired: true } }),
            mission: fields.text({ label: 'Label misi', description: 'Dipakai di Beranda dan Tentang Kami.', validation: { isRequired: true } }),
            values: fields.text({ label: 'Label nilai-nilai utama', description: 'Dipakai di Beranda dan Tentang Kami.', validation: { isRequired: true } }),
          },
          { label: 'Label umum' }
        ),
        ui: fields.object(
          {
            backToHome: fields.text({ label: 'Label kembali ke beranda', validation: { isRequired: true } }),
            titleSuffix: fields.text({
              label: 'Sufiks judul tab halaman',
              description: 'Ditambahkan setelah judul halaman pendaftaran, misalnya "· EIM Lab".',
              validation: { isRequired: true },
            }),
            revealPlay: fields.text({
              label: 'Label tombol putar intro',
              description: 'Tampil pada pil di atas media pengantar beranda.',
              validation: { isRequired: true },
            }),
            pagination: fields.object(
              {
                previous: fields.text({ label: 'Judul tombol halaman sebelumnya', validation: { isRequired: true } }),
                previousAria: fields.text({ label: 'Label pembaca layar halaman sebelumnya', validation: { isRequired: true } }),
                next: fields.text({ label: 'Judul tombol halaman selanjutnya', validation: { isRequired: true } }),
                nextAria: fields.text({ label: 'Label pembaca layar halaman selanjutnya', validation: { isRequired: true } }),
                info: fields.text({
                  label: 'Teks posisi halaman',
                  description: 'Gunakan {page} dan {total}.',
                  validation: { isRequired: true },
                }),
              },
              { label: 'Penomoran halaman' }
            ),
            filter: fields.object(
              {
                clearSearch: fields.text({ label: 'Label hapus pencarian', validation: { isRequired: true } }),
                resultsCount: fields.text({
                  label: 'Teks jumlah hasil filter',
                  description: 'Gunakan {n} untuk jumlah item.',
                  validation: { isRequired: true },
                }),
                searchPlaceholder: fields.text({ label: 'Placeholder pencarian bawaan', validation: { isRequired: true } }),
                sortLabel: fields.text({ label: 'Label urutkan', validation: { isRequired: true } }),
                sortNewest: fields.text({ label: 'Pilihan urutan terbaru', validation: { isRequired: true } }),
                sortOldest: fields.text({ label: 'Pilihan urutan terlama', validation: { isRequired: true } }),
                statusLabel: fields.text({ label: 'Label status', validation: { isRequired: true } }),
                allStatuses: fields.text({ label: 'Pilihan semua status', validation: { isRequired: true } }),
                categoryLabel: fields.text({ label: 'Label kategori', validation: { isRequired: true } }),
                allCategories: fields.text({ label: 'Pilihan semua kategori', validation: { isRequired: true } }),
                reset: fields.text({ label: 'Label tombol reset filter', validation: { isRequired: true } }),
              },
              { label: 'Bar filter' }
            ),
            contentFilter: fields.object(
              {
                noResults: fields.text({
                  label: 'Teks saat filter tidak menemukan hasil',
                  description: 'Gunakan {item} untuk nama koleksi.',
                  validation: { isRequired: true },
                }),
                resultsRange: fields.text({
                  label: 'Teks rentang hasil filter',
                  description: 'Gunakan {from}, {to}, {total}, dan {item}.',
                  validation: { isRequired: true },
                }),
              },
              { label: 'Hasil filter daftar' }
            ),
            registration: fields.object(
              {
                optional: fields.text({ label: 'Label berkas opsional', validation: { isRequired: true } }),
                wordCount: fields.text({
                  label: 'Teks penghitung kata',
                  description: 'Gunakan {count} dan {min}.',
                  validation: { isRequired: true },
                }),
              },
              { label: 'Formulir pendaftaran' }
            ),
            aria: fields.object(
              {
                mainNav: fields.text({ label: 'Label navigasi utama', validation: { isRequired: true } }),
                openMenu: fields.text({ label: 'Label buka menu', validation: { isRequired: true } }),
                closeMenu: fields.text({ label: 'Label tutup menu', validation: { isRequired: true } }),
                homeLink: fields.text({
                  label: 'Label tautan beranda footer',
                  description: 'Gunakan {name} untuk nama pendek lab.',
                  validation: { isRequired: true },
                }),
                mediaIntro: fields.text({ label: 'Label bagian media pengantar', validation: { isRequired: true } }),
                closeAnnouncement: fields.text({ label: 'Label tutup pengumuman', validation: { isRequired: true } }),
                closeModal: fields.text({ label: 'Label tutup modal poster', validation: { isRequired: true } }),
                previousEvent: fields.text({ label: 'Label poster kegiatan sebelumnya', validation: { isRequired: true } }),
                nextEvent: fields.text({ label: 'Label poster kegiatan berikutnya', validation: { isRequired: true } }),
                slideDot: fields.text({
                  label: 'Label titik navigasi poster',
                  description: 'Gunakan {n} untuk nomor gambar.',
                  validation: { isRequired: true },
                }),
                zoomIn: fields.text({ label: 'Label perbesar poster', validation: { isRequired: true } }),
                zoomOut: fields.text({ label: 'Label perkecil poster', validation: { isRequired: true } }),
                zoomReset: fields.text({ label: 'Label atur ulang ukuran poster', validation: { isRequired: true } }),
              },
              { label: 'Label pembaca layar' }
            ),
          },
          { label: 'Teks antarmuka' }
        ),
      },
    }),
    site: singleton({
      label: 'Site Metadata',
      path: 'src/data/site',
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Short Name' }),
        subName: fields.text({ label: 'Sub Name' }),
        fullName: fields.text({ label: 'Full Name' }),
        defaultTitle: fields.text({ label: 'Default Page Title' }),
        defaultDescription: fields.text({ label: 'Default Meta Description', multiline: true }),
        defaultKeywords: fields.text({ label: 'Default Meta Keywords', multiline: true }),
        favicon: fields.image({
          label: 'Favicon',
          directory: 'public/image/eim',
          publicPath: '/image/eim/',
          validation: { isRequired: true },
        }),
        timezone: fields.text({ label: 'Global IANA Timezone (e.g. Asia/Jakarta)', defaultValue: 'Asia/Jakarta' }),
        timezoneOffset: fields.text({ label: 'Global Timezone Offset (e.g. +07:00 for WIB, +08:00 for WITA)', defaultValue: '+07:00' }),
        contact: fields.object({
          location: fields.text({ label: 'Location' }),
          university: fields.text({ label: 'University' }),
          email: fields.text({ label: 'Email Address' }),
        }),
        socials: fields.object({
          instagram: fields.text({ label: 'Instagram URL' }),
          linkedin: fields.text({ label: 'LinkedIn URL' }),
          github: fields.text({ label: 'GitHub Organization URL' }),
        }),
      },
    }),
    divisions: singleton({
      label: 'Divisions',
      path: 'src/data/divisions',
      format: { data: 'json' },
      schema: {
        list: fields.array(
          fields.object({
            id: fields.text({ label: 'ID' }),
            name: fields.text({ label: 'Name' }),
            displayName: fields.text({ label: 'Display Name' }),
            description: fields.text({ label: 'Description', multiline: true }),
            registrationLabel: fields.text({ label: 'Registration Label' }),
            registrationValue: fields.text({ label: 'Registration Value' }),
            aliases: fields.array(fields.text({ label: 'Alias' }), {
              label: 'Aliases',
              itemLabel: props => props.value,
            }),
            borderColor: fields.text({ label: 'Border Color' }),
            roleColor: fields.text({ label: 'Role Color' }),
          }),
          {
            label: 'Divisions List',
            itemLabel: props => props.fields.name.value || 'Division',
          }
        ),
      },
    }),
    positions: singleton({
      label: 'Positions',
      path: 'src/data/positions',
      format: { data: 'json' },
      schema: {
        list: fields.array(
          fields.object({
            id: fields.text({ label: 'ID' }),
            label: fields.text({ label: 'Label' }),
            group: fields.select({
              label: 'Group',
              options: [
                { label: 'Dosen', value: 'dosen' },
                { label: 'Asisten', value: 'asisten' },
                { label: 'Mahasiswa', value: 'mahasiswa' },
              ],
              defaultValue: 'mahasiswa',
            }),
            order: fields.integer({ label: 'Order' }),
          }),
          {
            label: 'Positions List',
            itemLabel: (props) => props.fields.label.value || 'Position',
          }
        ),
      },
    }),
    members: singleton({
      label: 'Members',
      path: 'src/data/members',
      format: { data: 'json' },
      schema: {
        list: fields.array(
          fields.object({
            id: fields.number({ label: 'ID' }),
            name: fields.text({ label: 'Name' }),
            role: positionField,
            image: fields.image({
              label: 'Foto',
              description:
                'Potong foto ke rasio bingkai sebelum diunggah. Kosongkan untuk memakai inisial nama. Untuk berkas yang sudah dipotong, atur Scale ke 1 dan Position ke center. Ekspor 640 px persegi (1:1), format WebP atau AVIF, maksimal ±150 KB.',
              directory: 'public/image/division',
              publicPath: '/image/division/',
            }),
            scale: fields.text({
              label: 'Scale Factor',
              description: 'Hanya untuk unggahan yang belum dipotong: perbesar foto di dalam bingkai. Isi 1 bila foto sudah dipotong.',
            }),
            position: fields.text({
              label: 'Position',
              description: 'Hanya untuk unggahan yang belum dipotong: titik fokus foto, mis. "center 32%". Isi center bila foto sudah dipotong.',
            }),
          }),
          {
            label: 'Members List',
            itemLabel: props => props.fields.name.value || 'Member',
          }
        ),
      },
    }),
    lecturers: singleton({
      label: 'Lecturers',
      path: 'src/data/lecturers',
      format: { data: 'json' },
      schema: {
        list: fields.array(
          fields.object({
            id: fields.text({ label: 'ID' }),
            name: fields.text({ label: 'Name' }),
            role: positionField,
            image: fields.image({
              label: 'Foto',
              description:
                'Potong foto ke rasio bingkai sebelum diunggah. Kosongkan untuk memakai avatar cadangan. Untuk berkas yang sudah dipotong, atur Scale ke 1 dan Position ke center. Ekspor 640 px persegi (1:1), format WebP atau AVIF, maksimal ±150 KB.',
              directory: 'public/image/division',
              publicPath: '/image/division/',
            }),
            scale: fields.text({
              label: 'Scale Factor',
              description: 'Hanya untuk unggahan yang belum dipotong: perbesar foto di dalam bingkai. Isi 1 bila foto sudah dipotong.',
            }),
            position: fields.text({
              label: 'Position',
              description: 'Hanya untuk unggahan yang belum dipotong: titik fokus foto, mis. "center 32%". Isi center bila foto sudah dipotong.',
            }),
          }),
          {
            label: 'Lecturers List',
            itemLabel: props => props.fields.name.value || props.fields.role.value || 'Lecturer',
          }
        ),
      },
    }),
    about: singleton({
      label: 'Tentang Kami',
      path: 'src/data/about',
      format: { data: 'json' },
      schema: {
        meta: fields.object(
          {
            title: fields.text({
              label: 'Judul halaman',
              description: 'Tampil di tab browser dan hasil pencarian.',
              validation: { isRequired: true },
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            profile: fields.text({ label: 'Label titik profil', validation: { isRequired: true } }),
            stats: fields.text({ label: 'Label titik angka', validation: { isRequired: true } }),
            vision: fields.text({ label: 'Label titik visi & misi', validation: { isRequired: true } }),
            gallery: fields.text({
              label: 'Label titik galeri',
              description: 'Hanya tampil saat galeri berisi foto.',
              validation: { isRequired: true },
            }),
            cta: fields.text({ label: 'Label titik gabung', validation: { isRequired: true } }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        sections: fields.object(
          {
            hero: fields.object(
              {
                eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
                lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
                  label: 'Judul utama',
                  description: 'Satu item per baris, maksimal tiga baris.',
                  validation: { length: { min: 1, max: 3 } },
                  itemLabel: (props) => props.value,
                }),
                description: fields.text({ label: 'Deskripsi', multiline: true, validation: { isRequired: true } }),
                meta: fields.text({ label: 'Teks kecil di bawah tombol', validation: { isRequired: true } }),
                primaryLabel: fields.text({ label: 'Label tombol utama', validation: { isRequired: true } }),
                secondaryLabel: fields.text({ label: 'Label tautan kedua', validation: { isRequired: true } }),
              },
              { label: 'Hero' }
            ),
            profile: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                eyebrow: fields.text({ label: 'Teks kecil di atas ikhtisar', validation: { isRequired: true } }),
                factsLabel: fields.text({ label: 'Judul tabel identitas', validation: { isRequired: true } }),
                factName: fields.text({ label: 'Label baris nama resmi', validation: { isRequired: true } }),
                factFaculty: fields.text({ label: 'Label baris fakultas', validation: { isRequired: true } }),
                factFacultyValue: fields.text({ label: 'Isi baris fakultas', validation: { isRequired: true } }),
                factProgram: fields.text({ label: 'Label baris program studi', validation: { isRequired: true } }),
                factProgramValue: fields.text({ label: 'Isi baris program studi', validation: { isRequired: true } }),
                factLocation: fields.text({ label: 'Label baris lokasi', validation: { isRequired: true } }),
                factEmail: fields.text({ label: 'Label baris email', validation: { isRequired: true } }),
              },
              { label: 'Profil', description: 'Nama resmi, lokasi, dan email dibaca dari Site Metadata.' }
            ),
            stats: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                label: fields.text({ label: 'Label bagian', validation: { isRequired: true } }),
                membersValue: fields.integer({
                  label: 'Nilai anggota laboratorium (opsional)',
                  description: 'Kosongkan agar dihitung otomatis dari data anggota.',
                  validation: { isRequired: false },
                }),
                coursesValue: fields.integer({
                  label: 'Nilai mata kuliah (opsional)',
                  description: 'Kosongkan agar dihitung otomatis dari data mata kuliah.',
                  validation: { isRequired: false },
                }),
                dosenValue: fields.integer({
                  label: 'Nilai dosen (opsional)',
                  description: 'Kosongkan agar dihitung otomatis dari data posisi.',
                  validation: { isRequired: false },
                }),
              },
              { label: 'Laboratorium dalam angka', description: 'Label statistik diambil dari Navbar, Footer & Brand.' }
            ),
            teamLink: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                label: fields.text({ label: 'Label tautan ke struktur', validation: { isRequired: true } }),
              },
              { label: 'Tautan struktur', description: 'Tautan diarahkan ke halaman Struktur.' }
            ),
            galleryBand: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                label: fields.text({ label: 'Label untuk pembaca layar', validation: { isRequired: true } }),
              },
              { label: 'Foto studio', description: 'Hanya tampil saat galeri punya foto studio.' }
            ),
            visiMisi: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                heading: fields.text({
                  label: 'Judul bagian',
                  description: 'Isi visi, misi, dan nilai dibaca dari isian di bagian bawah halaman ini.',
                  validation: { isRequired: true },
                }),
              },
              { label: 'Visi & misi' }
            ),
            gallery: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
                title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
                intro: fields.text({ label: 'Paragraf pengantar', multiline: true, validation: { isRequired: true } }),
                showAll: fields.text({ label: 'Label tombol lihat semua foto', validation: { isRequired: true } }),
                hideAll: fields.text({ label: 'Label tombol sembunyikan foto', validation: { isRequired: true } }),
              },
              { label: 'Galeri' }
            ),
            cta: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
              },
              { label: 'Ajakan bergabung', description: 'Teksnya diatur di Navbar, Footer & Brand.' }
            ),
          },
          { label: 'Bagian halaman' }
        ),
        description: fields.text({ label: 'Deskripsi meta halaman', multiline: true, validation: { isRequired: true } }),
        overviewTitle: fields.text({ label: 'Judul ikhtisar', validation: { isRequired: true } }),
        overviewContent1: fields.text({ label: 'Paragraf ikhtisar pertama', multiline: true, validation: { isRequired: true } }),
        overviewContent2: fields.text({ label: 'Paragraf ikhtisar kedua', multiline: true, validation: { isRequired: true } }),
        vision: fields.text({ label: 'Pernyataan visi', multiline: true, validation: { isRequired: true } }),
        missions: fields.array(fields.text({ label: 'Poin misi' }), {
          label: 'Misi',
          itemLabel: (props) => props.value,
        }),
        values: fields.array(
          fields.object({
            title: fields.text({ label: 'Judul nilai', validation: { isRequired: true } }),
            description: fields.text({ label: 'Deskripsi nilai', multiline: true }),
            icon: fields.text({ label: 'Ikon FontAwesome' }),
            isAccent: fields.checkbox({ label: 'Ikon beraksen merah' }),
          }),
          {
            label: 'Nilai-nilai utama',
            itemLabel: (props) => props.fields.title.value || 'Nilai',
          }
        ),
      },
    }),
    gallery: singleton({
      label: 'Photo Gallery',
      path: 'src/data/gallery',
      format: { data: 'json' },
      schema: {
        featured: fields.object(
          {
            image: fields.image({
              label: 'Studio Photo',
              description: 'Ekspor maksimal 1200 px lebar, format WebP atau AVIF, maksimal ±300 KB.',
              directory: 'public/image/gallery',
              publicPath: '/image/gallery/',
              validation: { isRequired: true },
            }),
            alt: fields.text({ label: 'Alt Text', validation: { isRequired: true } }),
            caption: fields.text({ label: 'Caption', validation: { isRequired: true } }),
          },
          { label: 'Featured Studio Photo' }
        ),
        photos: fields.array(
          fields.object({
            image: fields.image({
              label: 'Photo',
              description: 'Ekspor maksimal 1200 px lebar, format WebP atau AVIF, maksimal ±300 KB.',
              directory: 'public/image/gallery',
              publicPath: '/image/gallery/',
              validation: { isRequired: true },
            }),
            alt: fields.text({ label: 'Alt Text', validation: { isRequired: true } }),
            caption: fields.text({ label: 'Caption', validation: { isRequired: true } }),
          }),
          { label: 'Activity Photos', itemLabel: props => props.fields.caption.value || 'Photo' }
        ),
      },
    }),
    registration: singleton({
      label: 'Registration Settings',
      path: 'src/data/registration',
      format: { data: 'json' },
      schema: registrationSchema,
    }),
    recruitment_results: singleton({
      label: 'Recruitment Results',
      path: 'src/data/recruitment_results',
      format: { data: 'json' },
      schema: recruitmentResultsSchema,
    }),
    contact: singleton({
      label: 'Kontak',
      path: 'src/data/contact',
      format: { data: 'json' },
      schema: {
        meta: fields.object(
          {
            title: fields.text({
              label: 'Judul halaman',
              description: 'Tampil di tab browser dan hasil pencarian.',
              validation: { isRequired: true },
            }),
            description: fields.text({
              label: 'Deskripsi meta',
              description: 'Tampil di hasil pencarian. Gunakan {location} dan {university} agar diisi otomatis dari Site Metadata.',
              multiline: true,
              validation: { isRequired: true },
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            detail: fields.text({ label: 'Label titik detail', validation: { isRequired: true } }),
            social: fields.text({ label: 'Label titik sosial', validation: { isRequired: true } }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        hero: fields.object(
          {
            eyebrow: fields.text({
              label: 'Teks kecil di atas judul',
              description: 'Sekaligus label titik navigasi bagian teratas.',
              validation: { isRequired: true },
            }),
            primaryLabel: fields.text({ label: 'Label tombol utama', validation: { isRequired: true } }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua', validation: { isRequired: true } }),
          },
          { label: 'Hero', description: 'Tanpa tombol tampil/sembunyi; judul dan deskripsi hero ada di bagian bawah.' }
        ),
        details: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true, validation: { isRequired: true } }),
            emailAction: fields.text({ label: 'Label tautan kirim email', validation: { isRequired: true } }),
            copyEmail: fields.text({ label: 'Label tombol salin email', validation: { isRequired: true } }),
            copied: fields.text({ label: 'Teks tombol setelah tersalin', validation: { isRequired: true } }),
            copyFailed: fields.text({ label: 'Teks tombol saat gagal menyalin', validation: { isRequired: true } }),
            copySuccessStatus: fields.text({ label: 'Status pembaca layar saat tersalin', validation: { isRequired: true } }),
            copyFailedStatus: fields.text({ label: 'Status pembaca layar saat gagal', validation: { isRequired: true } }),
            routingNote: fields.text({ label: 'Catatan perutean kontak', multiline: true, validation: { isRequired: true } }),
            picsTitle: fields.text({ label: 'Judul kartu PIC', validation: { isRequired: true } }),
            picsSubtitle: fields.text({ label: 'Penjelasan kartu PIC', multiline: true, validation: { isRequired: true } }),
          },
          {
            label: 'Detail kontak',
            description: 'Kartu lokasi, email, dan jam operasional dari kolom di bawah; daftar PIC dari kolom PIC.',
          }
        ),
        map: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            subtitle: fields.text({ label: 'Penjelasan singkat', multiline: true, validation: { isRequired: true } }),
            navDot: fields.text({ label: 'Label titik navigasi bagian ini', validation: { isRequired: true } }),
          },
          { label: 'Peta lokasi', description: 'Peta dibaca dari tautan sematan Google Maps di bawah.' }
        ),
        socials: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul', validation: { isRequired: true } }),
            title: fields.text({ label: 'Judul bagian', validation: { isRequired: true } }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true, validation: { isRequired: true } }),
          },
          { label: 'Media sosial', description: 'Daftar akun dibaca dari singleton Navbar, Footer & Brand.' }
        ),
        title: fields.text({ label: 'Judul utama hero', validation: { isRequired: true } }),
        heroDescription: fields.text({ label: 'Deskripsi hero', multiline: true, validation: { isRequired: true } }),
        locationTitle: fields.text({ label: 'Judul kartu lokasi', validation: { isRequired: true } }),
        mapsEmbedUrl: fields.text({
          label: 'Tautan sematan iframe Google Maps',
          description: 'Harus diawali https://www.google.com/maps/embed? atau https://maps.google.com/maps/embed?.',
          validation: { isRequired: true },
        }),
        emailTitle: fields.text({ label: 'Judul kartu email', validation: { isRequired: true } }),
        hoursTitle: fields.text({ label: 'Judul kartu jam operasional', validation: { isRequired: true } }),
        hoursText: fields.text({ label: 'Teks jam operasional', validation: { isRequired: true } }),
        hoursSubtext: fields.text({ label: 'Teks tambahan jam operasional', multiline: true, validation: { isRequired: true } }),
        contactPersons: contactPersonsField,
      },
    }),
    announcement: singleton({
      label: 'Announcement Banner',
      path: 'src/data/announcement',
      format: { data: 'json' },
      schema: {
        enabled: fields.checkbox({ label: 'Enable Announcement Banner', defaultValue: true }),
        mode: fields.select({
          label: 'Announcement Mode',
          options: [
            { label: 'Auto Sync with Active Recruitment Pipeline Stage', value: 'auto_recruitment' },
            { label: 'Manual Custom Announcement', value: 'manual' },
          ],
          defaultValue: 'auto_recruitment',
        }),
        alertType: fields.select({
          label: 'Alert Theme / Style (Manual Mode)',
          options: [
            { label: 'Recruitment (Purple / Gold Accent)', value: 'recruitment' },
            { label: 'Maintenance / Warning (Amber / Red Accent)', value: 'maintenance' },
            { label: 'General Info (Cyan / Blue Accent)', value: 'info' },
            { label: 'Success / Results (Emerald Green Accent)', value: 'success' },
          ],
          defaultValue: 'recruitment',
        }),
        icon: fields.text({ label: 'FontAwesome Icon Class (e.g. fa-solid fa-bullhorn)', defaultValue: 'fa-solid fa-bullhorn' }),
        badgeText: fields.text({
          label: 'Badge Tag Text (Manual Mode Only)',
          description: 'Hanya dipakai saat Announcement Mode = Manual. Mode auto memakai badge dari tahap rekrutmen aktif di Registration Settings.',
          defaultValue: 'REKRUTMEN',
        }),
        message: fields.text({
          label: 'Announcement Message Text (Manual Mode Only)',
          description: 'Hanya dipakai saat Announcement Mode = Manual. Mode auto memakai pesan dari tahap rekrutmen aktif di Registration Settings.',
          multiline: true,
          defaultValue: 'Pendaftaran Asisten EIM Lab sedang berlangsung!',
        }),
        ctaText: fields.text({
          label: 'Call-To-Action Button Text (Manual Mode Only)',
          description: 'Hanya dipakai saat Announcement Mode = Manual. Mode auto memakai label tombol dari tahap rekrutmen aktif di Registration Settings.',
          defaultValue: 'Daftar Sekarang',
        }),
        ctaLink: fields.text({ label: 'Call-To-Action Destination URL (Optional)', defaultValue: '/registration' }),
        dismissible: fields.checkbox({ label: 'Allow Visitors to Close / Dismiss Banner', defaultValue: true }),
        id: fields.text({ label: 'Announcement Version ID (Change this to reset dismissal state for visitors)', defaultValue: 'announcement-2026-v1' }),
      },
    }),
  },
  ui: {
    navigation: {
      Halaman: ['page_home', 'page_structure', 'page_courses', 'page_courseDetail', 'page_news', 'page_newsDetail', 'page_events', 'page_eventDetail', 'about', 'contact'],
      Koleksi: ['news', 'events', 'courses'],
      Pengaturan: [
        'site',
        'chrome',
        'divisions',
        'positions',
        'members',
        'lecturers',
        'gallery',
        'registration',
        'recruitment_results',
        'announcement',
      ],
    },
  },
});
