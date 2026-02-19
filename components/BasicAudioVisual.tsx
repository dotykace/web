import { Card, CardContent } from "@/components/ui/card"
import React, {useRef} from "react"
import { AnimatePresence, motion } from "framer-motion"
import VoiceVisualization from "@/components/VoiceVisualization"
import { useSharedAudio } from "@/context/AudioContext"
import SkipButton from "@/components/SkipButton"
import AudioControl from "@/components/AudioControl"

export default function BasicAudioVisual({
  audio = null,
  id,
  children,
  coloring = "bg-white/10",
  canSkip = true,
}: {
  children?: React.ReactNode
  coloring?: string
  canSkip?: boolean
}) {
  const playedForIdRef = useRef<string | null>(null)
  const { playOnce, stopAll, toggleOnce, isPlaying } = useSharedAudio()


  React.useEffect(() => {
    if (!audio) return
    // Stop ALL audio before playing new audio
    stopAll()
    playOnce(audio)

    // Cleanup: stop all audio when component unmounts
    return () => {
      stopAll()
    }
  }, [ audio, playOnce, stopAll])

  const skipInteraction = () => {
    if (!audio) return
    // Stop ALL audio first
    stopAll()
    // Then call onFinish to advance to next interaction
    fetch("/api/log", {
      method: "POST",
      body: JSON.stringify({ msg: ("Skipping audio " + audio.filename) }),
    })
    console.log("basic audio visual skip")
    if (audio.onFinish) {
      audio.onFinish()
    }
  }
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${coloring}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={"w-full flex items-center justify-center"}
        >
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl rounded-xl">
            <AudioControl
              onClick={() => toggleOnce(audio)}
              audioEnabled={isPlaying[audio?.filename] || false}
              disabled={!audio}
            />
            <CardContent className="p-8 text-center">
              {children ?? <VoiceVisualization />}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
      <SkipButton onSkip={skipInteraction} visible={audio && canSkip} />
    </div>
  )
}
