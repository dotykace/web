"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { readFromStorage } from "@/scripts/local-storage"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom } from "@/lib/dotykace-types"
import HelpButton from "@/components/HelpButton"
import { useAudioManager } from "@/hooks/use-audio"
import DotykaceLogo from "@/components/DotykaceLogo";
import MenuSectionCard from "@/components/MenuSectionCard";

type SectionState = "locked" | "unlocked" | "completed"

interface Section {
  id: number
  title: string
  subtitle: string
  path: string
  state: SectionState
  icon: React.ReactNode
}

export default function MenuPage() {
  const router = useRouter()
  const [chapter, setChapter] = useState<number | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [roomId, setRoomId] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [allowedChapters, setAllowedChapters] = useState<number[]>([0])
  const [completedChapters, setCompletedChapters] = useState<number[]>([])

  // 👉 hook musí byť vo vnútri komponentu
  const audioManager = useAudioManager()

  // Initialize client-side data
  useEffect(() => {
    setIsClient(true)

    // Only access localStorage after component mounts on client
    const storedChapter = readFromStorage("chapter") as number
    const storedUserName = (readFromStorage("UN") as string) || ""
    const storedRoomId = typeof window !== "undefined" ? localStorage.getItem("dotykace_roomId") : null
    const storedPlayerId = typeof window !== "undefined" ? localStorage.getItem("dotykace_playerId") : null

    setChapter(storedChapter)
    setUserName(storedUserName)
    setRoomId(storedRoomId)
    setPlayerId(storedPlayerId)

    // Redirect if chapter is not set properly
    if (storedChapter === 0) {
      console.log("Redirecting to chapter 0 from the menu")
      redirect("/chapter/0")
      return;
    }

    audioManager.preloadAll({
      "menu-background": { url: "/audio/CAKAREN.mp3", opts: { loop: true, volume: 0.3 } },
    }).then(()=> {
      if (!audioManager.isPlaying["menu-background"]){
        audioManager.play("menu-background")
      }
    })

    return () => {
      // Close the shared AudioContext on app exit
      const ctx = (audioManager as any).audioContextRef?.current;
      if (ctx && ctx.state !== "closed") ctx.close();
    };
  }, [])

  // Listen to room changes to get updated permissions
  useEffect(() => {
    if (!isClient || !roomId || !playerId) {
      // Fallback to local storage if not in dotykace mode
      return
    }

    const roomRef = doc(db, "rooms", roomId)
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const roomData = doc.data() as DotykaceRoom
        const participant = roomData.participants?.find((p) => p.id === playerId)
        const permissions = roomData.chapterPermissions?.[playerId]

        if (permissions) {
          setAllowedChapters(permissions.allowedChapters)
        }

        if (participant) {
          setCompletedChapters(participant.completedChapters || [])
        }
      }
    })

    return () => unsubscribe()
  }, [roomId, playerId, isClient])

  const getState = (id: number): SectionState => {
    if(id === 4 ) return "unlocked" // Chapter 4 is always unlocked for testing
    if (completedChapters.includes(id)) {
      return "completed"
    } else if (allowedChapters.includes(id)) {
      return "unlocked"
    } else {
      return "locked"
    }
  }

  // Initial sections data with states
  const [sections] = useState<Section[]>([
    {
      id: 1,
      title: "Chapter 1",
      subtitle: "Place & Touch",
      path: "/chapter/1",
      state: "locked", // Will be updated by getState
    },
    {
      id: 2,
      title: "Chapter 2",
      subtitle: "Mental & Physical Habits",
      path: "/chapter/2",
      state: "locked",
    },
    {
      id: 3,
      title: "Chapter 3",
      subtitle: "Relationships",
      path: "/chapter/3",
      state: "locked",
    },
    {
      id: 4,
      title: "Chapter 4",
      subtitle: "Advanced Relationships",
      path: "/chapter/4",
      state: "unlocked",
    },
  ])

  // Update section states when permissions change
  const updatedSections = sections.map((section) => ({
    ...section,
    state: getState(section.id),
  }))

  // Handle section click
  const handleSectionClick = (section: Section) => {
    const currentState = getState(section.id)
    if (currentState !== "locked") {
      router.push(section.path)
    }
  }

  // Show loading state while client-side data is being loaded
  if (!isClient || chapter === null) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-8 w-8 mx-auto mb-4" />
            <p>Načítavam...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex flex-col items-center justify-center p-4">
        <HelpButton />

        {/* Logo */}
        <div className="p-4 pb-8">
          <DotykaceLogo width={280} />
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-2 gap-6">
          {updatedSections.map((section, index) => {
            return (
                <MenuSectionCard
                    key={section.id}
                    section={section}
                    handleSectionClick={handleSectionClick}
                />
            )
          })}
        </div>

        {/* Admin waiting message */}
        {roomId && (
            <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                <p className="text-sky-700 text-sm">
                  {allowedChapters.length === 1
                      ? "Čakáte na povolenie od administrátora pre ďalšie kapitoly"
                      : `Máte povolené kapitoly: ${allowedChapters.join(", ")}`}
                </p>
              </div>
            </motion.div>
        )}
      </div>
  )
}
