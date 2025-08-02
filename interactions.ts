export interface Choice {
  type: string
  "next-id": string
}

export interface Interaction {
  id: string
  type: "message" | "input" | "multiple-choice" | "animation" | "notification" | "user-message"
  duration: number
  "next-id"?: string
  "timeout-id"?: string
  text?: string
  answer?: string // For input type interactions
  choices?: Choice[]
  [key: string]: any // For additional attributes
  face?: string // For doty's face
}

// Type for the raw interaction data from JSON (without id)
export interface RawInteraction {
  type: "message" | "input" | "multiple-choice" | "animation" | "notification"
  duration: number
  "next-id"?: string
  "timeout-id"?: string
  text?: string
  answer?: string
  choices?: Choice[]
  [key: string]: any
}

export type InteractionRecord = Record<string, RawInteraction>;
// Type for the interactions object structure in JSON
export interface InteractionsData {
  interactions: InteractionRecord
}

// Props types for components
export interface ChatProps {
  history: Interaction[]
  processText: (text: string | undefined) => string
  currentInteraction: Interaction | null
  goToNextInteraction: (nextId: string) => void
}

export interface InputAreaProps {
  currentInteraction: Interaction | null
  goToNextInteraction: (nextId: string) => void
}

export interface CardSequenceProps {
  currentInteraction: Interaction | null
  history: Interaction[]
  goToNextInteraction: (nextId: string) => void
  processText: (text: string | undefined) => string
}

export interface ProcessedInteraction extends Omit<RawInteraction, "text"> {
  id: string
  text: () => string
}
