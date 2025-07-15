"use client"

import { useState, useEffect, useRef } from "react"
import { collection, addDoc, serverTimestamp, doc, runTransaction } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Volume2, VolumeX, SkipForward, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import type { DotykaceRoom } from "@/lib/dotykace-types"
import Image from "next/image"

interface Interaction {
    type: string
    text?: string
    duration?: number
    "next-id"?: string
    animation?: {
        type: string
        buttons?: Array<{
            label: string
            "next-id": string
        }>
        options?: string[]
        button?: {
            label: string
            "next-id": string
        }
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

export default function Chapter3() {
    const [flowData, setFlowData] = useState<FlowData | null>(null)
    const [currentStep, setCurrentStep] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [displayText, setDisplayText] = useState("")
    const [showButtons, setShowButtons] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [showWarning, setShowWarning] = useState(false)
    const [audioEnabled, setAudioEnabled] = useState(true)
    const [isTyping, setIsTyping] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [isCompleted, setIsCompleted] = useState(false)
    const [currentCharacterImage, setCurrentCharacterImage] = useState("/images/phone-character-simple.png")

    const backgroundAudioRef = useRef<HTMLAudioElement | null>(null)
    const sfxAudioRef = useRef<HTMLAudioElement | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const skipFlagRef = useRef(false)
    const router = useRouter()

    // Load flow data
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch("/data/chapter3-flow.json")
                if (!response.ok) throw new Error("Failed to fetch")
                const data: FlowData = await response.json()
                setFlowData(data)
                setCurrentStep(data.startInteractionId)
                setIsLoading(false)
            } catch (error) {
                console.error("Error loading flow data:", error)
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    // Process current step
    useEffect(() => {
        if (!flowData || !currentStep || isCompleted) return

        const interaction = flowData.interactions[currentStep]
        if (!interaction) {
            console.error(`Step ${currentStep} not found`)
            return
        }

        processStep(interaction)
    }, [currentStep, flowData, isCompleted])

    const processStep = (interaction: Interaction) => {
        console.log("Processing step:", currentStep, interaction.type)

        // Clear previous timeouts
        clearAllTimeouts()

        // Reset UI state
        setShowButtons(false)
        setTimeLeft(null)
        setShowWarning(false)
        setSelectedOptions([])
        skipFlagRef.current = false

        // Set character image based on interaction type
        updateCharacterImage(interaction)

        switch (interaction.type) {
            case "message":
                handleMessage(interaction)
                break
            case "display":
                handleDisplay(interaction)
                break
            case "input":
                handleInput(interaction)
                break
            case "pause":
                handlePause(interaction)
                break
            case "loop":
                handleLoop(interaction)
                break
            case "music":
                handleMusic(interaction)
                break
            default:
                console.warn("Unknown interaction type:", interaction.type)
        }
    }

    const updateCharacterImage = (interaction: Interaction) => {
        if (interaction.animation?.type === "choice" || interaction.animation?.type === "multiselect") {
            setCurrentCharacterImage("/images/phone-character-question.png")
        } else if (interaction.type === "input") {
            setCurrentCharacterImage("/images/phone-character-thinking.png")
        } else if (interaction.type === "pause") {
            setCurrentCharacterImage("/images/phone-character-thinking.png")
        } else {
            setCurrentCharacterImage("/images/phone-character-simple.png")
        }
    }

    const handleMessage = (interaction: Interaction) => {
        typeText(interaction.text || "", () => {
            if (interaction.animation?.type === "choice" || interaction.animation?.type === "multiselect") {
                setTimeout(() => setShowButtons(true), 500)
            } else if (interaction["next-id"]) {
                const delay = (interaction.duration || 3) * 1000
                timeoutRef.current = setTimeout(() => {
                    moveToNext(interaction["next-id"]!)
                }, delay)
            }
        })
    }

    const handleDisplay = (interaction: Interaction) => {
        setDisplayText(interaction.text || "")
        if (interaction["next-id"]) {
            const delay = (interaction.duration || 2) * 1000
            timeoutRef.current = setTimeout(() => {
                moveToNext(interaction["next-id"]!)
            }, delay)
        }
    }

    const handleInput = (interaction: Interaction) => {
        setDisplayText(interaction.text || interaction.label || "")
        setInputValue("")
        setShowButtons(true)

        if (interaction.duration) {
            setTimeLeft(interaction.duration)
            countdownIntervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev === null || prev <= 1) {
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
    }

    const handlePause = (interaction: Interaction) => {
        setDisplayText("...")
        if (interaction["next-id"]) {
            const delay = (interaction.duration || 3) * 1000
            timeoutRef.current = setTimeout(() => {
                moveToNext(interaction["next-id"]!)
            }, delay)
        }
    }

    const handleLoop = (interaction: Interaction) => {
        setDisplayText(interaction.text || "")
        setShowButtons(true)
    }

    const handleMusic = (interaction: Interaction) => {
        if (interaction.src && audioEnabled) {
            playAudio(interaction.src, "background", interaction.loop)
        }
        setDisplayText("Prehrávam hudbu...")
        if (interaction["next-id"]) {
            const delay = (interaction.duration || 1) * 1000
            timeoutRef.current = setTimeout(() => {
                moveToNext(interaction["next-id"]!)
            }, delay)
        }
    }

    const moveToNext = (nextId: string) => {
        if (nextId === "end") {
            completeChapter()
        } else {
            setCurrentStep(nextId)
        }
    }

    const completeChapter = async () => {
        setIsCompleted(true)
        setDisplayText("Kapitola 3 dokončená!")
        setCurrentCharacterImage("/images/phone-character-simple.png")

        // Update Firestore
        await updateChapterStatus()

        // Redirect after delay
        setTimeout(() => {
            router.push("/menu")
        }, 2000)
    }

    const updateChapterStatus = async () => {
        const roomId = localStorage.getItem("dotykace_roomId")
        const playerId = localStorage.getItem("dotykace_playerId")

        if (!roomId || !playerId) return

        try {
            const roomRef = doc(db, "rooms", roomId)
            await runTransaction(db, async (transaction) => {
                const roomDoc = await transaction.get(roomRef)
                if (!roomDoc.exists()) return

                const roomData = roomDoc.data() as DotykaceRoom
                const updatedParticipants = [...(roomData.participants || [])]
                const updatedChapterPermissions = { ...(roomData.chapterPermissions || {}) }

                const participantIndex = updatedParticipants.findIndex((p) => p.id === playerId)
                if (participantIndex !== -1) {
                    const participant = updatedParticipants[participantIndex]
                    const completedChapters = new Set(participant.completedChapters || [])
                    completedChapters.add(3)
                    participant.completedChapters = Array.from(completedChapters).sort()
                    participant.currentChapter = 4
                    updatedParticipants[participantIndex] = participant
                }

                if (!updatedChapterPermissions[playerId]) {
                    updatedChapterPermissions[playerId] = { allowedChapters: [], playerName: "" }
                }

                transaction.update(roomRef, {
                    participants: updatedParticipants,
                    chapterPermissions: updatedChapterPermissions,
                })
            })
        } catch (error) {
            console.error("Error updating chapter status:", error)
        }
    }

    const saveToFirestore = async (interactionId: string, responseValue: string | string[], interactionType: string) => {
        try {
            await addDoc(collection(db, "chapter3"), {
                interactionId,
                responseValue,
                interactionType,
                timestamp: serverTimestamp(),
                sessionId: `session_${Date.now()}`,
                chapter: "chapter3",
            })
        } catch (error) {
            console.error("Error saving to Firestore:", error)
        }
    }

    const handleInputSave = async (interaction: Interaction) => {
        clearInterval(countdownIntervalRef.current!)

        if (inputValue.trim()) {
            await saveToFirestore(currentStep, inputValue, "input")
        }

        setTimeLeft(null)
        setShowWarning(false)

        if (interaction["next-id"]) {
            moveToNext(interaction["next-id"])
        }
    }

    const handleButtonClick = async (nextId: string, buttonLabel?: string) => {
        if (buttonLabel) {
            await saveToFirestore(currentStep, buttonLabel, "choice")
        }
        moveToNext(nextId)
    }

    const handleMultiselectSave = async (interaction: Interaction) => {
        await saveToFirestore(currentStep, selectedOptions, "multiselect")
        if (interaction.animation?.button?.["next-id"]) {
            moveToNext(interaction.animation.button["next-id"])
        }
    }

    const handleOptionToggle = (option: string) => {
        setSelectedOptions((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]))
    }

    const handleSkip = () => {
        if (!flowData || !currentStep) return

        const interaction = flowData.interactions[currentStep]
        if (!interaction) return

        if (isTyping && typingIntervalRef.current) {
            skipFlagRef.current = true
            typeText(interaction.text || "")
            return
        }

        clearAllTimeouts()

        if (interaction["next-id"]) {
            moveToNext(interaction["next-id"])
        }
    }

    const typeText = (text: string, callback?: () => void) => {
        setIsTyping(true)
        setDisplayText("")

        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current)
        }

        if (skipFlagRef.current) {
            setDisplayText(text)
            setIsTyping(false)
            skipFlagRef.current = false
            if (callback) callback()
            return
        }

        let charIndex = 0
        typingIntervalRef.current = setInterval(() => {
            if (charIndex < text.length) {
                setDisplayText(text.slice(0, charIndex + 1))
                charIndex++
            } else {
                clearInterval(typingIntervalRef.current!)
                setIsTyping(false)
                if (callback) callback()
            }
        }, 30)
    }

