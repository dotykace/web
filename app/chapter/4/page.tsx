"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"

// Import chapter data
import chapterData from "@/data/chapter4-flow.json"
import type { InteractionFlow, Interaction } from "@/types/interaction-system"

export default function Chapter4Page() {
  const router = useRouter()
  const [currentInteractionId, setCurrentInteractionId] = useState<string>("chapter4-intro")
  const [variables, setVariables] = useState<Record<string, any>>({})
  const [isChapterLocked, setIsChapterLocked] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [watchedVideos, setWatchedVideos] = useState<string[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  // Transform raw JSON data
  const transformRawData = (rawData: any): InteractionFlow => {
    const transformedInteractions: Record<string, Interaction> = {}

    Object.entries(rawData.interactions).forEach(([key, value]: [string, any]) => {
      transformedInteractions[key] = {
        id: key,
        type: value.type,
        maxDuration: value.duration || 3000,
        nextId: value.nextId,
        timeoutId: value.timeoutId,
        text: value.text,
        choices: value.choices,
        emojis: value.emojis,
        checkpoint: value.checkpoint || false,
      }
    })

    return {
      id: rawData.id,
      name: rawData.name,
      description: rawData.description,
      version: rawData.version,
      startInteractionId: rawData.startInteractionId,
      interactions: transformedInteractions,
    }
  }

  const flow = transformRawData(chapterData)
  const currentInteraction = flow.interactions[currentInteractionId]

  // Check if chapter is unlocked
  useEffect(() => {
    const completedChapters = JSON.parse(localStorage.getItem("completedChapters") || "[]")
    if (completedChapters.includes(3)) {
      setIsChapterLocked(false)
    }
    setIsLoading(false)
  }, [])

  // Process text with variables
  const processText = (text: string) => {
    return text?.replace(/\{([^}]+)\}/g, (match, variable) => {
      return variables[variable] || match
    })
  }

  // Load saved data on mount
  useEffect(() => {
    const preludeVariables = localStorage.getItem("preludeVariables")
    if (preludeVariables) {
      const vars = JSON.parse(preludeVariables)
      setVariables(vars)
    }
  }, [])

  // Handle video playback
  useEffect(() => {
    if (currentInteraction?.type === "video-player" && videoRef.current) {
      const video = videoRef.current

      const handleTimeUpdate = () => {
        setVideoProgress(video.currentTime)
        setVideoDuration(video.duration)
      }

      const handleEnded = () => {
        setIsPlaying(false)
        if (currentInteraction.nextId) {
          setWatchedVideos((prev) => [...prev, selectedVideo || ""])
          handleNext(currentInteraction.nextId)
        }
      }

      video.addEventListener("timeupdate", handleTimeUpdate)
      video.addEventListener("ended", handleEnded)

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("ended", handleEnded)
      }
    }
  }, [currentInteractionId, selectedVideo])

  // Auto-advance for intro screens
  useEffect(() => {
    if (
      (currentInteraction?.type === "video-intro" ||
        currentInteraction?.type === "video-conclusion" ||
        currentInteraction?.type === "chapter-complete") &&
      currentInteraction.nextId
    ) {
      const timer = setTimeout(() => {
        handleNext(currentInteraction.nextId!)
      }, currentInteraction.maxDuration)

      return () => clearTimeout(timer)
    }
  }, [currentInteractionId])

  const handleNext = (nextId: string) => {
    if (nextId === "menu") {
      // Mark chapter 4 as completed
      const completedChapters = JSON.parse(localStorage.getItem("completedChapters") || "[]")
      if (!completedChapters.includes(4)) {
        completedChapters.push(4)
        localStorage.setItem("completedChapters", JSON.stringify(completedChapters))
      }
      router.push("/menu")
      return
    }

    setCurrentInteractionId(nextId)
  }

  const handleVideoSelect = (choice: any) => {
    setSelectedVideo(choice.videoId)
    handleNext(choice.nextId)
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoContainerRef.current) {
      if (!isFullscreen) {
        if (videoContainerRef.current.requestFullscreen) {
          videoContainerRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  const handleVideoProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
      setVideoProgress(newTime)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-amber-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (isChapterLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-8xl mb-6"
          >
            🔒
          </motion.div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Kapitola 4 je uzamčená
          </h1>
          <p className="mb-6 text-amber-300">Pre odemčenie tejto kapitoly musíš najprv dokončiť Kapitolu 3.</p>
          <Button
            onClick={() => router.push("/menu")}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-none"
          >
            Zpět do menu
          </Button>
        </motion.div>
      </div>
    )
  }

  const renderInteraction = () => {
    switch (currentInteraction?.type) {
      case "video-intro":
      case "video-conclusion":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur opacity-25"></div>
              <div className="relative bg-black rounded-lg p-8 shadow-2xl border border-amber-500/20">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-6">
                  {processText(currentInteraction.text || "")}
                </h1>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto my-6"></div>
                <p className="text-gray-300 text-lg">
                  {currentInteraction.type === "video-intro"
                    ? "Pripravte sa na interaktívnu video skúsenosť"
                    : "Ďakujeme za sledovanie"}
                </p>
              </div>
            </div>
          </motion.div>
        )

      case "video-grid":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl w-full"
          >
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              {processText(currentInteraction.text || "")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentInteraction.choices?.map((choice, index) => {
                const isWatched = watchedVideos.includes(choice.videoId)

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                    onClick={() => handleVideoSelect(choice)}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                    <div
                      className={`relative h-48 rounded-lg overflow-hidden cursor-pointer border-2 ${
                        isWatched ? "border-green-500" : "border-amber-500/30"
                      } transition-all duration-300`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-black flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/40 transition-colors">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-white">{choice.type}</h3>
                        {isWatched && (
                          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )

      case "video-player":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl w-full"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white">{processText(currentInteraction.text || "")}</h2>
            </div>
            <div
              ref={videoContainerRef}
              className="relative rounded-lg overflow-hidden bg-black shadow-2xl border border-amber-500/20"
            >
              {/* Video placeholder - in a real implementation, this would be a real video */}
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src="/video-placeholder.mp4"
                  poster="/placeholder.svg?height=720&width=1280"
                />

                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <button
                      onClick={togglePlay}
                      className="w-20 h-20 rounded-full bg-amber-500/80 flex items-center justify-center"
                    >
                      <Play className="w-10 h-10 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Video controls */}
              <div className="bg-gray-900 p-4">
                <div className="flex items-center space-x-4 mb-2">
                  <button onClick={togglePlay} className="text-white">
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>

                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={videoDuration || 100}
                      value={videoProgress}
                      onChange={handleVideoProgress}
                      className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #f59e0b ${(videoProgress / (videoDuration || 100)) * 100}%, #374151 0%)`,
                      }}
                    />
                  </div>

                  <div className="text-white text-sm">
                    {formatTime(videoProgress)} / {formatTime(videoDuration || 0)}
                  </div>

                  <button onClick={toggleMute} className="text-white">
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>

                  <button onClick={toggleFullscreen} className="text-white">
                    {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case "video-reflection":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl w-full"
          >
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 shadow-xl border border-amber-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">{processText(currentInteraction.text || "")}</h2>
              <p className="text-gray-300 mb-8">Zamysli sa nad obsahom videa a jeho významom pre tvoj život.</p>
              <div className="flex justify-end">
                <Button
                  onClick={() => currentInteraction.nextId && handleNext(currentInteraction.nextId)}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-none"
                >
                  Pokračovať
                </Button>
              </div>
            </div>
          </motion.div>
        )

      case "chapter-complete":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotateZ: [0, 5, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="text-9xl mb-8"
            >
              🎬
            </motion.div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
              {processText(currentInteraction.text || "")}
            </h1>

            <p className="text-xl text-gray-300 mb-8">Dokončil si všetky dostupné kapitoly!</p>

            <div className="flex flex-col items-center space-y-4">
              <div className="text-sm text-gray-400">Pozretých videí: {watchedVideos.length}</div>

              <Button
                onClick={() => handleNext("menu")}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-none px-8 py-3 text-lg rounded-full"
              >
                Späť do menu
              </Button>
            </div>
          </motion.div>
        )

      default:
        return (
          <div className="text-center">
            <p className="text-xl text-white">Neznámy typ interakcie: {currentInteraction?.type}</p>
            <Button
              onClick={() => currentInteraction?.nextId && handleNext(currentInteraction.nextId)}
              className="mt-4 bg-amber-600 hover:bg-amber-700 text-white"
            >
              Pokračovať
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/menu")}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="text-white/70 text-sm">Kapitola 4</div>
        <Button
          onClick={() => {
            const completedChapters = JSON.parse(localStorage.getItem("completedChapters") || "[]")
            if (!completedChapters.includes(4)) {
              completedChapters.push(4)
              localStorage.setItem("completedChapters", JSON.stringify(completedChapters))
            }
            router.push("/menu")
          }}
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          Skip
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentInteractionId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex justify-center"
          >
            {renderInteraction()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
