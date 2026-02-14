"use client"

import HelpButton from "@/components/HelpButton"

interface ChapterHeaderProps {
  chapterNumber: number
  accentColor?: string
}

export default function ChapterHeader({
  chapterNumber,
  accentColor = "white",
}: ChapterHeaderProps) {
  return (
    <div className="shrink-0 z-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 flex items-center justify-between">
          {/* Chapter Title */}
          <h1 className="text-white pl-2 font-bold text-lg tracking-wide">
            Kapitola {chapterNumber}
          </h1>

          {/* Help Button */}
          <HelpButton variant="inline" />
        </div>
      </div>
    </div>
  )
}
