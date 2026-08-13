import type { RecruitmentStage, StageActionConfig } from './types';

export type { StageActionConfig };

/**
 * Global default timezone offset (WIB UTC+07:00).
 */
export const DEFAULT_TIMEZONE_OFFSET = "+07:00";

/**
 * Default fallback dates for recruitment lifecycle stages.
 */
export const DEFAULT_RECRUITMENT_DATES = {
  upcomingStartDate: "2026-08-01T00:00:00",
  openDate: "2026-08-13T00:00:00",
  deadline: "2026-08-20T23:59:59",
  extendedDeadline: "2026-08-23T23:59:59",
  selectionResultsDate: "2026-08-26T00:00:00",
  technicalTestStartDate: "2026-08-29T00:00:00",
  technicalTestEndDate: "2026-08-30T23:59:59",
  interviewStartDate: "2026-09-05T00:00:00",
  interviewEndDate: "2026-09-06T23:59:59",
  announcementDate: "2026-09-09T00:00:00",
} as const;

/**
 * Default fallback cover image for events and news items when no specific image is provided.
 */
export const DEFAULT_COVER_IMAGE = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600";

/**
 * Action button configuration for hero section based on current recruitment stage.
 */
export const STAGE_ACTION_CONFIG: Record<RecruitmentStage, StageActionConfig> = {
  closed: { label: 'Recruitment Info', icon: 'fa-info-circle' },
  upcoming: { label: 'Recruitment Opening Soon', icon: 'fa-clock' },
  open: { label: 'Register as Assistant Now', icon: 'fa-user-plus' },
  extended: { label: 'Register as Assistant Now', icon: 'fa-user-plus' },
  selection: { label: 'Check Screening Status', icon: 'fa-spinner' },
  selection_results: { label: 'Check Screening Results', icon: 'fa-square-poll-vertical' },
  technical_test: { label: 'Check Technical Test Info', icon: 'fa-laptop-code' },
  technical_test_results: { label: 'Check Technical Test Results', icon: 'fa-square-poll-vertical' },
  interview: { label: 'Check Interview Info', icon: 'fa-comments' },
  announcement: { label: 'Check Final Results', icon: 'fa-award' },
};

export const DEFAULT_ACTION_BTN: StageActionConfig = {
  label: 'Recruitment Information',
  icon: 'fa-info-circle',
};
