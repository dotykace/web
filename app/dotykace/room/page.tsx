"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { doc, onSnapshot, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom, DotykaceParticipant } from "@/lib/dotykace-types"
import { useRouter } from "next/navigation"
import { Clock } from "lucide-react"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"

import DotykaceLogo from "@/components/DotykaceLogo"

export default function DotykaceRoomPage() {
  const [room, setRoom] = useState<DotykaceRoom | null>(null)
  const [connectionError, setConnectionError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedPlayerName = readFromStorage("playerName") as string
    const storedRoomId = readFromStorage("roomId") as string
    const storedPlayerId = readFromStorage("playerId") as string

    if (!storedPlayerName || !storedRoomId) {
      router.push("/")
      return
    }

    if (!storedPlayerId) {
      console.log("Player ID not found in localStorage. Redirecting to root")
      router.push("/")
      return
    }

    let hasRedirected = false

    const roomRef = doc(db, "rooms", storedRoomId)
    const unsubscribe = onSnapshot(
      roomRef,
      async (document) => {
        if (hasRedirected) return

        if (document.exists()) {
          const roomData = document.data() as DotykaceRoom
          setRoom(roomData)
          setConnectionError(false)
          console.log(
            `Connected to room "${storedRoomId}" as player "${storedPlayerName}" (ID: ${storedPlayerId})`,
          )

          // Ak sa miestnosť spustila, automaticky začni introduction
          if (roomData.isStarted) {
            hasRedirected = true

            // Always fetch fresh participant data from Firestore
            const participantRef = doc(
              db,
              "rooms",
              storedRoomId,
              "participants",
              storedPlayerId,
            )
            const participantDoc = await getDoc(participantRef)
            const existingParticipant = participantDoc.exists()
              ? (participantDoc.data() as DotykaceParticipant)
              : null

            console.log("Participant data from Firestore:", existingParticipant)

            // Use Firestore data as source of truth, ignore localStorage
            const currentChapter = existingParticipant?.currentChapter ?? 0
            const completedChapters =
              existingParticipant?.completedChapters ?? []

            // Sync to localStorage
            setToStorage("chapter", currentChapter)
            setToStorage("completedChapters", completedChapters)

            // New players (chapter 0 not completed) must start at intro
            if (!completedChapters.includes(0)) {
              console.log("Chapter 0 not completed, redirecting to chapter 0")
              router.push("/chapter/0")
            } else if (currentChapter > 0) {
              console.log("Chapter 0 completed, going to menu")
              router.push("/menu")
            } else {
              console.log("Current chapter is 0, redirecting to chapter 0")
              router.push("/chapter/0")
            }
          }
        } else {
          hasRedirected = true
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

  if (!room) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin-smooth rounded-full border-3 border-white/30 border-t-white h-10 w-10 mx-auto mb-4" />
          {connectionError && (
            <div className="text-white/90 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              Problém s pripojením... Skúšam znovu...
            </div>
          )}
        </div>
      </div>
    )
  }

  const waitingHeader = "Čekáme na začátek"
  const waitingSubheader =
    "Administrátor ještě nespustil Dotykáče: interaktivní zkušenost s mobilem"

  return (
    <div className="h-screen overflow-hidden bg-gradient-warm p-4 flex flex-col items-center justify-center">
      <div className="max-w-md mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <DotykaceLogo />

        {/* Waiting Screen */}
        <Card className="glass-card border-0">
          <CardContent className="text-center py-12 px-8">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-orange-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {waitingHeader}
            </h3>
            <p className="text-gray-500 leading-relaxed">{waitingSubheader}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
