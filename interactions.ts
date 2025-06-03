export interface Choice {
  type: string
  "next-id": string
}

export interface Interaction {
  id: string
  type: "message" | "input" | "multiple-choice" | "animation" | "notification"
  duration: number
  "next-id"?: string
  "timeout-id"?: string
  text?: string
  answer?: string      // Only for type: "input"
  choices?: Choice[]   // Only for type: "multiple-choice"
  checkpoint?: boolean // Checkpoint marker (optional, default false)
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
  checkpoint?: boolean
}

// Type for the interactions object structure in JSON
export interface InteractionsData {
  interactions: Record<string, RawInteraction>
}
