import {Volume2, VolumeX} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function AudioControl ({onClick, audioEnabled, disabled}: {onClick: () => void, audioEnabled: boolean, disabled?: boolean}) {
  if (disabled) return null;
  return (
    <div className="absolute top-4 left-4 z-20">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className="text-white hover:bg-white/20"
      >
        {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </Button>
    </div>
  )
}