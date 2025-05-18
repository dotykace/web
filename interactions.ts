export interface Choice {
  type: string
  "next-id": string
}

export interface Interaction {
  id: string
  type: string
  duration: number
  "next-id"?: string
  "timeout-id"?: string
  text?: string
  answer?: string // For input type interactions
  choices?: Choice[]
  [key: string]: any // For additional attributes
}
