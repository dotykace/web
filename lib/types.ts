export interface User {
    id: string
    username: string
    password: string
    role: "admin" | "user"
    createdAt: any
}

export interface Room {
    id: string
    docId?: string // Pridajte toto pole
    name: string
    adminId: string
    isActive: boolean
    isStarted: boolean
    createdAt: any
    participants: Participant[]
}

export interface Participant {
    id: string
    name: string
    roomId: string
    joinedAt: any
    responses?: UserResponses
}

export interface UserResponses {
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
    isComplete: boolean
}
