"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Textarea } from "@/components/ui/textarea"
import useDB from "@/hooks/use-db"
import { useRouter } from "next/navigation"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"
import BasicAudioVisual from "@/components/BasicAudioVisual"
// ChapterPage already wraps the ViewComponent (which is Chapter2) with AudioWrapper + ChatProvider - I removed it here to avoid double wrapping
import { ProcessedInteraction } from "@/interactions"
import InputArea from "@/components/InputArea"
import { useChatContext } from "@/context/ChatContext"
import { useSharedAudio } from "@/context/AudioContext"
import VoiceVisualization from "@/components/VoiceVisualization"
import { CHAPTER2_PROGRESS_KEY } from "@/components/ChapterPage"
import ChapterHeader from "@/components/ChapterHeader"


interface Chapter2Progress {
  currentInteractionId: string
  savedUserMessage: string
}

function Chapter2Content() {
  const { state, currentInteraction, goToNextInteraction } = useChatContext()
  const { stop, stopAll, playOnce, isPlaying } = useSharedAudio()

  const [inputValue, setInputValue] = useState("")
  const [savedUserMessage, setSavedUserMessage] = useState("")
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const mountedRef = useRef(true)

  const router = useRouter()

  const [dbHook, setDbHook] = useState<any>(null)

  // Explicitly typed to match BasicAudioVisual's AudioConfig interface (was previously untyped {})
  const [currentAudio, setCurrentAudio] = useState<{
    filename: string
    type: "sound" | "voice"
    opts?: { loop?: boolean }
    onFinish?: () => void
  } | null>(null)

  useEffect(() => {
    if (!currentInteraction) return

    console.log(currentInteraction)

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    setTimeLeft(null)
    setShowWarning(false)

    // Voice interactions: flow JSON uses "sound" key (not "filename") for the audio file
    if (currentInteraction.type === "voice") {
      const soundFile = currentInteraction.sound || currentInteraction.filename || ""
      const audio = {
        filename: soundFile,
        type: "voice" as const,
        opts: {
          loop: currentInteraction.loop || false,
        },
        onFinish: () => {
          console.log("Played chapter 2 audio:", soundFile)
          saveAndContinue()
        },
      }
      setCurrentAudio(audio)
    } else {
      setCurrentAudio(null)
    }

    if (currentInteraction.type === "input") {
      setInputValue("")
      if (currentInteraction.duration) {
        setTimeLeft(currentInteraction.duration)
        countdownIntervalRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (!mountedRef.current || prev === null) return null

            if (prev <= 1) {
              handleInputSave(currentInteraction)
              return null
            }

            if (
              currentInteraction["warning-after"] &&
              prev === currentInteraction["warning-after"]
            ) {
              setShowWarning(true)
            }
            return prev - 1
          })
        }, 1000)
      }
    }
  }, [currentInteraction])

  useEffect(() => {
    const hook = useDB()
    setDbHook(hook)
    stopAll()
  }, [])

  // LocalStorage functions
  const saveProgressToLocalStorage = useCallback(
    (interactionId: string, message: string) => {
      const progress: Chapter2Progress = {
        currentInteractionId: interactionId,
        savedUserMessage: message,
      }
      setToStorage(CHAPTER2_PROGRESS_KEY, progress)
    },
    [],
  )

  // Initialize audio context for mobile Safari
  const initializeAudio = useCallback(async () => {
    if (audioInitialized) return
    try {
      // Play a silent audio to unlock audio context
      const silentAudio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
      )
      silentAudio.volume = 0
      await silentAudio.play()
      silentAudio.pause()
      setAudioInitialized(true)
    } catch (error) {
      console.warn("Audio initialization failed:", error)
    }
  }, [audioInitialized])

  // Enhanced saveToFirestore to include choice data
  const saveToFirestore = async (
    inputData: string,
    interactionId: string,
    choiceData?: { label: string; nextId: string },
  ) => {
    try {
      const docData: any = {
        interactionId,
        userInput: inputData,
        userId: readFromStorage("playerId") || "anonymous",
        roomId: readFromStorage("roomId") || "no-room",
        timestamp: serverTimestamp(),
        sessionId: `session_${Date.now()}`,
        chapter: "chapter2",
      }

      // Add choice data if provided
      if (choiceData) {
        docData.choice = choiceData
      }

      await addDoc(collection(db, "chapter2"), docData)
    } catch (error) {
      console.error("Error saving to Firestore:", error)
    }
  }

  const handleInputSave = useCallback(
    async (interaction: ProcessedInteraction) => {
      if (inputValue.trim()) {
        await saveToFirestore(inputValue, currentInteraction.id)
        if (interaction.id === "pairs-text-field") {
          setSavedUserMessage(inputValue)
        }
      }

      setTimeLeft(null)
      setShowWarning(false)

      saveAndContinue()
    },
    [inputValue, currentInteraction],
  )

  const saveAndContinue = (nextId?: string) => {
    console.log(
      "Saving progress and continuing from interaction:",
      currentInteraction.id,
    )
    saveProgressToLocalStorage(currentInteraction.id, savedUserMessage)
    goToNextInteraction(nextId)
  }

  // Enhanced handleButtonClick to save choice data
  const handleButtonClick = useCallback(
    async (button: { label: string; "next-id": string }) => {
      if (currentAudio) {
        console.log("Button clicked, stopping audio:", currentAudio.filename)
        stop(currentAudio.filename)
      }
      if (currentInteraction.type === "multiple-choice") {
        // Save choice to Firestore
        await saveToFirestore("", currentInteraction.id, {
          label: button.label,
          nextId: button["next-id"],
        })
      }
      saveAndContinue(button["next-id"])
    },
    [stop, currentInteraction, currentAudio],
  )

  // Handle chapter completion
  useEffect(() => {
    if (!currentInteraction) return
    if (currentInteraction.id === "chapter-2-end") {
      dbHook.updateChapter(2, () => router.push("/menu")).then()
    }
  }, [currentInteraction])

  // Explicitly typed choice param (was previously implicit any)
  const CustomButton = useCallback(
    (choice: { label: string; "next-id": string } | null) => {
      if (!choice) return null
      return (
        <button
          key={currentInteraction.id + "-button-" + choice.label}
          onClick={() => handleButtonClick(choice)}
          className="w-full bg-white hover:bg-white/90
                     text-purple-900 font-bold tracking-wide py-4 px-8 rounded-full shadow-lg
                     transition-all duration-300 active:scale-[0.98]"
        >
          {choice.label}
        </button>
      )
    },
    [currentInteraction, handleButtonClick],
  )

  const CustomInput = useCallback(() => {
    return (
      <div className="space-y-4 w-full">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Napíš svou odpověď..."
          className="bg-white/10 border-2 border-white/30 text-white placeholder:text-white/50
                     resize-none rounded-2xl font-medium tracking-wide focus:border-white/50 focus:ring-white/20 backdrop-blur-sm"
          rows={3}
        />
        {timeLeft !== null && (
          <div className="text-center">
            <div className="text-white font-bold text-sm tracking-wide drop-shadow-md">
              Zostáva: {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </div>
            {showWarning && currentInteraction["warning-text"] && (
              <div className="text-yellow-300 text-sm mt-2 font-bold tracking-wide drop-shadow-md">
                {currentInteraction["warning-text"]}
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => handleInputSave(currentInteraction)}
          disabled={!inputValue.trim()}
          className="w-full bg-white hover:bg-white/90
                     disabled:bg-white/30 disabled:text-white/50
                     text-purple-900 font-bold tracking-wide py-4 px-8 rounded-full shadow-lg
                     disabled:shadow-none transition-all duration-300 active:scale-[0.98]"
        >
          {currentInteraction["save-label"] || "Uložit"}
        </button>
      </div>
    )
  }, [inputValue, timeLeft, showWarning, currentInteraction, handleInputSave])

  if (
    !currentInteraction ||
    currentInteraction.type === "checkpoint" ||
    state === "loading"
  ) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-xl font-medium">Načítám...</div>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-xl font-medium">Chyba při načítání</div>
      </div>
    )
  }

  // Empty string because background gradient is now on the parent wrapper (Chapter2 component)
  const chapter2Coloring = ""
  const InteractionContent = () => {
    if (!currentInteraction) return null
    switch (currentInteraction?.type) {
      case "input":
      case "multiple-choice":
        return (
          <div className="w-full space-y-4">
            <p className="text-white text-xl leading-relaxed text-center font-semibold tracking-wide drop-shadow-lg">
              {currentInteraction?.text()}
            </p>
            <InputArea
              InputElement={CustomInput}
              ButtonElement={CustomButton}
            />
          </div>
        )

      case "voice":
        if (currentInteraction.loop === true) {
          const button = currentInteraction.button
          return (
            <div className="w-full space-y-6">
              <VoiceVisualization />
              {CustomButton(button)}
            </div>
          )
        }
        break
      // Message type: can optionally have animation.buttons for user choices (e.g. "2.2", "8.0")
      case "message":
        return (
          <div className="w-full space-y-6">
            <p className="text-white text-xl leading-relaxed text-center font-semibold tracking-wide drop-shadow-lg">
              {currentInteraction?.text()}
            </p>
            {currentInteraction?.animation?.buttons && (
              <div className="space-y-3">
                {currentInteraction.animation.buttons.map(
                  (btn: { label: string; "next-id": string }, idx: number) =>
                    CustomButton(btn),
                )}
              </div>
            )}
          </div>
        )
      case "show-message": {
        const messageText = savedUserMessage || "Žádný vzkaz"
        return (
          <div className="w-full">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl">
              <p className="text-white text-lg leading-relaxed text-center font-medium">
                {messageText}
              </p>
            </div>
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <BasicAudioVisual
      coloring={chapter2Coloring}
      audio={currentAudio}
      id={currentInteraction.id}
      canSkip={!currentInteraction.loop}
      showProgress={false} // Chapter 2 has no progress bar per design
    >
      {InteractionContent()}
    </BasicAudioVisual>
  )
}

const chapter2Bg =
  "bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600"

// Outer wrapper: manages start screen state, background gradient, ChapterHeader, and AudioWrapper
export default function Chapter2() {
  // Start screen gate — user must click "Spustit" before the chapter experience begins
  const [hasStarted, setHasStarted] = useState(false)

  if (!hasStarted) {
    return (
      <div
        className={`h-screen overflow-hidden ${chapter2Bg} flex items-center justify-center p-4`}
      >
        {/* Decorative blurred circle */}
        <div
          className="fixed w-32 h-32 bg-yellow-300/25 rounded-full pointer-events-none blur-2xl"
          style={{ top: "12%", left: "8%" }}
        />

        <div className="w-full max-w-md space-y-6 flex flex-col items-center">
          {/* Chapter number badge */}
          <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
            <span className="text-3xl font-bold text-purple-900">2</span>
          </div>

          {/* Main card */}
          <div className="w-full bg-white rounded-3xl p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kapitola 2
            </h2>
            <p className="text-purple-600 mb-8 font-medium text-sm">
              Připrav se na další část příběhu
            </p>
            <button
              onClick={() => setHasStarted(true)}
              className="w-full bg-purple-600 hover:bg-purple-700
                         text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-purple-500/30
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Spustit
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Background + ChapterHeader are here (not in BasicAudioVisual) so the header stays fixed above the content
  // No extra AudioWrapper needed — ChapterPage already wraps with AudioWrapper + ChatProvider
  return (
    <div className={`h-screen overflow-hidden ${chapter2Bg} flex flex-col`}>
      <ChapterHeader chapterNumber={2} />
      <Chapter2Content />
    </div>
  )
}
