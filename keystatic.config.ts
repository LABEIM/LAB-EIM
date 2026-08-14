import { config, fields, collection, singleton } from '@keystatic/core';

const registrationSchema = {
  status: fields.text({
    label: 'Recruitment Stage Status Override',
    description: 'Set to "auto" for automatic date-based calculation. Default lifecycle phases: "upcoming", "open", "extended", "final_selection", "announcement", "closed", "fallback". You can also override to any selection phase defined under Dynamic Selection Pipeline Steps by using its Step Identifier Key (e.g., "selection", "technical_test", "fgd", "interview"). To trigger a step\'s results announcement phase, append "_results" to its Step Identifier Key (e.g., "selection_results", "technical_test_results", "interview_results").',
    defaultValue: 'auto',
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
  heroTag: fields.text({ label: 'Hero Tag', defaultValue: 'Assistant Recruitment' }),
  heroTitle: fields.text({ label: 'Hero Title', defaultValue: 'Assistant Lab Registration' }),
  heroDescription: fields.text({ label: 'Hero Description', defaultValue: 'Join us and become a part of EIM Research Lab. Develop your potential in IT infrastructure, networks, and technology research.' }),
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
    message: fields.text({ label: 'Notice Message', multiline: true, defaultValue: 'Terima kasih kepada seluruh kandidat yang telah mengikuti seluruh rangkaian seleksi. Tim EIM Research Lab saat ini sedang melakukan rekapitulasi nilai dan verifikasi kelulusan akhir. Pengumuman kelulusan akhir akan dipublikasikan pada 9 September 2026.' }),
    estimatedAnnouncementDate: fields.text({ label: 'Estimated Announcement Date Text', defaultValue: '9 September 2026' }),
  }),
  announcementConfig: fields.object({
    title: fields.text({ label: 'Final Announcement Title', defaultValue: 'Final Selection Announcement' }),
    subtitle: fields.text({ label: 'Final Announcement Subtitle', defaultValue: 'Check your final selection status below. Congratulations to all accepted candidates!' }),
    acceptedMessage: fields.text({ label: 'Default Accepted Candidate Note / Message', defaultValue: 'Selamat! Anda diterima menjadi asisten di EIM Research Lab.' }),
    waitlistMessage: fields.text({ label: 'Default Waitlist Candidate Note / Message', defaultValue: 'Anda masuk dalam daftar cadangan (Waitlist) asisten EIM Research Lab.' }),
    rejectedMessage: fields.text({ label: 'Default Rejected Candidate Note / Message', defaultValue: 'Terima kasih telah mengikuti seluruh rangkaian rekrutmen asisten EIM Research Lab.' }),
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
        message: fields.text({ label: 'Notice Message', defaultValue: 'Please check your email/WhatsApp group for details.' }),
        scheduleInfo: fields.text({ label: 'Schedule Info (Optional)', defaultValue: '' }),
        locationInfo: fields.text({ label: 'Location / Platform Info (Optional)', defaultValue: '' }),
      }),
      resultsConfig: fields.object({
        title: fields.text({ label: 'Results Section Title', defaultValue: 'Step Results Announcement' }),
        subtitle: fields.text({ label: 'Results Subtitle', defaultValue: 'Check if you passed this step.' }),
        passedMessage: fields.text({ label: 'Default Passed / Accepted Candidate Note', defaultValue: 'Selamat! Anda dinyatakan lolos pada tahap ini. Cek WhatsApp Group rekrutmen untuk informasi lebih lanjut.' }),
        waitlistMessage: fields.text({ label: 'Default Waitlist Candidate Note (Optional)', defaultValue: 'Anda masuk dalam daftar cadangan (Waitlist).' }),
        failedMessage: fields.text({ label: 'Default Failed / Rejected Candidate Note', defaultValue: 'Terima kasih telah mengikuti tahap seleksi ini.' }),
        newsUrl: fields.text({ label: 'Official News Post URL (Optional)', defaultValue: '' }),
        documentUrl: fields.text({ label: 'PDF Document Link (Optional)', defaultValue: '' }),
      }),


    }),
    {
      label: 'Dynamic Selection Pipeline Steps',
      itemLabel: props => `${props.fields.enabled.value ? '✓' : '✗'} ${props.fields.shortLabel.value || 'Step'} (${props.fields.id.value || 'id'})`,
    }
  ),
  contactPersons: fields.array(

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
      link: fields.text({ label: 'Direct Clickable Contact Link (e.g. https://wa.me/6281234567890)' }),
    }),
    {
      label: 'Contact Persons List',
      itemLabel: props => `${props.fields.name.value || 'Contact Person'} (${props.fields.role.value || ''})`,
    }
  ),
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
          notes: fields.text({ label: 'Step Specific Note / Feedback (Optional)' }),
        }),
        {
          label: 'Stage / Step Statuses (Dynamic Selection Pipeline Steps)',
          itemLabel: props => `${props.fields.stepId.value || 'step'}: ${props.fields.status.value || 'passed'}`,
        }
      ),

      finalStatus: fields.select({
        label: 'Final Selection Status',
        options: [
          { label: 'Accepted (Diterima)', value: 'accepted' },
          { label: 'Waitlist (Cadangan)', value: 'waitlist' },
          { label: 'Rejected (Tidak Diterima)', value: 'rejected' },
        ],
        defaultValue: 'accepted',
      }),
      notes: fields.text({ label: 'Custom Notes / Feedback' }),
    }),
    {
      label: 'Candidate List',
      itemLabel: props => props.fields.nim.value ? `NIM: ${props.fields.nim.value}` : 'Candidate',
    }
  ),
};


