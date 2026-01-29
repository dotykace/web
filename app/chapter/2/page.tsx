"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Volume2, VolumeX, Star } from "lucide-react"
import HelpButton from "@/components/HelpButton";
import useDB from "@/hooks/use-db";
import {useRouter} from "next/navigation";
import {readFromStorage, setToStorage} from "@/scripts/local-storage";
import SkipButton from "@/components/SkipButton";
import AudioControl from "@/components/AudioControl";

// Animated Voice Visualization Component (unchanged)
const VoiceVisualization = ({ isActive }: { isActive: boolean }) => {
    return (
        <div className="relative w-full h-48 flex items-center justify-center">
            {/* Central phone character with pulsing effect */}
            <div className="relative z-10">
                <div className={`relative transition-all duration-1000 ${isActive ? "animate-pulse scale-110" : "scale-100"}`}>
                    <img src="/images/phone-character-simple.png" alt="Phone Character" className="w-24 h-24 drop-shadow-lg" />
                    {/* Animated rings around character */}
                    {isActive && (
                        <>
                            <div className="absolute inset-0 rounded-full border-2 border-yellow-300/50 animate-ping" />
                            <div
                                className="absolute inset-0 rounded-full border-2 border-orange-300/50 animate-ping"
                                style={{ animationDelay: "0.5s" }}
                            />
                            <div
                                className="absolute inset-0 rounded-full border-2 border-pink-300/50 animate-ping"
                                style={{ animationDelay: "1s" }}
                            />
                        </>
                    )}
                </div>
                {/* Sound waves */}
                {isActive && (
                    <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
                                style={{
                                    height: `${20 + i * 8}px`,
                                    right: `${i * 8}px`,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    animationDelay: `${i * 0.2}s`,
                                    animationDuration: "0.8s",
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// New Music Star Animation Component
const MusicStarAnimation = ({ isActive }: { isActive: boolean }) => {
    if (!isActive) return null

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <Star
                className="text-yellow-300 drop-shadow-lg animate-star-scale-pulse"
                size={100} // Base size for the star
            />
            {/* Subtle glowing rings around the star */}
            <div className="absolute w-24 h-24 rounded-full bg-yellow-300/30 animate-ping-slow" />
            <div
                className="absolute w-32 h-32 rounded-full bg-orange-300/20 animate-ping-slow"
                style={{ animationDelay: "0.5s" }}
            />
        </div>
    )
}

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
        "show-after-first-play"?: boolean // New property for delayed button display
        wait_to_show?: number // New property for timed button display
    }
    source?: string
}

interface FlowData {
    id: string
    startInteractionId: string
    interactions: Record<string, Interaction>
}

// LocalStorage keys
const CHAPTER2_PROGRESS_KEY = "chapter2_progress"

interface Chapter2Progress {
    currentInteractionId: string
    savedUserMessage: string
    hasStartedExperience: boolean
}

function Chapter2Content() {
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
    const [hasStartedExperience, setHasStartedExperience] = useState(false)
    const [isMusicPlaying, setIsMusicPlaying] = useState(false) // New state for music star animation
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false) // Track if audio has played once for delayed button

    // Only two audio channels now: voice and sfx
    const voiceAudioRef = useRef<HTMLAudioElement | null>(null) // For voice tracks
    const sfxAudioRef = useRef<HTMLAudioElement | null>(null) // For sound effects
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const buttonTimeoutRef = useRef<NodeJS.Timeout | null>(null) // New ref for button timing
    const skipFlagRef = useRef(false)
    const mountedRef = useRef(true)

    const [selectedVoice, setSelectedVoice] = useState()

    const router = useRouter()

    const [dbHook, setDbHook] = useState<any>(null);

    useEffect(() => {
        const hook = useDB();
        setDbHook(hook);
        setSelectedVoice(readFromStorage("selectedVoice"))
    }, []);

    // LocalStorage functions
    const saveProgressToLocalStorage = useCallback((interactionId: string, message: string, started: boolean) => {
      const progress: Chapter2Progress = {
        currentInteractionId: interactionId,
        savedUserMessage: message,
        hasStartedExperience: started,
      }
      setToStorage(CHAPTER2_PROGRESS_KEY, progress)
    }, [])

    const loadProgressFromLocalStorage = useCallback((): Chapter2Progress | null => {
      return readFromStorage(CHAPTER2_PROGRESS_KEY)
    }, [])

    // Cleanup function
    useCallback(() => {
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
        if (buttonTimeoutRef.current) {
            clearTimeout(buttonTimeoutRef.current)
            buttonTimeoutRef.current = null
        }
        // Clean up all remaining audio channels
        ;[voiceAudioRef, sfxAudioRef].forEach((audioRef) => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
                audioRef.current = null
            }
        })
    }, []);
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
        const loadFlowData = async () => {
            try {
                const response = await fetch("/data/chapter2-flow.json");
                if (!response.ok) throw new Error("Failed to load flow data");
                const data: FlowData = await response.json();
                if (!mountedRef.current) return;

                setFlowData(data);

                const savedProgress = loadProgressFromLocalStorage();
                if (savedProgress) {
                    setCurrentInteractionId(savedProgress.currentInteractionId);
                    setSavedUserMessage(savedProgress.savedUserMessage);
                    setHasStartedExperience(savedProgress.hasStartedExperience);

                    // nastav príznak, že je potrebná nová interakcia
                    setAudioInitialized(false);
                }

                setIsLoading(false);
            } catch (error) {
                console.error("Error loading flow data:", error);
                if (mountedRef.current) {
                    setIsLoading(false);
                }
            }
        };

        loadFlowData();
    }, []);


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
        async (src: string, channel: "voice" | "sfx", loop = false) => {
            if (!audioEnabled || !audioInitialized) {
                console.warn(
                    `Audio playback skipped for ${channel} channel (${src}): audioEnabled=${audioEnabled}, audioInitialized=${audioInitialized}`,
                )
                return
            }

            let audioRef: React.MutableRefObject<HTMLAudioElement | null>
            let volume: number

            switch (channel) {
                case "voice":
                    audioRef = voiceAudioRef
                    volume = 1.0
                    break
                case "sfx":
                    audioRef = sfxAudioRef
                    volume = 0.7
                    break
            }

            // Stop current audio on this channel and clear previous onended handler
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
                audioRef.current.onended = null // Clear previous onended handler
            }

            try {
                const audio = new Audio(`/audio/${src}`)
                audio.loop = loop
                audio.volume = volume
                audio.preload = "auto"
                audioRef.current = audio
                await audio.play()
            } catch (error) {
                console.warn(`Audio playback failed for ${channel} channel (${src}):`, error)
            }
        },
        [audioEnabled, audioInitialized],
    )

    // Stop all audio (voice and SFX)
    const stopAllAudio = useCallback(() => {
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
            if (buttonTimeoutRef.current) {
                clearTimeout(buttonTimeoutRef.current)
                buttonTimeoutRef.current = null
            }

            // Stop all audio
            stopAllAudio()
            setShowButtons(false)
            setTimeLeft(null)
            setShowWarning(false)
            skipFlagRef.current = false
            setIsTyping(false)
            setIsMusicPlaying(false) // Reset music animation state
            setHasPlayedOnce(false) // Reset first play tracking for the new interaction

            switch (interaction.type) {
                case "voice":
                    if (interaction.sound) {
                        const filePath = selectedVoice? `${selectedVoice}/${interaction.sound}`:interaction.sound
                        console.log("Interaction sound file path:",filePath)
                        playAudio(filePath, "voice", interaction.loop)

                        // Special handling for looping voice with delayed button
                        if (interaction.loop && interaction.button?.["show-after-first-play"]) {
                            // Set onended handler *after* playAudio has set voiceAudioRef.current
                            if (voiceAudioRef.current) {
                                voiceAudioRef.current.onended = () => {
                                    if (mountedRef.current && voiceAudioRef.current) {
                                        setHasPlayedOnce(true) // This will trigger the button display
                                        voiceAudioRef.current.currentTime = 0 // Reset for next loop
                                        voiceAudioRef.current.play().catch(console.error)
                                    }
                                }
                            }
                        }
                    }
                    setDisplayText(interaction.text || "")
                    if (interaction.button) {
                        // Handle different button display modes
                        if (interaction.button["show-after-first-play"]) {
                            // Don't show button immediately, wait for first play to complete
                        } else if (interaction.button["wait_to_show"]) {
                            // Show button after specified seconds
                            buttonTimeoutRef.current = setTimeout(() => {
                                if (mountedRef.current) {
                                    setShowButtons(true)
                                }
                            }, interaction.button["wait_to_show"] * 1000)
                        } else {
                            // Show button immediately
                            setShowButtons(true)
                        }
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
                    setCurrentInteractionId(interaction["next-id"]!)
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
        [currentInteractionId, typeText, playAudio, stopAllAudio, savedUserMessage],
    )

    // Effect to handle delayed button display for voice interactions
    useEffect(() => {
        if (!flowData || !currentInteractionId) return

        const currentInteraction = flowData.interactions[currentInteractionId]
        if (currentInteraction?.type === "voice" && currentInteraction.button?.["show-after-first-play"] && hasPlayedOnce) {
            setShowButtons(true)
        }
    }, [hasPlayedOnce, currentInteractionId, flowData])

    // Save progress to localStorage whenever currentInteractionId or savedUserMessage changes
    useEffect(() => {
        if (currentInteractionId && hasStartedExperience) {
            saveProgressToLocalStorage(currentInteractionId, savedUserMessage, hasStartedExperience)
        }
    }, [currentInteractionId, savedUserMessage, hasStartedExperience, saveProgressToLocalStorage])

    // Auto-initialize audio and process interaction when loading from localStorage
    useEffect(() => {
        if (hasStartedExperience && !audioInitialized) {
            initializeAudio()
        }
    }, [hasStartedExperience, audioInitialized, initializeAudio])

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
            stopAllAudio()

            // Save choice to Firestore
            await saveToFirestore("", currentInteractionId, {
                label: button.label,
                nextId: button["next-id"],
            })

            setCurrentInteractionId(button["next-id"])
        },
        [initializeAudio, stopAllAudio, currentInteractionId],
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

    // Process current interaction only if experience has started
    // todo add here voice selection check
    useEffect(() => {
        if ( hasStartedExperience && flowData && currentInteractionId && flowData.interactions[currentInteractionId]) {
            processInteraction(flowData.interactions[currentInteractionId])
        }
    }, [currentInteractionId, flowData, processInteraction, hasStartedExperience])

    // Handle chapter completion
    useEffect(() => {
        if (flowData && currentInteractionId === "end") {
            dbHook.updateChapter(2, () => router.push("/menu")).then()
        }
    }, [currentInteractionId, flowData])

    // Handle audio muting
    useEffect(() => {
        ;[voiceAudioRef, sfxAudioRef].forEach((audioRef) => {
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

    if (hasStartedExperience && !audioInitialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Pokračovať v zážitku?</h2>
                        <p className="text-white/80 mb-6">Klikni na tlačidlo nižšie pre pokračovanie.</p>
                        <Button
                            onClick={async () => {
                                await initializeAudio();
                                setAudioInitialized(true);
                                processInteraction(flowData!.interactions[currentInteractionId]);
                            }}
                            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200 hover:scale-105"
                        >
                            Pokračovať
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }


    const currentInteraction = flowData.interactions[currentInteractionId]

    // Show skip button only for desktop/laptop screens (lg and above)
    const showSkipButton = true;
    // todo solve the skip button visibility properly
        // currentInteraction &&
        // currentInteraction["next-id"] &&
        // !currentInteraction.animation?.buttons &&
        // currentInteraction.type !== "input" &&
        // currentInteraction.type !== "loop" &&
        // !currentInteraction.button

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">

            {/* Skip Button - Only visible on desktop/laptop screens (lg and above) */}
            <SkipButton onSkip={handleSkip} visible={showSkipButton}/>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                    <AudioControl
                      onClick={() => {
                        initializeAudio() // Ensure audio is initialized even if toggling mute
                        setAudioEnabled(!audioEnabled)
                        }}
                      audioEnabled={audioEnabled}
                    />
                    <CardContent className="p-6 space-y-6">
                        {/* Display Text with Voice/Music Visualization */}
                        <div className="min-h-[200px] flex flex-col items-center justify-center">
                            {currentInteraction?.type === "voice" ? (
                                <>
                                    <VoiceVisualization isActive={!isTyping} />
                                    {displayText && (
                                        <p className="text-white text-sm leading-relaxed text-center mt-4 px-4 opacity-80">{displayText}</p>
                                    )}
                                </>
                            ) : currentInteraction?.type === "music" ? (
                                <>
                                    <MusicStarAnimation isActive={isMusicPlaying} />
                                    {displayText && <p className="text-white text-lg leading-relaxed text-center">{displayText}</p>}
                                </>
                            ) : (
                                <div className="min-h-[120px] flex items-center justify-center px-4">
                                    <p className="text-white text-lg leading-relaxed text-center">
                                        {displayText}
                                        {isTyping && <span className="animate-pulse">|</span>}
                                    </p>
                                </div>
                            )}
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


export default function Chapter2() {
    return (
      <>
          <HelpButton />
          <Chapter2Content />
      </>
    )
}