"use client"

import React from "react"
import { readFromStorage } from "@/scripts/local-storage"
import { useInteractions } from "@/hooks/use-interactions"
import { redirect, usePathname } from "next/navigation"
import LoadingScreen from "@/components/LoadingScreen"
import { ChatProvider } from "@/context/ChatContext"
import AudioWrapper from "@/components/audio/AudioWrapper";

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
      console.log(`Resuming chapter ${chapterNumber} from interaction ID:`, progress)
      return progress.currentInteractionId;
    }
  }
  return null
}

export default function ChapterPage({
  chapterNumber,
  interactionsFileName,
  ViewComponent,
}: ChapterPageProps) {
  const chapter = readFromStorage("chapter") as number
  const savedProgress = getProgressId(chapterNumber)
  const {
    state,
    soundMap,
    currentInteraction,
    goToNextInteraction,
    handleUserInput,
    handleChoiceSelection,
  } = useInteractions(interactionsFileName, savedProgress)

  const pathname = usePathname()

  if (chapter == undefined && pathname !== "/") {
    console.log("Redirecting to root")
    redirect("/")
  }

  if (!state || state === "loading" || !currentInteraction || !soundMap) {
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
