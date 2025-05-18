"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Settings, MessageSquare } from "lucide-react"
import Card from "@/components/Card"
import UserInput from "@/components/UserInput"
import type { Interaction, Choice } from "./interactions/interactions"

export default function Home() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [currentInteraction, setCurrentInteraction] = useState<Interaction | null>(null)
  const [username, setUsername] = useState("")
  const [botName, setBotName] = useState("Bot")
  const [userInput, setUserInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<Interaction[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch interactions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the data from the interactions.json file
        const data = await import("@/data/interactions.json")
        setInteractions(data.interactions)

        // Set the first interaction
        const firstInteraction = data.interactions.find((i: Interaction) => i.id === "1")
        if (firstInteraction) {
          setCurrentInteraction(firstInteraction)
          setHistory([firstInteraction])
        }
        setLoading(false)
      } catch (error) {
        console.error("Error loading interactions:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Scroll to bottom when history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  // Handle timeout for interactions with duration
  useEffect(() => {
    if (!currentInteraction || currentInteraction.type === "input" || currentInteraction.type === "multiple-choice") {
      return
    }

    const timer = setTimeout(() => {
      if (currentInteraction["next-id"]) {
        goToNextInteraction(currentInteraction["next-id"])
      }
    }, currentInteraction.duration * 1000)

    return () => clearTimeout(timer)
  }, [currentInteraction])

  const goToNextInteraction = (nextId: string) => {
    const next = interactions.find((i) => i.id === nextId)
    if (next) {
      setCurrentInteraction(next)
      setHistory((prev) => [...prev, next])
    }
  }

  const handleUserInput = (input: string) => {
    setUserInput(input)

    if (currentInteraction?.type === "input") {
      // If this is a username input (id "2")
      if (currentInteraction.id === "2") {
        setUsername(input)
      }
      // If this is a bot name input (id "11a")
      else if (currentInteraction.id === "11a") {
        setBotName(input)
      }

      // Add user's message to history
      setHistory((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          type: "user-message",
          text: input,
          duration: 0,
        } as Interaction,
      ])

      if (currentInteraction["next-id"]) {
        goToNextInteraction(currentInteraction["next-id"])
      }
    }
  }

  const handleChoiceSelection = (choice: Choice) => {
    // Add user's choice to history
    setHistory((prev) => [
      ...prev,
      {
        id: `user-choice-${Date.now()}`,
        type: "user-message",
        text: choice.type,
        duration: 0,
      } as Interaction,
    ])

    if (choice["next-id"]) {
      goToNextInteraction(choice["next-id"])
    }
  }

  // Replace placeholders in text
  const processText = (text: string | undefined) => {
    if (!text) return ""

    let processed = text.replace(/UN/g, username || "ty")
    processed = processed.replace(/BN/g, botName)
    processed = processed.replace(/\{\{user_input\}\}/g, userInput)

    return processed
  }

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

  return (
      <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
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

        <div className="w-full max-w-md mx-auto flex flex-col h-[calc(100vh-2rem)]">
          <div className="bg-white/10 backdrop-blur-sm rounded-t-xl p-3 flex items-center gap-3 border-b border-white/20">
            <MessageSquare className="w-6 h-6 text-white" />
            <h1 className="text-xl font-semibold text-white">Interaktivní chat</h1>
          </div>

          {/* Chat history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5 backdrop-blur-sm">
            {history.map((interaction, index) => (
                <div
                    key={`${interaction.id}-${index}`}
                    className={`max-w-[80%] ${interaction.type === "user-message" ? "ml-auto" : "mr-auto"}`}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                      {interaction.type === "user-message" ? (
                          <div className="bg-indigo-600 text-white p-3 rounded-xl rounded-tr-none">
                            <p>{interaction.text}</p>
                          </div>
                      ) : interaction.type === "message" ? (
                          <div className="bg-white/20 text-white p-3 rounded-xl rounded-tl-none">
                            <p>{processText(interaction.text)}</p>
                          </div>
                      ) : interaction.type === "notification" ? (
                          <div className="bg-gray-800/50 text-white p-3 rounded-xl text-center w-full max-w-full mx-auto">
                            <p>{processText(interaction.text)}</p>
                          </div>
                      ) : interaction.type === "animation" ? (
                          <div className="flex justify-center items-center h-20 w-full max-w-full mx-auto">
                            <div className="animate-bounce text-4xl">✨</div>
                          </div>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="bg-white/10 backdrop-blur-sm rounded-b-xl p-4 border-t border-white/20">
            {currentInteraction?.type === "input" ? (
                <UserInput
                    onSubmit={handleUserInput}
                    placeholder={currentInteraction.id === "2" ? "Jak ti mám říkat?" : "Napiš odpověď..."}
                    buttonText="Odeslat"
                />
            ) : currentInteraction?.type === "multiple-choice" ? (
                <div className="flex flex-wrap gap-2">
                  {currentInteraction.choices?.map((choice, index) => (
                      <button
                          key={index}
                          onClick={() => handleChoiceSelection(choice)}
                          className="bg-white/20 hover:bg-white/30 transition-colors py-2 px-4 rounded-lg text-white font-medium flex-1"
                      >
                        {choice.type}
                      </button>
                  ))}
                </div>
            ) : (
                <div
                    className="bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-lg text-white/70 text-center cursor-pointer"
                    onClick={() => currentInteraction?.["next-id"] && goToNextInteraction(currentInteraction["next-id"])}
                >
                  Klikni pro pokračování...
                </div>
            )}
          </div>
        </div>
      </main>
  )
}
