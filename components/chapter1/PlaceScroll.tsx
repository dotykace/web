import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { setToStorage } from "@/scripts/local-storage"
import ScrollableCards from "@/components/ScrollableCard"
import Place from "@/components/chapter1/Place"
import { useSharedAudio } from "@/context/AudioContext"
import type { ProcessedInteraction } from "@/interactions"

export default function PlaceScroll({
  current,
  goToNext,
}: {
  current: ProcessedInteraction
  goToNext: (nextId?: string) => void
}) {
  const [showBackToChat, setShowBackToChat] = useState(false)

  const dotPosition = { x: 0.5, y: 0.5, offset: 20, start: 200 }

  const { stop } = useSharedAudio()

  useEffect(() => {
    if (current?.id === "back-to-chat") {
      setShowBackToChat(true)
    }
  }, [current])

  const onScrollCard = useCallback(() => {
    if (current.type !== "card") {
      goToNext()
      return
    } else {
      if (current.nextCard) {
        goToNext(current.nextCard)
      }
    }
  }, [current, goToNext])

  const choiceCallback = (option: string, choice?: string) => {
    if (option === "compare") {
      setShowBackToChat(true)
      goToNext("back-to-chat")
      return
    }
    if (option === "choice" && choice) {
      setToStorage("finger-choice", choice)
      goToNext("finger-compare")
    }
  }
  return (
    <>
      {showBackToChat ? (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Button
            key={"back-to-chat-button"}
            className="bg-white hover:bg-white/90 text-blue-600 hover:text-blue-700 font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out"
            onClick={() => {
              stop("loop")
              goToNext("overlay-off_a")
            }}
          >
            Zpět do chatu
          </Button>
        </div>
      ) : (
        <Place
          dotPosition={dotPosition}
          onAnimationEnd={() => goToNext()}
          onReveal={() => {}}
        >
          {() => (
            <ScrollableCards
              onScroll={onScrollCard}
              currentInteraction={current}
              onFinish={choiceCallback}
            />
          )}
        </Place>
      )}
    </>
  )
}
