"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Textarea } from "@/components/ui/textarea"
import { useChatContext } from "@/context/ChatContext"
import { useSharedAudio } from "@/context/AudioContext"
import BasicAudioVisual from "@/components/BasicAudioVisual"
import VoiceVisualization from "@/components/VoiceVisualization"
import { motion, AnimatePresence } from "framer-motion"

function Chapter3Content() {
  const { state, currentInteraction, goToNextInteraction } = useChatContext()
  const { stop, stopAll, playOnce, isPlaying } = useSharedAudio()

  const [inputValue, setInputValue] = useState("")
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [showChoices, setShowChoices] = useState(false)
  const [timerExpired, setTimerExpired] = useState(false)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // Reset state when interaction changes
  useEffect(() => {
    setInputValue("")
    setTimeLeft(null)
    setShowWarning(false)
    setShowChoices(false)
    setTimerExpired(false)
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [currentInteraction?.id])

  // Start countdown for timed input interactions
  useEffect(() => {
    if (currentInteraction?.type !== "input" || !currentInteraction.duration)
      return

    setTimeLeft(currentInteraction.duration)
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          setTimerExpired(true)
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

  useEffect(() => {
    if (timerExpired) {
      goToNextInteraction()
    }
  }, [timerExpired, goToNextInteraction])

  const saveToFirestore = async (
    value: string | string[],
    interactionId: string,
    interactionType: string,
  ) => {
    try {
      await addDoc(collection(db, "chapter3"), {
        interactionId,
        responseValue: value,
        interactionType,
        timestamp: serverTimestamp(),
        chapter: "chapter3",
      })
    } catch (error) {
      console.error("Error saving to Firestore:", error)
    }
  }

  const handleInputSave = useCallback(() => {
    if (!currentInteraction) return
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (inputValue.trim()) {
      saveToFirestore(inputValue, currentInteraction.id, "input")
    }
    goToNextInteraction()
  }, [inputValue, currentInteraction, goToNextInteraction])

  const handleChoiceClick = useCallback(
    (choice: { label: string; "next-id": string }) => {
      stopAll()
      if (currentInteraction) {
        saveToFirestore(choice.label, currentInteraction.id, "choice")
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

  const hasChoices = !!(currentInteraction.choices as any[])?.length
  const hasButton = !!currentInteraction.button

  const currentAudio =
    currentInteraction.type === "voice" && currentInteraction.filename
      ? {
          filename: currentInteraction.filename as string,
          type: "voice" as const,
          onFinish: () => {
            // If the interaction has choices or a button, reveal them instead of advancing
            if (hasChoices) {
              setShowChoices(true)
            } else if (!hasButton) {
              goToNextInteraction()
            }
          },
        }
      : null

  // Voice interaction — may include choices or a continue button shown after audio
  if (currentInteraction.type === "voice") {
    const needsChildren = hasButton || hasChoices
    return (
      <BasicAudioVisual
        id={currentInteraction.id}
        audio={currentAudio}
        showProgress={false}
        canSkip={!currentInteraction.loop && !showChoices && !hasButton}
      >
        {needsChildren ? (
          <div className="w-full space-y-4">
            <VoiceVisualization />

            {hasButton && (
              <div className="px-4">
                <button
                  onClick={() => handleButtonClick(currentInteraction.button)}
                  className="w-full bg-white hover:bg-white/90
                             text-orange-900 font-bold tracking-wide py-2 px-2 rounded-full shadow-lg
                             transition-all duration-300 active:scale-[0.98]"
                >
                  {currentInteraction.button.label}
                </button>
              </div>
            )}

            {showChoices && hasChoices && (
              <div className="px-2 flex flex-col min-h-0">
                {currentInteraction.label && (
                  <p className="text-white text-lg text-center font-semibold tracking-wide drop-shadow-lg mb-2 shrink-0">
                    {currentInteraction.label}
                  </p>
                )}
                <div className="space-y-2 overflow-y-auto max-h-[45vh] pr-1">
                  {(
                    currentInteraction.choices as Array<{
                      label: string
                      "next-id": string
                    }>
                  ).map((choice, index) => (
                    <motion.div
                      key={choice.label}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <button
                        onClick={() => handleChoiceClick(choice)}
                        className="w-full bg-white hover:bg-white/90
                                     text-orange-900 font-semibold text-sm tracking-wide py-2.5 px-2 rounded-full shadow-md
                                     transition-all duration-300 active:scale-[0.98]"
                      >
                        {choice.label}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </BasicAudioVisual>
    )
  }

  // Input with countdown
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
                       text-orange-900 font-bold tracking-wide py-2 px-2 rounded-full shadow-lg
                       disabled:shadow-none transition-all duration-300 active:scale-[0.98]"
          >
            {currentInteraction["save-label"] || "Uložit"}
          </button>
        </div>
      </BasicAudioVisual>
    )
  }

  // Fallback for other interaction types
  return (
    <BasicAudioVisual
      id={currentInteraction.id}
      audio={null}
      showProgress={false}
    />
  )
}

export default function Chapter3() {
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
            <span className="text-3xl font-bold text-orange-500">3</span>
          </div>

          <div className="w-full bg-white rounded-3xl p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kapitola 3
            </h2>
            <p className="text-orange-500 mb-8 font-medium text-sm">
              Připrav se na další část příběhu
            </p>
            <button
              onClick={() => setHasStarted(true)}
              className="w-full bg-orange-500 hover:bg-orange-600
                         text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-orange-500/30
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Jsi ready?
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <Chapter3Content />
}
