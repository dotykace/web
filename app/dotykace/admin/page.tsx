"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom } from "@/lib/dotykace-types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { Trash2, Users, Play, Download, Plus } from "lucide-react"

export default function AdminPage() {
    const [rooms, setRooms] = useState<DotykaceRoom[]>([])
    const [newRoomName, setNewRoomName] = useState("")
    const [loading, setLoading] = useState(false)
    const [adminId, setAdminId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const storedAdminId = localStorage.getItem("dotykace_adminId")
        if (!storedAdminId) {
            router.push("/dotykace")
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
            })
            setNewRoomName("")
        } catch (error) {
            console.error("Error creating room:", error)
        } finally {
            setLoading(false)
        }
    }

    const deleteRoom = async (roomDocId: string) => {
        try {
            console.log("Deleting room with document ID:", roomDocId)
            await deleteDoc(doc(db, "rooms", roomDocId))
        } catch (error) {
            console.error("Error deleting room:", error)
        }
    }

    const startRoom = async (roomDocId: string) => {
        try {
            console.log("Starting room with document ID:", roomDocId)
            await updateDoc(doc(db, "rooms", roomDocId), {
                isStarted: true,
            })
        } catch (error) {
            console.error("Error starting room:", error)
        }
    }

    const exportData = async (room: DotykaceRoom) => {
        try {
            // Create CSV data from participants
            const csvData = [
                ["Meno", "Čas pripojenia", "Dokončené"],
                ...room.participants.map((p) => [
                    p.name,
                    p.joinedAt?.toDate?.()?.toLocaleString() || "N/A",
                    p.responses?.isComplete ? "Áno" : "Nie",
                ]),
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

    const logout = () => {
        localStorage.removeItem("dotykace_adminId")
        router.push("/") // Zmenené z "/dotykace" na "/"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-gray-600">Spravujte miestnosti a účastníkov</p>
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
                <div className="grid gap-4">
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
                                            disabled={room.isStarted || room.participants?.length === 0}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Play className="w-4 h-4 mr-1" />
                                            Začať
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
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{room.participants?.length || 0} účastníkov</span>
                                </div>
                                {room.participants && room.participants.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <h4 className="font-semibold text-sm">Účastníci:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {room.participants.map((participant, index) => (
                                                <Badge key={index} variant="outline">
                                                    {participant.name}
                                                </Badge>
                                            ))}
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
