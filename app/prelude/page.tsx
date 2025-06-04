"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Send } from "lucide-react"

// Import prelude data
import preludeData from "@/data/prelude-flow.json"
import type { InteractionFlow, Interaction } from "@/types/interaction-system"

export default function PreludePage() {
    const router = useRouter()
    const [currentInteractionId, setCurrentInteractionId] = useState<string>("prelude-1")
    const [variables, setVariables] = useState<Record<string, any>>({})
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [displayedText, setDisplayedText] = useState("")
    const [showNextButton, setShowNextButton] = useState(false)

    // Transform raw JSON data to match our TypeScript interfaces
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

    const flow = transformRawData(preludeData)
    const currentInteraction = flow.interactions[currentInteractionId]

    // Process text with variables
    const processText = (text: string) => {
        return text.replace(/\{([^}]+)\}/g, (match, variable) => {
            return variables[variable] || match
        })
    }

    // Typing animation effect
    useEffect(() => {
        if (currentInteraction?.type === "title-card" && currentInteraction.text) {
            const text = processText(currentInteraction.text)
            setDisplayedText("")
            setShowNextButton(false)
            setIsTyping(true)

            let index = 0
            const typingInterval = setInterval(() => {
                if (index < text.length) {
                    setDisplayedText(text.slice(0, index + 1))
                    index++
                } else {
                    clearInterval(typingInterval)
                    setIsTyping(false)
                    setShowNextButton(true)
                }
            }, 50) // Typing speed

            return () => clearInterval(typingInterval)
        } else {
            setDisplayedText("")
            setShowNextButton(false)
            setIsTyping(false)
        }
    }, [currentInteractionId, variables])

    // Auto-advance for title cards after duration
    useEffect(() => {
        if (currentInteraction?.type === "title-card" && currentInteraction.nextId && !isTyping) {
            const timer = setTimeout(() => {
                if (showNextButton) {
                    handleNext(currentInteraction.nextId!)
                }
            }, currentInteraction.maxDuration || 3000)

            return () => clearTimeout(timer)
        }
    }, [currentInteraction, isTyping, showNextButton])

    const handleNext = (nextId: string) => {
        if (nextId === "menu") {
            // Mark prelude as completed and go to menu
            localStorage.setItem("preludeCompleted", "true")
            router.push("/menu")
            return
        }

        setCurrentInteractionId(nextId)
    }

    const handleChoice = (choice: any) => {
        // Save choice to localStorage
        const choices = JSON.parse(localStorage.getItem("preludeChoices") || "{}")
        choices[currentInteractionId] = choice.type
        localStorage.setItem("preludeChoices", JSON.stringify(choices))

        handleNext(choice.nextId)
    }

    const handleInputSubmit = () => {
        if (!inputValue.trim()) return

        // Save input to variables and localStorage
        let variableName = "input"
        if (currentInteractionId === "prelude-2") {
            variableName = "userName"
        } else if (currentInteractionId === "prelude-11a") {
            variableName = "phoneName"
        }

        const newVariables = { ...variables, [variableName]: inputValue }
        setVariables(newVariables)
        localStorage.setItem("preludeVariables", JSON.stringify(newVariables))

        setInputValue("")
        if (currentInteraction?.nextId) {
            handleNext(currentInteraction.nextId)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleInputSubmit()
        }
    }

    // Load saved data on mount
    useEffect(() => {
        const savedVariables = localStorage.getItem("preludeVariables")
        if (savedVariables) {
            setVariables(JSON.parse(savedVariables))
        }
    }, [])

    if (!currentInteraction) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Skip button */}
            <div className="absolute top-4 right-4 z-10">
                <Button
                    onClick={() => {
                        // Mark prelude as completed
                        localStorage.setItem("preludeCompleted", "true")

                        // Set default values for required variables
                        const defaultVariables = {
                            userName: "User",
                            phoneName: "Phone",
                        }

                        // Check if we already have some variables
                        const existingVars = localStorage.getItem("preludeVariables")
                        const mergedVars = {
                            ...defaultVariables,
                            ...(existingVars ? JSON.parse(existingVars) : {}),
                        }

                        // Save merged variables
                        localStorage.setItem("preludeVariables", JSON.stringify(mergedVars))

                        // Navigate to menu
                        router.push("/menu")
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-white/30 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                    Skip Intro
                </Button>
            </div>
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-4xl w-full text-center">
                    <AnimatePresence mode="wait">
                        {currentInteraction.type === "title-card" && (
                            <motion.div
                                key={currentInteractionId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-8"
                            >
                                <div className="text-4xl md:text-6xl font-light leading-relaxed">
                                    {displayedText}
                                    {isTyping && <span className="animate-pulse">|</span>}
                                </div>

                                {showNextButton && currentInteraction.nextId && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                        <Button
                                            onClick={() => handleNext(currentInteraction.nextId!)}
                                            variant="outline"
                                            size="lg"
                                            className="bg-transparent border-white text-white hover:bg-white hover:text-black transition-colors"
                                        >
                                            Continue
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {currentInteraction.type === "input" && (
                            <motion.div
                                key={currentInteractionId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-8"
                            >
                                <div className="text-2xl md:text-4xl font-light mb-8">{processText(currentInteraction.text || "")}</div>

                                <div className="flex items-center space-x-4 max-w-md mx-auto">
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your response..."
                                        className="bg-transparent border-white text-white placeholder-gray-400 text-lg"
                                        autoFocus
                                    />
                                    <Button
                                        onClick={handleInputSubmit}
                                        disabled={!inputValue.trim()}
                                        variant="outline"
                                        size="icon"
                                        className="bg-transparent border-white text-white hover:bg-white hover:text-black transition-colors"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {currentInteraction.type === "multiple-choice" && (
                            <motion.div
                                key={currentInteractionId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-8"
                            >
                                <div className="text-2xl md:text-4xl font-light mb-8">{processText(currentInteraction.text || "")}</div>

                                <div className="space-y-4 max-w-md mx-auto">
                                    {currentInteraction.choices?.map((choice, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => handleChoice(choice)}
                                            variant="outline"
                                            size="lg"
                                            className="w-full bg-transparent border-white text-white hover:bg-white hover:text-black transition-colors"
                                        >
                                            {choice.type}
                                        </Button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
