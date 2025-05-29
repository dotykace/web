"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type {Choice, Interaction, InteractionRecord, InteractionsData, RawInteraction} from "@/interactions"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function useInteractions<T>() {
  const [interactions, setInteractions] = useState<InteractionRecord>({})
  const [currentInteraction, setCurrentInteraction] = useState<RawInteraction | null>(null)
  const [username, setUsername] = useLocalStorage<string>("UN", "")
  const [botName, setBotName] = useLocalStorage<string>("BN", "Bot")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const [userInput, setUserInput] = useState("")
  // todo maybe get rid of history
  const [history, setHistory] = useState<Interaction[]>([])

  // FIXED: Use refs to prevent infinite loops
  const firstInteractionSetRef = useRef(false)
  const currentChapterRef = useRef<number | null>(null)

  // Fetch interactions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Starting to load interactions...")

        const data = (await import("@/data/interactions.json")) as InteractionsData

        console.log("Raw data loaded:", data)

        if (!data || !data.interactions) {
          throw new Error("Invalid data format - missing interactions")
        }

        setInteractions(data.interactions)
        console.log("Interactions set successfully")
      } catch (error) {
        console.error("Error loading interactions:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // FIXED: Stable function that doesn't change on every render
  const setFirstInteraction = useCallback(
      (startOfChapter: string, forceReset = false) => {
        if (firstInteractionSetRef.current && !forceReset) {
          console.log("First interaction already set, skipping...")
          return
        }

        console.log("Setting first interaction:", startOfChapter, "Available interactions:", interactions.length)

        const firstInteraction = interactions[startOfChapter]
        if (firstInteraction) {
          console.log("Found first interaction:", firstInteraction)
          setCurrentInteraction(firstInteraction)
          setHistory([{id:startOfChapter, ...firstInteraction}])
          setInitialized(true)
          firstInteractionSetRef.current = true
        } else {
          console.error("First interaction not found:", startOfChapter)
        }
      },
      [interactions],
  )

  // FIXED: Stable clear function
  const clearChatHistory = useCallback(() => {
    console.log("Clearing chat history for new chapter")
    setHistory([])
    firstInteractionSetRef.current = false
    setInitialized(false)
  }, [])

  // Handle timeout for interactions with duration
  useEffect(() => {
    if (!currentInteraction || currentInteraction.type === "input" || currentInteraction.type === "multiple-choice") {
      return
    }

    const timer = setTimeout(() => {
      goToNextInteraction()
    }, currentInteraction.duration * 1000)

    return () => clearTimeout(timer)
  }, [currentInteraction])

  const goToNextInteraction = useCallback(
    (nextId?:string) => {

      let localNextId = nextId
      if(!localNextId) {
        if(!currentInteraction) return
        if(!currentInteraction["next-id"]) return
        localNextId = currentInteraction["next-id"]
        if(!localNextId) return
      }
      const next = interactions[localNextId]
      if (next) {
        setCurrentInteraction(next)
        setHistory((prev) => [...prev, {id:localNextId, ...next}])
      }
    },
    [interactions, currentInteraction],
  )

  const handleUserInput = useCallback(
      (input: string) => {
        setUserInput(input)
        // todo id is not really part of currentInteraction, solve it later with further refactoring
        if (currentInteraction?.type === "input") {
          // If this is a username input (id "2")
          if (currentInteraction.id === "2") {
            setUsername(input)
          }
          // If this is a bot name input (id "11a")
          else if (currentInteraction.id === "11a") {
            setBotName(input)
          }

          // Add user's message to history
          const userMessage: Interaction = {
            id: `user-${Date.now()}-${Math.random()}`, // FIXED: Ensure unique IDs
            type: "user-message",
            text: input,
            duration: 0,
          }

          setHistory((prev) => [...prev, userMessage])

          goToNextInteraction()
        }
      },
      [currentInteraction, setUsername, setBotName, goToNextInteraction],
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

        setHistory((prev) => [...prev, userChoice])

        if (choice["next-id"]) {
          goToNextInteraction(choice["next-id"])
        }
      },
      [goToNextInteraction],
  )

  // Replace placeholders in text
  const processText = useCallback(
      (text: string | undefined) => {
        if (!text) return ""

        let processed = text.replace(/UN/g, username || "ty")
        processed = processed.replace(/BN/g, botName || "Bot")
        processed = processed.replace(/\{\{user_input\}\}/g, userInput || "")

        return processed
      },
      [username, botName, userInput],
  )

  // todo vsetko musi ist do pice je tu toho moc vela
  return {
    interactions,
    currentInteraction,
    username,
    botName,
    userInput,
    history,
    loading,
    error,
    initialized,
    setFirstInteraction,
    clearChatHistory,
    handleUserInput,
    handleChoiceSelection,
    processText,
    goToNextInteraction,
  }
}
