"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Settings } from "lucide-react"
import Card from "@/components/Card"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useInteractions } from "@/hooks/use-interactions"
import { ChatProvider } from "@/context/ChatContext"
import CardSequence from "@/components/CardSequence"
import Chat from "@/components/Chat"

// FIXED: Added chapter configuration object (was TODO: store chapter info in some object maybe)
const CHAPTER_CONFIG = {
  0: {
    name: "Introduction",
    startInteractionId: "1",
    component: "CardSequence",
  },
  1: {
    name: "Chat Mode",
    startInteractionId: "1.1",
    component: "Chat",
  },
} as const

export default function Home() {
  const [chapter, setChapter] = useLocalStorage<number>("chapter", 0)
  const {
    interactions,
    setFirstInteraction,
    currentInteraction,
    history,
    goToNextInteraction,
    processText,
    handleUserInput,
    handleChoiceSelection,
    loading,
    error,
    initialized,
  } = useInteractions()

  // FIXED: Use ref to prevent multiple initialization calls
  const initializationAttempted = useRef(false)

  // FIXED: Separate effect for initialization to prevent infinite loops
  useEffect(() => {
    // FIXED: Only attempt initialization once and when all conditions are met
    if (
        !initializationAttempted.current &&
        !loading &&
        !error &&
        interactions.length > 0 &&
        chapter !== null &&
        !initialized
    ) {
      console.log("Initializing with:", {
        interactionsLength: interactions.length,
        chapter,
        loading,
        error,
        initialized,
      })

      initializationAttempted.current = true

      // FIXED: Use chapter configuration object instead of switch statement
      const chapterConfig = CHAPTER_CONFIG[chapter as keyof typeof CHAPTER_CONFIG]
      const startOfChapter = chapterConfig?.startInteractionId || "1"

      console.log("Setting first interaction for chapter:", chapter, "startId:", startOfChapter)
      setFirstInteraction(startOfChapter)
    }
  }, [interactions.length, chapter, loading, error, initialized, setFirstInteraction])

  // FIXED: Separate effect for chapter transitions
  useEffect(() => {
    if (currentInteraction?.id === "chapter-1-animation") {
      setChapter(1)
      // FIXED: Reset initialization for new chapter
      initializationAttempted.current = false
    }
  }, [currentInteraction?.id, setChapter])

  if (loading) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="w-full max-w-md mx-auto">
            <Card>
              <div className="p-6 text-center">
                <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="text-white/90"
                >
                  Načítání interakcí...
                </motion.div>
              </div>
            </Card>
          </div>
        </main>
    )
  }

  if (error) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900">
          <div className="w-full max-w-md mx-auto">
            <Card>
              <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-white mb-2">Chyba při načítání</h2>
                <p className="text-white/80 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Zkusit znovu
                </button>
              </div>
            </Card>
          </div>
        </main>
    )
  }

  // FIXED: Show loading until properly initialized
  if (!initialized || !currentInteraction) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="w-full max-w-md mx-auto">
            <Card>
              <div className="p-6 text-center">
                <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="text-white/90"
                >
                  Inicializace...
                </motion.div>
              </div>
            </Card>
          </div>
        </main>
    )
  }

  // FIXED: Use chapter configuration to determine current view
  const chapterConfig = CHAPTER_CONFIG[chapter as keyof typeof CHAPTER_CONFIG]
  let currentView

  if (chapterConfig) {
    switch (chapterConfig.component) {
      case "CardSequence":
        currentView = (
            <CardSequence
                currentInteraction={currentInteraction}
                goToNextInteraction={goToNextInteraction}
                history={history}
                processText={processText}
            />
        )
        break
      case "Chat":
        currentView = (
            <Chat
                history={history}
                processText={processText}
                goToNextInteraction={goToNextInteraction}
                currentInteraction={currentInteraction}
            />
        )
        break
    }
  } else {
    currentView = (
        <div className="w-full max-w-md mx-auto">
          <Card>
            <div className="p-6 text-center">
              <h1 className="text-xl font-semibold">Interaktivní chat</h1>
              <p className="mt-4">Vítej v interaktivním chatu! Klikni na tlačítko níže pro zahájení.</p>
            </div>
          </Card>
        </div>
    )
  }

  return (
      <main className="min-h-screen">
        {/* Link to interactions editor */}
        <div className="absolute top-4 right-4 z-50 hidden md:block">
          <Link href="/interactions">
            <motion.div
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-full backdrop-blur-sm shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Editor interakcí</span>
            </motion.div>
          </Link>
        </div>
        <ChatProvider handleUserInput={handleUserInput} handleChoiceSelection={handleChoiceSelection}>
          {currentView}
        </ChatProvider>
      </main>
  )
}
