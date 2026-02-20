"use client"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState, useCallback } from "react"
import { useChatContext } from "@/context/ChatContext"
import { useSharedAudio } from "@/context/AudioContext"
import { useRouter } from "next/navigation"
import UserInput from "@/components/UserInput"
import FullScreenVideo from "@/components/FullScreenVideo"
import LoadingScreen from "@/components/LoadingScreen"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"
import useDB from "@/hooks/use-db"

const MESSAGE_DELAY_MS = 200
const USER_RESPONSE_DISPLAY_MS = 1500 // Time to show user response before next card
const MAX_VISIBLE_CARDS = 4

export default function CardSequence() {
  const {
    currentInteraction,
    goToNextInteraction,
    handleUserInput,
    handleChoiceSelection,
  } = useChatContext()
  const [history, setHistory] = useState<any[]>([])
  const [displayCount, setDisplayCount] = useState(0)
  const { playPreloaded } = useSharedAudio()
  const router = useRouter()
  const dbHook = useDB()

  // Add user response to history and then call the original handler after delay
  const handleUserResponse = useCallback(
    (text: string) => {
      const userMessage = {
        id: `user-response-${Date.now()}`,
        text: text,
        isUserResponse: true,
      }
      setHistory((prev) => [...prev, userMessage])
      setDisplayCount((prev) => prev + 1)
      // Delay before moving to next interaction so user can see their response
      setTimeout(() => {
        handleUserInput(text)
      }, USER_RESPONSE_DISPLAY_MS)
    },
    [handleUserInput],
  )

  const handleChoiceResponse = useCallback(
    (choice: any) => {
      const userMessage = {
        id: `user-choice-${Date.now()}`,
        text: choice.type || choice.label || choice,
        isUserResponse: true,
      }
      setHistory((prev) => [...prev, userMessage])
      setDisplayCount((prev) => prev + 1)
      // Delay before moving to next interaction so user can see their response
      setTimeout(() => {
        handleChoiceSelection(choice)
      }, USER_RESPONSE_DISPLAY_MS)
    },
    [handleChoiceSelection],
  )

  const handleContinue = () => {
    if (currentInteraction?.type === "message") {
      goToNextInteraction()
    }
  }

  useEffect(() => {
    if (!currentInteraction) return
    if (currentInteraction.type === "music") {
      playPreloaded(currentInteraction.key)
      return
    }
    setHistory((prev) => {
      const last = prev.at(-1)
      if (last?.id === currentInteraction.id) {
        return prev
      }
      return [...prev, currentInteraction]
    })
  }, [currentInteraction])

  useEffect(() => {
    if (history.length === 0) {
      setDisplayCount(0)
      return
    }

    const needsMoreMessages = displayCount < history.length
    if (!needsMoreMessages) return

    const timer = setTimeout(() => {
      setDisplayCount((prev) => Math.min(history.length, prev + 1))
    }, MESSAGE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [history.length, displayCount])

  const visibleHistory = history.slice(0, displayCount)

  // Get the last N cards for the stack effect
  const stackedCards = visibleHistory.slice(-MAX_VISIBLE_CARDS)
  const stackStartIndex = Math.max(0, visibleHistory.length - MAX_VISIBLE_CARDS)

  // Check interaction types
  const needsInput = currentInteraction?.type === "input"
  const needsChoice = currentInteraction?.type === "multiple-choice"
  const isMessage = currentInteraction?.type === "message"

  const renderCard = (
    interaction: any,
    stackIndex: number,
    totalInStack: number,
  ) => {
    const isTopCard = stackIndex === totalInStack - 1
    const depth = totalInStack - 1 - stackIndex

    // Calculate stack effect values
    const scale = 1 - depth * 0.04
    const yOffset = depth * -16
    const opacity = isTopCard ? 1 : Math.max(0.4, 1 - depth * 0.2)
    const zIndex = totalInStack - depth
    const blur = isTopCard ? 0 : depth * 1

    // Check if card is clickable (top card + message type + not user response)
    const isClickable = isTopCard && isMessage && !interaction.isUserResponse

    return (
      <motion.div
        key={interaction.id || `card-${stackStartIndex + stackIndex}`}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{
          opacity,
          y: yOffset,
          scale,
          filter: `blur(${blur}px)`,
        }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute inset-x-0 mx-auto w-full max-w-md px-6"
        style={{ zIndex }}
        onClick={isClickable ? handleContinue : undefined}
      >
        <div
          className={`rounded-3xl px-6 py-8 shadow-2xl transition-all duration-300 ${
            interaction.isUserResponse
              ? "bg-[#0EA5E9] text-white"
              : "bg-white/95 backdrop-blur-md text-gray-800"
          } ${isTopCard ? "ring-2 ring-white/30" : ""} ${
            isClickable
              ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              : ""
          }`}
        >
          <p className="text-lg leading-relaxed text-center">
            {typeof interaction.text === "function"
              ? interaction.text()
              : interaction.text}
          </p>
        </div>
      </motion.div>
    )
  }

  // Handle checkpoint - show loading and redirect
  if (currentInteraction?.type === "checkpoint") {
    return <LoadingScreen />
  }

  // Handle video interactions
  if (currentInteraction?.type === "video") {
    return (
      <FullScreenVideo
        videoSrc={currentInteraction.source}
        onEnded={() => goToNextInteraction()}
      />
    )
  }

  return (
    <main className="flex h-screen overflow-hidden flex-col bg-gradient-chapter0">
      <div className="w-full max-w-2xl mx-auto flex h-screen flex-col px-4">
        {/* Card Stack Container */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="relative w-full h-72">
            <AnimatePresence mode="popLayout">
              {stackedCards.map((interaction, index) =>
                renderCard(interaction, index, stackedCards.length),
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="w-full max-w-md mx-auto px-6 pb-10 pt-4">
            <AnimatePresence mode="wait">
              {/* Input Field - for input type */}
              {needsInput && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-5 shadow-2xl"
                >
                  <UserInput
                    onSubmit={handleUserResponse}
                    placeholder="Napiš odpověď..."
                    buttonText="Odeslat"
                  />
                </motion.div>
              )}

              {/* Choice Buttons - for multiple-choice type */}
              {needsChoice && (
                <motion.div
                  key="choices"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-wrap justify-center gap-3"
                >
                  {currentInteraction.choices?.map(
                    (choice: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleChoiceResponse(choice)}
                        className="py-3 px-6 rounded-full font-semibold shadow-lg
                                   transition-all duration-300 active:scale-[0.98] hover:shadow-xl"
                        style={{
                          backgroundColor: "#0EA5E9",
                          color: "white",
                        }}
                      >
                        {choice.label || choice.type}
                      </button>
                    ),
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  )
}
