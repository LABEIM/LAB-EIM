import type { SelectionStepConfig } from './types';

export interface SimulationParams {
  active: boolean;
  intervalSec: number;
  startTimeMs: number;
  forcedStage?: string | null;
}

export const SIMULATION_STORAGE_KEY = 'eim_recruitment_sim_config';

export function formatMsToLocalIso(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function generateSimulationTimestamps(
  intervalSec: number = 30,
  startTimeMs: number = Date.now(),
  selectionSteps: SelectionStepConfig[] = []
) {
  const intervalMs = intervalSec * 1000;
  let cursor = startTimeMs + 2000; // Opens in 2s

  const upcomingStartDateMs = startTimeMs - 1000;
  const openDateMs = cursor;

  cursor += intervalMs;
  const deadlineMs = cursor;

  cursor += intervalMs;
  const extendedDeadlineMs = cursor;

  const stepsSim: Record<string, { startDate: string; endDate: string; resultsDate?: string }> = {};

  const enabledSteps = (selectionSteps || []).filter((s) => s.enabled !== false);

  if (enabledSteps.length > 0) {
    enabledSteps.forEach((step) => {
      const stepStart = cursor;
      cursor += intervalMs;
      const stepEnd = cursor;

      let stepResults: number | undefined;
      // Only allocate a resultsDate window if the original step has a resultsDate defined
      if (step.resultsDate) {
        cursor += intervalMs;
        stepResults = cursor;
      }

      stepsSim[step.id] = {
        startDate: formatMsToLocalIso(stepStart),
        endDate: formatMsToLocalIso(stepEnd),
        resultsDate: stepResults ? formatMsToLocalIso(stepResults) : undefined,
      };
    });
  } else {
    // Fallback standard steps
    const defaultSteps = [
      { id: 'selection', hasResults: true },
      { id: 'technical_test', hasResults: true },
      { id: 'interview', hasResults: false },
      { id: 'final_selection', hasResults: false },
    ];
    defaultSteps.forEach((st) => {
      const stepStart = cursor;
      cursor += intervalMs;
      const stepEnd = cursor;
      let stepResults: number | undefined;
      if (st.hasResults) {
        cursor += intervalMs;
        stepResults = cursor;
      }

      stepsSim[st.id] = {
        startDate: formatMsToLocalIso(stepStart),
        endDate: formatMsToLocalIso(stepEnd),
        resultsDate: stepResults ? formatMsToLocalIso(stepResults) : undefined,
      };
    });
  }

  const announcementDateMs = cursor;

  return {
    upcomingStartDate: formatMsToLocalIso(upcomingStartDateMs),
    openDate: formatMsToLocalIso(openDateMs),
    deadline: formatMsToLocalIso(deadlineMs),
    extendedDeadline: formatMsToLocalIso(extendedDeadlineMs),
    announcementDate: formatMsToLocalIso(announcementDateMs),
    steps: stepsSim,
  };
}

export function applySimulationToConfig(
  originalConfig: any,
  intervalSec: number = 30,
  startTimeMs: number = Date.now(),
  forcedStage?: string | null
): any {
  if (!originalConfig) return originalConfig;
  const rawSteps = originalConfig.selectionSteps || [];
  const sim = generateSimulationTimestamps(intervalSec, startTimeMs, rawSteps);

  const updatedConfig = JSON.parse(JSON.stringify(originalConfig));
  updatedConfig.status = forcedStage || 'auto';
  updatedConfig.upcomingStartDate = sim.upcomingStartDate;
  updatedConfig.openDate = sim.openDate;
  updatedConfig.deadline = sim.deadline;
  updatedConfig.extendedDeadline = sim.extendedDeadline;
  updatedConfig.announcementDate = sim.announcementDate;

  if (Array.isArray(updatedConfig.selectionSteps)) {
    updatedConfig.selectionSteps = updatedConfig.selectionSteps.map((step: any) => {
      const stepSim = (sim.steps as any)[step.id];
      if (stepSim) {
        return {
          ...step,
          startDate: stepSim.startDate || step.startDate,
          endDate: stepSim.endDate || step.endDate,
          resultsDate: stepSim.resultsDate ? stepSim.resultsDate : (step.resultsDate ? stepSim.endDate : undefined),
        };
      }
      return step;
    });
  }

  return updatedConfig;
}
