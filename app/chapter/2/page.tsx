"use client"

import { useState, useEffect, useRef } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Volume2, VolumeX } from "lucide-react"

interface Interaction {
    type: string
    text?: string
    duration?: number
    "next-id"?: string
    animation?: {
        type: string
        buttons: Array<{
            label: string
            "next-id": string
        }>
    }
    src?: string
    loop?: boolean
    label?: string
    "save-label"?: string
    "warning-after"?: number
    "warning-text"?: string
    "countdown-last"?: number
    pause?: number
    button?: {
        label: string
        "next-id": string
        persistent?: boolean
    }
    source?: string
}

interface FlowData {
    id: string
    startInteractionId: string
    interactions: Record<string, Interaction>
}

export default function Chapter2() {
    const [flowData, setFlowData] = useState<FlowData | null>(null)
    const [currentInteractionId, setCurrentInteractionId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [displayText, setDisplayText] = useState("")
    const [showButtons, setShowButtons] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [savedUserMessage, setSavedUserMessage] = useState("")
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [showWarning, setShowWarning] = useState(false)
    const [audioEnabled, setAudioEnabled] = useState(true)
    const [isTyping, setIsTyping] = useState(false)

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null) // Používame pre typing interval

    useEffect(() => {
        loadFlowData()
    }, [])

    const loadFlowData = async () => {
        try {
            const response = await fetch("/data/chapter2-flow.json")
            const data: FlowData = await response.json()
            setFlowData(data)
            setCurrentInteractionId(data.startInteractionId)
            setIsLoading(false)
        } catch (error) {
            console.error("Error loading flow data:", error)
            setIsLoading(false)
        }
    }

    const saveToFirestore = async (inputData: string, interactionId: string) => {
        try {
            await addDoc(collection(db, "chapter2"), {
                interactionId,
                userInput: inputData,
                timestamp: serverTimestamp(),
                sessionId: `session_${Date.now()}`,
                chapter: "chapter2",
            })
        } catch (error) {
            console.error("Error saving to Firestore:", error)
        }
    }

    const typeText = (text: string, callback?: () => void) => {
        setIsTyping(true)
        setDisplayText("") // Vyčistí predchádzajúci text

        let charIndex = 0
        let currentTypedText = ""

        // Vyčistí akýkoľvek existujúci interval písania, aby sa zabránilo viacerým spusteniam
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        intervalRef.current = setInterval(() => {
            if (charIndex < text.length) {
                currentTypedText += text[charIndex]
                setDisplayText(currentTypedText)
                charIndex++
            } else {
                clearInterval(intervalRef.current!) // Používame ! pretože sme ho už skontrolovali
                setIsTyping(false)
                if (callback) callback()
            }
        }, 30)
    }

    const playAudio = (src: string, loop = false) => {
        if (!audioEnabled) return

        if (audioRef.current) {
            audioRef.current.pause()
        }

        audioRef.current = new Audio(`/audio/${src}`)
        audioRef.current.loop = loop
        audioRef.current.play().catch(console.error)
    }

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }
    }

    const processInteraction = (interaction: Interaction) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        if (intervalRef.current) {
            // Clear typing interval as well
            clearInterval(intervalRef.current)
        }

        setShowButtons(false)
        setTimeLeft(null)
        setShowWarning(false)

        switch (interaction.type) {
            case "message":
                typeText(interaction.text || "", () => {
                    if (interaction.animation?.type === "normal" || interaction.animation?.type === "choice") {
                        setTimeout(() => setShowButtons(true), 500)
                    } else if (interaction["next-id"]) {
                        timeoutRef.current = setTimeout(
                            () => {
                                setCurrentInteractionId(interaction["next-id"]!)
                            },
                            (interaction.duration || 3) * 1000,
                        )
                    }
                })
                break

            case "display":
                setDisplayText(interaction.text || "")
                if (interaction["next-id"]) {
                    timeoutRef.current = setTimeout(
                        () => {
                            setCurrentInteractionId(interaction["next-id"]!)
                        },
                        (interaction.duration || 2) * 1000,
                    )
                }
                break

            case "music":
                if (interaction.src) {
                    playAudio(interaction.src, interaction.loop)
                }
                if (interaction["next-id"]) {
                    timeoutRef.current = setTimeout(
                        () => {
                            setCurrentInteractionId(interaction["next-id"]!)
                        },
                        (interaction.duration || 1) * 1000,
                    )
                }
                break

            case "pause":
                setDisplayText("...")
                if (interaction["next-id"]) {
                    timeoutRef.current = setTimeout(
                        () => {
                            setCurrentInteractionId(interaction["next-id"]!)
                        },
                        (interaction.duration || 3) * 1000,
                    )
                }
                break

            case "loop":
                setDisplayText(interaction.text || "")
                setShowButtons(true)
                break

            case "input":
                setDisplayText(interaction.text || interaction.label || "")
                setInputValue("")
                setShowButtons(true)

                if (interaction.duration) {
                    setTimeLeft(interaction.duration)
                    intervalRef.current = setInterval(() => {
                        setTimeLeft((prev) => {
                            if (prev === null) return null
                            if (prev <= 1) {
                                handleInputSave(interaction)
                                return null
                            }

                            if (interaction["warning-after"] && prev === interaction["warning-after"]) {
                                setShowWarning(true)
                            }

                            return prev - 1
                        })
                    }, 1000)
                }
                break

            case "show-message":
                if (interaction.source === "saved-user-message") {
                    setDisplayText(savedUserMessage || "Žiadny vzkaz")
                }
                if (interaction["next-id"]) {
                    timeoutRef.current = setTimeout(
                        () => {
                            setCurrentInteractionId(interaction["next-id"]!)
                        },
                        (interaction.duration || 3) * 1000,
                    )
                }
                break
        }
    }

    const handleInputSave = async (interaction: Interaction) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        if (inputValue.trim()) {
            await saveToFirestore(inputValue, currentInteractionId)

            if (interaction.label?.includes("Když držíš můj mobil")) {
                setSavedUserMessage(inputValue)
            }
        }

        setTimeLeft(null)
        setShowWarning(false)

        if (interaction["next-id"]) {
            setCurrentInteractionId(interaction["next-id"])
        }
    }

    const handleButtonClick = (nextId: string) => {
        stopAudio()
        setCurrentInteractionId(nextId)
    }

    useEffect(() => {
        if (flowData && currentInteractionId && flowData.interactions[currentInteractionId]) {
            processInteraction(flowData.interactions[currentInteractionId])
        }
    }, [currentInteractionId, flowData])

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (intervalRef.current) clearInterval(intervalRef.current)
            stopAudio()
        }
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Načítavam Chapter 2...</div>
            </div>
        )
    }

    if (!flowData || !currentInteractionId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Chyba pri načítaní</div>
            </div>
        )
    }

    const currentInteraction = flowData.interactions[currentInteractionId]

    if (currentInteractionId === "end") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Chapter 2 Dokončený</h2>
                        <p className="text-white/80 mb-6">Ďakujem za účasť v tejto kapitole!</p>
                        <Button
                            onClick={() => (window.location.href = "/")}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                            Späť na hlavnú stránku
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
            {/* Audio Control */}
            <div className="absolute top-4 right-4 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="text-white hover:bg-white/20"
                >
                    {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                    <CardContent className="p-6 space-y-6">
                        {/* Display Text */}
                        <div className="min-h-[120px] flex items-center justify-center">
                            <p className="text-white text-lg leading-relaxed text-center">
                                {displayText}
                                {isTyping && <span className="animate-pulse">|</span>}
                            </p>
                        </div>

                        {/* Input Field */}
                        {currentInteraction?.type === "input" && showButtons && (
                            <div className="space-y-4">
                                <Textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Napíš svoju odpoveď..."
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 resize-none"
                                    rows={3}
                                />

                                {timeLeft !== null && (
                                    <div className="text-center">
                                        <div className="text-white/80 text-sm">
                                            Zostáva: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                                        </div>
                                        {showWarning && currentInteraction["warning-text"] && (
                                            <div className="text-yellow-300 text-sm mt-1">{currentInteraction["warning-text"]}</div>
                                        )}
                                    </div>
                                )}

                                <Button
                                    onClick={() => handleInputSave(currentInteraction)}
                                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                                    disabled={!inputValue.trim()}
                                >
                                    {currentInteraction["save-label"] || "Uložiť"}
                                </Button>
                            </div>
                        )}

                        {/* Choice Buttons */}
                        {showButtons && currentInteraction?.animation?.buttons && (
                            <div className="space-y-3">
                                {currentInteraction.animation.buttons.map((button, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => handleButtonClick(button["next-id"])}
                                        className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200 hover:scale-105"
                                    >
                                        {button.label}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Loop/Continue Button */}
                        {showButtons && currentInteraction?.button && (
                            <Button
                                onClick={() => handleButtonClick(currentInteraction.button!["next-id"])}
                                className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200 hover:scale-105"
                            >
                                {currentInteraction.button.label}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Progress Indicator */}
            <div className="p-4">
                <div className="max-w-lg mx-auto">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
                            style={{
                                width: `${Math.min(100, (Object.keys(flowData.interactions).indexOf(currentInteractionId) / Object.keys(flowData.interactions).length) * 100)}%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
