import { AudioProvider, useSharedAudio } from "@/context/AudioContext"
import { useEffect } from "react"

function AudioInitializer({ soundMap }: { soundMap: SoundMap }) {
  const { preloadAll } = useSharedAudio()

  useEffect(() => {
    if (!soundMap || Object.keys(soundMap).length === 0) return
    console.log("Starting to preload sounds...")
    preloadAll(soundMap)
      .then(() => {
        console.log("Sounds loaded")
      })
      .catch((error) => {
        console.error("Failed to preload sounds:", error)
      })
  }, [preloadAll, soundMap])

  return null
}
export default function AudioWrapper({
  children,
  soundMap,
}: {
  children: React.ReactNode
  soundMap: SoundMap
}) {
  return (
    <AudioProvider>
      <AudioInitializer soundMap={soundMap} />
      {children}
    </AudioProvider>
  )
}
