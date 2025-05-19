"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Settings } from "lucide-react"
import Card from "@/components/Card"
import { useLocalStorage } from '@/hooks/use-local-storage';
import {useInteractions} from "@/hooks/use-interactions";
import CardSequence from "@/components/CardSequence";
import Chat from "@/components/Chat";

export default function Home() {

  const [loading, setLoading] = useState(true)
  const [chapter, setChapter] = useLocalStorage<number>('chapter', 0);
  const {
    interactions,
    setFirstInteraction,
    currentInteraction,
    history,
    goToNextInteraction,
    processText
  } = useInteractions()

  // Wait for chapter and interactions to load before setting the first interaction
  useEffect(() => {
    if(!interactions || interactions.length === 0) return
    if(chapter == null ) return
    // Set the first interaction
    let startOfChapter;
    switch (chapter) {
      case 0:
        startOfChapter = "1";
        break;
      case 1:
        startOfChapter = "1.1";
        break;
      default:
        startOfChapter = "1"; // Default to chapter 1 if no valid chapter is found

    }
    setFirstInteraction(startOfChapter);
  }, [interactions, chapter]);

  // Wait for history to load before showing any interface
  useEffect(() => {
    if(!loading) return
    if(!history || history.length === 0) return
    if(currentInteraction == null ) return
    setLoading(false)
    console.log("Current interaction:", currentInteraction);
  }, [history, currentInteraction]);

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

  // todo store chapter info in some object maybe

  let currentView;

  switch (chapter) {
    case 0:
      currentView = <CardSequence currentInteraction={ currentInteraction} goToNextInteraction={goToNextInteraction} history={history} processText={processText}/>
      break;
    case 1:
      currentView = <Chat history={history} processText={processText}/>
      break;
    default:
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
      <main className="min-h-screen flex-col items-center justify-between p-4 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
        {/* Link to interactions editor */}
        <div className="absolute top-4 right-4 z-10">
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
        {currentView}
      </main>
  )
}
