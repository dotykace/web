import {Card} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {RadioGroupItem} from "@/components/ui/radio-group";
import {Button} from "@/components/ui/button";
import {Pause, Play} from "lucide-react";

export default function VoiceItem ({voice, isSelected, isPlaying, onToggle, disabled}) {
  return (
    <Card
      key={voice.id}
      className={`p-0 rounded-2xl border-2 transition-all duration-300 ${
        isSelected
          ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
      }`}
    >
      <Label htmlFor={voice.id} className="flex items-center justify-between p-6 cursor-pointer">
        <div className="flex items-center gap-4">
          <RadioGroupItem
            value={voice.id}
            id={voice.id}
            className="border-zinc-600 text-blue-500"
            disabled={disabled}
          />
          <div className="space-y-1">
            <div className="font-semibold text-xl text-white">{voice.name}</div>
            {disabled && <div className="text-sm text-zinc-500">Brzy k dispozici</div>}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-14 w-14 rounded-full transition-all ${
            isSelected
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={(e) => {
            e.preventDefault()
            onToggle(voice.audioKey)
          }}
          disabled={disabled}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </Button>
      </Label>
    </Card>
  )
}