"use client"

import { useEffect, useState, useCallback } from "react"
import type { Choice, Interaction, InteractionRecord, RawInteraction, ProcessedInteraction } from "@/interactions"
import { useRouter } from "next/navigation"
import { readFromStorage, setToStorage, isTesterMode } from "@/scripts/local-storage"
import useDB from "@/hooks/use-db";

export function useInteractions<T>(filename: string) {
    const [interactions, setInteractions] = useState<InteractionRecord | null>(null)
    const [currentInteraction, setCurrentInteraction] = useState<ProcessedInteraction | null>(null)
    const [state, setState] = useState<"loading" | "initialized" | "error" | null>(null)
    const [isClient, setIsClient] = useState(false)

    const router = useRouter()

    const [dbHook, setDbHook] = useState<any>(null);

    useEffect(() => {
        const hook = useDB();
        setDbHook(hook);
    }, []);

    const [userInput, setUserInput] = useState("")

    // Ensure we're on the client side
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Replace placeholders in text
    const processText = useCallback(
        (text: string | undefined) => {
            if (!text || !isClient) return ""

            let processed = text

            // todo maybe refactor?
            if (/UN/.test(text)) {
                const username = (readFromStorage("UN") as string) || "Ty"
                const capitalized = username.charAt(0).toUpperCase() + username.slice(1)
                processed = processed.replace(/UN/g, capitalized)
            }

            if (/BN/.test(text)) {
                const botName = (readFromStorage("BN") as string) || "Dotykačka"
                const capitalized = botName.charAt(0).toUpperCase() + botName.slice(1)
                processed = processed.replace(/BN/g, capitalized)
            }

            if (/\{\{user_input\}\}/.test(text)) {
                const userInput = readFromStorage("firstMessage") as string
                processed = processed.replace(/\{\{user_input\}\}/g, userInput || "")
            }

            return processed
        },
        [isClient],
    )

    const setCurrent = (current: RawInteraction, key: string) => {
        const newInteraction: ProcessedInteraction = {
            ...current,
            id: key,
            text: () => processText(current.text),
        }
        setCurrentInteraction(newInteraction)
    }

    // Fetch interactions data
    useEffect(() => {
        if (!isClient) return

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
    }, [filename, router, processText, isClient])

    // Handle timeout for interactions with duration
    useEffect(() => {
        if (!currentInteraction || currentInteraction.type === "input" || currentInteraction.type === "multiple-choice") {
            return
        }
        if (currentInteraction.duration == undefined || currentInteraction.duration < 0) {
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
        if (!currentInteraction || !isClient) return

        // id is intro-end or chapter-X-end
        const match = currentInteraction.id.match(/^(?:chapter-(\d+)|intro)-end$/)

        if (match) {
            // If it's "intro-end", chapterNumber = 0; otherwise, use the captured number
            const chapterNumber = match[1] ? Number(match[1]) : 0
            const nextChapter = Math.min(chapterNumber + 1, 4)
            
            // Always update localStorage regardless of dbHook availability
            const existingCompleted = (readFromStorage("completedChapters") as number[]) || []
            const completedSet = new Set(existingCompleted)
            completedSet.add(chapterNumber)
            const completedArray = Array.from(completedSet).sort((a, b) => a - b)
            
            setToStorage("completedChapters", completedArray)
            setToStorage("chapter", nextChapter)
            console.log(`Chapter ${chapterNumber} completed, setting chapter to ${nextChapter}`)
            
            // Update database if available, then redirect
            if (dbHook && dbHook.updateChapter) {
                dbHook.updateChapter(chapterNumber, () => router.push("/menu")).then()
            } else {
                // No database hook, just redirect
                router.push("/menu")
            }
        }
    }, [currentInteraction, isClient, dbHook, router])

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
            if (!isClient) return

            // todo id is not really part of currentInteraction, solve it later with further refactoring
            if (currentInteraction?.type === "input") {
                if (currentInteraction.id === "username-input") {
                    setToStorage("UN", input)
                }
                else if (currentInteraction.id === "botname-input") {
                    setToStorage("BN", input)
                }
            }
            // todo make it function properly in greater context
            // todo either dont have user input as interaction or make it work properly
            // todo maybe separate user inputs and interactions
            if (
                currentInteraction?.id === "first-notification" ||
                currentInteraction?.id === "1.6" ||
                currentInteraction?.id === "1.100" ||
                currentInteraction?.id === "1.101"
            ) {
                setToStorage("firstMessage", input)
            }
            goToNextInteraction()
        },
        [currentInteraction, goToNextInteraction, isClient],
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

    // Tester mode: Press Space to skip to next interaction
    useEffect(() => {
        if (!isClient || !isTesterMode()) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip on Space key press (only in tester mode)
            if (e.code === "Space" && currentInteraction) {
                e.preventDefault()
                console.log("🧪 Tester mode: Skipping to next interaction")
                
                // For input types, auto-fill with test data
                if (currentInteraction.type === "input") {
                    if (currentInteraction.id === "username-input") {
                        setToStorage("UN", "Tester")
                        handleUserInput("Tester")
                    } else if (currentInteraction.id === "botname-input") {
                        setToStorage("BN", "TestBot")
                        handleUserInput("TestBot")
                    } else {
                        handleUserInput("test input")
                    }
                } else if (currentInteraction.type === "multiple-choice" && currentInteraction.choices && currentInteraction.choices.length > 0) {
                    // Auto-select first choice
                    handleChoiceSelection(currentInteraction.choices[0])
                } else {
                    // For all other types, just go to next
                    if (currentInteraction["timeout-id"]) {
                        goToNextInteraction(currentInteraction["timeout-id"])
                    } else if (currentInteraction["next-id"]) {
                        goToNextInteraction(currentInteraction["next-id"])
                    }
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isClient, currentInteraction, handleUserInput, handleChoiceSelection, goToNextInteraction])

    // todo vsetko musi ist do pice je tu toho moc vela
    return {
        interactions,
        currentInteraction,
        state,
        handleUserInput,
        handleChoiceSelection,
        goToNextInteraction,
        isClient,
    }
}