export default config({
  storage: import.meta.env.PROD
    ? {
      kind: 'github',
      repo: 'LABEIM/LAB-EIM',
    }
    : {
      kind: 'local',
    },
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
        }),
      },
    }),
    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'src/content/events/*',
      format: { contentField: 'description' },
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
        description: fields.markdoc({
          label: 'Description/Content',
          extension: 'md',
        }),
        link: fields.text({ label: 'Link (Optional)' }),
        poster: fields.text({ label: 'Poster / Banner Image URL (Optional)' }),
        image: fields.array(fields.text({ label: 'Image URL' }), {
          label: 'Images',
          itemLabel: props => props.value,
        }),
        icon: fields.text({ label: 'FontAwesome Icon class (e.g., fa-building-columns)' }),
        organizer: fields.text({ label: 'Organizer', defaultValue: 'EIM Research Lab' }),
        benefits: fields.array(fields.text({ label: 'Benefit' }), {
          label: 'Benefits',
          itemLabel: props => props.value,
        }),
        requirements: fields.array(fields.text({ label: 'Requirement' }), {
          label: 'Requirements',
          itemLabel: props => props.value,
        }),
        show_register: fields.checkbox({ label: 'Show Register Button', defaultValue: true }),
      },
    }),
  },
  singletons: {
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
        favicon: fields.text({ label: 'Favicon Path' }),
        logo: fields.text({ label: 'Logo Image Path' }),
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
    members: singleton({
      label: 'Members',
      path: 'src/data/members',
      format: { data: 'json' },
      schema: {
        list: fields.array(
          fields.object({
            id: fields.number({ label: 'ID' }),
            name: fields.text({ label: 'Name' }),
            role: fields.text({ label: 'Role' }),
            division: fields.text({ label: 'Division' }),
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
    about: singleton({
      label: 'About Page',
      path: 'src/data/about',
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'Hero Description' }),
        overviewTitle: fields.text({ label: 'Overview Title' }),
        overviewContent1: fields.text({ label: 'Overview Paragraph 1', multiline: true }),
        overviewContent2: fields.text({ label: 'Overview Paragraph 2', multiline: true }),
        overviewImage: fields.text({ label: 'Overview Image' }),
        vision: fields.text({ label: 'Vision Statement', multiline: true }),
        missions: fields.array(fields.text({ label: 'Mission Point' }), {
          label: 'Missions',
          itemLabel: props => props.value,
        }),
        values: fields.array(
          fields.object({
            title: fields.text({ label: 'Title' }),
            description: fields.text({ label: 'Description', multiline: true }),
            icon: fields.text({ label: 'FontAwesome Icon' }),
            isAccent: fields.checkbox({ label: 'Red Accent Icon' }),
          }),
          {
            label: 'Core Values',
            itemLabel: props => props.fields.title.value || 'Value',
          }
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
      label: 'Contact Page',
      path: 'src/data/contact',
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Page Title' }),
        heroDescription: fields.text({ label: 'Hero Description', multiline: true }),
        locationTitle: fields.text({ label: 'Location Card Title' }),
        location: fields.text({ label: 'Room / Location' }),
        university: fields.text({ label: 'University / Campus' }),
        mapsUrl: fields.text({ label: 'External Google Maps Link' }),
        mapsEmbedUrl: fields.text({ label: 'Google Maps Embed iframe URL' }),
        emailTitle: fields.text({ label: 'Email Card Title' }),
        email: fields.text({ label: 'Official Email Address' }),
        hoursTitle: fields.text({ label: 'Working Hours Card Title' }),
        hoursText: fields.text({ label: 'Working Hours Text' }),
        hoursSubtext: fields.text({ label: 'Working Hours Subtext', multiline: true }),
        mapSectionTitle: fields.text({ label: 'Map Section Title' }),
        mapSectionSubtitle: fields.text({ label: 'Map Section Subtitle', multiline: true }),
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
        message: fields.text({ label: 'Announcement Message Text', multiline: true, defaultValue: 'Pendaftaran Asisten EIM Research Lab sedang berlangsung!' }),
        ctaText: fields.text({ label: 'Call-To-Action Button Text (Optional)', defaultValue: 'Daftar Sekarang' }),
        ctaLink: fields.text({ label: 'Call-To-Action Destination URL (Optional)', defaultValue: '/registration' }),
        dismissible: fields.checkbox({ label: 'Allow Visitors to Close / Dismiss Banner', defaultValue: true }),
        id: fields.text({ label: 'Announcement Version ID (Change this to reset dismissal state for visitors)', defaultValue: 'announcement-2026-v1' }),
      },
    }),
  },
});
