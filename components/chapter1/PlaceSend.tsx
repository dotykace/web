import CustomSend from "@/components/chapter1/CustomSend"
import { useCallback } from "react"
import Place from "@/components/chapter1/Place"
import { useSharedAudio } from "@/context/AudioContext"
import type { ProcessedInteraction } from "@/interactions"

export default function PlaceSend({
  current,
  goToNext,
}: {
  current: ProcessedInteraction
  goToNext: (nextId?: string) => void
}) {
  const dotPosition = { x: 0.9, y: 0.6, offset: 20, start: 0 }
  const { playPreloaded } = useSharedAudio()
  const sendGlowing = useCallback(() => current.type === "request", [current])
  const handleClick = useCallback(() => {
    if (current.type === "request") {
      playPreloaded("send").then(() => goToNext())
    }
  }, [current, goToNext, playPreloaded])

  const Request = ({ text, visible }: { text: string; visible: boolean }) => {
    if (!visible) return null
    return (
      <div className="request absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center text-xl px-2 py-2 backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 shadow-2xl font-light tracking-wide">
        {text}
      </div>
    )
  }

  return (
    <>
      <Request text={current.text()} visible={current.type === "request"} />
      <Place
        dotPosition={dotPosition}
        onAnimationEnd={() => goToNext("1.10")}
        onReveal={() => goToNext("1.11")}
      >
        {() => (
          <div
            style={{
              position: "absolute",
              left: "calc(90% - 20px)",
              top: "calc(60% - 20px)",
            }}
          >
            {CustomSend({ onClick: handleClick, isGlowing: sendGlowing })}
          </div>
        )}
      </Place>
    </>
  )
}
