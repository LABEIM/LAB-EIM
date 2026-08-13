import type { RecruitmentConfig, RecruitmentStage } from './types';
import { DEFAULT_RECRUITMENT_DATES } from './constants';
import { parseGlobalDateStr, GLOBAL_SITE_TIMEZONE_OFFSET } from './date';

export type { RecruitmentConfig, RecruitmentStage };

/**
 * Helper to parse date string with fallback timezone offset (default +07:00 WIB) if offset is not specified in string.
 */
export function parseConfigDateStr(dateStr?: string, offset: string = GLOBAL_SITE_TIMEZONE_OFFSET): number {
  return parseGlobalDateStr(dateStr, offset);
}

/**
 * Calculates the current recruitment lifecycle stage based on system dates or explicit status override.
 */
export function getCurrentRecruitmentStage(
  config: Partial<RecruitmentConfig> | Record<string, any>
): RecruitmentStage {
  const rawStatus = (config?.status as string) || 'auto';
  if (rawStatus !== 'auto' && rawStatus in STAGE_VALIDATOR) {
    return rawStatus as RecruitmentStage;
  }

  const offset = (config as any)?.timezoneOffset || GLOBAL_SITE_TIMEZONE_OFFSET;

  const upcomingStartDateStr = config.upcomingStartDate || DEFAULT_RECRUITMENT_DATES.upcomingStartDate;
  const openDateStr = config.openDate || DEFAULT_RECRUITMENT_DATES.openDate;
  const deadlineStr = config.deadline || DEFAULT_RECRUITMENT_DATES.deadline;
  const extendedDeadlineStr = config.extendedDeadline || DEFAULT_RECRUITMENT_DATES.extendedDeadline;
  const selectionResultsDateStr = config.selectionResultsDate || DEFAULT_RECRUITMENT_DATES.selectionResultsDate;
  const technicalTestStartDateStr = config.technicalTestStartDate || DEFAULT_RECRUITMENT_DATES.technicalTestStartDate;
  const technicalTestEndDateStr = config.technicalTestEndDate || DEFAULT_RECRUITMENT_DATES.technicalTestEndDate;
  const interviewStartDateStr = config.interviewStartDate || DEFAULT_RECRUITMENT_DATES.interviewStartDate;
  const interviewEndDateStr = config.interviewEndDate || DEFAULT_RECRUITMENT_DATES.interviewEndDate;
  const announcementDateStr = config.announcementDate || DEFAULT_RECRUITMENT_DATES.announcementDate;

  const nowTime = new Date().getTime();
  const upcomingStartTime = parseConfigDateStr(upcomingStartDateStr, offset);
  const openTime = parseConfigDateStr(openDateStr, offset);
  const deadlineTime = parseConfigDateStr(deadlineStr, offset);
  const extendedTime = extendedDeadlineStr ? parseConfigDateStr(extendedDeadlineStr, offset) : 0;
  const selectionResultsTime = parseConfigDateStr(selectionResultsDateStr, offset);
  const technicalTestStartTime = parseConfigDateStr(technicalTestStartDateStr, offset);
  const technicalTestEndTime = parseConfigDateStr(technicalTestEndDateStr, offset);
  const interviewStartTime = parseConfigDateStr(interviewStartDateStr, offset);
  const interviewEndTime = parseConfigDateStr(interviewEndDateStr, offset);
  const announcementTime = parseConfigDateStr(announcementDateStr, offset);

  if (nowTime < upcomingStartTime) {
    return 'closed';
  } else if (nowTime < openTime) {
    return 'upcoming';
  } else if (nowTime < deadlineTime) {
    return 'open';
  } else if (extendedTime > 0 && nowTime < extendedTime) {
    return 'extended';
  } else if (nowTime < selectionResultsTime) {
    return 'selection';
  } else if (nowTime < technicalTestStartTime) {
    return 'selection_results';
  } else if (nowTime <= technicalTestEndTime) {
    return 'technical_test';
  } else if (nowTime < interviewStartTime) {
    return 'technical_test_results';
  } else if (nowTime <= interviewEndTime) {
    return 'interview';
  } else if (nowTime >= announcementTime) {
    return 'announcement';
  } else {
    return 'closed';
  }
}

const STAGE_VALIDATOR: Record<RecruitmentStage, boolean> = {
  closed: true,
  upcoming: true,
  open: true,
  extended: true,
  selection: true,
  selection_results: true,
  technical_test: true,
  technical_test_results: true,
  interview: true,
  announcement: true,
};
