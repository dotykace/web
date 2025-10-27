import React from "react";
import Image from "next/image";
import {Check} from "lucide-react";
function generateSectionFileName (chapterNumber: number, disabled: boolean) {
  return `/images/menu/menu${chapterNumber}_${disabled ? "dis" : "en"}.svg`
}
export default function MenuSectionCard({section, handleSectionClick}) {
  const isLocked = section.state === "locked"
  const isCompleted = section.state === "completed"
  const fileName = generateSectionFileName(section.id, isLocked)

  return (
    <div className="flex flex-col items-center w-[150px] relative">
      <div className="relative w-[150px] h-[150px] rounded-xl border-white border-2 overflow-hidden">
        <Image
          src={fileName}
          alt={`Chapter Image ${fileName}`}
          fill
          className="object-cover"
          onClick={() => handleSectionClick(section)}
        />
      </div>
      {isCompleted && (
        <div className="absolute top-[-10px] right-[-10px] bg-green-500 rounded-full p-1 shadow-lg border-2 border-white">
          <Check className="w-8 h-8 text-white" />
        </div>
      )}
      {/* Text block */}
      <div className="mt-2 w-full">
        <p className="text-lg font-semibold break-words">{section.title}</p>
        <p className="text-white/90 text-sm break-words">{section.subtitle}</p>
      </div>
    </div>
  )
}