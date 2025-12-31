import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";

type SectionState = "locked" | "unlocked" | "completed";

interface Section {
  id: number;
  title: string;
  path: string;
  state: SectionState;
}

function generateSectionFileName(chapterNumber: number, disabled: boolean) {
  return `/images/menu/menu${chapterNumber}_${disabled ? "dis" : "en"}.svg`;
}

export default function MenuSectionCard({
  section,
  handleSectionClick,
}: {
  section: Section;
  handleSectionClick: (section: Section) => void;
}) {
  const isLocked = section.state === "locked";
  const isCompleted = section.state === "completed";
  const fileName = generateSectionFileName(section.id, isLocked);

  return (
    <div className="flex flex-col items-center w-[150px] relative group">
      <div 
        className={`relative w-[150px] h-[150px] rounded-2xl border-4 overflow-hidden
                    transition-all duration-300 cursor-pointer
                    ${isLocked 
                      ? 'border-white/50 opacity-70' 
                      : 'border-white shadow-lg shadow-black/10 hover:shadow-xl hover:scale-105'
                    }`}
        onClick={() => handleSectionClick(section)}
      >
        <Image
          src={fileName}
          alt={`Chapter Image ${fileName}`}
          fill
          className="object-cover"
        />
      </div>
      {isCompleted && (
        <div className="absolute top-[-8px] right-[-8px] bg-gradient-to-br from-green-400 to-green-600 
                        rounded-full p-1.5 shadow-lg shadow-green-500/30 border-2 border-white
                        animate-scale-in">
          <Check className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
      )}
      {/* Text block */}
      <div className="mt-3 w-full text-center">
        <p className={`text-lg font-bold tracking-wide ${isLocked ? 'text-white/70' : 'text-white'}`}>
          {section.title}
        </p>
      </div>
    </div>
  );
}
