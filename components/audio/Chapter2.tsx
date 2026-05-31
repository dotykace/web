"use client"

import { useState, useEffect, useCallback } from "react"
import { setToStorage } from "@/scripts/local-storage"
import BasicAudioVisual from "@/components/BasicAudioVisual"
import { useChatContext } from "@/context/ChatContext"
import { useSharedAudio } from "@/context/AudioContext"
import { CHAPTER2_PROGRESS_KEY } from "@/components/ChapterPage"
import AudioChapterStart from "@/components/audio/AudioChapterStart";
import AudioChapterInput from "@/components/audio/AudioChapterInput";
import LoadingScreen from "@/components/LoadingScreen";

function Chapter2Content() {
  const { state, currentInteraction, goToNextInteraction } = useChatContext()
  const { stopAll } = useSharedAudio()

  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    setShowButton(false)
    if (currentInteraction?.id && currentInteraction.saveProgress === true) {
      setToStorage(CHAPTER2_PROGRESS_KEY, currentInteraction?.id)
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
  if(currentInteraction.type === "checkpoint"){
    return <LoadingScreen />
  }

  const hasButton = !!currentInteraction.button

  const currentAudio =
    currentInteraction.type === "voice" && currentInteraction.filename
      ? {
          filename: currentInteraction.filename as string,
          type: "voice" as const,
          opts: { loop: currentInteraction.loop || false },
          onFinish: () => {
            if (!hasButton) {
              goToNextInteraction()
            }
            else {
              console.log("Voice interaction finished, showing button")
              setShowButton(true)
            }
          },
        }
      : null

  if (currentInteraction.type === "voice") {
    return (
      <BasicAudioVisual
        id={currentInteraction.id}
        audio={currentAudio}
        canSkip={true}
      >
        {(hasButton) ? (
          <div className="px-4 w-full">
            <button
              onClick={() => handleButtonClick(currentInteraction.button)}
              disabled={!showButton}
              className="w-full bg-white hover:bg-white/90
                           text-purple-900 font-bold tracking-wide py-2 px-4 rounded-full shadow-lg
                           transition-all duration-300 active:scale-[0.98]"
              style={{ opacity: showButton ? 1 : 0, pointerEvents: showButton ? "auto" : "none" }}
            >
              {currentInteraction.button.label}
            </button>
          </div>
        ) : null}
      </BasicAudioVisual>
    )
  }
  else {
    return(
      <AudioChapterInput
        chapterString={"chapter2"}
        stopAll={stopAll}
        currentInteraction={currentInteraction}
        goToNextInteraction={goToNextInteraction}
        coloring={{
          text: "text-purple-900",
        }}
      />
    )
  }
}

export default function Chapter2() {
  return <AudioChapterStart number={2} component={<Chapter2Content />}/>
}
