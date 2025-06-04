"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Volume2, Mic } from "lucide-react"

// Import chapter data
import chapterData from "@/data/chapter2-flow.json"
import type { InteractionFlow, Interaction } from "@/types/interaction-system"

export default function Chapter2Page() {
  const router = useRouter()
  const [currentInteractionId, setCurrentInteractionId] = useState<string>("chapter2-intro")
  const [variables, setVariables] = useState<Record<string, any>>({})
  const [inputValue, setInputValue] = useState("")
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [isChapterLocked, setIsChapterLocked] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [currentText, setCurrentText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Transform raw JSON data
  const transformRawData = (rawData: any): InteractionFlow => {
    const transformedInteractions: Record<string, Interaction> = {}

    Object.entries(rawData.interactions).forEach(([key, value]: [string, any]) => {
      transformedInteractions[key] = {
        id: key,
        type: value.type,
        maxDuration: value.duration || 3000,
        nextId: value.nextId,
        timeoutId: value.timeoutId,
        text: value.text,
        choices: value.choices,
        emojis: value.emojis,
        checkpoint: value.checkpoint || false,
      }
    })

    return {
      id: rawData.id,
      name: rawData.name,
      description: rawData.description,
      version: rawData.version,
      startInteractionId: rawData.startInteractionId,
      interactions: transformedInteractions,
    }
  }

  const flow = transformRawData(chapterData)
  const currentInteraction = flow.interactions[currentInteractionId]

  // Check if chapter is unlocked
  useEffect(() => {
    const completedChapters = JSON.parse(localStorage.getItem("completedChapters") || "[]")
    if (completedChapters.includes(1)) {
      setIsChapterLocked(false)
    }
    setIsLoading(false)
  }, [])

  // Process text with variables
  const processText = (text: string) => {
    return text?.replace(/\{([^}]+)\}/g, (match, variable) => {
      return variables[variable] || match
    })
  }

  // Load saved data on mount
  useEffect(() => {
    const preludeVariables = localStorage.getItem("preludeVariables")
    if (preludeVariables) {
      const vars = JSON.parse(preludeVariables)
      setVariables(vars)
    }
  }, [])

  // Typing animation effect
  useEffect(() => {
    if (currentInteraction?.text) {
      const text = processText(currentInteraction.text)
      setCurrentText("")
      setIsTyping(true)

      let index = 0
      const typingInterval = setInterval(() => {
        if (index < text.length) {
          setCurrentText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
        }
      }, 30) // Faster typing for better UX

      return () => clearInterval(typingInterval)
    }
  }, [currentInteractionId, variables])

  // Auto-advance logic
  useEffect(() => {
    if (
      !isTyping &&
      currentInteraction?.nextId &&
      ![
        "voice-selection",
        "binary-choice",
        "text-input",
        "continue-button",
        "voice-demo",
        "show-saved-message",
      ].includes(currentInteraction.type)
    ) {
      const timer = setTimeout(() => {
        handleNext(currentInteraction.nextId!)
      }, currentInteraction.maxDuration || 3000)

      return () => clearTimeout(timer)
    }
  }, [currentInteractionId, isTyping])

  // Show input for text-input type
  useEffect(() => {
    if (currentInteraction?.type === "text-input") {
      setShowInput(true)
    } else {
      setShowInput(false)
    }
  }, [currentInteractionId])

  const handleNext = (nextId: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }

    if (nextId === "menu") {
      // Mark chapter 2 as completed
      const completedChapters = JSON.parse(localStorage.getItem("completedChapters") || "[]")
      if (!completedChapters.includes(2)) {
        completedChapters.push(2)
        localStorage.setItem("completedChapters", JSON.stringify(completedChapters))
      }
      router.push("/menu")
      return
    }

    setCurrentInteractionId(nextId)
  }

  const handleChoice = (choice: any) => {
    if (currentInteractionId === "voice-question") {
      setSelectedVoice(choice.type)
      const newVariables = { ...variables, selectedVoice: choice.type }
      setVariables(newVariables)
    }

    handleNext(choice.nextId)
  }

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return

    if (currentInteractionId === "message-input") {
      setSavedMessage(inputValue)
    }

    const newVariables = { ...variables, userMessage: inputValue }
    setVariables(newVariables)

    setInputValue("")
    setShowInput(false)

    if (currentInteraction?.nextId) {
      handleNext(currentInteraction.nextId)
    }
  }

  const handleVoiceDemo = () => {
    setIsVoiceActive(true)
    setTimeout(() => {
      setIsVoiceActive(false)
      if (currentInteraction?.nextId) {
        handleNext(currentInteraction.nextId)
      }
    }, 2000)
  }

  const handleContinueButton = () => {
    if (currentInteraction?.nextId) {
      handleNext(currentInteraction.nextId)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-purple-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (isChapterLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-8xl mb-6"
          >
            🔒
          </motion.div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Kapitola 2 je uzamčená
          </h1>
          <p className="mb-6 text-purple-300">Pre odemčenie tejto kapitoly musíš najprv dokončiť Kapitolu 1.</p>
          <Button
            onClick={() => router.push("/menu")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
          >
            Zpět do menu
          </Button>
        </motion.div>
      </div>
    )
  }

  const getBackgroundGradient = () => {
    switch (currentInteraction?.type) {
      case "title-screen":
        return "from-purple-900 via-indigo-900 to-black"
      case "voice-selection":
      case "voice-demo":
        return "from-blue-900 via-purple-900 to-indigo-900"
      case "binary-choice":
        return "from-indigo-900 via-purple-900 to-pink-900"
      case "scenario-text":
        return "from-orange-900 via-red-900 to-purple-900"
      case "text-input":
        return "from-green-900 via-teal-900 to-blue-900"
      default:
        return "from-gray-900 via-purple-900 to-indigo-900"
    }
  }

  const renderInteraction = () => {
    switch (currentInteraction?.type) {
      case "title-screen":
        return (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-8"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              {currentText}
            </motion.h1>
          </motion.div>
        )

      case "voice-selection":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl"
          >
            <h2 className="text-4xl font-bold text-white mb-12">{processText(currentInteraction.text || "")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentInteraction.choices?.map((choice, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  onClick={() => handleChoice(choice)}
                  className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <Volume2 className="w-8 h-8 mx-auto mb-4" />
                    <div className="text-lg font-semibold">{choice.type}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case "voice-demo":
        return (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <h2 className="text-3xl font-bold text-white mb-12">{processText(currentInteraction.text || "")}</h2>
            <motion.button
              animate={isVoiceActive ? { scale: [1, 1.2, 1] } : { scale: [1, 1.1, 1] }}
              transition={isVoiceActive ? { duration: 0.5 } : { duration: 2, repeat: Number.POSITIVE_INFINITY }}
              onClick={handleVoiceDemo}
              className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
                isVoiceActive
                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                  : "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500"
              }`}
            >
              {isVoiceActive ? <Volume2 size={48} /> : <Mic size={48} />}
            </motion.button>
          </motion.div>
        )

      case "binary-choice":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl">
            {currentInteraction.text && (
              <h2 className="text-3xl font-bold text-white mb-12">{processText(currentInteraction.text)}</h2>
            )}
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              {currentInteraction.choices?.map((choice, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => handleChoice(choice)}
                  className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-xl font-semibold">{choice.type}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case "text-input":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-8">{processText(currentInteraction.text || "")}</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Napíš svoju odpoveď..."
                className="w-full min-h-[120px] bg-transparent border-2 border-white/30 text-white placeholder-white/60 text-lg rounded-xl focus:border-white/60 focus:ring-0"
                autoFocus
              />
              <Button
                onClick={handleInputSubmit}
                disabled={!inputValue.trim()}
                className="mt-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white border-none px-8 py-3 text-lg"
              >
                Uložiť odpoveď
              </Button>
            </div>
          </motion.div>
        )

      case "continue-button":
        return (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.button
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              onClick={handleContinueButton}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-12 py-6 rounded-2xl shadow-2xl text-2xl font-bold transition-all duration-300 transform hover:scale-105"
            >
              {currentInteraction.text}
            </motion.button>
          </motion.div>
        )

      case "show-saved-message":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-2xl"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Tvoja uložená správa:</h2>
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-yellow-500/30">
              <p className="text-xl text-yellow-100">{savedMessage || "Žiadna správa nebola uložená."}</p>
            </div>
          </motion.div>
        )

      case "chapter-complete":
        return (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="text-8xl mb-8"
            >
              ✨
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              Kapitola 2 dokončená!
            </h1>
            <p className="text-xl text-white/80 mb-8">{currentText}</p>
            <Button
              onClick={() => handleNext("menu")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-none px-8 py-3 text-lg"
            >
              Späť do menu
            </Button>
          </motion.div>
        )

      default:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl">
            <p className="text-2xl md:text-3xl text-white leading-relaxed">
              {currentText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </motion.div>
        )
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} flex flex-col`}>
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/menu")}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="text-white/70 text-sm">Kapitola 2</div>
        <Button
          onClick={() => {
            const completedChapters = JSON.parse(localStorage.getItem("completedChapters") || "[]")
            if (!completedChapters.includes(2)) {
              completedChapters.push(2)
              localStorage.setItem("completedChapters", JSON.stringify(completedChapters))
            }
            router.push("/menu")
          }}
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          Skip
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentInteractionId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderInteraction()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  )
}
