"use client"

import React, { useEffect, useState } from "react"
import { readFromStorage } from "@/scripts/local-storage"
import { useInteractions } from "@/hooks/use-interactions"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/LoadingScreen"
import { ChatProvider } from "@/context/ChatContext"
import AudioWrapper from "@/components/audio/AudioWrapper"

interface ChapterPageProps {
  chapterNumber: number
  interactionsFileName: string
  ViewComponent: React.ComponentType<any>
}

export const CHAPTER2_PROGRESS_KEY = "chapter2_progress"

const getProgressId = (chapterNumber: number) => {
  // todo handle other chapters when they have progress saving implemented
  if (chapterNumber === 2) {
    const progress = readFromStorage(CHAPTER2_PROGRESS_KEY) as string
    if (progress) {
      console.log(
        `Resuming chapter ${chapterNumber} from interaction ID:`,
        progress,
      )
      return progress.currentInteractionId
    }
  }
  return null
}

export default function ChapterPage({
  chapterNumber,
  interactionsFileName,
  ViewComponent,
}: ChapterPageProps) {
  const savedProgress = getProgressId(chapterNumber)
  const {
    state,
    soundMap,
    currentInteraction,
    goToNextInteraction,
    handleUserInput,
    handleChoiceSelection,
  } = useInteractions(interactionsFileName, savedProgress)

  const [chapterChecked, setChapterChecked] = useState(false)
  const [hasValidChapter, setHasValidChapter] = useState(false)
  const router = useRouter()

  // Check localStorage for chapter on client-side only
  useEffect(() => {
    const storedChapter = readFromStorage("chapter")
    // Chapter is valid if it exists (including 0)
    const isValid = storedChapter !== undefined && storedChapter !== null
    if (!isValid) {
      console.log("No chapter found in localStorage, redirecting to root")
      router.push("/")
    } else {
      setHasValidChapter(true)
    }
    setChapterChecked(true)
  }, [router])

  // Show loading while checking chapter or loading interactions
  if (
    !chapterChecked ||
    !hasValidChapter ||
    !state ||
    state === "loading" ||
    !currentInteraction ||
    !soundMap
  ) {
    return <LoadingScreen />
  }

  return (
    <AudioWrapper soundMap={soundMap}>
      <ChatProvider
        state={state}
        handleUserInput={handleUserInput}
        handleChoiceSelection={handleChoiceSelection}
        currentInteraction={currentInteraction}
        goToNextInteraction={goToNextInteraction}
      >
        <ViewComponent />
      </ChatProvider>
    </AudioWrapper>
  )
}
