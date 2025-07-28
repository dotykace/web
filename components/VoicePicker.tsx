"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Play, Pause } from "lucide-react"

interface VoiceOption {
  id: string
  name: string
  audioUrl: string
}

interface VoicePickerProps {
  voices: VoiceOption[]
  selectedVoice?: string
  onVoiceSelect: (voiceId: string) => void
}

export default function VoicePicker({ voices, selectedVoice, onVoiceSelect }: VoicePickerProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  const handlePlayPause = (voiceId: string, audioUrl: string) => {
    const audio = audioRefs.current[voiceId] || new Audio(audioUrl)
    audioRefs.current[voiceId] = audio

    if (playingVoice === voiceId) {
      audio.pause()
      setPlayingVoice(null)
    } else {
      // Pause any currently playing audio
      Object.values(audioRefs.current).forEach((a) => a.pause())
      setPlayingVoice(voiceId)

      audio.currentTime = 0
      audio.play()

      audio.onended = () => setPlayingVoice(null)
      audio.onerror = () => setPlayingVoice(null)
    }
  }

  return (
    <div className="w-full max-w-md space-y-3">
      <RadioGroup value={selectedVoice} onValueChange={onVoiceSelect}>
        {/*<div className="flex gap-4">*/}
          {voices.map((voice) => (
            <Card key={voice.id} className="p-0 rounded-xl">
              <Label
                htmlFor={voice.id}
                className={`flex  rounded-xl items-center justify-between p-4 cursor-pointer transition-colors ${
                  selectedVoice === voice.id ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <RadioGroupItem value={voice.id} id={voice.id} className="sr-only" disabled={voice.id !== "male"} />
                <div className="flex items-center justify-between w-full">
                  <div className="font-medium text-lg">{voice.name}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`ml-2 p-4`}
                    onClick={(e) => {
                      e.preventDefault()
                      handlePlayPause(voice.id, voice.audioUrl)
                    }}
                  >
                    {playingVoice === voice.id ? <Pause size={40} /> : <Play size={40} />}
                  </Button>
                </div>
              </Label>
            </Card>
          ))}
        {/*</div>*/}
      </RadioGroup>
    </div>
  )
}
