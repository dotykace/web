import {useEffect, useState} from "react";
import {Choice, Interaction} from "@/interactions";

export function useInteractions<T>(){

  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [currentInteraction, setCurrentInteraction] = useState<Interaction | null>(null)
  const [username, setUsername] = useState("")
  const [botName, setBotName] = useState("Bot")

  const [userInput, setUserInput] = useState("")
  const [history, setHistory] = useState<Interaction[]>([])

  // Fetch interactions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the data from the interactions.json file
        const data = await import("@/data/interactions.json")
        setInteractions(data.interactions)
      } catch (error) {
        console.error("Error loading interactions:", error)
      }
    }
    fetchData()
  }, [])

  const setFirstInteraction = (startOfChapter: string) => {
    const firstInteraction = interactions.find((i: Interaction) => i.id === startOfChapter)
    if (firstInteraction) {
      setCurrentInteraction(firstInteraction)
      setHistory([firstInteraction])
    }
  }

  // Handle timeout for interactions with duration
  useEffect(() => {
    if (!currentInteraction || currentInteraction.type === "input" || currentInteraction.type === "multiple-choice") {
      return
    }

    const timer = setTimeout(() => {
      if (currentInteraction["next-id"]) {
        goToNextInteraction(currentInteraction["next-id"])
      }
    }, currentInteraction.duration * 1000)

    return () => clearTimeout(timer)
  }, [currentInteraction])

  const goToNextInteraction = (nextId: string) => {
    const next = interactions.find((i) => i.id === nextId)
    if (next) {
      setCurrentInteraction(next)
      setHistory((prev) => [...prev, next])
    }
  }
  const handleUserInput = (input: string) => {
    setUserInput(input)

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
      setHistory((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          type: "user-message",
          text: input,
          duration: 0,
        } as Interaction,
      ])

      if (currentInteraction["next-id"]) {
        goToNextInteraction(currentInteraction["next-id"])
      }
    }
  }
  const handleChoiceSelection = (choice: Choice) => {
    // Add user's choice to history
    setHistory((prev) => [
      ...prev,
      {
        id: `user-choice-${Date.now()}`,
        type: "user-message",
        text: choice.type,
        duration: 0,
      } as Interaction,
    ])

    if (choice["next-id"]) {
      goToNextInteraction(choice["next-id"])
    }
  }

  // Replace placeholders in text
  const processText = (text: string | undefined) => {
    console.log("Processing text:", text)
    if (!text) return ""

    let processed = text.replace(/UN/g, username || "ty")
    processed = processed.replace(/BN/g, botName)
    processed = processed.replace(/\{\{user_input\}\}/g, userInput)

    return processed
  }

  return {
    interactions,
    currentInteraction,
    username,
    botName,
    userInput,
    history,
    setFirstInteraction,
    handleUserInput,
    handleChoiceSelection,
    processText,
    goToNextInteraction
  }
}