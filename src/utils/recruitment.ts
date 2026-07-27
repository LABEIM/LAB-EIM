export function getCurrentRecruitmentStage(config: Record<string, any>): string {
  let stage = config.status || "auto";
  if (stage !== "auto") {
    return stage;
  }

  const upcomingStartDateStr = config.upcomingStartDate || "2026-08-01T00:00:00";
  const openDateStr = config.openDate || "2026-08-13T00:00:00";
  const deadlineStr = config.deadline || "2026-08-20T23:59:59";
  const extendedDeadlineStr = config.extendedDeadline || "2026-08-23T23:59:59";
  const selectionResultsDateStr = config.selectionResultsDate || "2026-08-26T00:00:00";
  const technicalTestStartDateStr = config.technicalTestStartDate || "2026-08-29T00:00:00";
  const technicalTestEndDateStr = config.technicalTestEndDate || "2026-08-30T23:59:59";
  const interviewStartDateStr = config.interviewStartDate || "2026-09-05T00:00:00";
  const interviewEndDateStr = config.interviewEndDate || "2026-09-06T23:59:59";
  const announcementDateStr = config.announcementDate || "2026-09-09T00:00:00";

  const nowTime = new Date().getTime();
  const upcomingStartTime = new Date(upcomingStartDateStr).getTime();
  const openTime = new Date(openDateStr).getTime();
  const deadlineTime = new Date(deadlineStr).getTime();
  const extendedTime = extendedDeadlineStr ? new Date(extendedDeadlineStr).getTime() : 0;
  const selectionResultsTime = new Date(selectionResultsDateStr).getTime();
  const technicalTestStartTime = new Date(technicalTestStartDateStr).getTime();
  const technicalTestEndTime = new Date(technicalTestEndDateStr).getTime();
  const interviewStartTime = new Date(interviewStartDateStr).getTime();
  const interviewEndTime = new Date(interviewEndDateStr).getTime();
  const announcementTime = new Date(announcementDateStr).getTime();

  if (nowTime < upcomingStartTime) {
    return "closed";
  } else if (nowTime < openTime) {
    return "upcoming";
  } else if (nowTime < deadlineTime) {
    return "open";
  } else if (extendedTime > 0 && nowTime < extendedTime) {
    return "extended";
  } else if (nowTime < selectionResultsTime) {
    return "selection";
  } else if (nowTime < technicalTestStartTime) {
    return "selection_results";
  } else if (nowTime <= technicalTestEndTime) {
    return "technical_test";
  } else if (nowTime < interviewStartTime) {
    return "technical_test_results";
  } else if (nowTime <= interviewEndTime) {
    return "interview";
  } else if (nowTime >= announcementTime) {
    return "announcement";
  } else {
    return "closed";
  }
}
