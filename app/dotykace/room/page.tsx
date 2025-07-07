"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom, DotykaceParticipant } from "@/lib/dotykace-types"
import { useRouter } from "next/navigation"
import { Clock, Users } from "lucide-react"

export default function DotykaceRoomPage() {
    const [room, setRoom] = useState<DotykaceRoom | null>(null)
    const [playerName, setPlayerName] = useState("")
    const [roomId, setRoomId] = useState("")
    const [hasStarted, setHasStarted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const storedPlayerName = localStorage.getItem("dotykace_playerName")
        const storedRoomId = localStorage.getItem("dotykace_roomId")

        if (!storedPlayerName || !storedRoomId) {
            router.push("/") // Zmenené z "/dotykace" na "/"
            return
        }

        setPlayerName(storedPlayerName)
        setRoomId(storedRoomId)

        // Listen to room changes using Firestore real-time listener
        const roomRef = doc(db, "rooms", storedRoomId)
        const unsubscribe = onSnapshot(
            roomRef,
            (doc) => {
                if (doc.exists()) {
                    const roomData = doc.data() as DotykaceRoom
                    setRoom(roomData)

                    // Check if player is already in participants
                    const existingParticipant = roomData.participants?.find((p) => p.name === storedPlayerName)
                    if (!existingParticipant) {
                        addPlayerToRoom(storedRoomId, storedPlayerName)
                    }

                    // Check if game started and redirect to TouchThePhone
                    if (roomData.isStarted && !hasStarted) {
                        setHasStarted(true)
                        // Uložiť meno hráča do TouchThePhone localStorage
                        localStorage.setItem("userName", storedPlayerName)
                        // Presmerovať na intro kapitolu TouchThePhone
                        router.push("/chapter/0")
                    }
                } else {
                    console.error("Room not found:", storedRoomId)
                    router.push("/") // Zmenené z "/dotykace" na "/"
                }
            },
            (error) => {
                console.error("Error listening to room:", error)
                router.push("/") // Zmenené z "/dotykace" na "/"
            },
        )

        return () => unsubscribe()
    }, [router, hasStarted])

    const addPlayerToRoom = async (roomId: string, playerName: string) => {
        try {
            const roomRef = doc(db, "rooms", roomId)
            const newParticipant: DotykaceParticipant = {
                id: Date.now().toString(),
                name: playerName,
                roomId,
                joinedAt: new Date(),
                responses: {
                    isComplete: false,
                },
            }

            await updateDoc(roomRef, {
                participants: arrayUnion(newParticipant),
            })
        } catch (error) {
            console.error("Error adding player to room:", error)
        }
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center">
                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-4">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                            ^_^
                        </div>
                        <CardTitle className="text-xl text-gray-900">{room.name}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            {room.participants?.length || 0} účastníkov
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Waiting Screen */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                    <CardContent className="text-center py-12">
                        <Clock className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Čakáme na začiatok</h3>
                        <p className="text-gray-600 mb-4">Administrátor ešte nespustil TouchThePhone zážitok</p>
                        <div className="text-sm text-gray-500">
                            Pripojený ako: <span className="font-semibold">{playerName}</span>
                        </div>

                        {/* Show participants list */}
                        {room.participants && room.participants.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Pripojení hráči:</h4>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {room.participants.map((participant, index) => (
                                        <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                            {participant.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
