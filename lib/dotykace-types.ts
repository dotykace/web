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
    createdAt: Timestamp | Date
    participants: DotykaceParticipant[]
    chapterPermissions?: ChapterPermissions
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
    phoneUsage?: {
        question1: string
        question2: string
        question3: string
    }
    experienceRating?: {
        question1: string
        question2: string
    }
}

export interface ChapterPermissions {
    [playerId: string]: {
        allowedChapters: number[]
        playerName: string
    }
}

// Helper type for chapter titles
export type ChapterNumber = 0 | 1 | 2 | 3 | 4

export const CHAPTER_TITLES: Record<ChapterNumber, string> = {
    0: "Introduction",
    1: "Place & Touch",
    2: "Mental & Physical Habits",
    3: "Relationships",
    4: "Advanced Relationships",
} as const
