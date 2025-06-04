"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Play, Pause } from "lucide-react"

// Import chapter data
import chapterData from "@/data/chapter3-flow.json"
import type { InteractionFlow, Interaction } from "@/types/interaction-system"

export default function Chapter3Page() {
  const router = useRouter()
  const [currentInteractionId, setCurrentInteractionId] = useState<string>("chapter3-intro")
  const [variables, setVariables] = useState<Record<string, any>>({})
  const [inputValue, setInputValue] = useState("")
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [isChapterLocked, setIsChapterLocked] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [spiralProgress, setSpiralProgress] = useState(0)
  const [spiralSize, setSpiralSize] = useState(0)
  const [eyeAnimation, setEyeAnimation] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>(0)

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
    if (completedChapters.includes(2)) {
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

  // Show input for text-input type
  useEffect(() => {
    if (currentInteraction?.type === "text-input") {
      setShowInput(true)
    } else {
      setShowInput(false)
    }
  }, [currentInteractionId])

  // Handle audio visualization animation
  useEffect(() => {
    if (currentInteraction?.type === "audio-visualization") {
      setIsAudioPlaying(true)
      setAudioProgress(0)
      setSpiralProgress(0)
      setSpiralSize(0)

      // Random eye animation
      if (Math.random() > 0.7) {
        setTimeout(() => {
          setEyeAnimation(true)
          setTimeout(() => setEyeAnimation(false), 300)
        }, currentInteraction.maxDuration / 2)
      }

      const startTime = Date.now()
      const duration = currentInteraction.maxDuration

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        setAudioProgress(progress)
        setSpiralProgress(progress * 10)
        setSpiralSize(progress * 0.8 + 0.2)

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          setIsAudioPlaying(false)
          if (currentInteraction.nextId) {
            handleNext(currentInteraction.nextId)
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)

      return () => {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [currentInteractionId])

  // Draw spiral on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || currentInteraction?.type !== "audio-visualization") return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Center of canvas
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Draw spiral
    ctx.beginPath()
    ctx.strokeStyle = "#8B5CF6"
    ctx.lineWidth = 3

    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4 * spiralSize
    const turns = 3 + spiralProgress
    const pointsPerTurn = 30
    const totalPoints = turns * pointsPerTurn

    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / pointsPerTurn) * Math.PI * 2
      const radius = (i / totalPoints) * maxRadius

      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()

    // Draw eye if animation is active
    if (eyeAnimation) {
      // Draw eye
      ctx.beginPath()
      ctx.fillStyle = "#FFFFFF"
      ctx.ellipse(centerX, centerY, maxRadius * 0.5, maxRadius * 0.3, 0, 0, Math.PI * 2)
      ctx.fill()

      // Draw iris
      ctx.beginPath()
      ctx.fillStyle = "#3B82F6"
      ctx.arc(centerX, centerY, maxRadius * 0.25, 0, Math.PI * 2)
      ctx.fill()

      // Draw pupil
      ctx.beginPath()
      ctx.fillStyle = "#000000"
      ctx.arc(centerX, centerY, maxRadius * 0.1, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [spiralProgress, spiralSize, eyeAnimation, currentInteraction?.type])

  const handleNext = (nextId: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }

    if (nextId === "menu") {
      // Mark chapter 3 as completed
      const completedChapters = JSON.parse(localStorage.getItem("completedChapters") || "[]")
      if (!completedChapters.includes(3)) {
        completedChapters.push(3)
        localStorage.setItem("completedChapters", JSON.stringify(completedChapters))
      }
      router.push("/menu")
      return
    }

    setCurrentInteractionId(nextId)
  }

  const handleChoice = (choice: any) => {
    handleNext(choice.nextId)
  }

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return

    // Save input to variables
    const newVariables = { ...variables, userMessage: inputValue }
    setVariables(newVariables)

    setInputValue("")
    setShowInput(false)

    if (currentInteraction?.nextId) {
      handleNext(currentInteraction.nextId)
    }
  }

  const handleContinueButton = () => {
    if (currentInteraction?.nextId) {
      handleNext(currentInteraction.nextId)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
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
            Kapitola 3 je uzamčená
          </h1>
          <p className="mb-6 text-purple-300">Pre odemčenie tejto kapitoly musíš najprv dokončiť Kapitolu 2.</p>
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

  const renderInteraction = () => {
    switch (currentInteraction?.type) {
      case "audio-visualization":
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-2xl aspect-square">
              <canvas ref={canvasRef} className="w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-md text-center">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl md:text-2xl text-white font-light"
                  >
                    {processText(currentInteraction.text || "")}
                  </motion.p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                {isAudioPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
              </div>
              <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${audioProgress * 100}%` }} />
              </div>
            </div>
          </div>
        )

      case "text-input":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-purple-900/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-purple-500/30">
              <h2 className="text-2xl font-light text-white mb-6">{processText(currentInteraction.text || "")}</h2>
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Napíš svoju odpoveď..."
                className="w-full min-h-[120px] bg-purple-800/50 border-purple-500/50 text-white placeholder-purple-300/60 text-lg rounded-xl focus:border-purple-400 focus:ring-0"
                autoFocus
              />
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleInputSubmit}
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-none px-8 py-2"
                >
                  Potvrdiť
                </Button>
              </div>
            </div>
          </motion.div>
        )

      case "multiple-choice":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            {currentInteraction.text && (
              <h2 className="text-2xl font-light text-white mb-8 text-center">
                {processText(currentInteraction.text)}
              </h2>
            )}
            <div className="grid grid-cols-1 gap-4">
              {currentInteraction.choices?.map((choice, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleChoice(choice)}
                  className="bg-purple-900/50 backdrop-blur-md border border-purple-500/30 hover:bg-purple-800/60 text-white text-left px-6 py-4 rounded-xl transition-all duration-300"
                >
                  {choice.type}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case "continue-button":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.button
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              onClick={handleContinueButton}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-10 py-4 rounded-full shadow-lg text-xl font-medium transition-all duration-300"
            >
              {currentInteraction.text}
            </motion.button>
          </motion.div>
        )

      case "chapter-complete":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
              }}
              className="relative w-64 h-64 mx-auto mb-8"
            >
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 opacity-20"></div>
              <div className="absolute inset-2 rounded-full border-4 border-purple-400 opacity-40"></div>
              <div className="absolute inset-4 rounded-full border-4 border-purple-300 opacity-60"></div>
              <div className="absolute inset-6 rounded-full border-4 border-purple-200 opacity-80"></div>
              <div className="absolute inset-8 rounded-full border-4 border-purple-100"></div>
              <div className="absolute inset-0 flex items-center justify-center text-6xl">✨</div>
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-4">{processText(currentInteraction.text || "")}</h1>
            <p className="text-xl text-purple-200 mb-8">Kapitola 4 je teraz odomknutá!</p>

            <Button
              onClick={() => handleNext("menu")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-none px-8 py-3 text-lg rounded-full"
            >
              Späť do menu
            </Button>
          </motion.div>
        )

      default:
        return (
          <div className="text-center">
            <p className="text-xl text-white">Neznámy typ interakcie: {currentInteraction?.type}</p>
            <Button
              onClick={() => currentInteraction?.nextId && handleNext(currentInteraction.nextId)}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Pokračovať
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-indigo-950 text-white">
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
        <div className="text-white/70 text-sm">Kapitola 3</div>
        <Button
          onClick={() => {
            const completedChapters = JSON.parse(localStorage.getItem("completedChapters") || "[]")
            if (!completedChapters.includes(3)) {
              completedChapters.push(3)
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
            className="w-full flex justify-center"
          >
            {renderInteraction()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
