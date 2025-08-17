"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Triangle, Square, Circle, CheckCircle2 } from "lucide-react"
import { readFromStorage } from "@/scripts/local-storage"
import { Card } from "@/components/ui/card"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom } from "@/lib/dotykace-types"
import HelpButton from "@/components/HelpButton";

// Define the section types and states
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

  // Initialize client-side data
  useEffect(() => {
    setIsClient(true)

    // Only access localStorage after component mounts on client
    const storedChapter = readFromStorage("chapter") as number
    const storedUserName = (readFromStorage("userName") as string) || ""
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
    }
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
      icon: <Triangle className="w-6 h-6" />,
    },
    {
      id: 2,
      title: "Chapter 2",
      subtitle: "Mental & Physical Habits",
      path: "/chapter/2",
      state: "locked",
      icon: <Square className="w-6 h-6" />,
    },
    {
      id: 3,
      title: "Chapter 3",
      subtitle: "Relationships",
      path: "/chapter/3",
      state: "locked",
      icon: <Circle className="w-6 h-6" />,
    },
    {
      id: 4,
      title: "Chapter 4",
      subtitle: "Advanced Relationships",
      path: "/chapter/4",
      state: "locked",
      icon: <Triangle className="w-6 h-6" />,
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
        {/* Welcome message */}
        {userName && (
            <motion.div
                className="mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
                <p className="text-sky-700 font-medium">Vítaj späť, {userName}!</p>
              </div>
            </motion.div>
        )}

        {/* Logo */}
        <motion.div
            className="mb-12"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <div className="bg-white rounded-full p-8 shadow-2xl">
              <h1 className="text-4xl font-bold text-sky-500 text-center">dotykáče</h1>
            </div>
            <motion.div
                className="absolute -top-2 -right-2 w-12 h-12 bg-amber-300 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
            >
              <div className="text-amber-700 text-xl">^_^</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-2 gap-6 max-w-md w-full items-stretch">
          {updatedSections.map((section, index) => {
            const isUnlocked = section.state !== "locked"
            const isCompleted = section.state === "completed"

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="h-full"
              >
                <Card
                  className={`relative overflow-hidden cursor-pointer border-2 transition-all duration-200 h-full ${
                    isUnlocked
                      ? "border-amber-300 bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 shadow-lg hover:shadow-xl"
                      : "border-gray-300 bg-gradient-to-br from-gray-200 to-gray-300 opacity-60"
                  } rounded-2xl`}
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="p-6 flex flex-col items-center relative h-full">
                    <div className="bg-amber-200 p-3 rounded-lg mb-2 text-amber-700">
                      {section.icon}
                    </div>
                    <div className="text-amber-900 font-semibold text-center text-sm">
                      {section.title}
                    </div>
                    <div className="text-amber-700 text-xs text-center mt-1">
                      {section.subtitle}
                    </div>

                    {isCompleted && (
                      <motion.div
                        className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}

                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                        <div className="bg-gray-600 rounded-full p-2 shadow-lg">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
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

        {/* Debug info */}
        <div className="mt-8 text-white/70 text-sm text-center">
          <div>Dokončené kapitoly: {completedChapters.join(", ") || "žiadne"}</div>
          <div>Povolené kapitoly: {allowedChapters.join(", ")}</div>
        </div>
      </div>
  )
}
