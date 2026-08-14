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
  portofolio?: FieldState;
}

export interface RecruitmentConfig {
  status?: string;
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


