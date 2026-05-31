import React, { useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import VoiceVisualization from "@/components/VoiceVisualization"
import { useSharedAudio } from "@/context/AudioContext"
import SkipButton from "@/components/SkipButton";

interface AudioConfig {
  filename: string
  opts?: { loop?: boolean; volume?: number }
  onFinish?: () => void
  type: "sound" | "voice"
}

interface BasicAudioVisualProps {
  audio?: AudioConfig | null
  id?: string
  children?: React.ReactNode
  canSkip?: boolean
  progress?: number
  showProgress?: boolean // When false, hides the progress bar (e.g. chapter 2 doesn't need it)
}

export default function BasicAudioVisual({
  audio = null,
  id,
  children,
  canSkip = true,
  progress = 50,
  showProgress = false,
}: BasicAudioVisualProps) {
  const playedForIdRef = useRef<string | null>(null)
  const [showSkip, setShowSkip] = React.useState(false)
  const [loading, setLoading] = React.useState(!!audio)

  const { playOnce, stopAll } = useSharedAudio()

  // audio/stopAll/playOnce are intentionally omitted from deps —
  // the effect should only fire when the interaction id changes
  const audioRef = useRef(audio)
  audioRef.current = audio

  React.useEffect(() => {
    setShowSkip(false) // Reset skip button visibility when interaction changes
    stopAll()

    const currentAudio = audioRef.current
    if (currentAudio && playedForIdRef.current !== id) {
      playedForIdRef.current = id || null
      playOnce({
        filename: currentAudio.filename,
        opts: currentAudio.opts,
        onFinish: currentAudio.onFinish || (() => {}),
        onStarted: () => {setLoading(false)},
        type: currentAudio.type || "sound",
      })
    }

    return () => {
      stopAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const skipInteraction = () => {
    if (!audio) return

    // Stop ALL audio first
    stopAll()

    // Then call onFinish to advance to next interaction
    if (audio.onFinish) {
      audio.onFinish()
    }
  }

  // Changed from h-screen to flex-1 so this component works inside parent flex layouts (e.g. below ChapterHeader)
  return (
    <div className={`flex-1 min-h-0 flex flex-col`}>
      {/* Main content area */}
      {loading? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-white/80">Načítám audio...</div>
        </div>
        ):(
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md flex flex-col items-center justify-center text-center min-h-0 max-h-full"
              onClick={() => setShowSkip(canSkip!!)}
            >
              <VoiceVisualization />
              {children ?? null}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Skip Button - pinned to bottom */}
      {audio && (
        <SkipButton onSkip={skipInteraction} visible={canSkip && showSkip} />
      )}

      {/* Progress Indicator */}
      {showProgress && (
        <div className="p-6">
          <div className="max-w-lg mx-auto">
            <div className="h-3 bg-white/20 border border-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
