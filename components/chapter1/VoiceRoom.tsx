"use client"

import { ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import VoiceItem from "@/components/chapter1/VoiceItem"
import { useSharedAudio } from "@/context/AudioContext"

const sampleVoices = [
  {
    id: "female",
    name: "Ženský hlas",
    audioKey: "voice-female",
  },
  {
    id: "male",
    name: "Mužský hlas",
    audioKey: "voice-male",
  },
]

export default function VoiceRoom({
  onFinish,
}: {
  onFinish: (voice: string) => void
}) {
  const [selectedVoice, setSelectedVoice] = useState<string>("male")
  const { playPreloaded, isPlaying, togglePreloaded, stop, playOnce } =
    useSharedAudio()
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [disableSelection, setDisableSelection] = useState<boolean>(false)

  useEffect(() => {
    playPreloaded("voice-loop")
  }, [])
  useEffect(() => {
    sampleVoices.forEach((voice) => {
      if (voice.audioKey && isPlaying[voice.audioKey]) {
        setCurrentlyPlaying(voice.audioKey)
      }
    })
  }, [isPlaying])

  const playTrackZero = () => {
    setDisableSelection((prevState) => !prevState)
    console.log(disableSelection)
    stop("voice-loop")
    sampleVoices.forEach((voice) => {
      if (voice.audioKey && isPlaying[voice.audioKey]) {
        stop(voice.audioKey)
      }
    })
    const path = `${selectedVoice}/track0.mp3`
    playOnce({
      filename: path,
      type: "sound",
      onFinish: () => {
        onFinish(selectedVoice)
      },
    })
  }

  const titleHeader = "Jak na tebe mám mluvit?"
  const titleSubheader = "Vyber si hlas, který ti nejvíc vyhovuje:"

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-balance drop-shadow-lg">
            {titleHeader}
          </h1>
          <p className="text-white/80 text-lg">
            {titleSubheader}
          </p>
        </div>

        {/* Voice Options */}
        <div className="space-y-4">
          <RadioGroup value={selectedVoice} onValueChange={setSelectedVoice}>
            {sampleVoices.map((voice) => {
              const disabled = voice.audioKey === undefined || disableSelection

              return (
                <VoiceItem
                  key={voice.id}
                  disabled={disabled}
                  voice={{
                    id: voice.id,
                    name: voice.name,
                    audioKey: voice.audioKey || "",
                  }}
                  isSelected={selectedVoice === voice.id}
                  isPlaying={disabled ? false : isPlaying[voice.audioKey]}
                  onToggle={() => {
                    if (disabled) return
                    if (
                      currentlyPlaying &&
                      currentlyPlaying !== voice.audioKey
                    ) {
                      stop(currentlyPlaying)
                    }
                    togglePreloaded(voice.audioKey)
                  }}
                />
              ) as ReactNode
            })}
          </RadioGroup>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button
            disabled={disableSelection}
            onClick={playTrackZero}
            size="lg"
            className="px-12 py-6 text-lg font-semibold bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-full shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/50 hover:scale-105"
          >
            Pokračovat
          </Button>
        </div>
      </div>
    </main>
  )
}