    const playAudio = (src: string, type: "background" | "sfx", loop = false) => {
        if (!audioEnabled) return

        if (type === "background") {
            if (backgroundAudioRef.current) {
                backgroundAudioRef.current.pause()
            }
            backgroundAudioRef.current = new Audio(`/audio/${src}`)
            backgroundAudioRef.current.loop = loop
            backgroundAudioRef.current.volume = 0.3
            backgroundAudioRef.current.play().catch(console.error)
        }
    }

    const clearAllTimeouts = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }

    // Cleanup
    useEffect(() => {
        return () => {
            clearAllTimeouts()
            if (backgroundAudioRef.current) backgroundAudioRef.current.pause()
            if (sfxAudioRef.current) sfxAudioRef.current.pause()
        }
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-white text-xl font-medium"
                >
                    Načítavam Kapitolu 3...
                </motion.div>
            </div>
        )
    }

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <div className="mb-6">
                        <Image
                            src="/images/phone-character-simple.png"
                            alt="Phone Character"
                            width={120}
                            height={120}
                            className="mx-auto"
                        />
                    </div>
                    <Card className="bg-white/20 backdrop-blur-lg border-white/30 shadow-2xl">
                        <CardContent className="p-8 text-center">
                            <h2 className="text-3xl font-bold text-white mb-4">Kapitola 3 Dokončená!</h2>
                            <p className="text-white/90 text-lg">Presmerovávam na menu...</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    if (!flowData || !currentStep) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-xl">Chyba pri načítaní kapitoly</div>
            </div>
        )
    }

    const currentInteraction = flowData.interactions[currentStep]
    if (!currentInteraction) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-xl">Neplatná interakcia: {currentStep}</div>
            </div>
        )
    }

    const showSkipButton =
        currentInteraction["next-id"] &&
        !currentInteraction.animation?.buttons &&
        currentInteraction.type !== "input" &&
        currentInteraction.type !== "loop" &&
        currentInteraction.animation?.type !== "multiselect"

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex flex-col relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full"></div>
                <div className="absolute top-32 right-16 w-16 h-16 bg-blue-300 rounded-full"></div>
                <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-300 rounded-full"></div>
                <div className="absolute bottom-40 right-10 w-12 h-12 bg-pink-300 rounded-full"></div>
            </div>

            {/* Audio Control */}
            <div className="absolute top-4 right-4 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="text-white hover:bg-white/20 backdrop-blur-sm"
                >
                    {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
            </div>

            {/* Skip Button */}
            {showSkipButton && (
                <div className="absolute bottom-4 right-4 z-20">
                    <Button
                        onClick={handleSkip}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                    >
                        <SkipForward className="h-4 w-4 mr-2" />
                        Preskočiť
                    </Button>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-lg">
                    {/* Character Image */}
                    <motion.div
                        key={currentCharacterImage}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center mb-6"
                    >
                        <Image
                            src={currentCharacterImage || "/placeholder.svg"}
                            alt="Phone Character"
                            width={100}
                            height={100}
                            className="mx-auto"
                        />
                    </motion.div>

                    {/* Content Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="bg-white/20 backdrop-blur-lg border-white/30 shadow-2xl rounded-3xl">
                                <CardContent className="p-6 space-y-6">
                                    {/* Display Text */}
                                    <div className="min-h-[120px] flex items-center justify-center">
                                        <p className="text-white text-lg leading-relaxed text-center font-medium">
                                            {displayText}
                                            {isTyping && <span className="animate-pulse ml-1">|</span>}
                                        </p>
                                    </div>

                                    {/* Input Field */}
                                    {currentInteraction?.type === "input" && showButtons && (
                                        <div className="space-y-4">
                                            <Textarea
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder="Napíš svoju odpoveď..."
                                                className="bg-white/30 border-white/40 text-white placeholder:text-white/70 resize-none rounded-2xl"
                                                rows={3}
                                            />

                                            {timeLeft !== null && (
                                                <div className="text-center">
                                                    <div className="text-white/90 text-sm font-medium">
                                                        Zostáva: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                                                    </div>
                                                    {showWarning && currentInteraction["warning-text"] && (
                                                        <div className="text-yellow-200 text-sm mt-1 font-medium">
                                                            {currentInteraction["warning-text"]}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <Button
                                                onClick={() => handleInputSave(currentInteraction)}
                                                className="w-full bg-white/30 hover:bg-white/40 text-white border-white/40 rounded-2xl font-medium"
                                                disabled={!inputValue.trim()}
                                            >
                                                {currentInteraction["save-label"] || "Uložiť"}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Choice Buttons */}
                                    {showButtons &&
                                        currentInteraction?.animation?.type === "choice" &&
                                        currentInteraction.animation.buttons && (
                                            <div className="space-y-3">
                                                {currentInteraction.animation.buttons.map((button, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ x: -20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Button
                                                            onClick={() => handleButtonClick(button["next-id"], button.label)}
                                                            className="w-full bg-white/30 hover:bg-white/40 text-white border-white/40 rounded-2xl font-medium py-3 h-auto whitespace-normal"
                                                        >
                                                            {button.label}
                                                        </Button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                    {/* Multiselect Options */}
                                    {showButtons &&
                                        currentInteraction?.animation?.type === "multiselect" &&
                                        currentInteraction.animation.options && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 gap-3">
                                                    {currentInteraction.animation.options.map((option, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ x: -20, opacity: 0 }}
                                                            animate={{ x: 0, opacity: 1 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <Button
                                                                onClick={() => handleOptionToggle(option)}
                                                                className={`w-full rounded-2xl font-medium py-3 h-auto whitespace-normal transition-all ${
                                                                    selectedOptions.includes(option)
                                                                        ? "bg-yellow-400 text-yellow-900 border-yellow-500 shadow-lg"
                                                                        : "bg-white/30 hover:bg-white/40 text-white border-white/40"
                                                                }`}
                                                            >
                                                                {selectedOptions.includes(option) && <Check className="h-4 w-4 mr-2" />}
                                                                {option}
                                                            </Button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                {currentInteraction.animation.button && (
                                                    <Button
                                                        onClick={() => handleMultiselectSave(currentInteraction)}
                                                        className="w-full bg-white/40 hover:bg-white/50 text-white border-white/50 rounded-2xl font-medium mt-4"
                                                    >
                                                        {currentInteraction.animation.button.label}
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                    {/* Loop/Continue Button */}
                                    {showButtons && currentInteraction?.button && (
                                        <Button
                                            onClick={() => handleButtonClick(currentInteraction.button!["next-id"])}
                                            className="w-full bg-white/30 hover:bg-white/40 text-white border-white/40 rounded-2xl font-medium"
                                        >
                                            {currentInteraction.button.label}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="p-4 relative z-10">
                <div className="max-w-lg mx-auto">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <motion.div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                                width: `${Math.min(100, (Object.keys(flowData.interactions).indexOf(currentStep) / Object.keys(flowData.interactions).length) * 100)}%`,
                            }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
