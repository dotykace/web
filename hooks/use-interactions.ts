"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type {Choice, Interaction, InteractionRecord, RawInteraction} from "@/interactions"
import {redirect, useRouter} from "next/navigation";
import {readFromStorage, setToStorage} from "@/scripts/local-storage";

export function useInteractions<T>(filename:string) {
  const [interactions, setInteractions] = useState<InteractionRecord|null>(null)
  const [currentInteraction, setCurrentInteraction] = useState<RawInteraction | null>(null)
  const [state, setState] = useState<"loading"|"initialized"|"error"|null>(null)

  const router = useRouter();

  const [userInput, setUserInput] = useState("")

  const setCurrent = (current, key) => {
    const newInteraction = {...current, id: key, text: () => processText(current.text)}
    setCurrentInteraction(newInteraction)
  }

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
        console.log("Interactions set successfully")

        const latestCheckpoint = readFromStorage("checkpoint") as string

        const startOfChapter = latestCheckpoint?? (data.startInteractionId || "1")
        const firstInteraction = data.interactions[startOfChapter]
        if (firstInteraction) {
          console.log("Found first interaction:", firstInteraction)
          setState("initialized")
          setCurrent(firstInteraction, startOfChapter)
        } else {
          throw new Error(`Start interaction with ID ${startOfChapter} not found in interactions`)
        }
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND'){
          router.push('/404');
        }
        console.error("Error loading interactions:", error)
      }
    }
    fetchData()
  }, [])


  // Handle timeout for interactions with duration
  useEffect(() => {
    if (!currentInteraction || currentInteraction.type === "input" || currentInteraction.type === "multiple-choice") {
      return
    }

    const timer = setTimeout(() => {
      if(currentInteraction["timeout-id"]){
        goToNextInteraction(currentInteraction["timeout-id"])
      }
      else goToNextInteraction()
    }, currentInteraction.duration * 1000)

    return () => clearTimeout(timer)
  }, [currentInteraction])

  // Handle chapter transitions
  useEffect(() => {
    if (!currentInteraction) return

    if (currentInteraction.type === "checkpoint") {
      if (currentInteraction.id === "intro-end") {
        console.log("Introduction end interaction reached, setting chapter to 1")
        setToStorage("chapter", 1)
        redirect("/menu")
      } else if (currentInteraction.id === "chapter-1-end") {
        console.log("Chapter 1 end interaction reached, setting chapter to 2")
        setToStorage("chapter", 2)
        redirect("/menu")
      }
      setToStorage("checkpoint", currentInteraction.id)
    }
  }, [currentInteraction])

  // todo branching od 1.6 nefunguje
  const goToNextInteraction = useCallback(
    (nextId?:string) => {
      if (!interactions) {
        console.error("Interactions data is not loaded yet")
        return
      }

      let localNextId = nextId
      if(!localNextId) {
        if(!currentInteraction) return
        if(!currentInteraction["next-id"]) return
        localNextId = currentInteraction["next-id"]
        if(!localNextId) return
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

          goToNextInteraction()
        }
          // todo make it function properly in greater context
          // todo either dont have user input as interaction or make it work properly
        // todo maybe separate user inputs and interactions
        else if (true){
          if (currentInteraction?.id === "1.6" || currentInteraction?.id === "1.100" || currentInteraction?.id === "1.102") {
            setToStorage("firstMessage", input)
            goToNextInteraction("1.7")
          }
        }
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

  // Replace placeholders in text
  const processText = useCallback(
    (text: string | undefined) => {
      if (!text) return "";

      let processed = text;

      if (/UN/.test(text)) {
        const username = readFromStorage("UN") as string;
        processed = processed.replace(/UN/g, username || "ty");
      }

      if (/BN/.test(text)) {
        const botName = readFromStorage("BN") as string;
        processed = processed.replace(/BN/g, botName || "Bot");
      }

      if (/\{\{user_input\}\}/.test(text)) {
        const userInput = readFromStorage("firstMessage") as string;
        processed = processed.replace(/\{\{user_input\}\}/g, userInput || "");
      }

      return processed;
    },
      [],
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
