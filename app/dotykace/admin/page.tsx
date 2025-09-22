"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent} from "@/components/ui/card"
import { collection, onSnapshot, updateDoc, doc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom, ChapterPermissions } from "@/lib/dotykace-types"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import CreateRoom from "@/components/admin/CreateRoom";
import RenderRoom from "@/components/admin/RenderRoom";
import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger
} from "@/components/ui/sidebar";

export default function AdminPage() {
    const [rooms, setRooms] = useState<DotykaceRoom[]>([])
    const [adminId, setAdminId] = useState<string | null>(null)
    const processedRooms = useRef(new Set<string>())
    const router = useRouter()

    const [selectedRoom, setSelectedRoom] = useState<DotykaceRoom | null>(null)

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
        if (!selectedRoom) {
            setSelectedRoom(rooms[0] || null)
        }
        if (selectedRoom) {
            const updatedRoom = rooms.find(room => room.id === selectedRoom.id)
            if (updatedRoom){
                setSelectedRoom(updatedRoom)
            }
            else {
                setSelectedRoom(rooms[0] || null)
            }
        }
    }, [rooms])

    const logout = () => {
        localStorage.removeItem("dotykace_adminId")
        router.push("/")
    }

    const EmptyRoomList =() =>{
        return (
          <Card>
              <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                      <Users className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Žiadne miestnosti</h3>
                  <p className="text-gray-500">Vytvorte svoju prvú miestnosť pre začatie interaktívneho zážitku</p>
              </CardContent>
          </Card>
        )
    }

    const RoomButton = ({room}) => {
        const coloring = selectedRoom?.id === room.id ? "bg-blue-500 text-white" : "hover:bg-blue-500/30"
        return (
          <SidebarMenuButton
            onClick={() => setSelectedRoom(room)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${coloring}`}
          >
              <span className="text-base font-medium">{room.name}</span>
          </SidebarMenuButton>
        )
    }
    const AppSidebar = () => {
        return (
          <Sidebar>
              <SidebarHeader>
                  <p className="text-3xl font-bold text-gray-900">Admin Panel</p>
                  {/* Create Room */}
                  <CreateRoom adminId={adminId}/>
              </SidebarHeader>
              <SidebarContent>
                  <SidebarGroup>
                      <SidebarGroupLabel>Zoznam miestnosti</SidebarGroupLabel>
                      <SidebarGroupContent>
                          <SidebarMenu>
                              {rooms.map((room) => (
                                <SidebarMenuItem key={room.id}>
                                    <RoomButton room={room} />
                                </SidebarMenuItem>
                              ))}
                          </SidebarMenu>
                      </SidebarGroupContent>
                  </SidebarGroup>
            </SidebarContent>
              <SidebarFooter>
                  <Button onClick={logout}>
                      Odhlásiť sa
                  </Button>
              </SidebarFooter>
          </Sidebar>
        )
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <SidebarProvider style={{
              "--sidebar-width": "18rem",
          }}>
              <AppSidebar />
              <div className="w-max flex-grow">
                  <SidebarTrigger />
                  {selectedRoom?(
                    <RenderRoom room={selectedRoom} processedRooms={processedRooms}/>
                  ):(
                    <EmptyRoomList/>
                  )}
              </div>
          </SidebarProvider>
      </div>

    )
}