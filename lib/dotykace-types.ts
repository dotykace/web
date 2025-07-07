export interface DotykaceUser {
    id: string
    username: string
    password: string
    role: "admin" | "user"
    createdAt: any
}

export interface DotykaceRoom {
    id: string
    docId?: string
    name: string
    adminId: string
    isActive: boolean
    isStarted: boolean
    createdAt: any
    participants: DotykaceParticipant[]
}

export interface DotykaceParticipant {
    id: string
    name: string
    roomId: string
    joinedAt: any
    responses?: DotykaceUserResponses
}

export interface DotykaceUserResponses {
    isComplete: boolean
}
