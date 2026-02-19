"use client"

import { motion, AnimatePresence } from "framer-motion"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import useDB from "@/hooks/use-db"
import { useRouter } from "next/navigation"
import ChapterHeader from "@/components/ChapterHeader"
import LoadingScreen from "@/components/LoadingScreen"

interface VideoItem {
  id: number
  title: string
  description: string
  fileName: string
}

const videos: VideoItem[] = [
  {
    id: 1,
    title: "Mobil a mozek",
    description:
      "Co je dopamin, jak používání mobilu ovlivňuje jeho vyplavování do mozku, a proč je to důležité?",
    fileName: "DOPAMIN.mp4",
  },
]

export default function VideoPage() {
  const pageHeader = "Video na závěr"
  const finishButtonText = "Dokončit zážitek"

  const [selectedVoice, setSelectedVoice] = useState<string>()
  const [dbHook, setDbHook] = useState<ReturnType<typeof useDB>>()
  const router = useRouter()

  const [filePathLoaded, setFilePathLoaded] = useState(false)
  const [showFinishButton, setShowFinishButton] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)

  useEffect(() => {
    const savedVoice = readFromStorage("selectedVoice") || "male"
    if (savedVoice) {
      setSelectedVoice(savedVoice)
      setFilePathLoaded(true)
    }
    const hook = useDB()
    setDbHook(hook)
    setTimeout(
      () => {
        setShowFinishButton(true)
      },
      1000 * 2 * 60,
    ) // Show finish button after 2 minutes
  }, [])

  const onVideoEnded = () => {
    setVideoEnded(true)
    setShowFinishButton(true)
    setTimeout(() => {
      handleFinish()
    }, 1000 * 30)
  }

  const handleFinish = () => {
    setToStorage("dotykaceFinished", true)
    if (dbHook) {
      dbHook.updateChapter(5, () => router.push("/dotykace"))
    } else {
      router.push("/dotykace")
    }
  }

  const filePath = `/videos/${selectedVoice}/`

  if (!filePathLoaded) {
    return <LoadingScreen message="Načítávám video obsah..." />
  }

  return (
    <main className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600">
      {/* Chapter Header */}
      <ChapterHeader chapterNumber={5} />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
              {pageHeader}
            </h1>
          </motion.div>

          {/* Video Cards */}
          <div className="w-full space-y-6">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + index * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <div className="rounded-3xl px-6 py-6 shadow-2xl bg-white/95 backdrop-blur-md text-gray-800 ring-2 ring-white/30">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {video.title}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed">
                    {video.description}
                  </p>
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/10">
                    <video
                      className="absolute top-0 left-0 w-full h-full bg-black"
                      src={`${filePath}${video.fileName}`}
                      title={video.title}
                      controls
                      playsInline
                      onEnded={onVideoEnded}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Finish Button */}
          <AnimatePresence>
            {showFinishButton && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="pb-8"
              >
                <Button
                  onClick={handleFinish}
                  className="px-12 py-6 text-lg font-semibold bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-full shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/50 hover:scale-105"
                >
                  {finishButtonText}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion message */}
          <AnimatePresence>
            {videoEnded && !showFinishButton && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/70 text-sm"
              >
                Video dokončeno
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
