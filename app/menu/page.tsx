"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceParticipant, DotykaceRoom } from "@/lib/dotykace-types"
import HelpButton from "@/components/HelpButton"
import { useAudioManager } from "@/hooks/use-audio"
import DotykaceLogo from "@/components/DotykaceLogo"
import MenuSectionCard from "@/components/MenuSectionCard"
import { chapterConfigs } from "@/app/chapter/[id]/ChapterClient"

type SectionState = "locked" | "unlocked" | "completed"

interface Section {
  id: number
  title: string
  path: string
  state: SectionState
}

const chapterString = "Kapitola"
const defaultSections = Object.values(chapterConfigs)
  .filter((config) => config.chapterNumber !== 0)
  .map(
    (config) =>
      ({
        id: config.chapterNumber,
        title: `${chapterString} ${config.chapterNumber}`,
        path: `/chapter/${config.chapterNumber}`,
        state: "locked", // example logic
      }) as Section,
  )

export default function MenuPage() {
  const router = useRouter()
  const [chapter, setChapter] = useState<number | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [roomId, setRoomId] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [allowedChapters, setAllowedChapters] = useState<number[]>([0])
  const [completedChapters, setCompletedChapters] = useState<number[]>([])

  const [sections, setSections] = useState<Section[]>(defaultSections)

  // 👉 hook musí byť vo vnútri komponentu
  const audioManager = useAudioManager()

  // Initialize client-side data
  useEffect(() => {
    setIsClient(true)

    // Only access localStorage after component mounts on client
    const storedChapter = readFromStorage("chapter") as number
    const storedUserName = (readFromStorage("UN") as string) || ""
    const storedRoomId = readFromStorage("roomId") as string
    const storedPlayerId = readFromStorage("playerId") as string

    const selectedVoice = readFromStorage("selectedVoice") as string
    console.log("Selected voice from storage:", selectedVoice)
    if (!selectedVoice) {
      setToStorage("selectedVoice", "male")
    }

    setChapter(storedChapter)
    setUserName(storedUserName)
    setRoomId(storedRoomId)
    setPlayerId(storedPlayerId)

    // Redirect if chapter is not set properly
    if (storedChapter === 0) {
      console.log("Redirecting to chapter 0 from the menu")
      redirect("/chapter/0")
      return
    }

    audioManager
      .preloadAll({
        "menu-background": {
          filename: "CAKAREN.mp3",
          opts: { loop: true, volume: 0.3 },
        },
      })
      .then(() => {
        if (!audioManager.isPlaying["menu-background"]) {
          audioManager.playPreloaded("menu-background")
        }
      })

    return () => {
      // Close the shared AudioContext on app exit
      const ctx = (audioManager as any).audioContextRef?.current
      if (ctx && ctx.state !== "closed") ctx.close()
    }
  }, [])

  const updateSectionsState = () => {
    setSections((prevSections) => {
      return prevSections.map((section) => ({
        ...section,
        state: getState(section.id),
      }))
    })
  }

  useEffect(() => {
    updateSectionsState()
  }, [completedChapters, allowedChapters])

  // Listen to room changes to get updated permissions
  useEffect(() => {
    console.log(
      "Setting up room listener for roomId:",
      roomId,
      "and playerId:",
      playerId,
    )
    if (!isClient || !roomId || !playerId) {
      // Fallback to local storage if not in dotykace mode
      return
    }

    const roomRef = doc(db, "rooms", roomId)
    const unsubscribe = onSnapshot(roomRef, (document) => {
      if (document.exists()) {
        const roomData = document.data() as DotykaceRoom
        const permissions = roomData.chapterPermissions?.[playerId]

        if (permissions) {
          setAllowedChapters(permissions.allowedChapters)
        }
      }
    })
    const participantRef = doc(db, "rooms", roomId, "participants", playerId)
    const unsubscribeParticipant = onSnapshot(
      participantRef,
      (participantSnap) => {
        if (participantSnap.exists()) {
          const participant = participantSnap.data() as DotykaceParticipant
          setCompletedChapters(participant.completedChapters || [])
          const savedChapter = readFromStorage("chapter")
          const dbChapter = participant.currentChapter
          if (dbChapter !== savedChapter) {
            console.log(
              `Synchronizing chapter from ${savedChapter} to ${dbChapter}`,
            )
            setToStorage("chapter", dbChapter)
          }
          console.log("Participant data updated:", participant)
        } else {
          console.log("Participant document does not exist.")
        }
      },
    )

    return () => {
      unsubscribe()
      unsubscribeParticipant()
    }
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

  // Handle section click
  const handleSectionClick = (section: Section) => {
    const currentState = getState(section.id)
    if (currentState !== "locked") {
      audioManager.stop("menu-background")
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
        {sections.map((section, index) => {
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
