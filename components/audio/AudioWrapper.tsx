import { AudioProvider, useSharedAudio } from "@/context/AudioContext"
import { useEffect } from "react"

function AudioInitializer({ soundMap, setLoaded }) {
  const { preloadAll } = useSharedAudio()

  useEffect(() => {
    if (!soundMap) return
    preloadAll(soundMap).then(() => {
      console.log("Sounds loaded")
      setLoaded && setLoaded(true)
    })
  }, [preloadAll])

  return null
}
export default function AudioWrapper({ children, soundMap, setLoaded }) {
  return (
    <AudioProvider>
      <AudioInitializer soundMap={soundMap} setLoaded={setLoaded} />
      {children}
    </AudioProvider>
  )
}
