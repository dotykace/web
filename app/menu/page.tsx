"use client"
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {readFromStorage, setToStorage} from "@/scripts/local-storage"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type {DotykaceParticipant, DotykaceRoom} from "@/lib/dotykace-types"
import HelpButton from "@/components/HelpButton"
import { useAudioManager } from "@/hooks/use-audio"
import DotykaceLogo from "@/components/DotykaceLogo";
import MenuSectionCard from "@/components/MenuSectionCard";
import {chapterConfigs} from "@/app/chapter/[id]/ChapterClient";

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
  .map((config) => ({
    id: config.chapterNumber,
    title: `${chapterString} ${config.chapterNumber}`,
    path: `/chapter/${config.chapterNumber}`,
    state: "locked", // example logic
  } as Section))

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
    if(!selectedVoice){
      setToStorage("selectedVoice", "male")
    }

    setChapter(storedChapter)
    setUserName(storedUserName)
    setRoomId(storedRoomId)
    setPlayerId(storedPlayerId)

    // Check completed chapters to see if user has finished the intro (chapter 0)
    const storedCompletedChapters = (readFromStorage("completedChapters") as number[]) || []
    
    // Only redirect to chapter 0 if it hasn't been completed yet
    if (!storedCompletedChapters.includes(0)) {
      console.log("Redirecting to chapter 0 from the menu - intro not completed yet")
      router.push("/chapter/0")
      return;
    }
  }, [router])

  // Handle audio separately to avoid infinite loop
  useEffect(() => {
    if (!isClient) return;

    audioManager.preloadAll({
      "menu-background": { filename: "CAKAREN.mp3", opts: { loop: true, volume: 0.3 } },
    }).then(() => {
      if (!audioManager.isPlaying["menu-background"]) {
        audioManager.playPreloaded("menu-background")
      }
    })

    return () => {
      // Close the shared AudioContext on app exit
      const ctx = (audioManager as any).audioContextRef?.current;
      if (ctx && ctx.state !== "closed") ctx.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient])

  const getState = useCallback((id: number): SectionState => {
    if (completedChapters.includes(id)) {
      return "completed"
    } else if (allowedChapters.includes(id)) {
      return "unlocked"
    } else {
      return "locked"
    }
  }, [completedChapters, allowedChapters])

  const updateSectionsState = useCallback(() => {
    setSections((prevSections) =>{
      return prevSections.map((section) => ({
        ...section,
        state: getState(section.id),
      }))
    })
  }, [getState])

  useEffect(() => {
    updateSectionsState()
  }, [updateSectionsState]);

  // Listen to room changes to get updated permissions
  useEffect(() => {
    console.log("Setting up room listener for roomId:", roomId, "and playerId:", playerId)
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
    const unsubscribeParticipant = onSnapshot(participantRef, (participantSnap) => {
      if (participantSnap.exists()) {
        const participant = participantSnap.data() as DotykaceParticipant
        setCompletedChapters(participant.completedChapters || [])
        const savedChapter = readFromStorage("chapter");
        const dbChapter = participant.currentChapter;
        if (dbChapter !== savedChapter) {
          console.log(`Synchronizing chapter from ${savedChapter} to ${dbChapter}`);
          setToStorage("chapter", dbChapter);
        }
        console.log("Participant data updated:", participant)
      } else {
        console.log("Participant document does not exist.")
      }
    })

    return () => {
      unsubscribe()
      unsubscribeParticipant()
    }
  }, [roomId, playerId, isClient])

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
        <div className="min-h-screen bg-gradient-menu flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin-smooth rounded-full border-3 border-white/30 border-t-white h-10 w-10 mx-auto mb-4" />
            <p className="text-white/90 font-medium">Načítavam...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gradient-menu flex flex-col items-center justify-center p-4">
        <HelpButton />

        {/* Logo */}
        <div className="p-4 pb-10 animate-fade-in">
          <DotykaceLogo width={280} />
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-2 gap-6 animate-scale-in">
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
                className="mt-10 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
            >
              <div className="bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg shadow-sky-900/10">
                <p className="text-sky-700 text-sm font-medium">
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
