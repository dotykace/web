import type { Timestamp } from "firebase/firestore"

export interface DotykaceUser {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  createdAt: Timestamp | Date
}

export interface DotykaceRoom {
  id: string
  docId?: string
  name: string
  adminId: string
  isActive: boolean
  isStarted: boolean
  showVideo: boolean
  createdAt: Timestamp | Date
  chapterPermissions?: ChapterPermissions
  globalUnlockedChapters?: number[] // Nové pole pre sledovanie globálne odomknutých kapitol
}

export interface DotykaceParticipant {
  id: string
  name: string
  roomId: string
  joinedAt: Timestamp | Date
  responses?: DotykaceUserResponses
  currentChapter?: number
  completedChapters?: number[]
}

export interface DotykaceUserResponses {
  isComplete: boolean
  botName?: string
  userName?: string
  voiceOption: string
}

export interface ChapterPermissions {
  [playerId: string]: {
    allowedChapters: number[]
    playerName: string
  }
}
