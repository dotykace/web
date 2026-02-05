"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import HelpButton from "@/components/HelpButton";

interface ChapterHeaderProps {
  chapterNumber: number;
  accentColor?: string;
}

export default function ChapterHeader({ 
  chapterNumber, 
  accentColor = "white" 
}: ChapterHeaderProps) {
  const router = useRouter();

  return (
    <div className="shrink-0 z-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => router.push("/menu")}
            className="p-2 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Menu</span>
          </button>

          {/* Chapter Title */}
          <h1 className="text-white font-bold text-lg tracking-wide">
            Kapitola {chapterNumber}
          </h1>

          {/* Help Button */}
          <HelpButton variant="inline" />
        </div>
      </div>
    </div>
  );
}
