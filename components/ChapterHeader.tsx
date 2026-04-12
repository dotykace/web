"use client"

import HelpButton from "@/components/HelpButton"
import AudioControl from "@/components/AudioControl"
import React from "react";

interface ChapterHeaderProps {
  chapterNumber: number
  chapterText?: string
  accentColor?: string
  showAudioControl?: boolean
  muted?: boolean
  onToggleMute?: () => void
  children?: React.ReactNode
  showHelp?: boolean
}

export default function ChapterHeader({
  chapterNumber,
  chapterText,
  showAudioControl = false,
  muted = false,
  onToggleMute,
  children,
  showHelp = true
}: ChapterHeaderProps) {
  return (
    <div className="shrink-0 z-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 flex items-center justify-between">
          {children}
          <h1 className="text-white pl-2 font-bold text-lg tracking-wide">
            {chapterText ?? `Kapitola ${chapterNumber}`}
          </h1>

          <div className="flex items-center gap-2">
            {showAudioControl && onToggleMute && (
              <AudioControl
                onClick={onToggleMute}
                audioEnabled={!muted}
                inline
              />
            )}
            {showHelp && <HelpButton variant="inline" />}
          </div>
        </div>
      </div>
    </div>
  )
}
