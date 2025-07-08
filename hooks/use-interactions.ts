"use client"

import { useEffect, useState, useCallback } from "react"
import type { Choice, Interaction, InteractionRecord, RawInteraction, ProcessedInteraction } from "@/interactions"
import { redirect, useRouter } from "next/navigation"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom } from "@/lib/dotykace-types"

export function useInteractions<T>(filename: string) {
    const [interactions, setInteractions] = useState<InteractionRecord | null>(null)
    const [currentInteraction, setCurrentInteraction] = useState<ProcessedInteraction | null>(null)
    const [state, setState] = useState<"loading" | "initialized" | "error" | null>(null)

    const router = useRouter()

    const [userInput, setUserInput] = useState("")

    // Replace placeholders in text
    const processText = useCallback((text: string | undefined) => {
        if (!text) return ""

        let processed = text

        if (/UN/.test(text)) {
            const username = readFromStorage("UN") as string
            processed = processed.replace(/UN/g, username || "ty")
        }

        if (/BN/.test(text)) {
            const botName = readFromStorage("BN") as string
            processed = processed.replace(/BN/g, botName || "Bot")
        }

        if (/\{\{user_input\}\}/.test(text)) {
            const userInput = readFromStorage("firstMessage") as string
            processed = processed.replace(/\{\{user_input\}\}/g, userInput || "")
        }

        return processed
    }, [])

    const setCurrent = (current: RawInteraction, key: string) => {
        const newInteraction: ProcessedInteraction = {
            ...current,
            id: key,
            text: () => processText(current.text),
        }
        setCurrentInteraction(newInteraction)
    }

    // Update player progress in database
    const updatePlayerProgress = async (currentChapter: number, completedChapters: number[]) => {
        const roomId = localStorage.getItem("dotykace_roomId")
        const playerId = localStorage.getItem("dotykace_playerId")
        const playerName = localStorage.getItem("dotykace_playerName")

        if (!roomId || !playerId || !playerName) return

        try {
            const roomRef = doc(db, "rooms", roomId)
            const roomSnap = await getDoc(roomRef)

            if (!roomSnap.exists()) return

            const roomData = roomSnap.data() as DotykaceRoom
            const participants = roomData.participants || []

            // Find and update the specific participant
            const updatedParticipants = participants.map((participant) => {
                if (participant.id === playerId) {
                    return {
                        ...participant,
                        currentChapter,
                        completedChapters,
                    }
                }
                return participant
            })

            // If participant not found, this shouldn't happen but let's handle it
            const participantExists = participants.some((p) => p.id === playerId)
            if (!participantExists) {
                console.warn("Participant not found, this shouldn't happen")
                return
            }

            await updateDoc(roomRef, {
                participants: updatedParticipants,
            })

            console.log("✅ Player progress updated:", { playerId, currentChapter, completedChapters })
        } catch (error) {
            console.error("❌ Error updating player progress:", error)
        }
    }

    // Fetch interactions data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setState("loading")
                console.log("Starting to load interactions...")

                const data = await import("@/data/" + filename + ".json")
                console.log("Raw data loaded")

                if (!data || !data.interactions) {
                    setState("error")
                    throw new Error("Invalid data format - missing interactions")
                }

                setInteractions(data.interactions)
                console.log("Interactions set successfully")

                const startOfChapter = data.startInteractionId || "1"
                const firstInteraction = data.interactions[startOfChapter]
                if (firstInteraction) {
                    console.log("Found first interaction:", firstInteraction)
                    setState("initialized")
                    setCurrent(firstInteraction, startOfChapter)
                } else {
                    throw new Error(`Start interaction with ID ${startOfChapter} not found in interactions`)
                }
            } catch (error) {
                const err = error as Error
                if (err.message?.includes("MODULE_NOT_FOUND")) {
                    router.push("/404")
                }
                console.error("Error loading interactions:", error)
                setState("error")
            }
        }
        fetchData()
    }, [filename, router, processText])

    // Handle timeout for interactions with duration
    useEffect(() => {
        if (!currentInteraction || currentInteraction.type === "input" || currentInteraction.type === "multiple-choice") {
            return
        }

        const timer = setTimeout(() => {
            if (currentInteraction["timeout-id"]) {
                goToNextInteraction(currentInteraction["timeout-id"])
            } else {
                goToNextInteraction()
            }
        }, currentInteraction.duration * 1000)

        return () => clearTimeout(timer)
    }, [currentInteraction])

    // Handle chapter transitions
    useEffect(() => {
        if (!currentInteraction) return

        // Check if interaction is a checkpoint by type or by specific checkpoint IDs
        const isCheckpoint =
            currentInteraction.type === "checkpoint" ||
            currentInteraction.id === "intro-end" ||
            currentInteraction.id === "chapter-1-end" ||
            currentInteraction.id === "chapter-2-end" ||
            currentInteraction.id === "chapter-3-end" ||
            currentInteraction.id === "chapter-4-end"

        if (isCheckpoint) {
            if (currentInteraction.id === "intro-end") {
                console.log("Introduction end interaction reached, setting chapter to 1")
                const completedChapters = [0]
                setToStorage("chapter", 1)
                setToStorage("completedChapters", completedChapters)
                updatePlayerProgress(1, completedChapters)
                redirect("/menu")
            } else if (currentInteraction.id === "chapter-1-end") {
                console.log("Chapter 1 end interaction reached, setting chapter to 2")
                const currentCompleted = (readFromStorage("completedChapters") as number[]) || [0]
                const completedChapters = [...currentCompleted, 1]
                setToStorage("chapter", 2)
                setToStorage("completedChapters", completedChapters)
                updatePlayerProgress(2, completedChapters)
                redirect("/menu")
            } else if (currentInteraction.id === "chapter-2-end") {
                console.log("Chapter 2 end interaction reached, setting chapter to 3")
                const currentCompleted = (readFromStorage("completedChapters") as number[]) || [0, 1]
                const completedChapters = [...currentCompleted, 2]
                setToStorage("chapter", 3)
                setToStorage("completedChapters", completedChapters)
                updatePlayerProgress(3, completedChapters)
                redirect("/menu")
            } else if (currentInteraction.id === "chapter-3-end") {
                console.log("Chapter 3 end interaction reached, setting chapter to 4")
                const currentCompleted = (readFromStorage("completedChapters") as number[]) || [0, 1, 2]
                const completedChapters = [...currentCompleted, 3]
                setToStorage("chapter", 4)
                setToStorage("completedChapters", completedChapters)
                updatePlayerProgress(4, completedChapters)
                redirect("/menu")
            } else if (currentInteraction.id === "chapter-4-end") {
                console.log("Chapter 4 end interaction reached, game completed")
                const currentCompleted = (readFromStorage("completedChapters") as number[]) || [0, 1, 2, 3]
                const completedChapters = [...currentCompleted, 4]
                setToStorage("completedChapters", completedChapters)
                updatePlayerProgress(4, completedChapters)
                // Redirect to completion page or menu
                redirect("/menu")
            }
        }
    }, [currentInteraction])

    const goToNextInteraction = useCallback(
        (nextId?: string) => {
            if (!interactions) {
                console.error("Interactions data is not loaded yet")
                return
            }

            let localNextId = nextId
            if (!localNextId) {
                if (!currentInteraction) return
                if (!currentInteraction["next-id"]) return
                localNextId = currentInteraction["next-id"]
                if (!localNextId) return
            }
            const next = interactions[localNextId]
            if (next) {
                setCurrent(next, localNextId)
            }
        },
        [interactions, currentInteraction],
    )

    const handleUserInput = useCallback(
        (input: string) => {
            // todo id is not really part of currentInteraction, solve it later with further refactoring
            if (currentInteraction?.type === "input") {
                // If this is a username input (id "2")
                if (currentInteraction.id === "2") {
                    setToStorage("UN", input)
                }
                // If this is a bot name input (id "11a")
                else if (currentInteraction.id === "11a") {
                    setToStorage("BN", input)
                }
            }
            // todo make it function properly in greater context
            // todo either dont have user input as interaction or make it work properly
            // todo maybe separate user inputs and interactions
            if (
                currentInteraction?.id === "1.6" ||
                currentInteraction?.id === "1.100" ||
                currentInteraction?.id === "1.101"
            ) {
                setToStorage("firstMessage", input)
            }
            goToNextInteraction()
        },
        [currentInteraction, goToNextInteraction],
    )

    const handleChoiceSelection = useCallback(
        (choice: Choice) => {
            // Add user's choice to history
            const userChoice: Interaction = {
                id: `user-choice-${Date.now()}-${Math.random()}`, // FIXED: Ensure unique IDs
                type: "user-message",
                text: choice.type,
                duration: 0,
            }

            if (choice["next-id"]) {
                goToNextInteraction(choice["next-id"])
            }
        },
        [goToNextInteraction],
    )

    // todo vsetko musi ist do pice je tu toho moc vela
    return {
        interactions,
        currentInteraction,
        state,
        handleUserInput,
        handleChoiceSelection,
        goToNextInteraction,
    }
}
