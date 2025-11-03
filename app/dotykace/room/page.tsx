"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {doc, onSnapshot, setDoc} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom, DotykaceParticipant } from "@/lib/dotykace-types"
import { useRouter } from "next/navigation"
import { Clock } from "lucide-react"
import {readFromStorage} from "@/scripts/local-storage";

import DotykaceLogo from "@/components/DotykaceLogo";

export default function DotykaceRoomPage() {
    const [room, setRoom] = useState<DotykaceRoom | null>(null)
    const [connectionError, setConnectionError] = useState(false)
    const hasAddedPlayer = useRef(false)
    const router = useRouter()

    useEffect(() => {
        const storedPlayerName = localStorage.getItem("dotykace_playerName")
        const storedRoomId = localStorage.getItem("dotykace_roomId")
        const storedPlayerId = localStorage.getItem("dotykace_playerId")

        if (!storedPlayerName || !storedRoomId) {
            router.push("/")
            return
        }

        const roomRef = doc(db, "rooms", storedRoomId)
        const unsubscribe = onSnapshot(
            roomRef,
            (doc) => {
                if (doc.exists()) {
                    const roomData = doc.data() as DotykaceRoom
                    setRoom(roomData)
                    setConnectionError(false)

                    // Skontroluj či hráč už existuje v miestnosti
                    const existingParticipant = roomData.participants?.find(
                        (p) => p.id === storedPlayerId || p.name === storedPlayerName,
                    )

                    // Pridaj hráča len ak neexistuje a ešte nebol pridaný
                    if (!existingParticipant && !hasAddedPlayer.current) {
                        hasAddedPlayer.current = true
                        addPlayerToRoom(storedRoomId, storedPlayerName)
                    }

                    // Ak sa miestnosť spustila, automaticky začni introduction
                    if (roomData.isStarted) {
                        console.log("Room has started, redirecting to introduction chapter")
                        localStorage.setItem("userName", storedPlayerName)
                        let currentChapter = readFromStorage("chapter") ?? existingParticipant?.currentChapter ?? 0
                        localStorage.setItem("chapter", currentChapter.toString())
                        if(currentChapter > 0) {
                            console.log("Current chapter from existing participant:", currentChapter)
                            router.push(`/menu`)
                        }
                        else {
                            console.log("Current chapter is 0, redirecting to chapter 0")
                            router.push("/chapter/0")
                        }

                    }
                } else {
                    router.push("/")
                }
            },
            (error) => {
                console.error("Connection error:", error)
                setConnectionError(true)
            },
        )

        return () => unsubscribe()
    }, [router])

    const addPlayerToRoom = async (roomId: string, playerName: string) => {
        try {
            const newPlayerId = Date.now().toString()
            localStorage.setItem("dotykace_playerId", newPlayerId)

            const newParticipant: DotykaceParticipant = {
                id: newPlayerId,
                name: playerName,
                roomId,
                joinedAt: new Date(),
                responses: {
                    isComplete: false,
                },
                currentChapter: 0,
                completedChapters: [],
            }

            const participantRef = doc(db, "rooms", roomId, "participants", newPlayerId);
            await setDoc(participantRef, newParticipant);
            console.log("Participant added:", newPlayerId);

            console.log("✅ Player added successfully")
        } catch (error) {
            console.error("❌ Error adding player:", error)
            hasAddedPlayer.current = false
        }
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8 mx-auto mb-4" />
                    {connectionError && <div className="text-white text-sm">Problém s pripojením... Skúšam znovu...</div>}
                </div>
            </div>
        )
    }

    const waitingHeader = "Čekáme na začátek"
    const waitingSubheader = "Administrátor ještě nespustil Dotykáče: interaktivní zkušenost s mobilem"

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-4">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <DotykaceLogo />

                {/* Waiting Screen */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-xl">
                    <CardContent className="text-center py-12">
                        <Clock className="w-16 h-16 mx-auto text-sky-500 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{waitingHeader}</h3>
                        <p className="text-gray-600 mb-4">{waitingSubheader}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
