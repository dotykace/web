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

    const deleteRoom = async (roomDocId: string) => {
        try {
            await deleteDoc(doc(db, "rooms", roomDocId))
            const keysToDelete = Array.from(processedRooms.current).filter((key) => key.startsWith(roomDocId))
            keysToDelete.forEach((key) => processedRooms.current.delete(key))
        } catch (error) {
            console.error("❌ Error deleting room:", error)
        }
    }

    const startRoom = async (roomDocId: string) => {
        try {
            // Spusti room a automaticky odomkni introduction (kapitolu 0)
            await updateDoc(doc(db, "rooms", roomDocId), {
                isStarted: true,
                globalUnlockedChapters: [0],
            })
        } catch (error) {
            console.error("❌ Error starting room:", error)
        }
    }

    const allowNextChapterForAll = async (room: DotykaceRoom, nextChapter: number) => {
        try {
            const currentPermissions = room.chapterPermissions || {}
            const updatedPermissions: ChapterPermissions = { ...currentPermissions }
            const currentGlobalUnlocked = room.globalUnlockedChapters || []
            const updatedGlobalUnlocked = [...currentGlobalUnlocked]

            if (!updatedGlobalUnlocked.includes(nextChapter)) {
                updatedGlobalUnlocked.push(nextChapter)
                updatedGlobalUnlocked.sort((a, b) => a - b)
            }

            room.participants.forEach((participant) => {
                const completedChapters = participant.completedChapters || []
                const previousChapter = nextChapter - 1

                if (completedChapters.includes(previousChapter) || nextChapter === 1) {
                    const playerPermissions = updatedPermissions[participant.id] || {
                        allowedChapters: [],
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
                globalUnlockedChapters: updatedGlobalUnlocked,
            })

            const keysToDelete = Array.from(processedRooms.current).filter((key) => key.startsWith(room.docId!))
            keysToDelete.forEach((key) => processedRooms.current.delete(key))
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
                allowedChapters: [],
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
            const csvData = [
                ["Meno", "Čas pripojenia", "Aktuálna kapitola", "Dokončené kapitoly", "Povolené kapitoly"],
                ...room.participants.map((p) => {
                    const permissions = room.chapterPermissions?.[p.id]
                    return [
                        p.name,
                        p.joinedAt
                            ? p.joinedAt instanceof Timestamp
                                ? p.joinedAt.toDate().toLocaleString()
                                : p.joinedAt.toLocaleString()
                            : "N/A",
                        p.currentChapter?.toString() || "0",
                        p.completedChapters?.join(", ") || "žiadne",
                        permissions?.allowedChapters?.join(", ") || "žiadne",
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

    const canUnlockChapterForAll = (room: DotykaceRoom, chapter: number) => {
        return room.participants.some((p) => (p.completedChapters || []).includes(chapter - 1) || chapter === 1)
    }

    const isChapterGloballyUnlocked = (room: DotykaceRoom, chapter: number) => {
        return room.globalUnlockedChapters?.includes(chapter) || false
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
                <CreateRoom adminId={adminId}/>

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
                                        {room.globalUnlockedChapters && room.globalUnlockedChapters.length > 0 && (
                                            <div className="mt-2">
                        <span className="text-sm text-green-600 font-medium">
                          Globálne odomknuté kapitoly: {room.globalUnlockedChapters.join(", ")}
                        </span>
                                            </div>
                                        )}
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
                                {room.participants && room.participants.length > 0 && room.isStarted && (
                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold text-sm mb-3 text-blue-900">Hromadné akcie - Kapitoly:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {[1, 2, 3, 4].map((chapterNum) => (
                                                <Button
                                                    key={chapterNum}
                                                    size="sm"
                                                    variant={isChapterGloballyUnlocked(room, chapterNum) ? "default" : "outline"}
                                                    className={
                                                        isChapterGloballyUnlocked(room, chapterNum)
                                                            ? "bg-green-600 hover:bg-green-700"
                                                            : "bg-blue-100 hover:bg-blue-200 border-blue-300"
                                                    }
                                                    onClick={() => allowNextChapterForAll(room, chapterNum)}
                                                    disabled={!canUnlockChapterForAll(room, chapterNum)}
                                                >
                                                    {isChapterGloballyUnlocked(room, chapterNum) ? (
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <UnlockKeyhole className="w-3 h-3 mr-1" />
                                                    )}
                                                    {isChapterGloballyUnlocked(room, chapterNum)
                                                        ? `Kapitola ${chapterNum} odomknutá`
                                                        : `Povoliť kapitolu ${chapterNum} všetkým`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Participant Progress Table */}
                                {room.participants && room.participants.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-sm">Pokrok hráčov:</h4>
                                            <div className="text-xs text-gray-500 flex items-center gap-4">
                        <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Dokončené
                        </span>
                                                <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Aktuálne
                        </span>
                                                <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Povolené
                        </span>
                                                <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          Zamknuté
                        </span>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                                                    <tr>
                                                        <th className="text-left p-3 text-sm font-semibold text-gray-800 min-w-[120px]">Hráč</th>
                                                        <th className="text-center p-3 text-sm font-semibold text-gray-800 w-12">0</th>
                                                        <th className="text-center p-3 text-sm font-semibold text-gray-800 w-12">1</th>
                                                        <th className="text-center p-3 text-sm font-semibold text-gray-800 w-12">2</th>
                                                        <th className="text-center p-3 text-sm font-semibold text-gray-800 w-12">3</th>
                                                        <th className="text-center p-3 text-sm font-semibold text-gray-800 w-12">4</th>
                                                        <th className="text-center p-3 text-sm font-semibold text-gray-800 min-w-[100px]">
                                                            Akcie
                                                        </th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                    {room.participants.map((participant, index) => {
                                                        const permissions = room.chapterPermissions?.[participant.id]
                                                        const allowedChapters = permissions?.allowedChapters || []
                                                        const currentChapter = participant.currentChapter || 0
                                                        const completedChapters = participant.completedChapters || []

                                                        return (
                                                            <tr
                                                                key={participant.id}
                                                                className={`transition-colors duration-150 hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                                                            >
                                                                <td className="p-2">
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900 text-xs">{participant.name}</div>
                                                                    </div>
                                                                </td>
                                                                {[0, 1, 2, 3, 4].map((chapterNum) => {
                                                                    const isCompleted = completedChapters.includes(chapterNum)
                                                                    const isAllowed = allowedChapters.includes(chapterNum)
                                                                    const isCurrent = currentChapter === chapterNum
                                                                    const canUnlock = chapterNum === Math.max(...completedChapters) + 1

                                                                    return (
                                                                        <td key={`${participant.id}-chapter-${chapterNum}`} className="p-2 text-center">
                                                                            <div className="flex items-center justify-center">
                                                                                <div
                                                                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 shadow-sm ${
                                                                                        isCompleted
                                                                                            ? "bg-emerald-500 text-white shadow-emerald-200"
                                                                                            : isCurrent
                                                                                                ? "bg-blue-500 text-white shadow-blue-200 ring-2 ring-blue-200"
                                                                                                : isAllowed
                                                                                                    ? "bg-amber-500 text-white shadow-amber-200"
                                                                                                    : "bg-gray-300 text-gray-600"
                                                                                    }`}
                                                                                >
                                                                                    {isCompleted ? <CheckCircle className="w-2.5 h-2.5" /> : chapterNum}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    )
                                                                })}
                                                                <td className="p-2">
                                                                    <div className="flex justify-center gap-1">
                                                                        {[1, 2, 3, 4].map((chapterNum) => {
                                                                            const completedChapters = participant.completedChapters || []
                                                                            const allowedChapters = permissions?.allowedChapters || []
                                                                            const canUnlock = chapterNum === Math.max(...completedChapters) + 1
                                                                            const isAllowed = allowedChapters.includes(chapterNum)

                                                                            if (!canUnlock || isAllowed || chapterNum === 0) return null

                                                                            return (
                                                                                <Button
                                                                                    key={chapterNum}
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-5 w-5 p-0 text-xs bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-sm"
                                                                                    onClick={() => allowNextChapter(room, participant.id, chapterNum)}
                                                                                    title={`Odomknúť kapitolu ${chapterNum}`}
                                                                                >
                                                                                    <Unlock className="w-2.5 h-2.5 text-blue-600" />
                                                                                </Button>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                    </tbody>
                                                </table>
                                            </div>
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
