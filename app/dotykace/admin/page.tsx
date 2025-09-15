"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, where, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom, ChapterPermissions } from "@/lib/dotykace-types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { Trash2, Users, Play, Download, Plus, CheckCircle, Unlock, UnlockKeyhole } from "lucide-react"
import CreateRoom from "@/components/admin/CreateRoom";
import RoomParticipants from "@/components/admin/RoomParticipants";
import RenderRoom from "@/components/admin/RenderRoom";

export default function AdminPage() {
    const [rooms, setRooms] = useState<DotykaceRoom[]>([])
    const [adminId, setAdminId] = useState<string | null>(null)
    const processedRooms = useRef(new Set<string>())
    const router = useRouter()

    useEffect(() => {
        const storedAdminId = localStorage.getItem("dotykace_adminId")
        if (!storedAdminId) {
            router.push("/")
            return
        }
        setAdminId(storedAdminId)

        const roomsRef = collection(db, "rooms")
        const q = query(roomsRef, where("adminId", "==", storedAdminId))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const roomsData = snapshot.docs.map((doc) => ({
                docId: doc.id,
                id: doc.data().id || doc.id,
                ...doc.data(),
            })) as DotykaceRoom[]
            setRooms(roomsData)
        })

        return () => unsubscribe()
    }, [router])

    const ensurePlayerPermissions = async (room: DotykaceRoom) => {
        if (!room.globalUnlockedChapters || room.globalUnlockedChapters.length === 0) return
        if (!room.docId) return

        const roomStateKey = `${room.docId}-${room.participants?.length || 0}-${room.globalUnlockedChapters.join(",")}`

        if (processedRooms.current.has(roomStateKey)) return

        const currentPermissions = room.chapterPermissions || {}
        let needsUpdate = false
        const updatedPermissions: ChapterPermissions = { ...currentPermissions }

        room.participants.forEach((participant) => {
            const playerPermissions = updatedPermissions[participant.id] || {
                allowedChapters: [],
                playerName: participant.name,
            }

            room.globalUnlockedChapters!.forEach((chapter) => {
                if (!playerPermissions.allowedChapters.includes(chapter)) {
                    playerPermissions.allowedChapters.push(chapter)
                    needsUpdate = true
                }
            })

            playerPermissions.allowedChapters.sort((a, b) => a - b)
            updatedPermissions[participant.id] = playerPermissions
        })

        if (needsUpdate) {
            try {
                processedRooms.current.add(roomStateKey)
                await updateDoc(doc(db, "rooms", room.docId), {
                    chapterPermissions: updatedPermissions,
                })
            } catch (error) {
                console.error("❌ Error updating player permissions:", error)
                processedRooms.current.delete(roomStateKey)
            }
        }
    }

    useEffect(() => {
        if (processedRooms.current.size > 50) {
            const entries = Array.from(processedRooms.current)
            processedRooms.current.clear()
            entries.slice(-25).forEach((entry) => processedRooms.current.add(entry))
        }

        rooms.forEach((room) => {
            ensurePlayerPermissions(room)
        })
    }, [rooms])

    const logout = () => {
        localStorage.removeItem("dotykace_adminId")
        router.push("/")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-gray-600">Spravujte miestnosti a pokrok hráčov</p>
                    </div>
                    <Button onClick={logout} variant="outline">
                        Odhlásiť sa
                    </Button>
                </div>

                {/* Create Room */}
                <CreateRoom adminId={adminId}/>

                {/* Rooms List */}
                <div className="grid gap-6">
                    {rooms.map((room) => (
                      <div key={room.id}>
                          <RenderRoom room={room} processedRooms={processedRooms}/>
                      </div>

                    ))}
                </div>

                {rooms.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Users className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">Žiadne miestnosti</h3>
                            <p className="text-gray-500">Vytvorte svoju prvú miestnosť pre začatie interaktívneho zážitku</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
