"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type {Choice, Interaction, InteractionRecord, RawInteraction} from "@/interactions"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function useInteractions<T>(filename:string) {
  const [interactions, setInteractions] = useState<InteractionRecord|null>(null)
  const [currentInteraction, setCurrentInteraction] = useState<RawInteraction | null>(null)
  const [state, setState] = useState<"loading"|"initialized"|"error"|null>(null)
  const [username, setUsername] = useLocalStorage<string>("UN", "")
  const [botName, setBotName] = useLocalStorage<string>("BN", "Bot")

  const [startOfChapter, setStartOfChapter] = useState<string>("1")

  const [userInput, setUserInput] = useState("")

  // Fetch interactions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState("loading")
        console.log("Starting to load interactions...")

        const data = (await import("@/data/"+filename+".json"))
        console.log("Raw data loaded:", data)

        if (!data || !data.interactions) {
          setState("error")
          throw new Error("Invalid data format - missing interactions")
        }

        setInteractions(data.interactions)
        console.log("Interactions loaded:", data.interactions)
        setStartOfChapter(data.startInteractionId || "1")
        console.log("Interactions set successfully")
      } catch (error) {
        console.error("Error loading interactions:", error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!interactions) return
    const firstInteraction = interactions[startOfChapter]
    if (firstInteraction) {
      console.log("Found first interaction:", firstInteraction)
      setCurrentInteraction(firstInteraction)
      setState("initialized")
    } else {
      throw new Error(`Start interaction with ID ${startOfChapter} not found in interactions`)
    }
  }, [interactions]);


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

  // todo branching od 1.6 nefunguje
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

          goToNextInteraction()
        }
          // todo make it function properly in greater context
          // todo either dont have user input as interaction or make it work properly
        // todo maybe separate user inputs and interactions
        else if (true){
          if (currentInteraction?.id === "1.6") {
            goToNextInteraction("1.7")
          }
        }
      },
      [currentInteraction, setUsername, setBotName, goToNextInteraction],
  )
  const addUserInputToHistory = (input: string) => {
    const userMessage: Interaction = {
      id: `user-${Date.now()}-${Math.random()}`, // FIXED: Ensure unique IDs
      type: "user-message",
      text: input,
      duration: 0,
    }
  }

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
    state,
    handleUserInput,
    handleChoiceSelection,
    processText,
    goToNextInteraction,
  }
}
