import { useChatContext } from "@/context/ChatContext"
import Scales from "@/components/chapter4/Scales"
import Gallery from "@/components/chapter4/Gallery"
import React, { useEffect, useState } from "react"
import BasicAudioVisual from "@/components/BasicAudioVisual"
import CountDownInput from "@/components/CountDownInput"
import { useRouter } from "next/navigation"
import useDB from "@/hooks/use-db"
import FullScreenVideo from "@/components/FullScreenVideo"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"
import { useChapterLayout } from "@/context/ChapterLayoutContext"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface Interpretation {
  secondary: string
  percentage: number
  class: number
  combo?: string
}

export default function ScalesAndGallery() {
  const [hasStartedExperience, setHasStartedExperience] = useState(false)

  if (!hasStartedExperience) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
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
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
              <span className="text-3xl font-bold text-indigo-600">4</span>
            </div>
          </motion.div>

          <div className="w-full bg-white rounded-3xl p-8 text-center shadow-xl">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Kapitola 4
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-indigo-600 mb-8 font-medium text-sm"
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

  return <ScalesAndGalleryContent />
}

function ScalesAndGalleryContent() {
  const { currentInteraction, goToNextInteraction } = useChatContext()
  const { setHeaderVisible } = useChapterLayout()
  const [data, setData] = useState<Record<string, Interpretation> | null>(null)
  const [interactionIndex, setInteractionIndex] = useState(0)
  const [dbHook, setDbHook] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const hook = useDB()
    setDbHook(hook)
  }, [])

  // Hide ChapterHeader during fullscreen video playback
  useEffect(() => {
    setHeaderVisible(currentInteraction?.type !== "video")
  }, [currentInteraction?.type, setHeaderVisible])

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

  const finishChapter = async (finalResponse: string) => {
    console.log("Final response:", finalResponse)
    let showVideo = true
    if (dbHook) {
      try {
        showVideo = await dbHook.canShowVideo()
      } catch (e) {
        console.warn("canShowVideo failed, defaulting to video:", e)
      }
    }
    console.log("Show video:", showVideo)
    if (showVideo) {
      if (dbHook) await dbHook.updateChapter(4)
      router.push("/video")
    } else {
      setToStorage("dotykaceFinished", true)
      if (dbHook) await dbHook.updateChapter(4)
      router.push("/dotykace")
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
          audio={audio}
          progress={progress}
          showProgress={false}
        />
      )
    }
    if (currentInteraction.type === "input") {
      return (
        <BasicAudioVisual
          id={currentInteraction.id}
          audio={null}
          progress={90}
          showProgress={false}
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
          audio={null}
          progress={progress}
          showProgress={false}
        />
      )
  }
}
