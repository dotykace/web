// Chapter 2 Constants

// Timing constants (in milliseconds unless noted)
export const TYPING_SPEED_MS = 30;
export const DEFAULT_DURATION_SECONDS = 3;
export const BUTTON_SHOW_DELAY_MS = 500;

// LocalStorage keys
export const CHAPTER2_PROGRESS_KEY = "chapter2_progress";

// Interfaces
export interface Chapter2Progress {
  currentInteractionId: string;
  savedUserMessage: string;
  hasStartedExperience: boolean;
}

export interface Interaction {
  type: string;
  text?: string;
  duration?: number;
  "next-id"?: string;
  animation?: {
    type: string;
    buttons: Array<{
      label: string;
      "next-id": string;
    }>;
  };
  src?: string;
  sound?: string;
  loop?: boolean;
  forever?: boolean;
  label?: string;
  "save-label"?: string;
  "warning-after"?: number;
  "warning-text"?: string;
  "countdown-last"?: number;
  pause?: number;
  button?: {
    label: string;
    "next-id": string;
    persistent?: boolean;
    "show-after-first-play"?: boolean;
    wait_to_show?: number;
  };
  source?: string;
}

export interface FlowData {
  id: string;
  startInteractionId: string;
  interactions: Record<string, Interaction>;
}
