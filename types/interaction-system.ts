export interface Choice {
    type: string
    nextId: string
}

export interface Interaction {
    id: string
    type: string
    maxDuration: number
    nextId?: string
    timeoutId?: string
    text?: string
    choices?: Choice[] // Only for type: "multiple-choice"
    emojis?: string[] // For emoji-related interactions
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
    emojis?: string[]
    checkpoint?: boolean
}

// Type for the interactions object structure in JSON
export interface InteractionsData {
    interactions: Record<string, RawInteraction>
}

// Flow definition
export interface InteractionFlow {
    id: string
    name: string
    description?: string
    version: string
    startInteractionId: string
    interactions: Record<string, Interaction>
}

// State management
export interface InteractionState {
    currentInteractionId: string | null
    history: string[]
    variables: Record<string, any>
}

// Context for renderers
export interface InteractionContext {
    state: InteractionState
    flow: InteractionFlow
    onInteractionComplete: (interactionId: string, result?: any) => void
    onVariableChange: (variable: string, value: any) => void
}
