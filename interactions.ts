export interface Choice {
  type: string
  "nextId": string
}

export interface Interaction {
  id: string
  type: string
  maxDuration: number
  nextId?: string
  timeoutId?: string
  text?: string
  choices?: Choice[]   // Only for type: "multiple-choice"
  checkpoint?: boolean // Checkpoint marker (optional, default false)
}

// Type for the raw interaction data from JSON (without id)
export interface RawInteraction {
  type: string
  duration: number
  nextId?: string
  timeoutId?: string
  text?: string
  choices?: Choice[]
  checkpoint?: boolean
}

// Type for the interactions object structure in JSON
export interface InteractionsData {
  interactions: Record<string, RawInteraction>
}
