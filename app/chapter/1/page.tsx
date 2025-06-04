"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, RotateCcw, ArrowLeft, Bell } from "lucide-react"
import Image from "next/image"

// Import chapter data
import chapterData from "@/data/chapter1-flow.json"
import type { InteractionFlow, Interaction } from "@/types/interaction-system"

export default function Chapter1Page() {
  const router = useRouter()
  const [currentInteractionId, setCurrentInteractionId] = useState<string>("chat-emoji-start")
  const [variables, setVariables] = useState<Record<string, any>>({})
  const [inputValue, setInputValue] = useState("")
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; text: string; isBot: boolean; timestamp: number }>
  >([])
  const [isTyping, setIsTyping] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [isRotated, setIsRotated] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationText, setNotificationText] = useState("")
  const [currentView, setCurrentView] = useState<"chat" | "other">("other")
  const [chatEnabled, setChatEnabled] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

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

  // Process text with variables
  const processText = (text: string) => {
    return text.replace(/\{([^}]+)\}/g, (match, variable) => {
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

  // Determine if we should show chat view
  useEffect(() => {
    const chatTypes = ["chat-message-bot", "chat-input", "notification"]
    if (chatTypes.includes(currentInteraction?.type || "") || chatEnabled) {
      setCurrentView("chat")
    } else {
      setCurrentView("other")
    }
  }, [currentInteractionId, chatEnabled])

  // Enable chat after "Napiš něco, pls."
  useEffect(() => {
    if (currentInteractionId === "chat-input-request") {
      setChatEnabled(true)
      setShowInput(true)
    }
  }, [currentInteractionId])

  // Handle timeouts
  useEffect(() => {
    if (currentInteraction?.timeoutId && currentInteraction.maxDuration) {
      const timer = setTimeout(() => {
        if (currentInteraction.timeoutId) {
          setCurrentInteractionId(currentInteraction.timeoutId)
        }
      }, currentInteraction.maxDuration)

      setTimeoutId(timer)
      return () => clearTimeout(timer)
    }
  }, [currentInteractionId])

  // Auto-advance for certain types
  useEffect(() => {
    if (currentInteraction?.type === "chat-message-bot") {
      // Show typing indicator first
      setIsTyping(true)

      setTimeout(() => {
        // Add bot message to chat
        const newMessage = {
          id: currentInteractionId,
          text: processText(currentInteraction.text || ""),
          isBot: true,
          timestamp: Date.now(),
        }
        setChatMessages((prev) => [...prev, newMessage])
        setIsTyping(false)

        // Auto-advance after message is shown
        const timer = setTimeout(() => {
          if (currentInteraction.nextId) {
            handleNext(currentInteraction.nextId)
          }
        }, currentInteraction.maxDuration || 3000)

        return () => clearTimeout(timer)
      }, 1000) // Typing delay
    } else if (
      currentInteraction?.type === "expanding-dot" ||
      currentInteraction?.type === "message-circle" ||
      currentInteraction?.type === "center-dot-to-play" ||
      currentInteraction?.type === "social-media-storm" ||
      currentInteraction?.type === "turn-instruction" ||
      currentInteraction?.type === "rotating-bubble"
    ) {
      const timer = setTimeout(() => {
        if (currentInteraction.nextId) {
          handleNext(currentInteraction.nextId)
        }
      }, currentInteraction.maxDuration || 3000)

      return () => clearTimeout(timer)
    }
  }, [currentInteractionId, variables])

  // Handle notification type
  useEffect(() => {
    if (currentInteraction?.type === "notification") {
      setNotificationText(processText(currentInteraction.text || ""))
      setShowNotification(true)

      const timer = setTimeout(() => {
        setShowNotification(false)
        setTimeout(() => {
          if (currentInteraction.nextId) {
            handleNext(currentInteraction.nextId)
          }
        }, 500) // Wait for notification to disappear
      }, currentInteraction.maxDuration || 3000)

      return () => clearTimeout(timer)
    }
  }, [currentInteractionId, variables])

  // Show input for chat-input type
  useEffect(() => {
    if (currentInteraction?.type === "chat-input") {
      setShowInput(true)
    }
  }, [currentInteractionId])

  // Scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleNext = (nextId: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }

    if (nextId === "menu") {
      // Mark chapter 1 as completed and unlock chapter 2
      const completedChapters = JSON.parse(localStorage.getItem("completedChapters") || "[]")
      if (!completedChapters.includes(1)) {
        completedChapters.push(1)
        localStorage.setItem("completedChapters", JSON.stringify(completedChapters))
      }
      router.push("/menu")
      return
    }

    setCurrentInteractionId(nextId)
  }

  const handleChoice = (choice: any) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }

    // Save choice
    const newVariables = { ...variables, [`choice_${currentInteractionId}`]: choice.type }
    setVariables(newVariables)

    handleNext(choice.nextId)
  }

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return

    // Add user message to chat
    const userMessage = {
      id: `user_${Date.now()}`,
      text: inputValue,
      isBot: false,
      timestamp: Date.now(),
    }
    setChatMessages((prev) => [...prev, userMessage])

    // Only process the input if we're in a chat-input interaction OR chat-input-request
    if (currentInteraction?.type === "chat-input" || currentInteractionId === "chat-input-request") {
      // Save input to variables
      const newVariables = { ...variables, userMessage: inputValue }
      setVariables(newVariables)

      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }

      if (currentInteraction?.nextId) {
        handleNext(currentInteraction.nextId)
      }
    }

    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputSubmit()
    }
  }

  // Handle scroll interactions
  useEffect(() => {
    if (currentInteraction?.type?.includes("scroll-line")) {
      const handleScroll = () => {
        const scrolled = window.scrollY
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        const progress = Math.min(scrolled / Math.max(maxScroll, 1), 1)
        setScrollProgress(progress)

        if (progress > 0.8 && currentInteraction.nextId) {
          handleNext(currentInteraction.nextId)
        }
      }

      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [currentInteractionId])

  if (!currentInteraction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const renderChatView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 text-white flex flex-col">
      {/* Chat header inspired by Figma */}
      <div className="bg-yellow-400 text-black p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/menu")}
              className="text-black hover:bg-black/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="font-bold text-lg">Part 1: Place & Touch</div>
          </div>
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex items-end space-x-2 ${message.isBot ? "justify-start" : "justify-end"}`}
          >
            {message.isBot && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image src="/bot-avatar.png" alt="Bot" width={32} height={32} className="w-full h-full object-cover" />
              </div>
            )}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                message.isBot ? "bg-white/90 text-gray-800 rounded-bl-md" : "bg-yellow-400 text-black rounded-br-md"
              }`}
            >
              {message.text}
            </div>
            {!message.isBot && (
              <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">!</span>
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end space-x-2 justify-start"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <Image src="/bot-avatar.png" alt="Bot" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <div className="bg-white/90 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Chat input inspired by Figma */}
      {(showInput || chatEnabled) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="p-4 bg-purple-600"
        >
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-yellow-400 rounded-full px-4 py-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Napište zprávu..."
                className="border-0 bg-transparent text-black placeholder-black/60 focus:ring-0 p-0"
                autoFocus
              />
            </div>
            <Button
              onClick={handleInputSubmit}
              disabled={!inputValue.trim()}
              size="icon"
              className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )

  const renderOtherView = () => {
    switch (currentInteraction.type) {
      case "multiple-choice":
        // Special handling for finger selection
        if (currentInteractionId === "finger-selection") {
          return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center space-y-8"
              >
                <div className="text-2xl md:text-3xl font-light mb-8">{processText(currentInteraction.text || "")}</div>
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  {currentInteraction.choices?.map((choice, index) => (
                    <Button
                      key={index}
                      onClick={() => handleChoice(choice)}
                      variant="outline"
                      className="h-16 px-4 bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white transition-all text-sm"
                    >
                      {choice.type}
                    </Button>
                  ))}
                </div>
              </motion.div>
            </div>
          )
        }

        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-8"
            >
              <div className="text-2xl md:text-4xl font-light mb-8">{processText(currentInteraction.text || "")}</div>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {currentInteraction.choices?.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    variant="outline"
                    size="lg"
                    className="text-4xl h-20 bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white transition-all"
                  >
                    {choice.type}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        )

      case "expanding-dot":
        return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, duration: 1 }}
              className="text-center"
            >
              <motion.div
                className="w-32 h-32 bg-yellow-400 rounded-full mx-auto mb-8"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-xl max-w-md"
              >
                {processText(currentInteraction.text || "")}
              </motion.div>
            </motion.div>
          </div>
        )

      case "message-circle":
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <motion.div
                className="w-80 h-80 border-2 border-yellow-400 rounded-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <div className="text-center max-w-xs p-4 whitespace-pre-line text-lg leading-relaxed">
                  {processText(currentInteraction.text || "")}
                </div>
              </motion.div>
            </motion.div>
          </div>
        )

      case "center-dot-to-play":
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div
                className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-8 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => currentInteraction.nextId && handleNext(currentInteraction.nextId)}
              />
              <div className="text-xl max-w-md">{processText(currentInteraction.text || "")}</div>
            </motion.div>
          </div>
        )

      case "social-media-storm":
        return (
          <div className="min-h-screen bg-gradient-to-br from-red-900 to-purple-900 text-white flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-4xl"
                  initial={{
                    x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
                    y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 600),
                    opacity: 0,
                  }}
                  animate={{
                    x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
                    y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 600),
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                >
                  {["📱", "💬", "❤️", "👍", "📸", "🎵", "📺", "🎮"][i % 8]}
                </motion.div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="text-2xl text-center max-w-md bg-black/80 p-8 rounded-2xl"
                >
                  {processText(currentInteraction.text || "")}
                </motion.div>
              </div>
            </div>
          </div>
        )

      case "turn-instruction":
        return (
          <div
            className={`min-h-screen bg-gradient-to-br from-green-900 to-blue-900 text-white flex items-center justify-center transition-transform duration-1000 ${
              isRotated ? "rotate-180" : ""
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center"
            >
              <Button
                onClick={() => {
                  setIsRotated(!isRotated)
                  setTimeout(() => {
                    if (currentInteraction.nextId) {
                      handleNext(currentInteraction.nextId)
                    }
                  }, 1000)
                }}
                variant="outline"
                size="lg"
                className="mb-8 bg-transparent border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {processText(currentInteraction.text || "")}
              </Button>
            </motion.div>
          </div>
        )

      case "rotating-bubble":
        return (
          <div className="min-h-screen bg-gradient-to-br from-teal-900 to-blue-900 text-white flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="p-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-96 h-96 border-4 border-yellow-400 rounded-full flex items-center justify-center"
              >
                <div className="text-center p-8 text-xl leading-relaxed max-w-xs">
                  {processText(currentInteraction.text || "")}
                </div>
              </motion.div>
            </motion.div>
          </div>
        )

      case "scroll-line":
      case "scroll-line-timeout":
        return (
          <div className="min-h-[200vh] bg-gradient-to-br from-orange-900 to-red-900 text-white">
            <div className="sticky top-0 h-screen flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center"
              >
                <div className="text-4xl mb-8">{processText(currentInteraction.text || "")}</div>
                <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto">
                  <motion.div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${scrollProgress * 100}%` }}
                  />
                </div>
                <div className="text-sm text-gray-300 mt-4">Scrolluj dolů</div>
              </motion.div>
            </div>
          </div>
        )

      case "back-to-chat":
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 text-white flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Button
                onClick={() => currentInteraction.nextId && handleNext(currentInteraction.nextId)}
                variant="outline"
                size="lg"
                className="bg-transparent border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {processText(currentInteraction.text || "")}
              </Button>
            </motion.div>
          </div>
        )

      case "chapter-complete":
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 text-white flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, duration: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="text-8xl mb-8"
              >
                🎉
              </motion.div>
              <div className="text-4xl font-bold mb-4">{processText(currentInteraction.text || "")}</div>
              <div className="text-xl text-green-200 mb-8">Kapitola 2 je teraz odomknutá!</div>
              <Button
                onClick={() => handleNext("menu")}
                size="lg"
                className="bg-yellow-400 text-black hover:bg-yellow-500"
              >
                Späť do menu
              </Button>
            </motion.div>
          </div>
        )

      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-4">Neznámy typ interakcie: {currentInteraction.type}</div>
              <Button
                onClick={() => currentInteraction.nextId && handleNext(currentInteraction.nextId)}
                variant="outline"
              >
                Pokračovať
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="relative">
      {/* Skip button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => {
            const completedChapters = JSON.parse(localStorage.getItem("completedChapters") || "[]")
            if (!completedChapters.includes(1)) {
              completedChapters.push(1)
              localStorage.setItem("completedChapters", JSON.stringify(completedChapters))
            }
            router.push("/menu")
          }}
          variant="outline"
          size="sm"
          className="bg-black/50 border-white/30 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          Skip Chapter
        </Button>
      </div>

      {/* Smartphone-style notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm"
          >
            <div className="bg-white text-black rounded-2xl shadow-2xl p-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">dotykáče</div>
                <div className="text-sm text-gray-600">{notificationText}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render appropriate view without screen flashing */}
      {currentView === "chat" ? renderChatView() : renderOtherView()}
    </div>
  )
}
