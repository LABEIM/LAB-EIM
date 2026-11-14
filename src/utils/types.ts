/**
 * Type definitions for recruitment stages and utilities.
 */

export type RecruitmentStage =
  | 'closed'
  | 'upcoming'
  | 'open'
  | 'extended'
  | 'announcement'
  | (string & {});

export interface StageActionConfig {
  label: string;
  icon: string;
}

export interface DivisionConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  registrationLabel?: string;
  registrationValue?: string;
  aliases?: string[];
  borderColor?: string;
  roleColor?: string;
}

export interface DocumentLimits {
  ksmMb: number;
  khsMb: number;
  mlMb: number;
  cvMb: number;
  piMb: number;
  totalMb: number;
}

export interface ContactPerson {
  name: string;
  role?: string;
  platform?: 'whatsapp' | 'line' | 'email' | 'phone' | string;
  contactId?: string;
  link?: string;
  whatsapp?: string;
  line?: string;
}

export interface UpcomingConfig {
  title: string;
  subtitle: string;
  prepNotice: string;
}

export interface ExtendedConfig {
  bannerTitle: string;
  bannerMessage: string;
}

export interface SelectionConfig {
  title: string;
  subtitle: string;
  message: string;
  estimatedAnnouncementDate: string;
}

export interface SelectionResultsConfig {
  title: string;
  subtitle: string;
  newsUrl: string;
  documentUrl?: string;
}

export interface TechnicalTestConfig {
  title: string;
  subtitle: string;
  message: string;
  scheduleInfo: string;
  locationInfo: string;
}

export interface TechnicalTestResultsConfig {
  title: string;
  subtitle: string;
  newsUrl: string;
  documentUrl?: string;
}

export interface InterviewConfig {
  title: string;
  subtitle: string;
  message: string;
  scheduleInfo: string;
  locationInfo: string;
}

export interface FinalSelectionConfig {
  title: string;
  subtitle: string;
  message: string;
  estimatedAnnouncementDate?: string;
}

export interface AnnouncementConfig {
  title: string;
  subtitle: string;
  acceptedMessage?: string;
  waitlistMessage?: string;
  rejectedMessage?: string;
  newsUrl: string;
  documentUrl?: string;
}


export interface ClosedConfig {
  title: string;
  subtitle: string;
  message: string;
  nextBatchInfo: string;
}

export interface FallbackConfig {
  title: string;
  subtitle: string;
  message: string;
  formUrl: string;
  buttonText: string;
}

export type FieldState = 'required' | 'optional' | 'disabled';
export type PortfolioFieldState = 'required' | 'only_trigger' | 'optional' | 'disabled';

export interface FieldStates {
  ksm?: FieldState;
  khs?: FieldState;
  ml?: FieldState;
  cv?: FieldState;
  pi?: FieldState;
  nomor_telp?: FieldState;
  angkatan?: FieldState;
  divisi_2?: FieldState;
  alasan_divisi_2?: FieldState;
  bersedia_dipindah?: FieldState;
  portofolio?: PortfolioFieldState;
}

export interface RecruitmentConfig {
  status?: string;
  autoCloseAfterDeadline?: boolean;
  timezone?: string;
  timezoneOffset?: string;
  upcomingStartDate?: string;
  openDate?: string;
  deadline?: string;
  extendedDeadline?: string;
  selectionResultsDate?: string;
  technicalTestStartDate?: string;
  technicalTestEndDate?: string;
  interviewStartDate?: string;
  interviewEndDate?: string;
  announcementDate?: string;
  formDescriptionTitle?: string;
  formDescription?: string;
  formDescriptionItems?: string[];
  studentYears?: string[];
  fieldStates?: FieldStates;
  documentLimits?: DocumentLimits;
  piTemplateUrl?: string;
  minReasonWords?: number;
  contactPersons?: ContactPerson[];
  upcomingConfig?: UpcomingConfig;
  extendedConfig?: ExtendedConfig;
  selectionConfig?: SelectionConfig;
  selectionResultsConfig?: SelectionResultsConfig;
  technicalTestConfig?: TechnicalTestConfig;
  technicalTestResultsConfig?: TechnicalTestResultsConfig;
  interviewConfig?: InterviewConfig;
  finalSelectionConfig?: FinalSelectionConfig;
  announcementConfig?: AnnouncementConfig;
  closedConfig?: ClosedConfig;
  fallbackConfig?: FallbackConfig;
  selectionSteps?: SelectionStepConfig[];
}

export type StepTemplateType = 'in_progress' | 'results' | 'info';

export interface SelectionStepConfig {
  id: string;
  enabled: boolean;
  title: string;
  shortLabel: string;
  icon?: string;
  startDate?: string;
  endDate?: string;
  resultsDate?: string;
  templateType: StepTemplateType;
  inProgressConfig?: {
    title: string;
    subtitle: string;
    message: string;
    scheduleInfo?: string;
    locationInfo?: string;
  };
  resultsConfig?: {
    title: string;
    subtitle: string;
    passedMessage?: string;
    waitlistMessage?: string;
    failedMessage?: string;
    newsUrl?: string;
    documentUrl?: string;
  };


}

export interface RegistrationPageConfigs {
  formDescriptionTitle?: string;
  formDescription?: string;
  formDescriptionItems?: string[];
  studentYears: string[];
  fieldStates: FieldStates;
  docLimits: DocumentLimits;
  piTemplateUrl: string;
  minReasonWords: number;
  openDateStr: string;
  deadlineStr: string;
  extendedDeadlineStr: string;
  autoCloseAfterDeadline: boolean;
  contactPersons: ContactPerson[];
  upcomingCfg: UpcomingConfig;
  extendedCfg: ExtendedConfig;
  selectionCfg: SelectionConfig;
  selectionResultsCfg: SelectionResultsConfig;
  technicalTestCfg: TechnicalTestConfig;
  technicalTestResultsCfg: TechnicalTestResultsConfig;
  interviewCfg: InterviewConfig;
  finalSelectionCfg: FinalSelectionConfig;
  announcementCfg: AnnouncementConfig;
  closedCfg: ClosedConfig;
  fallbackCfg: FallbackConfig;
  selectionSteps: SelectionStepConfig[];
}

