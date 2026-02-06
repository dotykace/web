"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import HelpButton from "@/components/HelpButton"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import useDB from "@/hooks/use-db"
import { useRouter } from "next/navigation"

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

  const [selectedVoice, setSelectedVoice] = useState()
  const [dbHook, setDbHook] = useState()
  const router = useRouter()

  const [filePathLoaded, setFilePathLoaded] = useState(false)
  const [showFinishButton, setShowFinishButton] = useState(false)

  useEffect(() => {
    console.log("Loading selected voice from storage")
    // todo get voice from firebase
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
    setShowFinishButton(true)
    setTimeout(() => {
      handleFinish()
    }, 1000 * 30)
  }

  const handleFinish = () => {
    if (dbHook) {
      dbHook.updateChapter(5, () => setToStorage("dotykaceFinished", true))
    }
    router.push("/dotykace")
  }

  const filePath = `/videos/${selectedVoice}/`
  const coloring =
    "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"

  if (!filePathLoaded) {
    const loadingText = "Načítavam video obsah..."
    return (
      <div
        className={`min-h-screen text-white flex items-center justify-center p-4 ${coloring}`}
      >
        {loadingText}
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 ${coloring}`}
    >
      <HelpButton />

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 mt-12 sm:mt-16"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
          {pageHeader}
        </h1>
      </motion.div>

      <div className="w-full max-w-3xl space-y-8 mb-12">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl rounded-xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                  {video.title}
                </h2>
                <p className="text-white/80 text-sm sm:text-base mb-4">
                  {video.description}
                </p>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                  <video
                    className="absolute top-0 left-0 w-full h-full"
                    src={`${filePath}${video.fileName}`}
                    title={video.title}
                    controls
                    playsInline
                    onEnded={onVideoEnded}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {showFinishButton && (
        <Button
          onClick={handleFinish}
          className={
            "rounded-full border-2 border-blue-950 bg-blue-700 text-white text-xl p-6"
          }
        >
          {finishButtonText}
        </Button>
      )}
    </div>
  )
}
