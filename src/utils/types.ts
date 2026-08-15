/**
 * Type definitions for recruitment stages and utilities.
 */

export type RecruitmentStage =
  | 'closed'
  | 'upcoming'
  | 'open'
  | 'extended'
  | 'announcement'
  | 'fallback'
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

export type DynamicFormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'time'
  | 'email'
  | 'tel'
  | 'url'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file';

export type DynamicFieldValidationState = 'required' | 'optional' | 'disabled';

export interface DynamicFormFieldConfig {
  id: string;
  label: string;
  type: DynamicFormFieldType;
  placeholder?: string;
  description?: string;
  sectionId?: string;
  validationState: DynamicFieldValidationState;
  fullWidth?: boolean;
  options?: string[];
  acceptExtensions?: string;
  maxMb?: number;
  minWords?: number;
  templateUrl?: string;
  templateLabel?: string;
  conditionalTrigger?: {
    fieldId: string;
    operator: 'equals' | 'includes' | 'not_equals';
    value: string;
  };
}

export interface DynamicFormSectionConfig {
  id: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface RecruitmentConfig {
  formType?: 'recruitment' | 'event' | 'generic';
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
  successMessage?: string;
  studentYears?: string[];
  portfolioDivisionTriggerValues?: string;
  formSections?: DynamicFormSectionConfig[];
  formFields?: DynamicFormFieldConfig[];
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
  formType: 'recruitment' | 'event' | 'generic';
  formDescriptionTitle?: string;
  formDescription?: string;
  formDescriptionItems?: string[];
  successMessage?: string;
  studentYears: string[];
  formSections: DynamicFormSectionConfig[];
  formFields: DynamicFormFieldConfig[];
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

export interface EventData {
  title: string;
  category?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
  event_date?: string;
  open_date?: string;
  deadline?: string;
  description?: string;
  link?: string;
  poster?: string;
  image?: string[];
  icon?: string;
  organizer?: string;
  benefits?: string[];
  requirements?: string[];
  show_register?: boolean;
  audit?: boolean;
  success_message?: string;
  formSections?: DynamicFormSectionConfig[];
  formFields?: DynamicFormFieldConfig[];
}



