import { useChatContext } from "@/context/ChatContext"
import Scales from "@/components/chapter4/Scales"
import Gallery from "@/components/chapter4/Gallery"
import React, { useState } from "react"
import BasicAudioVisual from "@/components/BasicAudioVisual"
import AudioWrapper from "@/components/audio/AudioWrapper"
import CountDownInput from "@/components/CountDownInput"
import { useRouter } from "next/navigation"
import useDB from "@/hooks/use-db"
import ChapterHeader from "@/components/ChapterHeader"
import FullScreenVideo from "@/components/FullScreenVideo"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const coloring = "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"

const soundMap = {}

interface Interpretation {
  secondary: string
  percentage: number
  class: number
  combo?: string
}

export default function ScalesAndGallery() {
  const [hasStartedExperience, setHasStartedExperience] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  if (!hasStartedExperience) {
    return (
      <div
        className={`h-screen overflow-hidden ${coloring} flex items-center justify-center p-4`}
      >
        {/* Decorative elements */}
        <div
          className="fixed w-24 h-24 bg-blue-400/30 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ top: "15%", left: "10%" }}
        />
        <div
          className="fixed w-20 h-20 bg-indigo-400/25 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ top: "25%", right: "15%", animationDelay: "1s" }}
        />
        <div
          className="fixed w-28 h-28 bg-purple-400/20 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ bottom: "20%", left: "20%", animationDelay: "2s" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md space-y-6"
        >
          {/* Chapter badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-white border-2 border-indigo-400 shadow-xl flex items-center justify-center">
              <span className="text-3xl font-bold text-indigo-600">4</span>
            </div>
          </motion.div>

          {/* Main card */}
          <div className="bg-white rounded-2xl border-2 border-indigo-400 p-8 text-center shadow-xl">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-2xl font-bold text-indigo-600 mb-2"
            >
              Kapitola 4
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-indigo-500 mb-8 font-medium text-sm"
            >
              Pro spuštění zážitku klikněte na tlačítko
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Button
                onClick={() => setHasStartedExperience(true)}
                className="w-full bg-indigo-500 hover:bg-indigo-600
                           text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-indigo-500/30
                           transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Spustit
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`h-dvh flex flex-col overflow-hidden ${coloring}`}>
      {!isVideoPlaying && <ChapterHeader chapterNumber={4} />}
      <div className="flex-1 min-h-0 flex flex-col">
        <AudioWrapper soundMap={soundMap} setLoaded={() => {}}>
          <ScalesAndGalleryContent onVideoStateChange={setIsVideoPlaying} />
        </AudioWrapper>
      </div>
    </div>
  )
}

function ScalesAndGalleryContent({
  onVideoStateChange,
}: {
  onVideoStateChange?: (isPlaying: boolean) => void
}) {
  const { currentInteraction, goToNextInteraction } = useChatContext()
  const [data, setData] = useState<Record<string, Interpretation> | null>(null)
  const [interactionIndex, setInteractionIndex] = useState(0)
  const dbHook = useDB()
  const router = useRouter()

  // Notify parent when video state changes
  React.useEffect(() => {
    const isVideo = currentInteraction?.type === "video"
    onVideoStateChange?.(isVideo)
  }, [currentInteraction?.type, onVideoStateChange])

  // Track interaction progress
  const totalSteps = 5 // Approximate: intro voice + scales + gallery + input

  const collectData = (data: Record<string, Interpretation>) => {
    console.log("Collected data:", data)
    setData(data)
    setInteractionIndex((prev) => prev + 1)
    goToNextInteraction()
  }

  const pickGalleryImages = (): string[] => {
    if (!currentInteraction) return []
    if (!data) return []
    return Object.entries(data).map(
      ([key, value]) => `/images/scales/${key}/${value.combo}.jpg`,
    )
  }

  if (!currentInteraction) return null

  // Calculate progress
  const progress = Math.min(
    100,
    Math.round(((interactionIndex + 1) / totalSteps) * 100),
  )

  if (data) {
    if (currentInteraction.id === "gallery") {
      const images = pickGalleryImages()
      const audio = {
        filename: currentInteraction.voice as string,
        type: "voice" as const,
        onFinish: () => {
          console.log("Played gallery audio:", currentInteraction.voice)
        },
      }
      return (
        <Gallery
          images={images}
          helpText={currentInteraction.text()}
          onFinish={() => {
            setInteractionIndex((prev) => prev + 1)
            goToNextInteraction()
          }}
          audio={audio}
        />
      )
    }
  }

  const finishChapter = (finalResponse: string) => {
    console.log("Final response:", finalResponse)
    if (dbHook) {
      dbHook.canShowVideo().then((canShow) => {
        const showVideo = canShow
        console.log("Can show video:", showVideo)
        if (showVideo) {
          dbHook.updateChapter(4, () => router.push("/video")).then()
        } else {
          setToStorage("dotykaceFinished", true)
          dbHook.updateChapter(4, () => router.push("/dotykace")).then()
        }
      })
    }
  }

  if (currentInteraction.id === "scales")
    return (
      <Scales
        currentInteraction={currentInteraction}
        onComplete={collectData}
      />
    )
  else {
    if (currentInteraction.type === "video") {
      const selectedVoice = readFromStorage("selectedVoice") || "male"
      if (currentInteraction) {
        return (
          <FullScreenVideo
            videoSrc={`${selectedVoice}/${currentInteraction.source}`}
            onEnded={() => goToNextInteraction()}
          />
        )
      }
    }
    if (currentInteraction.type === "voice") {
      const audio = {
        filename: currentInteraction.filename as string,
        type: "voice" as const,
        onFinish: () => {
          setInteractionIndex((prev) => prev + 1)
          goToNextInteraction()
        },
      }
      return (
        <BasicAudioVisual
          id={currentInteraction.id}
          coloring={coloring}
          audio={audio}
          progress={progress}
        />
      )
    }
    if (currentInteraction.type === "input") {
      return (
        <BasicAudioVisual
          id={currentInteraction.id}
          coloring={coloring}
          audio={null}
          progress={90}
        >
          <CountDownInput
            questionText={currentInteraction.text()}
            countdownSeconds={currentInteraction.duration}
            onSave={finishChapter}
          />
        </BasicAudioVisual>
      )
    } else
      return (
        <BasicAudioVisual
          id={currentInteraction.id}
          coloring={coloring}
          audio={null}
          progress={progress}
        />
      )
  }
}
