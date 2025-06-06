"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Settings } from "lucide-react"
import Card from "@/components/Card"
import { useInteractions } from "@/hooks/use-interactions"
import { ChatProvider } from "@/context/ChatContext"
import CardSequence from "@/components/CardSequence"
import {redirect} from "next/navigation";
import {readFromStorage} from "@/scripts/local-storage";


export default function Home() {
  const chapter = readFromStorage("chapter") as number
  const {
    state,
    currentInteraction,
    goToNextInteraction,
    processText,
    handleUserInput,
    handleChoiceSelection,
  } = useInteractions("intro-flow")

  if(chapter && chapter !== 0) {
    console.log("Redirecting to menu from chapter", chapter)
    redirect("/menu")
  }

  if (!state || state==="loading" || !currentInteraction ) {
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

  return (
      <>
        {/* Settings button - only show for non-chat views */}
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
          <CardSequence
            currentInteraction={currentInteraction}
            goToNextInteraction={goToNextInteraction}
            processText={processText}
          />
        </ChatProvider>
      </>
  )
}
