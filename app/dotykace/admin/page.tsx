"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom, ChapterPermissions } from "@/lib/dotykace-types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { Trash2, Users, Play, Download, Plus, CheckCircle, Unlock, UnlockKeyhole } from "lucide-react"

export default function AdminPage() {
    const [rooms, setRooms] = useState<DotykaceRoom[]>([])
    const [newRoomName, setNewRoomName] = useState("")
    const [loading, setLoading] = useState(false)
    const [adminId, setAdminId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const storedAdminId = localStorage.getItem("dotykace_adminId")
        if (!storedAdminId) {
            router.push("/")
            return
        }
        setAdminId(storedAdminId)

        // Listen to rooms changes using Firestore real-time listener
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

    const generateRoomCode = () => {
        return Math.random().toString(36).substring(2, 6).toUpperCase()
    }

    const createRoom = async () => {
        if (!newRoomName.trim() || !adminId) return

        setLoading(true)
        try {
            const roomCode = generateRoomCode()
            await addDoc(collection(db, "rooms"), {
                id: roomCode,
                name: newRoomName.trim(),
                adminId,
                isActive: true,
                isStarted: false,
                createdAt: new Date(),
                participants: [],
                chapterPermissions: {},
            })
            setNewRoomName("")
        } catch (error) {
            console.error("❌ Error creating room:", error)
        } finally {
            setLoading(false)
        }
    }

    const deleteRoom = async (roomDocId: string) => {
        try {
            await deleteDoc(doc(db, "rooms", roomDocId))
        } catch (error) {
            console.error("❌ Error deleting room:", error)
        }
    }

    const startRoom = async (roomDocId: string) => {
        try {
            await updateDoc(doc(db, "rooms", roomDocId), {
                isStarted: true,
            })
        } catch (error) {
            console.error("❌ Error starting room:", error)
        }
    }

    const allowNextChapterForAll = async (room: DotykaceRoom, nextChapter: number) => {
        try {
            const currentPermissions = room.chapterPermissions || {}
            const updatedPermissions: ChapterPermissions = { ...currentPermissions }

            // Update permissions for all participants who have completed the previous chapter
            room.participants.forEach((participant) => {
                const completedChapters = participant.completedChapters || []
                const previousChapter = nextChapter - 1

                // Only allow next chapter if they completed the previous one
                if (completedChapters.includes(previousChapter) || nextChapter === 1) {
                    const playerPermissions = updatedPermissions[participant.id] || {
                        allowedChapters: [0],
                        playerName: participant.name,
                    }

                    if (!playerPermissions.allowedChapters.includes(nextChapter)) {
                        playerPermissions.allowedChapters.push(nextChapter)
                        playerPermissions.allowedChapters.sort((a, b) => a - b)
                    }

                    updatedPermissions[participant.id] = playerPermissions
                }
            })

            await updateDoc(doc(db, "rooms", room.docId!), {
                chapterPermissions: updatedPermissions,
            })
        } catch (error) {
            console.error("❌ Error updating chapter permissions for all:", error)
        }
    }

    const allowNextChapter = async (room: DotykaceRoom, participantId: string, nextChapter: number) => {
        try {
            const participant = room.participants.find((p) => p.id === participantId)
            if (!participant) return

            const currentPermissions = room.chapterPermissions || {}
            const playerPermissions = currentPermissions[participantId] || {
                allowedChapters: [0],
                playerName: participant.name,
            }

            if (!playerPermissions.allowedChapters.includes(nextChapter)) {
                playerPermissions.allowedChapters.push(nextChapter)
                playerPermissions.allowedChapters.sort((a, b) => a - b)
            }

            const updatedPermissions: ChapterPermissions = {
                ...currentPermissions,
                [participantId]: playerPermissions,
            }

            await updateDoc(doc(db, "rooms", room.docId!), {
                chapterPermissions: updatedPermissions,
            })
        } catch (error) {
            console.error("❌ Error updating chapter permissions:", error)
        }
    }

    const exportData = async (room: DotykaceRoom) => {
        try {
            // Create CSV data from participants
            const csvData = [
                ["Meno", "Čas pripojenia", "Aktuálna kapitola", "Dokončené kapitoly", "Povolené kapitoly"],
                ...room.participants.map((p) => {
                    const permissions = room.chapterPermissions?.[p.id]
                    return [
                        p.name,
                        p.joinedAt?.toDate?.()?.toLocaleString() || "N/A",
                        p.currentChapter?.toString() || "0",
                        p.completedChapters?.join(", ") || "žiadne",
                        permissions?.allowedChapters?.join(", ") || "0",
                    ]
                }),
            ]

            const csvContent = csvData.map((row) => row.join(",")).join("\n")
            const blob = new Blob([csvContent], { type: "text/csv" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${room.name}_data.csv`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error exporting data:", error)
        }
    }

    const getChapterTitle = (chapterNum: number): string => {
        const titles: Record<number, string> = {
            0: "Introduction",
            1: "Place & Touch",
            2: "Mental & Physical Habits",
            3: "Relationships",
            4: "Advanced Relationships",
        }
        return titles[chapterNum] || `Chapter ${chapterNum}`
    }

    const getNextChapterToUnlock = (room: DotykaceRoom) => {
        // Find the most common completed chapter among all participants
        const allCompletedChapters = room.participants.flatMap((p) => p.completedChapters || [])
        const chapterCounts = allCompletedChapters.reduce(
            (acc, chapter) => {
                acc[chapter] = (acc[chapter] || 0) + 1
                return acc
            },
            {} as Record<number, number>,
        )

        // Find the highest chapter that at least one person has completed
        const maxCompletedChapter = Math.max(...Object.keys(chapterCounts).map(Number), -1)
        return maxCompletedChapter + 1
    }

    const canUnlockChapterForAll = (room: DotykaceRoom, chapter: number) => {
        // Check if at least one participant has completed the previous chapter
        return room.participants.some((p) => (p.completedChapters || []).includes(chapter - 1) || chapter === 1)
    }

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
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Vytvoriť novú miestnosť
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Názov miestnosti"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={createRoom} disabled={loading || !newRoomName.trim()}>
                                {loading ? <LoadingSpinner className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                Vytvoriť
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Rooms List */}
                <div className="grid gap-6">
                    {rooms.map((room) => (
                        <Card key={room.docId} className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {room.name}
                                            <Badge variant={room.isActive ? "default" : "secondary"}>
                                                {room.isActive ? "Aktívna" : "Neaktívna"}
                                            </Badge>
                                            {room.isStarted && <Badge variant="destructive">Spustená</Badge>}
                                        </CardTitle>
                                        <CardDescription>
                                            Kód miestnosti: <span className="font-mono font-bold text-lg">{room.id}</span>
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => startRoom(room.docId!)}
                                            disabled={room.isStarted}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Play className="w-4 h-4 mr-1" />
                                            {room.isStarted ? "Spustená" : "Začať"}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => exportData(room)}>
                                            <Download className="w-4 h-4 mr-1" />
                                            Export
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => deleteRoom(room.docId!)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                    <Users className="w-4 h-4" />
                                    <span>{room.participants?.length || 0} účastníkov</span>
                                </div>

                                {/* Bulk Actions */}
                                {room.participants && room.participants.length > 0 && (
                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold text-sm mb-3 text-blue-900">Hromadné akcie:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {[1, 2, 3, 4].map((chapterNum) => (
                                                <Button
                                                    key={chapterNum}
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-blue-100 hover:bg-blue-200 border-blue-300"
                                                    onClick={() => allowNextChapterForAll(room, chapterNum)}
                                                    disabled={!canUnlockChapterForAll(room, chapterNum)}
                                                >
                                                    <UnlockKeyhole className="w-3 h-3 mr-1" />
                                                    Povoliť kapitolu {chapterNum} všetkým
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Player Progress */}
                                {room.participants && room.participants.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-sm">Pokrok hráčov:</h4>
                                        <div className="grid gap-3">
                                            {room.participants.map((participant) => {
                                                const permissions = room.chapterPermissions?.[participant.id]
                                                const allowedChapters = permissions?.allowedChapters || [0]
                                                const currentChapter = participant.currentChapter || 0
                                                const completedChapters = participant.completedChapters || []

                                                return (
                                                    <div key={participant.id} className="bg-gray-50 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <h5 className="font-medium text-gray-900">{participant.name}</h5>
                                                                <p className="text-sm text-gray-600">Aktuálne: {getChapterTitle(currentChapter)}</p>
                                                            </div>
                                                        </div>

                                                        {/* Chapter Progress */}
                                                        <div className="space-y-2">
                                                            <div className="flex flex-wrap gap-2">
                                                                {[0, 1, 2, 3, 4].map((chapterNum) => {
                                                                    const isCompleted = completedChapters.includes(chapterNum)
                                                                    const isAllowed = allowedChapters.includes(chapterNum)
                                                                    const isCurrent = currentChapter === chapterNum
                                                                    const canUnlock = chapterNum === Math.max(...completedChapters) + 1

                                                                    return (
                                                                        <div
                                                                            key={`${participant.id}-chapter-${chapterNum}`}
                                                                            className="flex items-center gap-1"
                                                                        >
                                                                            <Badge
                                                                                variant={
                                                                                    isCompleted
                                                                                        ? "default"
                                                                                        : isCurrent
                                                                                            ? "secondary"
                                                                                            : isAllowed
                                                                                                ? "outline"
                                                                                                : "secondary"
                                                                                }
                                                                                className={
                                                                                    isCompleted
                                                                                        ? "bg-green-500"
                                                                                        : isCurrent
                                                                                            ? "bg-blue-500"
                                                                                            : isAllowed
                                                                                                ? "bg-yellow-500"
                                                                                                : "bg-gray-400"
                                                                                }
                                                                            >
                                                                                {isCompleted && <CheckCircle className="w-3 h-3 mr-1" />}
                                                                                {chapterNum}
                                                                            </Badge>

                                                                            {/* Allow next chapter button */}
                                                                            {canUnlock && !isAllowed && chapterNum > 0 && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-6 px-2 text-xs bg-transparent"
                                                                                    onClick={() => allowNextChapter(room, participant.id, chapterNum)}
                                                                                >
                                                                                    <Unlock className="w-3 h-3" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>

                                                            <div className="text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1 mr-3">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Dokončené
                                </span>
                                                                <span className="inline-flex items-center gap-1 mr-3">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  Aktuálne
                                </span>
                                                                <span className="inline-flex items-center gap-1 mr-3">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  Povolené
                                </span>
                                                                <span className="inline-flex items-center gap-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                  Zamknuté
                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
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
