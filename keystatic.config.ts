import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: import.meta.env.PROD
    ? {
        kind: 'github',
        repo: 'labeim/website-eim',
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
    members: singleton({
      label: 'Members (Structure)',
      path: 'src/data/members',
      format: { data: 'json' },
      schema: {
        list: fields.array(
          fields.object({
            id: fields.number({ label: 'ID (Unique order number)' }),
            name: fields.text({ label: 'Name' }),
            role: fields.text({ label: 'Role' }),
            division: fields.select({
              label: 'Division',
              options: [
                { label: 'Core', value: 'core' },
                { label: 'Research', value: 'research' },
                { label: 'PKU', value: 'pku' },
                { label: 'Competition', value: 'competition' },
                { label: 'Media & PR', value: 'media' },
                { label: 'Community Service', value: 'community' },
              ],
              defaultValue: 'core',
            }),
            image: fields.text({ label: 'Image Path' }),
            scale: fields.text({ label: 'Scale Factor', defaultValue: '2.8' }),
            position: fields.text({ label: 'Image Position', defaultValue: 'center' }),
          }),
          {
            label: 'Lab Members List',
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
        title: fields.text({ label: 'About Page Title', defaultValue: 'About EIM Research Lab' }),
        description: fields.text({ label: 'Short Hero Description', defaultValue: 'Getting closer to the Enterprise Infrastructure Management research laboratory at Telkom University.' }),
        overviewTitle: fields.text({ label: 'Overview Section Title', defaultValue: 'Enterprise Infrastructure Management Laboratory' }),
        overviewContent1: fields.text({ label: 'Overview Paragraph 1', defaultValue: 'EIM (Enterprise Infrastructure Management) is a research laboratory under the S1 Information Systems Study Program, Enterprise and Industrial System Expertise Group, Faculty of Industrial Engineering, Telkom University.' }),
        overviewContent2: fields.text({ label: 'Overview Paragraph 2', defaultValue: 'We focus on understanding and developing digital infrastructure such as computer networks, operating systems, cloud computing, and cybersecurity. We conduct research, in-depth studies, and large-scale technology training to prepare future digital talents.' }),
        overviewImage: fields.text({ label: 'Overview Image Path', defaultValue: '/image/eim/EIM.avif' }),
        vision: fields.text({ label: 'Vision Statement', defaultValue: 'To establish the Enterprise Infrastructure Management (EIM) Research Laboratory as a hub for optimal assistant potential development, creating a leading, collaborative, and competitive research laboratory capable of producing innovative and professional human resources ready to contribute academically and industrially.' }),
        missions: fields.array(fields.text({ label: 'Mission Point' }), {
          label: 'Missions',
          itemLabel: props => props.value,
        }),
      },
    }),
    registration: singleton({
      label: 'Registration Form Settings',
      path: 'src/data/registration',
      format: { data: 'json' },
      schema: {
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
          ],
          defaultValue: 'auto',
        }),
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
        closedMessage: fields.text({ label: 'Closed Form Message', defaultValue: 'Sorry, the assistant registration form is currently closed.' }),
        studentYears: fields.array(fields.text({ label: 'Year' }), {
          label: 'Eligible Student Years',
          itemLabel: props => props.value,
        }),
        medhumDivisionValue: fields.text({ label: 'MedHum Division Trigger Value', defaultValue: 'Medhum' }),
        piTemplateUrl: fields.text({ label: 'Pakta Integritas (PI) Template Link', defaultValue: 'https://bit.ly/Template-PI-EIM' }),
        documentLimits: fields.object({
          ksmMb: fields.number({ label: 'KSM File Limit (MB)', defaultValue: 2 }),
          khsMb: fields.number({ label: 'KHS File Limit (MB)', defaultValue: 2 }),
          mlMb: fields.number({ label: 'Motivation Letter File Limit (MB)', defaultValue: 2 }),
          cvMb: fields.number({ label: 'CV File Limit (MB)', defaultValue: 3 }),
          piMb: fields.number({ label: 'Pakta Integritas File Limit (MB)', defaultValue: 2 }),
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
      },
    }),
    recruitment_results: singleton({
      label: 'Recruitment Results (Candidate Search)',
      path: 'src/data/recruitment_results',
      format: { data: 'json' },
      schema: {
        batch: fields.text({ label: 'Batch Title', defaultValue: 'Recruitment Assistant 2026' }),
        publishedDate: fields.text({ label: 'Published Date', defaultValue: '2026-08-01' }),
        candidates: fields.array(
          fields.object({
            nim: fields.text({ label: 'NIM' }),
            name: fields.text({ label: 'Candidate Full Name' }),
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
            itemLabel: props => `${props.fields.name.value || 'Candidate'} (${props.fields.nim.value || ''})`,
          }
        ),
      },
    }),
  },
});
