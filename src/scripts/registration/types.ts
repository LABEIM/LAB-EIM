export interface DocCheckItem {
  input: HTMLInputElement | null;
  label: string;
  defaultMax: number;
}

export interface RegistrationContext {
  container: HTMLElement;
  formElement: HTMLFormElement | null;
  submitBtn: HTMLButtonElement | null;
  btnText: HTMLElement | null;
  alertError: HTMLElement | null;
  alertSuccess: HTMLElement | null;
  div1Select: HTMLSelectElement | null;
  div2Select: HTMLSelectElement | null;
  medhumPortoContainer: HTMLElement | null;
  medhumPortoInput: HTMLInputElement | null;
  clearDraftModal: HTMLElement | null;
  draftToast: HTMLElement | null;
  progressModal: HTMLElement | null;
  portfolioTriggerList: string[];
  minReasonWords: number;
  scriptUrl?: string;
  secretToken?: string;
}