export interface CandidateStepStatus {
  stepId: string;
  status: 'passed' | 'failed' | 'pending' | string;
  notes?: string;
}


export interface CandidateResult {
  nim: string;
  division?: string;
  stageStatuses?: CandidateStepStatus[];
  finalStatus?: string;
  notes?: string;
  [key: string]: any;
}

/** Homepage v2 — Antigravity Light */

export type PositionGroup = 'dosen' | 'asisten' | 'mahasiswa';

export interface Position {
  id: string;
  label: string;
  group: PositionGroup;
  order: number;
}

export interface PositionSection<T> {
  position: Position;
  people: T[];
}

export interface CourseModule {
  title: string;
  topics: string;
}

export interface CourseData {
  title: string;
  code: string;
  sks: number;
  semester?: number;
  hasPracticum: boolean;
  modules: CourseModule[];
  coordinatorId: string;
  assistantIds: number[];
  order: number;
}

export interface CourseView extends CourseData {
  id: string;
  coordinator: Lecturer | null;
  assistants: Member[];
}

export interface Member {
  id: number;
  name: string;
  role: string;
  image: string;
  scale?: string;
  position?: string;
}

export interface Lecturer {
  id: string;
  name: string;
  role: string;
  image: string;
  scale?: string;
  position?: string;
}

export interface HeroPortrait {
  name: string;
  image: string;
}

export interface DivisionSection {
  division: DivisionConfig;
  coordinator: Member | null;
  staff: Member[];
}

export interface GalleryItem {
  image: string;
  alt: string;
  caption: string;
}

export interface GalleryData {
  featured?: GalleryItem;
  photos?: GalleryItem[];
}

export interface ChromeData {
  nav: {
    home: string;
    about: string;
    structure: string;
    courses: string;
    event: string;
    news: string;
    register: string;
    contact: string;
    joinUs: string;
  };
  footer: {
    description: string;
    quickLinks: string;
    contact: string;
    resources: string;
    assets: string;
    linkHub: string;
    rights: string;
    backToTop: string;
  };
  cta: {
    title: string;
    description: string;
    contactLabel: string;
  };
  brand: {
    logoHorizontal: string;
    logoIcon: string;
  };
  labels: {
    upcoming: string;
    details: string;
    learnMore: string;
    statsDosen: string;
    statsMembers: string;
    statsCourses: string;
    organizerFallback: string;
    coordinator: string;
    sks: string;
    practicumYes: string;
    practicumNo: string;
    featured: string;
    search: string;
    close: string;
    vision: string;
    mission: string;
    values: string;
  };
}

export interface HomePageData {
  meta: {
    title: string;
    description?: string;
  };
  navDots: {
    reveal: string;
    focus: string;
    vision: string;
    courses: string;
    events: string;
    articles: string;
    sectionLabel: string;
  };
  hero: {
    kicker: string;
    lines: string[];
    description: string;
    primaryLabel: string;
    secondaryLabel: string;
  };
  reveal: {
    enabled: boolean;
    caption: string;
    pending: string;
    pendingCta: string;
  };
  focus: {
    enabled: boolean;
    title: string;
    intro: string;
    rows: { title: string; description: string }[];
  };
  visiMisi: {
    enabled: boolean;
    title: string;
  };
  numbers: {
    enabled: boolean;
    label: string;
    dosenValue?: number | null;
    membersValue?: number | null;
    coursesValue?: number | null;
  };
  courses: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    intro: string;
    link: string;
  };
  events: {
    enabled: boolean;
    title: string;
    intro: string;
    empty: string;
    viewAll: string;
  };
  news: {
    enabled: boolean;
    title: string;
    intro: string;
    empty: string;
    viewAll: string;
  };
  cta: {
    enabled: boolean;
  };
}

export interface AboutData {
  title: string;
  description: string;
  overviewTitle: string;
  overviewContent1: string;
  overviewContent2: string;
  overviewImage: string;
  vision: string;
  missions: string[];
  values: { title: string; description: string; icon: string; isAccent?: boolean }[];
  meta: {
    title: string;
  };
  sectionLabel: string;
  navDots: {
    profile: string;
    stats: string;
    vision: string;
    cta: string;
    gallery: string;
  };
  sections: {
    hero: {
      eyebrow: string;
      lines: string[];
      description: string;
      meta: string;
      primaryLabel: string;
      secondaryLabel: string;
    };
    profile: {
      enabled: boolean;
      eyebrow: string;
      factsLabel: string;
      factName: string;
      factFaculty: string;
      factFacultyValue: string;
      factProgram: string;
      factProgramValue: string;
      factLocation: string;
      factEmail: string;
    };
    stats: {
      enabled: boolean;
      label: string;
      dosenValue?: number | null;
      membersValue?: number | null;
      coursesValue?: number | null;
    };
    teamLink: {
      enabled: boolean;
      label: string;
    };
    galleryBand: {
      enabled: boolean;
      label: string;
    };
    visiMisi: {
      enabled: boolean;
      heading: string;
    };
    gallery: {
      enabled: boolean;
      eyebrow: string;
      intro: string;
      title: string;
      showAll: string;
      hideAll: string;
    };
    cta: {
      enabled: boolean;
    };
  };
}


