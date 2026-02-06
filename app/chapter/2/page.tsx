"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import HelpButton from "@/components/HelpButton"
import useDB from "@/hooks/use-db"
import { useRouter } from "next/navigation"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"
import BasicAudioVisual from "@/components/BasicAudioVisual"
import { useInteractions } from "@/hooks/use-interactions"
import AudioWrapper from "@/components/audio/AudioWrapper"
import { ProcessedInteraction } from "@/interactions"
import InputArea from "@/components/InputArea"
import { ChatProvider, useChatContext } from "@/context/ChatContext"
import { useSharedAudio } from "@/context/AudioContext"
import VoiceVisualization from "@/components/VoiceVisualization"

// LocalStorage keys
const CHAPTER2_PROGRESS_KEY = "chapter2_progress"

interface Chapter2Progress {
  currentInteractionId: string
  savedUserMessage: string
  hasStartedExperience: boolean
}

function Chapter2Content() {
  const { state, currentInteraction, goToNextInteraction } = useChatContext()
  const { stop, stopAll, isPlaying } = useSharedAudio()

  const [inputValue, setInputValue] = useState("")
  const [savedUserMessage, setSavedUserMessage] = useState("")
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [hasStartedExperience, setHasStartedExperience] = useState(false)

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const mountedRef = useRef(true)

  const router = useRouter()

  const [dbHook, setDbHook] = useState<any>(null)

  const [currentAudio, setCurrentAudio] = useState<{} | null>(null)

  useEffect(() => {
    if (!currentInteraction) return

    console.log(currentInteraction)

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    setTimeLeft(null)
    setShowWarning(false)

    if (currentInteraction.type === "voice") {
      const audio = {
        filename: currentInteraction.filename || "",
        type: "voice",
        opts: {
          loop: currentInteraction.loop || false,
        },
        onFinish: () => {
          console.log("Played chapter 2 audio:", currentInteraction.filename)
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
    (interactionId: string, message: string, started: boolean) => {
      const progress: Chapter2Progress = {
        currentInteractionId: interactionId,
        savedUserMessage: message,
        hasStartedExperience: started,
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

  const saveAndContinue = (nextId) => {
    console.log(
      "Saving progress and continuing from interaction:",
      currentInteraction.id,
    )
    saveProgressToLocalStorage(
      currentInteraction.id,
      savedUserMessage,
      hasStartedExperience,
    )
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

  const handleStartExperience = async () => {
    await initializeAudio()
    setHasStartedExperience(true)
  }

  const CustomButton = useCallback(
    (choice) => {
      if (!choice) return null
      return (
        <Button
          key={currentInteraction.id + "-button-" + choice.label}
          onClick={() => handleButtonClick(choice)}
          className={
            "w-full bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200 hover:scale-105"
          }
        >
          {choice.label}
        </Button>
      )
    },
    [currentInteraction, handleButtonClick],
  )

  const CustomInput = useCallback(() => {
    return (
      <div className="space-y-4">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Napíš svoju odpoveď..."
          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 resize-none"
          rows={3}
        />
        {timeLeft !== null && (
          <div className="text-center">
            <div className="text-white/80 text-sm">
              Zostáva: {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </div>
            {showWarning && currentInteraction["warning-text"] && (
              <div className="text-yellow-300 text-sm mt-1">
                {currentInteraction["warning-text"]}
              </div>
            )}
          </div>
        )}
        <Button
          onClick={() => handleInputSave(currentInteraction)}
          className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
          disabled={!inputValue.trim()}
        >
          {currentInteraction["save-label"] || "Uložiť"}
        </Button>
      </div>
    )
  }, [inputValue, timeLeft, showWarning, currentInteraction, handleInputSave])

  if (currentInteraction === "checkpoint" || state === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Načítavam...</div>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Chyba pri načítaní</div>
      </div>
    )
  }

  // Show start button if experience hasn't started
  if (!hasStartedExperience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Vitajte v Kapitole 2
            </h2>
            <p className="text-white/80 mb-6">
              Pre spustenie zážitku kliknite na tlačidlo.
            </p>
            <Button
              onClick={handleStartExperience}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200 hover:scale-105"
            >
              Spustiť
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const chapter2Coloring =
    "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
  const InteractionContent = () => {
    if (!currentInteraction) return null
    switch (currentInteraction?.type) {
      case "input":
      case "multiple-choice":
        return (
          <div className="p-6">
            <p className="text-lg mb-4 text-white">
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
            <div>
              <VoiceVisualization />
              {CustomButton(button)}
            </div>
          )
        }
        break
      case "message":
        return (
          <div className="p-6">
            <p className="text-lg mb-4 text-white">
              {currentInteraction?.text()}
            </p>
          </div>
        )
      case "show-message":
        const messageText = savedUserMessage || "Žadny vzkaz"
        return (
          <div className="p-6">
            <p className="text-lg mb-4 text-white">{messageText}</p>
          </div>
        )
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
    >
      {InteractionContent()}
    </BasicAudioVisual>
  )
}

export default function Chapter2() {
  const savedProgress = readFromStorage(CHAPTER2_PROGRESS_KEY)
  const {
    state,
    currentInteraction,
    goToNextInteraction,
    handleUserInput,
    handleChoiceSelection,
  } = useInteractions(
    "chapter2-flow",
    savedProgress ? savedProgress.currentInteractionId : null,
  )
  return (
    <ChatProvider
      state={state}
      handleUserInput={handleUserInput}
      handleChoiceSelection={handleChoiceSelection}
      currentInteraction={currentInteraction}
      goToNextInteraction={goToNextInteraction}
    >
      <AudioWrapper>
        <HelpButton />
        <Chapter2Content />
      </AudioWrapper>
    </ChatProvider>
  )
}
