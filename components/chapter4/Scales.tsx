import { useEffect, useState } from "react"
import ScaleTemplate from "@/components/chapter4/ScaleTemplate"
import { useSharedAudio } from "@/context/AudioContext"
import AudioControl from "@/components/AudioControl"
import { PlayOnceOptions } from "@/hooks/use-audio"

const classifyData = (number) => {
  if (number >= 67) return 1 // high
  if (number <= 33) return 5 // low
  return 3 // medium
}
// connections = {A: B, B: C, C: A}
const interpretData = (connections, data) => {
  const interpretations = {}
  for (const key in data) {
    interpretations[key] = {
      secondary: connections[key],
      percentage: data[key],
      class: classifyData(data[key]),
    }
  }
  for (const key in interpretations) {
    const secondaryKey = connections[key]
    interpretations[key].combo =
      `${key}${interpretations[key].class}${secondaryKey}${interpretations[secondaryKey].class}`
  }
  return interpretations
}

export default function Scales({ currentInteraction, onComplete }) {
  const [data, setData] = useState({})
  const [dataCollected, setDataCollected] = useState(false)

  const { playOnce, toggleOnce, isPlaying, stop } = useSharedAudio()

  useEffect(() => {
    if (dataCollected) {
      console.log("Final data:", data)
      const connections = {}
      for (const key in scalesObject) {
        connections[key] = scalesObject[key].secondary
      }
      const result = interpretData(connections, data)
      onComplete(result)
    }
  }, [data])

  const scalesObject = currentInteraction.scales
  const [currentScale, setCurrentScale] = useState(scalesObject["A"])
  const [currentAudio, setCurrentAudio] = useState<PlayOnceOptions>()

  const updateData = (key, value) => {
    setData((prev) => ({
      ...prev,
      [key]: value, // dynamically update key
    }))
  }

  const updateScale = (number) => {
    if (!currentScale) return
    updateData(currentScale.id, number)
    stop(currentScale.voice)
    if (!currentScale.next) {
      setDataCollected(true)
      return
    }
    setCurrentScale(scalesObject[currentScale.next])
  }

  useEffect(() => {
    if (!currentScale) return
    if (currentScale.voice) {
      if (isPlaying[currentScale.voice]) return
      const audio: PlayOnceOptions = {
        filename: currentScale.voice as string,
        type: "voice",
        onFinish: () => {
          console.log("Played sound for scales:", currentScale.voice)
        },
      }
      setCurrentAudio(audio)
    }
  }, [currentScale])

  useEffect(() => {
    if (currentAudio) {
      playOnce(currentAudio)
    }
  }, [currentAudio, playOnce])

  if (!currentScale) return null

  return (
    <div>
      <AudioControl
        onClick={() => {
          if (currentAudio) {
            toggleOnce(currentAudio)
          }
        }}
        audioEnabled={isPlaying[currentAudio?.filename] || false}
        disabled={!currentAudio}
      />
      <ScaleTemplate
        topText={currentScale.top}
        bottomText={currentScale.bottom}
        onConfirm={updateScale}
        confirmationText={
          !currentScale.next ? "Potvrdit a dokončit" : undefined
        }
      />
    </div>
  )
}
