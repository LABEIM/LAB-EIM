import type { RecruitmentConfig, RecruitmentStage } from './types';
import { DEFAULT_RECRUITMENT_DATES } from './constants';
import { parseGlobalDateStr, GLOBAL_SITE_TIMEZONE_OFFSET } from './date';
import { getRegistrationPageConfigs } from './registration-config';

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
): RecruitmentStage | string {
  const pageConfigs = getRegistrationPageConfigs(config || {});
  const rawStatus = (config?.status as string) || 'auto';
  const rawSteps = pageConfigs.selectionSteps;

  if (rawStatus !== 'auto') {
    const matchedStep = rawSteps.find((s: any) => rawStatus === s.id || rawStatus === `${s.id}_results`);
    if (matchedStep && matchedStep.enabled === false) {
      // Overridden step is disabled -> fallback to last enabled step before it
      const stepIdx = rawSteps.findIndex((s: any) => s.id === matchedStep.id);
      let fallbackStage = '';
      for (let i = stepIdx - 1; i >= 0; i--) {
        if (rawSteps[i].enabled !== false) {
          fallbackStage = rawSteps[i].resultsDate ? `${rawSteps[i].id}_results` : rawSteps[i].id;
          break;
        }
      }
      if (fallbackStage) {
        return fallbackStage;
      }
      // If no prior enabled step, proceed to date calculation below
    } else {
      return rawStatus;
    }
  }

  const offset = (config as any)?.timezoneOffset || GLOBAL_SITE_TIMEZONE_OFFSET;


  const upcomingStartDateStr = config.upcomingStartDate || DEFAULT_RECRUITMENT_DATES.upcomingStartDate;
  const openDateStr = config.openDate || DEFAULT_RECRUITMENT_DATES.openDate;
  const deadlineStr = config.deadline || DEFAULT_RECRUITMENT_DATES.deadline;
  const extendedDeadlineStr = config.extendedDeadline || DEFAULT_RECRUITMENT_DATES.extendedDeadline;
  const announcementDateStr = config.announcementDate || DEFAULT_RECRUITMENT_DATES.announcementDate;

  const nowTime = new Date().getTime();
  const upcomingStartTime = parseConfigDateStr(upcomingStartDateStr, offset);
  const openTime = parseConfigDateStr(openDateStr, offset);
  const deadlineTime = parseConfigDateStr(deadlineStr, offset);
  const extendedTime = extendedDeadlineStr ? parseConfigDateStr(extendedDeadlineStr, offset) : 0;
  const announcementTime = parseConfigDateStr(announcementDateStr, offset);

  if (upcomingStartTime > 0 && nowTime < upcomingStartTime) {
    return 'closed';
  } else if (openTime > 0 && nowTime < openTime) {
    return 'upcoming';
  } else if (deadlineTime > 0 && nowTime < deadlineTime) {
    return 'open';
  } else if (extendedTime > 0 && nowTime < extendedTime) {
    return 'extended';
  }

  // Non-recruitment forms (event / generic) close after deadline
  if (pageConfigs.formType !== 'recruitment') {
    return 'closed';
  }

  // Dynamic Selection Steps Evaluation
  const enabledSteps = rawSteps.filter((s: any) => s.enabled !== false);


  if (enabledSteps.length > 0) {
    for (let i = 0; i < enabledSteps.length; i++) {
      const step = enabledSteps[i];
      const stepStartTime = step.startDate ? parseConfigDateStr(step.startDate, offset) : 0;
      const stepEndTime = step.endDate ? parseConfigDateStr(step.endDate, offset) : 0;
      const stepResultsTime = step.resultsDate ? parseConfigDateStr(step.resultsDate, offset) : 0;

      // In-Progress phase (between startDate and endDate)
      if (stepEndTime > 0 && nowTime <= stepEndTime) {
        // If before start date of this step but past deadline, we are waiting or showing previous results
        if (stepStartTime > 0 && nowTime < stepStartTime && i > 0) {
          const prevStep = enabledSteps[i - 1];
          return prevStep.resultsDate ? `${prevStep.id}_results` : prevStep.id;
        }
        return step.id;
      }

      // Results phase (between endDate and resultsDate, or before next step start)
      if (stepResultsTime > 0 && nowTime < stepResultsTime) {
        return `${step.id}_results`;
      }

      // Check if current time falls into the window between end/results date and next step start
      const nextStep = enabledSteps[i + 1];
      if (nextStep && nextStep.startDate) {
        const nextStartTime = parseConfigDateStr(nextStep.startDate, offset);
        if (nowTime < nextStartTime) {
          return `${step.id}_results`;
        }
      }
    }
  } else {
    // Fallback static stage evaluation
    const selectionResultsTime = parseConfigDateStr(config.selectionResultsDate || DEFAULT_RECRUITMENT_DATES.selectionResultsDate, offset);
    const technicalTestStartTime = parseConfigDateStr(config.technicalTestStartDate || DEFAULT_RECRUITMENT_DATES.technicalTestStartDate, offset);
    const technicalTestEndTime = parseConfigDateStr(config.technicalTestEndDate || DEFAULT_RECRUITMENT_DATES.technicalTestEndDate, offset);
    const interviewStartTime = parseConfigDateStr(config.interviewStartDate || DEFAULT_RECRUITMENT_DATES.interviewStartDate, offset);
    const interviewEndTime = parseConfigDateStr(config.interviewEndDate || DEFAULT_RECRUITMENT_DATES.interviewEndDate, offset);

    if (nowTime < selectionResultsTime) return 'selection';
    if (nowTime < technicalTestStartTime) return 'selection_results';
    if (nowTime <= technicalTestEndTime) return 'technical_test';
    if (nowTime < interviewStartTime) return 'technical_test_results';
    if (nowTime <= interviewEndTime) return 'interview';
  }

  if (announcementTime > 0 && nowTime >= announcementTime) {
    return 'announcement';
  }

  // If past all step deadlines but before final announcement, return 'final_selection'
  return announcementTime > 0 && nowTime < announcementTime
    ? 'final_selection'
    : 'announcement';
}


