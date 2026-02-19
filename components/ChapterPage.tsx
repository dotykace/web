"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { readFromStorage, removeFromStorage } from "@/scripts/local-storage"
import { useInteractions } from "@/hooks/use-interactions"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/LoadingScreen"
import { ChatProvider } from "@/context/ChatContext"
import AudioWrapper from "@/components/audio/AudioWrapper"
import { useSharedAudio } from "@/context/AudioContext"
import ChapterHeader from "@/components/ChapterHeader"
import { ChapterLayoutProvider } from "@/context/ChapterLayoutContext"

interface ChapterPageProps {
  chapterNumber: number
  interactionsFileName: string
  ViewComponent: React.ComponentType<any>
  coloring?: string
  showHeader?: boolean
  showAudioControl?: boolean
}

export const CHAPTER2_PROGRESS_KEY = "chapter2_progress"

const getProgressId = (chapterNumber: number) => {
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

function ChapterHeaderBridge({
  chapterNumber,
  showAudioControl,
  onRestart,
}: {
  chapterNumber: number
  showAudioControl: boolean
  onRestart?: () => void
}) {
  const { muted, toggleMute } = useSharedAudio()
  return (
    <ChapterHeader
      chapterNumber={chapterNumber}
      showAudioControl={showAudioControl}
      muted={muted}
      onToggleMute={toggleMute}
      onRestart={onRestart}
    />
  )
}

export default function ChapterPage({
  chapterNumber,
  interactionsFileName,
  ViewComponent,
  coloring,
  showHeader = false,
  showAudioControl = false,
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
  const [headerVisible, setHeaderVisible] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedChapter = readFromStorage("chapter")
    const isValid = storedChapter !== undefined && storedChapter !== null
    if (!isValid) {
      console.log("No chapter found in localStorage, redirecting to root")
      router.push("/")
    } else {
      setHasValidChapter(true)
    }
    setChapterChecked(true)
  }, [router])

  const layoutContextValue = useMemo(
    () => ({ setHeaderVisible }),
    [setHeaderVisible],
  )

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

  const chatProvider = (
    <ChatProvider
      state={state}
      handleUserInput={handleUserInput}
      handleChoiceSelection={handleChoiceSelection}
      currentInteraction={currentInteraction}
      goToNextInteraction={goToNextInteraction}
    >
      <ChapterLayoutProvider value={layoutContextValue}>
        <ViewComponent />
      </ChapterLayoutProvider>
    </ChatProvider>
  )

  if (coloring) {
    return (
      <AudioWrapper soundMap={soundMap}>
        <div className={`h-dvh flex flex-col overflow-hidden ${coloring}`}>
          {showHeader && headerVisible && (
            <ChapterHeaderBridge
              chapterNumber={chapterNumber}
              showAudioControl={showAudioControl}
              onRestart={savedProgress ? () => {
                removeFromStorage(CHAPTER2_PROGRESS_KEY)
                window.location.reload()
              } : undefined}
            />
          )}
          <div className="flex-1 min-h-0 flex flex-col">
            {chatProvider}
          </div>
        </div>
      </AudioWrapper>
    )
  }

  return (
    <AudioWrapper soundMap={soundMap}>
      {chatProvider}
    </AudioWrapper>
  )
}
