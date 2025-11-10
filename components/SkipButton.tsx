import {Button} from "@/components/ui/button";
import {SkipForward} from "lucide-react";
import React from "react";

export default function SkipButton({ onSkip, visible }: { onSkip: () => void, visible:boolean }) {
  if (!onSkip || typeof onSkip !== "function") {
    return null;
  }
  if (!visible) {
    return null;
  }
  const skipText = "Přeskočit";
  return (
    <div className="absolute bottom-4 right-4 z-20">
      <Button
        onClick={onSkip}
        className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm flex items-center gap-1 rounded-full"
      >
        <SkipForward className="h-4 w-4" />
        {skipText}
      </Button>
    </div>
  )

}