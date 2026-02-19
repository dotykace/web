"use client"

import HelpButton from "@/components/HelpButton"
import AudioControl from "@/components/AudioControl"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChapterHeaderProps {
  chapterNumber: number
  accentColor?: string
  showAudioControl?: boolean
  muted?: boolean
  onToggleMute?: () => void
  onRestart?: () => void
}

export default function ChapterHeader({
  chapterNumber,
  accentColor = "white",
  showAudioControl = false,
  muted = false,
  onToggleMute,
  onRestart,
}: ChapterHeaderProps) {
  return (
    <div className="shrink-0 z-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 flex items-center justify-between">
          <h1 className="text-white pl-2 font-bold text-lg tracking-wide">
            Kapitola {chapterNumber}
          </h1>

          <div className="flex items-center gap-2">
            {onRestart && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRestart}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            {showAudioControl && onToggleMute && (
              <AudioControl
                onClick={onToggleMute}
                audioEnabled={!muted}
                inline
              />
            )}
            <HelpButton variant="inline" />
          </div>
        </div>
      </div>
    </div>
  )
}
