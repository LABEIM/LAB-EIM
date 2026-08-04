import { config, fields, collection, singleton } from '@keystatic/core';

const registrationSchema = {
  status: fields.select({
    label: 'Recruitment Stage Status',
    options: [
      { label: 'Auto (Date-based Pipeline)', value: 'auto' },
      { label: 'Upcoming (Opening Soon)', value: 'upcoming' },
      { label: 'Open (Registration Form Active)', value: 'open' },
      { label: 'Extended (Registration Extended)', value: 'extended' },
      { label: 'Document Screening In Progress', value: 'selection' },
      { label: 'Document Screening Announcement', value: 'selection_results' },
      { label: 'Technical Test In Progress', value: 'technical_test' },
      { label: 'Technical Test Announcement', value: 'technical_test_results' },
      { label: 'Interview Phase In Progress', value: 'interview' },
      { label: 'Final Selection Announcement', value: 'announcement' },
      { label: 'Recruitment Closed', value: 'closed' },
      { label: 'Fallback / Maintenance (Google Form Link)', value: 'fallback' },
    ],
    defaultValue: 'auto',
  }),
  upcomingStartDate: fields.text({ label: 'Upcoming / Opening Soon Start Date (ISO format: YYYY-MM-DDTHH:mm:ss)', defaultValue: '2026-08-01T00:00:00' }),
  openDate: fields.text({ label: 'Opening Date (ISO format: YYYY-MM-DDTHH:mm:ss)', defaultValue: '2026-08-13T00:00:00' }),
  deadline: fields.text({ label: 'Initial Deadline Date (ISO format)', defaultValue: '2026-08-20T23:59:59' }),
  extendedDeadline: fields.text({ label: 'Extended Deadline Date (Optional ISO format)', defaultValue: '2026-08-23T23:59:59' }),
  selectionEndDate: fields.text({ label: 'Document Screening End Date (ISO format)', defaultValue: '2026-08-25T23:59:59' }),
  selectionResultsDate: fields.text({ label: 'Screening Announcement Start Date (ISO format)', defaultValue: '2026-08-26T00:00:00' }),
  technicalTestStartDate: fields.text({ label: 'Technical Test Start Date (ISO format)', defaultValue: '2026-08-29T00:00:00' }),
  technicalTestEndDate: fields.text({ label: 'Technical Test End Date (ISO format)', defaultValue: '2026-08-30T23:59:59' }),
  technicalTestResultsDate: fields.text({ label: 'Technical Test Announcement Start Date (ISO format)', defaultValue: '2026-09-01T00:00:00' }),
  interviewStartDate: fields.text({ label: 'Interview Phase Start Date (ISO format)', defaultValue: '2026-09-05T00:00:00' }),
  interviewEndDate: fields.text({ label: 'Interview Phase End Date (ISO format)', defaultValue: '2026-09-06T23:59:59' }),
  announcementDate: fields.text({ label: 'Final Announcement Start Date (ISO format)', defaultValue: '2026-09-09T00:00:00' }),
  title: fields.text({ label: 'Form Section Title', defaultValue: 'Assistant Registration Form' }),
  subtitle: fields.text({ label: 'Form Section Subtitle', defaultValue: 'Complete the form below with valid and correct information.' }),
  heroTag: fields.text({ label: 'Hero Tag', defaultValue: 'Assistant Recruitment' }),
  heroTitle: fields.text({ label: 'Hero Title', defaultValue: 'Assistant Lab Registration' }),
  heroDescription: fields.text({ label: 'Hero Description', defaultValue: 'Join us and become a part of EIM Research Lab. Develop your potential in IT infrastructure, networks, and technology research.' }),
  studentYears: fields.array(fields.text({ label: 'Year' }), {
    label: 'Eligible Student Years',
    itemLabel: props => props.value,
  }),
  portfolioDivisionTriggerValues: fields.text({ label: 'Portfolio Division Trigger Values (Comma-separated, e.g. Medhum, Front-End)', defaultValue: 'Medhum' }),
  medhumDivisionValue: fields.text({ label: 'MedHum Division Trigger Value (Legacy Fallback)', defaultValue: 'Medhum' }),
  piTemplateUrl: fields.text({ label: 'Pakta Integritas (PI) Template Link', defaultValue: 'https://bit.ly/Template-PI-EIM' }),
  minReasonWords: fields.number({ label: 'Minimum Word Count for Reason for Choosing Division', defaultValue: 30 }),
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
  selectionConfig: fields.object({
    title: fields.text({ label: 'Screening Section Title', defaultValue: 'Document Screening In Progress' }),
    subtitle: fields.text({ label: 'Screening Subtitle', defaultValue: 'Our team is currently evaluating all submitted administrative documents.' }),
    message: fields.text({ label: 'Screening Notice Message', defaultValue: 'Thank you for registering! Document verification and administrative screening are underway.' }),
    estimatedAnnouncementDate: fields.text({ label: 'Estimated Announcement Date Text', defaultValue: '06 August 2026' }),
  }),
  selectionResultsConfig: fields.object({
    title: fields.text({ label: 'Screening Results Title', defaultValue: 'Pengumuman Seleksi Berkas (Document Screening Results)' }),
    subtitle: fields.text({ label: 'Screening Results Subtitle', defaultValue: 'Check if you passed document screening and qualify for the Technical Test.' }),
    newsUrl: fields.text({ label: 'Official News Post URL', defaultValue: '/news/pengumuman-rekrutmen-2026' }),
    documentUrl: fields.text({ label: 'PDF Document Link (Optional)', defaultValue: '' }),
  }),
  technicalTestConfig: fields.object({
    title: fields.text({ label: 'Technical Test Title', defaultValue: 'Technical Test Phase In Progress' }),
    subtitle: fields.text({ label: 'Technical Test Subtitle', defaultValue: 'Practical skills assessment and technical challenge in progress.' }),
    message: fields.text({ label: 'Technical Test Notice Message', defaultValue: 'Please check your registered email for your technical test instructions and submission brief.' }),
    scheduleInfo: fields.text({ label: 'Schedule Info Text', defaultValue: '07 - 10 August 2026' }),
    locationInfo: fields.text({ label: 'Location / Platform Info', defaultValue: 'EIM Research Lab / Online Submission' }),
  }),
  technicalTestResultsConfig: fields.object({
    title: fields.text({ label: 'Technical Test Results Title', defaultValue: 'Pengumuman Tes Teknikal (Technical Test Results)' }),
    subtitle: fields.text({ label: 'Technical Test Results Subtitle', defaultValue: 'Check if you passed the Technical Test and qualify for the Interview phase.' }),
    newsUrl: fields.text({ label: 'Official News Post URL', defaultValue: '/news/pengumuman-rekrutmen-2026' }),
    documentUrl: fields.text({ label: 'PDF Document Link (Optional)', defaultValue: '' }),
  }),
  interviewConfig: fields.object({
    title: fields.text({ label: 'Interview Section Title', defaultValue: 'Interview Phase In Progress' }),
    subtitle: fields.text({ label: 'Interview Subtitle', defaultValue: 'Candidate interview sessions in progress with EIM Research Lab team.' }),
    message: fields.text({ label: 'Interview Notice Message', defaultValue: 'Please check your registered email for your assigned interview time slot and Zoom call details.' }),
    scheduleInfo: fields.text({ label: 'Interview Schedule Info', defaultValue: '12 - 15 August 2026' }),
    locationInfo: fields.text({ label: 'Location / Zoom Room', defaultValue: 'EIM Research Lab / Online Zoom Room' }),
  }),
  announcementConfig: fields.object({
    title: fields.text({ label: 'Final Announcement Title', defaultValue: 'Final Selection Announcement' }),
    subtitle: fields.text({ label: 'Final Announcement Subtitle', defaultValue: 'Check your final selection status below. Congratulations to all accepted candidates!' }),
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
    description: 'Supported format: NIM | Division | Screening (passed/failed) | Technical (passed/failed) | Final (accepted/waitlist/rejected) | Notes',
  }),
  candidates: fields.array(
    fields.object({
      nim: fields.text({ label: 'NIM' }),
      division: fields.text({ label: 'Division Name' }),
      screeningStatus: fields.select({
        label: 'Document Screening Status',
        options: [
          { label: 'Passed (Lolos Berkas)', value: 'passed' },
          { label: 'Failed (Tidak Lolos)', value: 'failed' },
        ],
        defaultValue: 'passed',
      }),
      technicalTestStatus: fields.select({
        label: 'Technical Test Status',
        options: [
          { label: 'Passed (Lolos Tes Teknikal)', value: 'passed' },
          { label: 'Failed (Tidak Lolos)', value: 'failed' },
        ],
        defaultValue: 'passed',
      }),
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
  },
});
