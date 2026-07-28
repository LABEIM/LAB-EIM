/**
 * Default fallback cover image for events and news items when no specific image is provided.
 */
export const DEFAULT_COVER_IMAGE = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600";

/**
 * Action button configuration for hero section based on current recruitment stage.
 */
export interface StageActionConfig {
  label: string;
  icon: string;
}

export const STAGE_ACTION_CONFIG: Record<string, StageActionConfig> = {
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
