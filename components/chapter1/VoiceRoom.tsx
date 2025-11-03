"use client"

import {ReactNode, useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import VoiceItem from "@/components/chapter1/VoiceItem"
import {useSharedAudio} from "@/context/AudioContext";

const sampleVoices = [
  {
    id: "female",
    name: "Ženský hlas",
    audioKey: "voice-female",
  },
  {
    id: "male",
    name: "Mužský hlas",
    audioKey: "voice-placeholder",
  },
  {
    id: "neutral",
    name: "Neutrální hlas",
  },
]

export default function VoiceRoom({onFinish}) {
  const [selectedVoice, setSelectedVoice] = useState<string>("male")
  const { play, isPlaying, toggle } = useSharedAudio();

  useEffect(() => {
    play("voice-loop")
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-balance">Jak na tebe mám mluvit?</h1>
          <p className="text-zinc-400 text-lg">Vyber si hlas, který ti nejvíce vyhovuje</p>
        </div>

        {/* Voice Options */}
        <div className="space-y-4">
          <RadioGroup value={selectedVoice} onValueChange={setSelectedVoice}>
            {sampleVoices.map((voice) => {
              const disabled = voice.audioKey === undefined;

              return (
                <VoiceItem
                  key={voice.id}
                  disabled={disabled}
                  voice={voice}
                  isSelected={selectedVoice === voice.id}
                  isPlaying={disabled? false: isPlaying[voice.audioKey]}
                  onToggle={() => {
                    if (disabled) return;
                    console.log("Play/Pause toggled for voice:", voice.id)
                    toggle(voice.audioKey)
                  }}
                />
              ) as ReactNode;
            })}
          </RadioGroup>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => onFinish(selectedVoice)}
            size="lg"
            className="px-12 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-600/50 hover:scale-105"
          >
            Pokračovat
          </Button>
        </div>
      </div>
    </main>
  )
}
