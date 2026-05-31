"use client"

import { useEffect, useCallback } from "react"
import { useChatContext } from "@/context/ChatContext"
import { useSharedAudio } from "@/context/AudioContext"
import BasicAudioVisual from "@/components/BasicAudioVisual"
import { CHAPTER3_PROGRESS_KEY } from "@/components/ChapterPage"
import { setToStorage } from "@/scripts/local-storage";
import AudioChapterStart from "@/components/audio/AudioChapterStart";
import AudioChapterInput from "@/components/audio/AudioChapterInput";

function Chapter3Content() {
  const { state, currentInteraction, goToNextInteraction } = useChatContext()
  const { stopAll } = useSharedAudio()

  useEffect(() => {
    if (currentInteraction?.id && currentInteraction.saveProgress === true) {
      setToStorage(CHAPTER3_PROGRESS_KEY, currentInteraction?.id)
    }
  }, [currentInteraction?.id])

  const handleButtonClick = useCallback(
    (button: { label: string; "next-id": string }) => {
      stopAll()
      goToNextInteraction(button["next-id"])
    },
    [stopAll, goToNextInteraction],
  )

  if (!currentInteraction || state !== "initialized") return null
  const hasButton = !!currentInteraction.button

  const currentAudio =
    currentInteraction.type === "voice" && currentInteraction.filename
      ? {
          filename: currentInteraction.filename as string,
          type: "voice" as const,
          onFinish: () => {
            if (!hasButton) {
              goToNextInteraction()
            }
          },
        }
      : null

  // Voice interaction — may include continue button shown after audio
  if (currentInteraction.type === "voice") {
    return (
      <BasicAudioVisual
        id={currentInteraction.id}
        audio={currentAudio}
        canSkip={true}
      >
        {hasButton && (
          <div className="px-4 flex-shrink-0 w-full">
            <button
              onClick={() => handleButtonClick(currentInteraction.button)}
              className="w-full bg-white hover:bg-white/90
                             text-orange-900 font-bold tracking-wide py-2 px-2 rounded-full shadow-lg
                             transition-all duration-300 active:scale-[0.98]"
            >
              {currentInteraction.button.label}
            </button>
          </div>
        )}
      </BasicAudioVisual>
    )
  }
  else {
    return(
      <AudioChapterInput
        chapterString={"chapter3"}
        stopAll={stopAll}
        currentInteraction={currentInteraction}
        goToNextInteraction={goToNextInteraction}
        coloring={{
          text: "text-orange-900",
        }}
      />
    )
  }
}

export default function Chapter3() {
  return <AudioChapterStart number={3} component={<Chapter3Content />}/>
}