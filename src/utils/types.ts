/**
 * Type definitions for recruitment stages and utilities.
 */

export type RecruitmentStage =
  | 'closed'
  | 'upcoming'
  | 'open'
  | 'extended'
  | 'selection'
  | 'selection_results'
  | 'technical_test'
  | 'technical_test_results'
  | 'interview'
  | 'announcement';

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

export interface AnnouncementConfig {
  title: string;
  subtitle: string;
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

export interface RecruitmentConfig {
  status?: string;
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
  studentYears?: string[];
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
  announcementConfig?: AnnouncementConfig;
  closedConfig?: ClosedConfig;
  fallbackConfig?: FallbackConfig;
}

export interface RegistrationPageConfigs {
  studentYears: string[];
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
  announcementCfg: AnnouncementConfig;
  closedCfg: ClosedConfig;
  fallbackCfg: FallbackConfig;
}
