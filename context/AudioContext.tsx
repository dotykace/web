// context/AudioContext.tsx
import React, { createContext, useContext, useEffect } from "react"
import { useAudioManager } from "@/hooks/use-audio"

const AudioContext = createContext<ReturnType<typeof useAudioManager> | null>(
  null,
)

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const audioManager = useAudioManager()

  useEffect(() => {
    if (!audioManager) return
    const events = [
      "pointerdown",
      "mousedown",
      "touchstart",
      "keydown"
    ]

    events.forEach((e) => {
        window.addEventListener(e, audioManager.resumeAudioContext, {passive: true})
      }
    )

    return () => {
      events.forEach(e =>
        window.removeEventListener(e, audioManager.resumeAudioContext)
      )
    }
  }, [audioManager.resumeAudioContext])

  useEffect(() => {
    return () => {
      // Close the shared AudioContext on app exit
      const ctx = (audioManager as any).audioContextRef?.current
      if (ctx && ctx.state !== "closed") ctx.close()
    }
  }, [audioManager])

  return (
    <AudioContext.Provider value={audioManager}>
      {children}
    </AudioContext.Provider>
  )
}

export const useSharedAudio = () => {
  const ctx = useContext(AudioContext)
  if (!ctx) {
    throw new Error("useSharedAudio must be used within <AudioProvider>")
  }
  return ctx
}
