import { useChatContext } from "@/context/ChatContext"
import Scales from "@/components/chapter4/Scales"
import Gallery from "@/components/chapter4/Gallery"
import React, { useEffect, useState } from "react"
import BasicAudioVisual from "@/components/BasicAudioVisual"
import AudioWrapper from "@/components/audio/AudioWrapper"
import CountDownInput from "@/components/CountDownInput"
import { useRouter } from "next/navigation"
import useDB from "@/hooks/use-db"
import FullScreenVideo from "@/components/FullScreenVideo"
import { readFromStorage, setToStorage } from "@/scripts/local-storage"

const coloring = "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
export default function ScalesAndGallery() {
  return (
    <AudioWrapper>
      <ScalesAndGalleryContent />
    </AudioWrapper>
  )
}

function ScalesAndGalleryContent() {
  const { currentInteraction, goToNextInteraction } = useChatContext()
  const [data, setData] = useState(null)
  const [dbHook, setDbHook] = useState<any>(null)

  useEffect(() => {
    const hook = useDB()
    setDbHook(hook)
  }, [])
  const collectData = (data) => {
    console.log("Collected data:", data)
    // todo save to firestore
    setData(data)
    goToNextInteraction()
  }

  const pickGalleryImages = () => {
    if (!currentInteraction) return []
    if (!data) return []
    return Object.entries(data).map(
      ([key, value]) => `/images/scales/${key}/${value.combo}.jpg`,
    )
  }

  if (!currentInteraction) return null
  if (data) {
    if (currentInteraction.id === "gallery") {
      const images = pickGalleryImages()
      const audio = {
        filename: currentInteraction.voice,
        type: "voice",
        onFinish: () => {
          console.log("Played gallery audio:", currentInteraction.voice)
        },
      }
      return (
        <Gallery
          images={images}
          helpText={currentInteraction.text()}
          onFinish={() => goToNextInteraction()}
          audio={audio}
        />
      )
    }
  }
  const router = useRouter()
  const finishChapter = (finalResponse) => {
    console.log("Final response:", finalResponse)
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

  if (currentInteraction.id === "scales")
    return (
      <Scales
        currentInteraction={currentInteraction}
        onComplete={collectData}
      />
    )
  else {
    if (currentInteraction.type == "video") {
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
        filename: currentInteraction.filename,
        type: "voice",
        onFinish: () => goToNextInteraction(),
      }
      return <BasicAudioVisual coloring={coloring} audio={audio} />
    }
    if (currentInteraction.type === "input") {
      return (
        <BasicAudioVisual coloring={coloring}>
          <CountDownInput
            questionText={currentInteraction.text()}
            countdownSeconds={currentInteraction.duration}
            onSave={finishChapter}
          />
        </BasicAudioVisual>
      )
    } else return <BasicAudioVisual coloring={coloring} />
  }
}

// todo remove when not needed
function ResultTable({ data, children }) {
  return (
    <div className="p-4 py-20 h-screen items-center justify-between flex flex-col ">
      <h1 className="text-3xl font-bold mb-4">Result Data</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div
            key={key}
            className="p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">{key}</span>
              <span
                className={`px-2 py-1 rounded text-white text-sm ${
                  value.class === "high"
                    ? "bg-green-500"
                    : value.class === "medium"
                      ? "bg-orange-500"
                      : "bg-red-500"
                }`}
              >
                {value.class}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-gray-600">Percentage: </span>
              <span className="font-medium">{value.percentage}%</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-600">Secondary: </span>
              <span className="font-medium">{value.secondary}</span>
            </div>
            <div>
              <span className="text-gray-600">Combo: </span>
              <span className="font-medium">{value.combo}</span>
            </div>
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}
