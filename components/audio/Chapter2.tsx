"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Textarea } from "@/components/ui/textarea"
import { readFromStorage } from "@/scripts/local-storage"
import BasicAudioVisual from "@/components/BasicAudioVisual"
import { useChatContext } from "@/context/ChatContext"
import { useSharedAudio } from "@/context/AudioContext"
import VoiceVisualization from "@/components/VoiceVisualization"
import { motion } from "framer-motion"

function Chapter2Content() {
  const { state, currentInteraction, goToNextInteraction } = useChatContext()
  const { stopAll } = useSharedAudio()

  const [inputValue, setInputValue] = useState("")
  const [savedUserMessage, setSavedUserMessage] = useState("")
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  useEffect(() => {
    setInputValue("")
    setTimeLeft(null)
    setShowWarning(false)
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [currentInteraction?.id])

  useEffect(() => {
    if (currentInteraction?.type !== "input" || !currentInteraction.duration)
      return

    setTimeLeft(currentInteraction.duration)
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          goToNextInteraction()
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

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [currentInteraction?.id])

  const saveToFirestore = async (
    inputData: string,
    interactionId: string,
    choiceData?: { label: string; nextId: string },
  ) => {
    try {
      const docData: Record<string, unknown> = {
        interactionId,
        userInput: inputData,
        userId: readFromStorage("playerId") || "anonymous",
        roomId: readFromStorage("roomId") || "no-room",
        timestamp: serverTimestamp(),
        sessionId: `session_${Date.now()}`,
        chapter: "chapter2",
      }

      if (choiceData) {
        docData.choice = choiceData
      }

      await addDoc(collection(db, "chapter2"), docData)
    } catch (error) {
      console.error("Error saving to Firestore:", error)
    }
  }

  const handleInputSave = useCallback(() => {
    if (!currentInteraction) return
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (inputValue.trim()) {
      saveToFirestore(inputValue, currentInteraction.id)
      if (currentInteraction.id === "pairs-text-field") {
        setSavedUserMessage(inputValue)
      }
    }
    goToNextInteraction()
  }, [inputValue, currentInteraction, goToNextInteraction])

  const handleChoiceClick = useCallback(
    (choice: { label: string; "next-id": string }) => {
      stopAll()
      if (currentInteraction) {
        saveToFirestore("", currentInteraction.id, {
          label: choice.label,
          nextId: choice["next-id"],
        })
      }
      goToNextInteraction(choice["next-id"])
    },
    [currentInteraction, stopAll, goToNextInteraction],
  )

  const handleButtonClick = useCallback(
    (button: { label: string; "next-id": string }) => {
      stopAll()
      goToNextInteraction(button["next-id"])
    },
    [stopAll, goToNextInteraction],
  )

  if (!currentInteraction || state !== "initialized") return null

  const hasButton = !!currentInteraction.button

  const currentAudio =
    currentInteraction.type === "voice" && currentInteraction.filename
      ? {
          filename: currentInteraction.filename as string,
          type: "voice" as const,
          opts: { loop: currentInteraction.loop || false },
          onFinish: () => {
            if (!hasButton) {
              goToNextInteraction()
            }
          },
        }
      : null

  if (currentInteraction.type === "voice") {
    return (
      <BasicAudioVisual
        id={currentInteraction.id}
        audio={currentAudio}
        showProgress={false}
        canSkip={!currentInteraction.loop}
      >
        {hasButton ? (
          <div className="w-full space-y-4">
            <VoiceVisualization />
            <div className="px-4">
              <button
                onClick={() => handleButtonClick(currentInteraction.button)}
                className="w-full bg-white hover:bg-white/90
                           text-purple-900 font-bold tracking-wide py-2 px-4 rounded-full shadow-lg
                           transition-all duration-300 active:scale-[0.98]"
              >
                {currentInteraction.button.label}
              </button>
            </div>
          </div>
        ) : null}
      </BasicAudioVisual>
    )
  }

  if (currentInteraction.type === "multiple-choice") {
    return (
      <BasicAudioVisual
        id={currentInteraction.id}
        audio={null}
        showProgress={false}
        canSkip={false}
      >
        <div className="w-full space-y-4 px-4">
          <p className="text-white text-xl leading-relaxed text-center font-semibold tracking-wide drop-shadow-lg">
            {currentInteraction.text()}
          </p>
          <div className="space-y-3">
            {(
              currentInteraction.choices as Array<{
                label: string
                "next-id": string
              }>
            )?.map((choice, index) => (
              <motion.div
                key={choice.label}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.08 }}
              >
                <button
                  onClick={() => handleChoiceClick(choice)}
                  className="w-full bg-white hover:bg-white/90
                             text-purple-900 font-bold tracking-wide py-2 rounded-full shadow-lg
                             transition-all duration-300 active:scale-[0.98]"
                >
                  {choice.label}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </BasicAudioVisual>
    )
  }

  if (currentInteraction.type === "input") {
    return (
      <BasicAudioVisual
        id={currentInteraction.id}
        audio={null}
        showProgress={false}
        canSkip={false}
      >
        <div className="space-y-4 w-full px-4">
          <p className="text-white text-lg text-center font-medium">
            {currentInteraction.text()}
          </p>
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
            onClick={handleInputSave}
            disabled={!inputValue.trim()}
            className="w-full bg-white hover:bg-white/90
                       disabled:bg-white/30 disabled:text-white/50
                       text-purple-900 font-bold tracking-wide py-2 rounded-full shadow-lg
                       disabled:shadow-none transition-all duration-300 active:scale-[0.98]"
          >
            {currentInteraction["save-label"] || "Uložit"}
          </button>
        </div>
      </BasicAudioVisual>
    )
  }

  if (currentInteraction.type === "message") {
    return (
      <BasicAudioVisual
        id={currentInteraction.id}
        audio={null}
        showProgress={false}
      >
        <div className="w-full space-y-6">
          <p className="text-white text-xl leading-relaxed text-center font-semibold tracking-wide drop-shadow-lg">
            {currentInteraction.text()}
          </p>
        </div>
      </BasicAudioVisual>
    )
  }

  if (currentInteraction.type === "show-message") {
    return (
      <BasicAudioVisual
        id={currentInteraction.id}
        audio={null}
        showProgress={false}
      >
        <div className="w-full">
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl">
            <p className="text-white text-lg leading-relaxed text-center font-medium">
              {savedUserMessage || "Žádný vzkaz"}
            </p>
          </div>
        </div>
      </BasicAudioVisual>
    )
  }

  return (
    <BasicAudioVisual
      id={currentInteraction.id}
      audio={null}
      showProgress={false}
    />
  )
}

export default function Chapter2() {
  const [hasStarted, setHasStarted] = useState(false)

  if (!hasStarted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="fixed w-32 h-32 bg-yellow-300/25 rounded-full pointer-events-none blur-2xl"
          style={{ top: "12%", left: "8%" }}
        />

        <div className="w-full max-w-md space-y-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
            <span className="text-3xl font-bold text-purple-900">2</span>
          </div>

          <div className="w-full bg-white rounded-3xl p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kapitola 2
            </h2>
            <p className="text-purple-600 mb-8 font-medium text-sm">
              Jsi ready?
            </p>
            <button
              onClick={() => setHasStarted(true)}
              className="w-full bg-purple-600 hover:bg-purple-700
                         text-white font-bold py-2 px-2 rounded-full shadow-lg shadow-purple-500/30
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Spustit
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <Chapter2Content />
}
