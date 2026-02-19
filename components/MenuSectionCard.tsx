import React from "react"
import Image from "next/image"
import { Check, Lock } from "lucide-react"

type SectionState = "locked" | "unlocked" | "completed"

interface Section {
  id: number
  title: string
  path: string
  state: SectionState
}

function generateSectionFileName(chapterNumber: number, disabled: boolean) {
  return `/images/menu/menu${chapterNumber}_${disabled ? "dis" : "en"}.svg`
}

export default function MenuSectionCard({
  section,
  handleSectionClick,
}: {
  section: Section
  handleSectionClick: (section: Section) => void
}) {
  const isLocked = section.state === "locked"
  const isCompleted = section.state === "completed"
  const fileName = generateSectionFileName(section.id, isLocked)

  return (
    <div className="flex flex-col items-center relative group">
      {/* Card Container */}
      <div
        className={`relative aspect-square w-full rounded-2xl overflow-hidden
                    transition-all duration-300 cursor-pointer
                    ${
                      isLocked
                        ? "bg-white/10 backdrop-blur-sm border border-white/20 opacity-60"
                        : "bg-white/20 backdrop-blur-md border border-white/30 shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-105 hover:bg-white/25"
                    }`}
        onClick={() => handleSectionClick(section)}
      >
        <Image
          src={fileName}
          alt={`Chapter ${section.id}`}
          fill
          className="object-cover"
        />

        {/* Lock overlay for locked chapters */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Lock
                className="w-5 h-5 text-white/80"
                strokeWidth={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Completed badge */}
      {isCompleted && (
        <div
          className="absolute top-[-4px] right-[-4px] bg-white/20 backdrop-blur-md
                        rounded-full p-1 shadow-lg border border-white/30
                        animate-scale-in"
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Title */}
      <div className="mt-1.5 w-full text-center">
        <p
          className={`text-sm font-semibold tracking-wide ${
            isLocked ? "text-white/50" : "text-white"
          }`}
        >
          {section.title}
        </p>
      </div>
    </div>
  )
}
