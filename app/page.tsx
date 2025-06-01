"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Settings } from "lucide-react"
import Card from "@/components/Card"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useInteractions } from "@/hooks/use-interactions"
import { ChatProvider } from "@/context/ChatContext"
import CardSequence from "@/components/CardSequence"
import Chat from "@/components/Chat"

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
    clearChatHistory,
  } = useInteractions()

  // Single initialization effect
  useEffect(() => {
    if (loading || error || interactions.length === 0 || initialized) {
      return
    }

    console.log("Initializing chapter:", chapter)
    const chapterConfig = CHAPTER_CONFIG[chapter as keyof typeof CHAPTER_CONFIG]
    const startOfChapter = chapterConfig?.startInteractionId || "1"

    setFirstInteraction(startOfChapter)
  }, [loading, error, interactions.length, initialized, chapter, setFirstInteraction])

  // Chapter transitions
  useEffect(() => {
    // todo id is not really part of currentInteraction, solve it later with further refactoring
    if (currentInteraction?.id === "chapter-1-animation") {
      console.log("Transitioning to chapter 1")
      setTimeout(() => {
        setChapter(1)
        clearChatHistory()
        setTimeout(() => {
          setFirstInteraction("1.1", true)
        }, 100)
      }, 100)
    }
  }, [currentInteraction?.id, setChapter, clearChatHistory, setFirstInteraction])

  if (loading) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
          <div className="w-full max-w-md mx-auto">
            <Card>
              <div className="p-6 text-center">
                <div className="animate-pulse">Načítání interakcí...</div>
              </div>
            </Card>
          </div>
        </main>
    )
  }

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
      <>
        {/* Settings button - only show for non-chat views */}
        {chapterConfig?.component !== "Chat" && (
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
        )}

        <ChatProvider handleUserInput={handleUserInput} handleChoiceSelection={handleChoiceSelection}>
          {currentView}
        </ChatProvider>
      </>
  )
}
