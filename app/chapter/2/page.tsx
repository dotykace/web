"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { collection, addDoc, serverTimestamp, doc, runTransaction } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Volume2, VolumeX, SkipForward } from "lucide-react"
import { useRouter } from "next/navigation"
import type { DotykaceRoom } from "@/lib/dotykace-types"

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
    src?: string // For music type
    sound?: string // For voice type
    loop?: boolean
    forever?: boolean // For persistent background music
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
    const [audioInitialized, setAudioInitialized] = useState(false)
    const [hasStartedExperience, setHasStartedExperience] = useState(false) // New state for initial start

    // Three separate audio channels
    const backgroundAudioRef = useRef<HTMLAudioElement | null>(null) // For forever background music
    const voiceAudioRef = useRef<HTMLAudioElement | null>(null) // For voice tracks
    const sfxAudioRef = useRef<HTMLAudioElement | null>(null) // For sound effects

    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const skipFlagRef = useRef(false)
    const mountedRef = useRef(true)

    const router = useRouter()

    // Cleanup function
    const cleanup = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current)
            typingIntervalRef.current = null
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
        }
        // Clean up all audio channels
        ;[backgroundAudioRef, voiceAudioRef, sfxAudioRef].forEach((audioRef) => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
                audioRef.current = null
            }
        })
    }, [])

    // Initialize audio context for mobile Safari
    const initializeAudio = useCallback(async () => {
        if (audioInitialized) return

        try {
            // Play a silent audio to unlock audio context
            const silentAudio = new Audio(
                "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
            )
            silentAudio.volume = 0
            await silentAudio.play()
            silentAudio.pause()
            setAudioInitialized(true)
        } catch (error) {
            console.warn("Audio initialization failed:", error)
        }
    }, [audioInitialized])

    useEffect(() => {
        loadFlowData()
        return () => {
            mountedRef.current = false
            cleanup()
        }
    }, [cleanup])

    const loadFlowData = async () => {
        try {
            const response = await fetch("/data/chapter2-flow.json")
            if (!response.ok) throw new Error("Failed to load flow data")
            const data: FlowData = await response.json()

            if (!mountedRef.current) return

            setFlowData(data)
            // Do NOT set currentInteractionId here directly, wait for user to click "Start"
            setIsLoading(false)
        } catch (error) {
            console.error("Error loading flow data:", error)
            if (mountedRef.current) {
                setIsLoading(false)
            }
        }
    }

    // Enhanced saveToFirestore to include choice data
    const saveToFirestore = async (
        inputData: string,
        interactionId: string,
        choiceData?: { label: string; nextId: string },
    ) => {
        try {
            const docData: any = {
                interactionId,
                userInput: inputData,
                timestamp: serverTimestamp(),
                sessionId: `session_${Date.now()}`,
                chapter: "chapter2",
            }

            // Add choice data if provided
            if (choiceData) {
                docData.choice = choiceData
            }

            await addDoc(collection(db, "chapter2"), docData)
        } catch (error) {
            console.error("Error saving to Firestore:", error)
        }
    }

    const typeText = useCallback((text: string, callback?: () => void) => {
        if (!mountedRef.current) return

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
        let currentTypedText = ""

        typingIntervalRef.current = setInterval(() => {
            if (!mountedRef.current) {
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current)
                }
                return
            }

            if (charIndex < text.length) {
                currentTypedText += text[charIndex]
                setDisplayText(currentTypedText)
                charIndex++
            } else {
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current)
                    typingIntervalRef.current = null
                }
                setIsTyping(false)
                if (callback) callback()
            }
        }, 30)
    }, [])

    // Multi-channel audio playback
    const playAudio = useCallback(
        async (src: string, channel: "background" | "voice" | "sfx", loop = false) => {
            if (!audioEnabled || !audioInitialized) {
                console.warn(
                    `Audio playback skipped for ${channel} channel (${src}): audioEnabled=${audioEnabled}, audioInitialized=${audioInitialized}`,
                )
                return
            }

            let audioRef: React.MutableRefObject<HTMLAudioElement | null>
            let volume: number

            switch (channel) {
                case "background":
                    audioRef = backgroundAudioRef
                    volume = 0.3
                    break
                case "voice":
                    audioRef = voiceAudioRef
                    volume = 1.0
                    break
                case "sfx":
                    audioRef = sfxAudioRef
                    volume = 0.7
                    break
            }

            // Stop current audio on this channel
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
            }

            try {
                const audio = new Audio(`/audio/${src}`)
                audio.loop = loop
                audio.volume = volume
                audio.preload = "auto"

                // Handle voice looping
                if (channel === "voice" && loop) {
                    audio.onended = () => {
                        if (mountedRef.current && audioRef.current === audio) {
                            audio.currentTime = 0
                            audio.play().catch(console.error)
                        }
                    }
                }

                audioRef.current = audio
                await audio.play()
            } catch (error) {
                console.warn(`Audio playback failed for ${channel} channel (${src}):`, error)
            }
        },
        [audioEnabled, audioInitialized],
    )

    // Stop voice and SFX but keep background music
    const stopVoiceAndSfxAudio = useCallback(() => {
        ;[voiceAudioRef, sfxAudioRef].forEach((audioRef) => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
                audioRef.current = null
            }
        })
    }, [])

    const processInteraction = useCallback(
        (interaction: Interaction) => {
            if (!mountedRef.current) return

            console.log("Processing interaction:", currentInteractionId, interaction.type)

            // Clear timeouts and intervals
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current)
                typingIntervalRef.current = null
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
                countdownIntervalRef.current = null
            }

            // Stop voice and SFX but keep background music
            stopVoiceAndSfxAudio()
            setShowButtons(false)
            setTimeLeft(null)
            setShowWarning(false)
            skipFlagRef.current = false
            setIsTyping(false)

            switch (interaction.type) {
                case "voice":
                    if (interaction.sound) {
                        playAudio(interaction.sound, "voice", interaction.loop)
                    }
                    // Voice interactions show text immediately if present
                    setDisplayText(interaction.text || "")

                    // Handle button display for looping voice
                    if (interaction.button) {
                        setShowButtons(true)
                    } else if (interaction["next-id"]) {
                        timeoutRef.current = setTimeout(
                            () => {
                                if (mountedRef.current) {
                                    setCurrentInteractionId(interaction["next-id"]!)
                                }
                            },
                            (interaction.duration || 3) * 1000,
                        )
                    }
                    break

                case "message":
                    typeText(interaction.text || "", () => {
                        if (!mountedRef.current) return

                        if (interaction.animation?.type === "normal" || interaction.animation?.type === "choice") {
                            timeoutRef.current = setTimeout(() => {
                                if (mountedRef.current) setShowButtons(true)
                            }, 500)
                        } else if (interaction["next-id"]) {
                            timeoutRef.current = setTimeout(
                                () => {
                                    if (mountedRef.current) {
                                        setCurrentInteractionId(interaction["next-id"]!)
                                    }
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
                                if (mountedRef.current) {
                                    setCurrentInteractionId(interaction["next-id"]!)
                                }
                            },
                            (interaction.duration || 2) * 1000,
                        )
                    }
                    break

                case "music":
                    if (interaction.src) {
                        if (interaction.forever) {
                            // Play on background channel for forever music
                            playAudio(interaction.src, "background", interaction.loop)
                        } else {
                            // Play on SFX channel for regular music
                            playAudio(interaction.src, "sfx", interaction.loop)
                        }
                    }
                    if (interaction["next-id"]) {
                        timeoutRef.current = setTimeout(
                            () => {
                                if (mountedRef.current) {
                                    setCurrentInteractionId(interaction["next-id"]!)
                                }
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
                                if (mountedRef.current) {
                                    setCurrentInteractionId(interaction["next-id"]!)
                                }
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
                        countdownIntervalRef.current = setInterval(() => {
                            setTimeLeft((prev) => {
                                if (!mountedRef.current || prev === null) return null

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
                    setDisplayText(savedUserMessage || "Žiadny vzkaz")
                    if (interaction["next-id"]) {
                        timeoutRef.current = setTimeout(
                            () => {
                                if (mountedRef.current) {
                                    setCurrentInteractionId(interaction["next-id"]!)
                                }
                            },
                            (interaction.duration || 3) * 1000,
                        )
                    }
                    break
            }
        },
        [currentInteractionId, typeText, playAudio, stopVoiceAndSfxAudio, savedUserMessage],
    )

    const handleInputSave = useCallback(
        async (interaction: Interaction) => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
                countdownIntervalRef.current = null
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
        },
        [inputValue, currentInteractionId],
    )

    // Enhanced handleButtonClick to save choice data
    const handleButtonClick = useCallback(
        async (button: { label: string; "next-id": string }) => {
            await initializeAudio() // Ensure audio is initialized on any user interaction
            stopVoiceAndSfxAudio()

            // Save choice to Firestore
            await saveToFirestore("", currentInteractionId, {
                label: button.label,
                nextId: button["next-id"],
            })

            setCurrentInteractionId(button["next-id"])
        },
        [initializeAudio, stopVoiceAndSfxAudio, currentInteractionId],
    )

    const handleSkip = useCallback(() => {
        if (!flowData || !currentInteractionId) return

        const currentInteraction = flowData.interactions[currentInteractionId]

        if (isTyping && typingIntervalRef.current && currentInteraction.type === "message") {
            skipFlagRef.current = true
            typeText(currentInteraction.text || "")
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }

        if (currentInteraction["next-id"]) {
            setCurrentInteractionId(currentInteraction["next-id"])
        }
    }, [flowData, currentInteractionId, isTyping, typeText])

    const updateChapterCompletionStatus = useCallback(async () => {
        const storedRoomId = localStorage.getItem("dotykace_roomId")
        const storedPlayerId = localStorage.getItem("dotykace_playerId")

        if (!storedRoomId || !storedPlayerId) {
            console.warn("Room ID or Player ID not found in localStorage. Cannot update Firestore.")
            return
        }

        const roomRef = doc(db, "rooms", storedRoomId)

        try {
            await runTransaction(db, async (transaction) => {
                const roomDoc = await transaction.get(roomRef)
                if (!roomDoc.exists()) {
                    throw "Room document does not exist!"
                }

                const roomData = roomDoc.data() as DotykaceRoom
                const updatedParticipants = [...(roomData.participants || [])]

                const participantIndex = updatedParticipants.findIndex((p) => p.id === storedPlayerId)
                if (participantIndex !== -1) {
                    const participant = updatedParticipants[participantIndex]
                    const completedChapters = new Set(participant.completedChapters || [])
                    completedChapters.add(2)
                    participant.completedChapters = Array.from(completedChapters).sort((a, b) => a - b)
                    participant.currentChapter = 3
                    updatedParticipants[participantIndex] = participant
                }

                transaction.update(roomRef, {
                    participants: updatedParticipants,
                })
            })

            console.log("Firestore updated successfully: Chapter 2 completed, Chapter 3 unlocked.")
            router.push("/menu")
        } catch (e) {
            console.error("Firestore transaction failed: ", e)
        }
    }, [router])

    // Process current interaction only if experience has started
    useEffect(() => {
        if (hasStartedExperience && flowData && currentInteractionId && flowData.interactions[currentInteractionId]) {
            processInteraction(flowData.interactions[currentInteractionId])
        }
    }, [currentInteractionId, flowData, processInteraction, hasStartedExperience])

    // Handle chapter completion
    useEffect(() => {
        if (flowData && currentInteractionId === "end") {
            updateChapterCompletionStatus()
        }
    }, [currentInteractionId, flowData, updateChapterCompletionStatus])

    // Handle audio muting
    useEffect(() => {
        ;[backgroundAudioRef, voiceAudioRef, sfxAudioRef].forEach((audioRef) => {
            if (audioRef.current) {
                audioRef.current.muted = !audioEnabled
            }
        })
    }, [audioEnabled])

    const handleStartExperience = async () => {
        await initializeAudio()
        setHasStartedExperience(true)
        setCurrentInteractionId(flowData!.startInteractionId) // Set initial interaction after start
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Načítavam Chapter 2...</div>
            </div>
        )
    }

    if (!flowData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Chyba pri načítaní</div>
            </div>
        )
    }

    // Show start button if experience hasn't started
    if (!hasStartedExperience) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Vitajte v Kapitole 2</h2>
                        <p className="text-white/80 mb-6">Pre spustenie zážitku kliknite na tlačidlo.</p>
                        <Button
                            onClick={handleStartExperience}
                            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200 hover:scale-105"
                        >
                            Spustiť
                        </Button>
                    </CardContent>
                </Card>
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
                        <p className="text-white/80 mb-6">Aktualizujem stav...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const showSkipButton =
        currentInteraction &&
        currentInteraction["next-id"] &&
        !currentInteraction.animation?.buttons &&
        currentInteraction.type !== "input" &&
        currentInteraction.type !== "loop" &&
        !currentInteraction.button

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
            {/* Audio Control */}
            <div className="absolute top-4 right-4 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        initializeAudio() // Ensure audio is initialized even if toggling mute
                        setAudioEnabled(!audioEnabled)
                    }}
                    className="text-white hover:bg-white/20"
                >
                    {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
            </div>

            {/* Skip Button */}
            {showSkipButton && (
                <div className="absolute bottom-4 right-4 z-20">
                    <Button
                        onClick={handleSkip}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center gap-1"
                    >
                        <SkipForward className="h-4 w-4" />
                        Preskočiť
                    </Button>
                </div>
            )}

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
                                        onClick={() => handleButtonClick(button)}
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
                                onClick={() => handleButtonClick(currentInteraction.button!)}
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
