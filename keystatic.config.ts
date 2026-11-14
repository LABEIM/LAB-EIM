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

  title: fields.text({ label: 'Form Section Title', defaultValue: 'Assistant Registration Form' }),
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
    },
    {
      label: 'Label kolom formulir',
      description: 'Teks label dan placeholder pada formulir pendaftaran. Pesan validasi tetap di kode.',
    }
  ),
  heroTag: fields.text({ label: 'Hero Tag', defaultValue: 'Assistant Recruitment' }),
  heroTitle: fields.text({ label: 'Hero Title', defaultValue: 'Assistant Lab Registration' }),
  heroDescription: fields.text({ label: 'Hero Description', defaultValue: 'Join us and become a part of EIM Lab. Develop your potential in IT infrastructure, networks, and technology research.' }),
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
    title: fields.text({ label: 'Upcoming Section Title', defaultValue: 'Recruitment Opening Soon!' }),
    subtitle: fields.text({ label: 'Upcoming Subtitle', defaultValue: 'Get your documents ready. Registration will officially open soon.' }),
    prepNotice: fields.text({ label: 'Preparation Notice', defaultValue: 'Prepare the required files in advance so you can apply as soon as registration opens.' }),
  }),
  extendedConfig: fields.object({
    bannerTitle: fields.text({ label: 'Extended Banner Title', defaultValue: 'Pendaftaran Diperpanjang! (Registration Extended)' }),
    bannerMessage: fields.text({ label: 'Extended Banner Message', defaultValue: 'Good news! The assistant registration deadline has been extended. Don\'t miss this opportunity to submit your application.' }),
  }),
  finalSelectionConfig: fields.object({
    title: fields.text({ label: 'Final Selection In Progress Title', defaultValue: 'Seleksi Akhir & Olah Nilai Sedang Berlangsung' }),
    subtitle: fields.text({ label: 'Final Selection Subtitle', defaultValue: 'Seluruh rangkaian seleksi dan sesi wawancara telah selesai.' }),
    message: fields.text({ label: 'Notice Message', multiline: true, defaultValue: 'Terima kasih kepada seluruh kandidat yang telah mengikuti seluruh rangkaian seleksi. Tim EIM Lab saat ini sedang melakukan rekapitulasi nilai dan verifikasi kelulusan akhir. Pengumuman kelulusan akhir akan dipublikasikan pada 9 September 2026.' }),
    estimatedAnnouncementDate: fields.text({ label: 'Estimated Announcement Date Text', defaultValue: '9 September 2026' }),
  }),
  announcementConfig: fields.object({
    title: fields.text({ label: 'Final Announcement Title', defaultValue: 'Final Selection Announcement' }),
    subtitle: fields.text({ label: 'Final Announcement Subtitle', defaultValue: 'Check your final selection status below. Congratulations to all accepted candidates!' }),
    acceptedMessage: fields.text({ label: 'Default Accepted Candidate Note / Message', multiline: true, defaultValue: 'Selamat! Anda diterima menjadi asisten di EIM Lab.' }),
    waitlistMessage: fields.text({ label: 'Default Waitlist Candidate Note / Message', multiline: true, defaultValue: 'Anda masuk dalam daftar cadangan (Waitlist) asisten EIM Lab.' }),
    rejectedMessage: fields.text({ label: 'Default Rejected Candidate Note / Message', multiline: true, defaultValue: 'Terima kasih telah mengikuti seluruh rangkaian rekrutmen asisten EIM Lab.' }),
    newsUrl: fields.text({ label: 'Official News Post URL', defaultValue: '/news/pengumuman-rekrutmen-2026' }),
    documentUrl: fields.text({ label: 'PDF Document Link (Optional)', defaultValue: '' }),
  }),

  closedConfig: fields.object({
    title: fields.text({ label: 'Closed Title', defaultValue: 'Recruitment Period Ended' }),
    subtitle: fields.text({ label: 'Closed Subtitle', defaultValue: 'Assistant recruitment for this batch is officially closed.' }),
    message: fields.text({ label: 'Closed Message', defaultValue: 'Thank you to everyone who applied. Follow our social media for future recruitment cycles!' }),
    nextBatchInfo: fields.text({ label: 'Next Batch Info', defaultValue: 'Next recruitment expected in early 2027.' }),
  }),
  fallbackConfig: fields.object({
    title: fields.text({ label: 'Fallback Section Title', defaultValue: 'Sistem Pendaftaran Utama Sedang Pemeliharaan' }),
    subtitle: fields.text({ label: 'Fallback Subtitle', defaultValue: 'Formulir pendaftaran web sedang mengalami kendala teknis atau pemeliharaan sistem. Gunakan formulir cadangan di bawah ini.' }),
    message: fields.text({ label: 'Fallback Message', defaultValue: 'Silakan isi formulir pendaftaran melalui Google Form resmi kami di bawah ini untuk melanjutkan pendaftaran.' }),
    formUrl: fields.text({ label: 'External Backup Form URL (Google Form)', defaultValue: 'https://forms.gle/sample-fallback-form' }),
    buttonText: fields.text({ label: 'Fallback Button Text', defaultValue: 'Buka Formulir Pendaftaran Cadangan (Google Form)' }),
  }),
  selectionSteps: fields.array(
    fields.object({
      id: fields.text({ label: 'Step Identifier Key (e.g. selection, technical_test, fgd, interview)', defaultValue: 'custom_step' }),
      enabled: fields.checkbox({ label: 'Enable this Selection Step (Uncheck to skip/disable step)', defaultValue: true }),
      title: fields.text({ label: 'Full Step Title (e.g. Tes Teknikal & Case Study)', defaultValue: 'New Selection Step' }),
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
        title: fields.text({ label: 'In-Progress Section Title', defaultValue: 'Step In Progress' }),
        subtitle: fields.text({ label: 'In-Progress Subtitle', defaultValue: 'Candidate evaluation in progress.' }),
        message: fields.text({ label: 'Notice Message', multiline: true, defaultValue: 'Please check your email/WhatsApp group for details.' }),
        scheduleInfo: fields.text({ label: 'Schedule Info (Optional)', defaultValue: '' }),
        locationInfo: fields.text({ label: 'Location / Platform Info (Optional)', defaultValue: '' }),
      }),
      resultsConfig: fields.object({
        title: fields.text({ label: 'Results Section Title', defaultValue: 'Step Results Announcement' }),
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
            reveal: fields.text({ label: 'Label titik media' }),
            focus: fields.text({ label: 'Label titik fokus' }),
            vision: fields.text({ label: 'Label titik visi & misi' }),
            courses: fields.text({ label: 'Label titik mata kuliah' }),
            events: fields.text({ label: 'Label titik kegiatan' }),
            articles: fields.text({ label: 'Label titik artikel' }),
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
            primaryLabel: fields.text({ label: 'Label tombol utama' }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua' }),
          },
          { label: 'Hero' }
        ),
        reveal: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            caption: fields.text({ label: 'Keterangan media' }),
            pending: fields.text({ label: 'Teks saat media belum tersedia' }),
            pendingCta: fields.text({ label: 'Label tautan saat media belum tersedia' }),
          },
          { label: 'Media pengantar' }
        ),
        focus: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({ label: 'Judul bagian' }),
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
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            link: fields.text({ label: 'Label tautan ke daftar mata kuliah' }),
          },
          { label: 'Mata kuliah' }
        ),
        events: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            empty: fields.text({ label: 'Teks saat belum ada kegiatan', multiline: true }),
            viewAll: fields.text({ label: 'Label tautan semua kegiatan' }),
          },
          { label: 'Kegiatan' }
        ),
        news: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            empty: fields.text({ label: 'Teks saat belum ada artikel', multiline: true }),
            viewAll: fields.text({ label: 'Label tautan semua artikel' }),
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
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            chart: fields.text({ label: 'Label titik bagan' }),
            join: fields.text({ label: 'Label titik gabung' }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        groups: fields.object(
          {
            dosen: fields.text({ label: 'Label kelompok dosen' }),
            asisten: fields.text({ label: 'Label kelompok asisten' }),
            mahasiswa: fields.text({ label: 'Label kelompok mahasiswa' }),
          },
          { label: 'Label kelompok peran', description: 'Dipakai di bagan dan di judul tiap peran.' }
        ),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
              label: 'Judul utama',
              description: 'Satu item per baris, maksimal tiga baris.',
              validation: { length: { min: 1, max: 3 } },
              itemLabel: (props) => props.value,
            }),
            description: fields.text({ label: 'Deskripsi', multiline: true }),
            meta: fields.text({
              label: 'Teks kecil di bawah tombol',
              description: 'Jumlah anggota, dosen, dan peran diisi otomatis. Jangan hapus {members}, {dosen}, atau {positions}.',
            }),
            primaryLabel: fields.text({ label: 'Label tombol utama' }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua' }),
          },
          { label: 'Hero' }
        ),
        chart: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            ariaLabel: fields.text({
              label: 'Label bagan untuk pembaca layar',
              description: 'Menjelaskan susunan peran dari ketua laboratorium sampai asisten praktikum.',
              multiline: true,
            }),
            memberAssistantNote: fields.text({
              label: 'Catatan asisten praktikum',
              description: 'Jumlah diisi otomatis. Jangan hapus {n} atau {total}.',
            }),
            practicumAssistant: fields.text({ label: 'Nama peran asisten praktikum' }),
            emptyPosition: fields.text({ label: 'Teks saat peran belum berisi orang' }),
            positionCount: fields.text({
              label: 'Teks jumlah orang',
              description: 'Jumlah diisi otomatis. Jangan hapus {n}.',
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
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            list: fields.text({ label: 'Label titik daftar' }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
              label: 'Judul utama',
              description: 'Satu item per baris, maksimal tiga baris.',
              validation: { length: { min: 1, max: 3 } },
              itemLabel: (props) => props.value,
            }),
            description: fields.text({ label: 'Deskripsi', multiline: true }),
            summary: fields.text({
              label: 'Ringkasan jumlah di bawah tombol',
              description: 'Jumlah diisi otomatis. Jangan hapus {n} (jumlah mata kuliah) atau {p} (jumlah dengan praktikum).',
            }),
            primaryLabel: fields.text({ label: 'Label tombol utama' }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua' }),
          },
          { label: 'Hero', description: 'Markup hero ada langsung di halaman Mata Kuliah.' }
        ),
        list: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            empty: fields.text({ label: 'Teks saat belum ada mata kuliah', multiline: true }),
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
            heading: fields.text({ label: 'Judul bagian' }),
          },
          { label: 'Modul praktikum', description: 'Daftar modul dibaca dari koleksi Courses.' }
        ),
        assistants: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            heading: fields.text({ label: 'Judul bagian' }),
            note: fields.text({
              label: 'Catatan tanpa praktikum',
              description: 'Tampil saat mata kuliah tidak memiliki praktikum.',
              multiline: true,
            }),
          },
          { label: 'Asisten praktikum', description: 'Daftar asisten dibaca dari koleksi Courses dan Members.' }
        ),
        backLink: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label tautan kembali ke daftar' }),
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
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            list: fields.text({ label: 'Label titik daftar' }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
              label: 'Judul utama',
              description: 'Satu item per baris, maksimal tiga baris.',
              validation: { length: { min: 1, max: 3 } },
              itemLabel: (props) => props.value,
            }),
            description: fields.text({ label: 'Deskripsi', multiline: true }),
            meta: fields.text({
              label: 'Teks kecil di bawah tombol',
              description: 'Jumlah artikel, kategori, dan tahun diisi otomatis. Jangan hapus {articles}, {categories}, atau {year}.',
            }),
            metaEmpty: fields.text({
              label: 'Teks saat belum ada artikel',
              description: 'Tampil menggantikan jumlah artikel saat koleksi kosong.',
              multiline: true,
            }),
            primaryLabel: fields.text({ label: 'Label tombol utama' }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua' }),
          },
          { label: 'Hero' }
        ),
        list: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            emptyTitle: fields.text({ label: 'Judul saat belum ada artikel', multiline: true }),
            emptyDesc: fields.text({ label: 'Penjelasan saat belum ada artikel', multiline: true }),
            noMatchTitle: fields.text({ label: 'Judul saat pencarian tidak ditemukan', multiline: true }),
            noMatchDesc: fields.text({ label: 'Penjelasan saat pencarian tidak ditemukan', multiline: true }),
            searchPlaceholder: fields.text({ label: 'Teks placeholder kolom pencarian' }),
            contactLabel: fields.text({ label: 'Label tautan hubungi kontak' }),
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
            }),
          },
          { label: 'Meta halaman' }
        ),
        hero: fields.object(
          {
            backLabel: fields.text({
              label: 'Label tautan kembali di bagian atas',
              description: 'Tautan diarahkan ke halaman Artikel, di sebelah tombol bagikan.',
            }),
          },
          { label: 'Bagian atas artikel', description: 'Tanpa tombol tampil/sembunyi; judul artikel dibaca dari koleksi News.' }
        ),
        author: fields.text({ label: 'Label penulis' }),
        topics: fields.text({ label: 'Label topik' }),
        body: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
          },
          { label: 'Isi artikel', description: 'Teks artikel, foto sampul, dan daftar topik dibaca dari koleksi News.' }
        ),
        gallery: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            title: fields.text({ label: 'Judul bagian' }),
          },
          { label: 'Galeri foto', description: 'Foto dibaca dari koleksi News, tidak termasuk foto sampul.' }
        ),
        related: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
          },
          { label: 'Artikel terkait', description: 'Daftar artikel dibaca dari koleksi News.' }
        ),
        backLink: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label tautan kembali ke daftar' }),
          },
          { label: 'Tautan kembali di akhir halaman', description: 'Tautan diarahkan ke halaman Artikel.' }
        ),
        share: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label tombol bagikan' }),
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
            }),
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            list: fields.text({ label: 'Label titik daftar' }),
          },
          {
            label: 'Navigasi titik bagian',
            description: 'Titik navigasi di tepi halaman. Titik ikut hilang saat bagiannya dimatikan.',
          }
        ),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
              label: 'Judul utama',
              description: 'Satu item per baris, maksimal tiga baris.',
              validation: { length: { min: 1, max: 3 } },
              itemLabel: (props) => props.value,
            }),
            description: fields.text({ label: 'Deskripsi', multiline: true }),
            meta: fields.text({
              label: 'Teks kecil di bawah tombol',
              description: 'Jumlah kegiatan, kategori, dan tahun diisi otomatis. Jangan hapus {events}, {categories}, atau {year}.',
            }),
            metaEmpty: fields.text({
              label: 'Teks saat belum ada kegiatan',
              description: 'Tampil menggantikan jumlah kegiatan saat koleksi kosong.',
              multiline: true,
            }),
            primaryLabel: fields.text({ label: 'Label tombol utama' }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua' }),
          },
          { label: 'Hero' }
        ),
        list: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            emptyTitle: fields.text({ label: 'Judul saat belum ada kegiatan', multiline: true }),
            emptyDesc: fields.text({ label: 'Penjelasan saat belum ada kegiatan', multiline: true }),
            noMatchTitle: fields.text({ label: 'Judul saat pencarian tidak ditemukan', multiline: true }),
            noMatchDesc: fields.text({ label: 'Penjelasan saat pencarian tidak ditemukan', multiline: true }),
            searchPlaceholder: fields.text({ label: 'Teks placeholder kolom pencarian' }),
            contactLabel: fields.text({ label: 'Label tautan hubungi kontak' }),
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
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            title: fields.text({ label: 'Judul bagian' }),
            empty: fields.text({
              label: 'Teks saat dokumentasi kosong',
              description: 'Tampil saat kegiatan tidak memiliki cerita maupun foto dokumentasi.',
              multiline: true,
            }),
          },
          { label: 'Galeri dokumentasi', description: 'Foto dibaca dari koleksi Events, tidak termasuk foto sampul.' }
        ),
        related: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
          },
          { label: 'Kegiatan terkait', description: 'Daftar kegiatan dibaca dari koleksi Events.' }
        ),
        backLink: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label tautan kembali ke daftar' }),
          },
          { label: 'Tautan kembali di akhir halaman', description: 'Tautan diarahkan ke halaman Kegiatan.' }
        ),
        share: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            label: fields.text({ label: 'Label tombol bagikan' }),
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
            home: fields.text({ label: 'Menu Beranda' }),
            about: fields.text({ label: 'Menu Tentang Kami' }),
            structure: fields.text({ label: 'Menu Struktur' }),
            courses: fields.text({ label: 'Menu Mata Kuliah' }),
            event: fields.text({ label: 'Menu Kegiatan' }),
            news: fields.text({ label: 'Menu Artikel' }),
            register: fields.text({ label: 'Menu Pendaftaran' }),
            contact: fields.text({ label: 'Menu Kontak' }),
            joinUs: fields.text({ label: 'Tombol Gabung EIM' }),
          },
          { label: 'Menu navigasi' }
        ),
        footer: fields.object(
          {
            description: fields.text({ label: 'Deskripsi footer', multiline: true }),
            quickLinks: fields.text({ label: 'Judul tautan cepat' }),
            contact: fields.text({ label: 'Judul kontak' }),
            resources: fields.text({ label: 'Judul tautan' }),
            assets: fields.text({ label: 'Teks aset brand' }),
            linkHub: fields.text({ label: 'Teks EIM Link Hub' }),
            rights: fields.text({ label: 'Teks hak cipta' }),
            backToTop: fields.text({ label: 'Teks kembali ke atas' }),
          },
          { label: 'Footer' }
        ),
        cta: fields.object(
          {
            title: fields.text({ label: 'Judul ajakan bergabung' }),
            description: fields.text({ label: 'Deskripsi ajakan bergabung', multiline: true }),
            contactLabel: fields.text({ label: 'Label tombol kontak' }),
          },
          { label: 'Ajakan bergabung' }
        ),
        brand: fields.object(
          {
            logoHorizontal: fields.image({
              label: 'Logo horizontal',
              directory: 'public/assets/brand',
              publicPath: '/assets/brand/',
            }),
            logoIcon: fields.image({
              label: 'Ikon logo',
              directory: 'public/assets/brand',
              publicPath: '/assets/brand/',
            }),
          },
          { label: 'Logo' }
        ),
        labels: fields.object(
          {
            upcoming: fields.text({ label: 'Label mendatang' }),
            details: fields.text({ label: 'Label lihat detail' }),
            learnMore: fields.text({ label: 'Label pelajari selengkapnya' }),
            statsDosen: fields.text({ label: 'Label statistik dosen' }),
            statsMembers: fields.text({ label: 'Label statistik anggota' }),
            statsCourses: fields.text({ label: 'Label statistik mata kuliah' }),
            organizerFallback: fields.text({ label: 'Label penyelenggara cadangan' }),
            sectionNav: fields.text({ label: 'Label navigasi bagian halaman' }),
            coordinator: fields.text({ label: 'Label koordinator mata kuliah' }),
            sks: fields.text({ label: 'Label SKS', description: 'Gunakan {n} untuk jumlah SKS.' }),
            practicumYes: fields.text({ label: 'Label dengan praktikum' }),
            practicumNo: fields.text({ label: 'Label tanpa praktikum' }),
            featured: fields.text({ label: 'Label artikel utama' }),
            search: fields.text({ label: 'Label pencarian' }),
            close: fields.text({ label: 'Label tutup' }),
            vision: fields.text({ label: 'Label visi', description: 'Dipakai di Beranda dan Tentang Kami.' }),
            mission: fields.text({ label: 'Label misi', description: 'Dipakai di Beranda dan Tentang Kami.' }),
            values: fields.text({ label: 'Label nilai-nilai utama', description: 'Dipakai di Beranda dan Tentang Kami.' }),
          },
          { label: 'Label umum' }
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
            image: fields.text({ label: 'Image Path' }),
            scale: fields.text({ label: 'Scale Factor' }),
            position: fields.text({ label: 'Position' }),
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
            image: fields.text({ label: 'Image Path' }),
            scale: fields.text({ label: 'Scale Factor' }),
            position: fields.text({ label: 'Position' }),
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
            profile: fields.text({ label: 'Label titik profil' }),
            stats: fields.text({ label: 'Label titik angka' }),
            vision: fields.text({ label: 'Label titik visi & misi' }),
            gallery: fields.text({
              label: 'Label titik galeri',
              description: 'Hanya tampil saat galeri berisi foto.',
            }),
            cta: fields.text({ label: 'Label titik gabung' }),
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
                eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
                lines: fields.array(fields.text({ label: 'Baris judul', validation: { isRequired: true } }), {
                  label: 'Judul utama',
                  description: 'Satu item per baris, maksimal tiga baris.',
                  validation: { length: { min: 1, max: 3 } },
                  itemLabel: (props) => props.value,
                }),
                description: fields.text({ label: 'Deskripsi', multiline: true }),
                meta: fields.text({ label: 'Teks kecil di bawah tombol' }),
                primaryLabel: fields.text({ label: 'Label tombol utama' }),
                secondaryLabel: fields.text({ label: 'Label tautan kedua' }),
              },
              { label: 'Hero' }
            ),
            profile: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                eyebrow: fields.text({ label: 'Teks kecil di atas ikhtisar' }),
                factsLabel: fields.text({ label: 'Judul tabel identitas' }),
                factName: fields.text({ label: 'Label baris nama resmi' }),
                factFaculty: fields.text({ label: 'Label baris fakultas' }),
                factFacultyValue: fields.text({ label: 'Isi baris fakultas' }),
                factProgram: fields.text({ label: 'Label baris program studi' }),
                factProgramValue: fields.text({ label: 'Isi baris program studi' }),
                factLocation: fields.text({ label: 'Label baris lokasi' }),
                factEmail: fields.text({ label: 'Label baris email' }),
              },
              { label: 'Profil', description: 'Nama resmi, lokasi, dan email dibaca dari Site Metadata.' }
            ),
            stats: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                label: fields.text({ label: 'Label bagian' }),
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
                label: fields.text({ label: 'Label tautan ke struktur' }),
              },
              { label: 'Tautan struktur', description: 'Tautan diarahkan ke halaman Struktur.' }
            ),
            galleryBand: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                label: fields.text({ label: 'Label untuk pembaca layar' }),
              },
              { label: 'Foto studio', description: 'Hanya tampil saat galeri punya foto studio.' }
            ),
            visiMisi: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                heading: fields.text({
                  label: 'Judul bagian',
                  description: 'Isi visi, misi, dan nilai dibaca dari isian di bagian bawah halaman ini.',
                }),
              },
              { label: 'Visi & misi' }
            ),
            gallery: fields.object(
              {
                enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
                eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
                title: fields.text({ label: 'Judul bagian' }),
                intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
                showAll: fields.text({ label: 'Label tombol lihat semua foto' }),
                hideAll: fields.text({ label: 'Label tombol sembunyikan foto' }),
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
        title: fields.text({ label: 'Judul cadangan', description: 'Tidak tampil di halaman; dipertahankan agar nilai lama tidak hilang.' }),
        description: fields.text({ label: 'Deskripsi meta halaman', multiline: true }),
        overviewTitle: fields.text({ label: 'Judul ikhtisar' }),
        overviewContent1: fields.text({ label: 'Paragraf ikhtisar pertama', multiline: true }),
        overviewContent2: fields.text({ label: 'Paragraf ikhtisar kedua', multiline: true }),
        overviewImage: fields.text({ label: 'Gambar ikhtisar', description: 'Belum dipakai halaman mana pun.' }),
        vision: fields.text({ label: 'Pernyataan visi', multiline: true }),
        missions: fields.array(fields.text({ label: 'Poin misi' }), {
          label: 'Misi',
          itemLabel: (props) => props.value,
        }),
        values: fields.array(
          fields.object({
            title: fields.text({ label: 'Judul nilai' }),
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
          },
          { label: 'Meta halaman' }
        ),
        navDots: fields.object(
          {
            detail: fields.text({ label: 'Label titik detail' }),
            social: fields.text({ label: 'Label titik sosial' }),
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
            }),
            primaryLabel: fields.text({ label: 'Label tombol utama' }),
            secondaryLabel: fields.text({ label: 'Label tautan kedua' }),
          },
          { label: 'Hero', description: 'Tanpa tombol tampil/sembunyi; judul dan deskripsi hero ada di bagian bawah.' }
        ),
        details: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
            emailAction: fields.text({ label: 'Label tautan kirim email' }),
            copyEmail: fields.text({ label: 'Label tombol salin email' }),
            copied: fields.text({ label: 'Teks tombol setelah tersalin' }),
            copyFailed: fields.text({ label: 'Teks tombol saat gagal menyalin' }),
            copySuccessStatus: fields.text({ label: 'Status pembaca layar saat tersalin' }),
            copyFailedStatus: fields.text({ label: 'Status pembaca layar saat gagal' }),
            routingNote: fields.text({ label: 'Catatan perutean kontak', multiline: true }),
            picsTitle: fields.text({ label: 'Judul kartu PIC' }),
            picsSubtitle: fields.text({ label: 'Penjelasan kartu PIC', multiline: true }),
          },
          {
            label: 'Detail kontak',
            description: 'Kartu lokasi, email, dan jam operasional dari kolom di bawah; daftar PIC dari kolom PIC.',
          }
        ),
        map: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            title: fields.text({ label: 'Judul bagian' }),
            subtitle: fields.text({ label: 'Penjelasan singkat', multiline: true }),
            navDot: fields.text({ label: 'Label titik navigasi bagian ini' }),
          },
          { label: 'Peta lokasi', description: 'Peta dibaca dari tautan sematan Google Maps di bawah.' }
        ),
        socials: fields.object(
          {
            enabled: fields.checkbox({ label: 'Tampilkan bagian ini', defaultValue: true }),
            eyebrow: fields.text({ label: 'Teks kecil di atas judul' }),
            title: fields.text({ label: 'Judul bagian' }),
            intro: fields.text({ label: 'Paragraf pengantar', multiline: true }),
          },
          { label: 'Media sosial', description: 'Daftar akun dibaca dari singleton Navbar, Footer & Brand.' }
        ),
        title: fields.text({ label: 'Judul utama hero' }),
        heroDescription: fields.text({ label: 'Deskripsi hero', multiline: true }),
        locationTitle: fields.text({ label: 'Judul kartu lokasi' }),
        location: fields.text({ label: 'Ruang / lokasi' }),
        university: fields.text({ label: 'Universitas / kampus' }),
        mapsUrl: fields.text({ label: 'Tautan eksternal Google Maps' }),
        mapsEmbedUrl: fields.text({ label: 'Tautan sematan iframe Google Maps' }),
        emailTitle: fields.text({ label: 'Judul kartu email' }),
        email: fields.text({ label: 'Alamat email resmi' }),
        hoursTitle: fields.text({ label: 'Judul kartu jam operasional' }),
        hoursText: fields.text({ label: 'Teks jam operasional' }),
        hoursSubtext: fields.text({ label: 'Teks tambahan jam operasional', multiline: true }),
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
        badgeText: fields.text({ label: 'Badge Tag Text (e.g., PENGUMUMAN, MAINTENANCE)', defaultValue: 'REKRUTMEN' }),
        message: fields.text({ label: 'Announcement Message Text', multiline: true, defaultValue: 'Pendaftaran Asisten EIM Lab sedang berlangsung!' }),
        ctaText: fields.text({ label: 'Call-To-Action Button Text (Optional)', defaultValue: 'Daftar Sekarang' }),
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
