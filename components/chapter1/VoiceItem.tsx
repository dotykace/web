import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Pause, Play } from "lucide-react"

export default function VoiceItem({
  voice,
  isSelected,
  isPlaying,
  onToggle,
  disabled,
}: {
  voice: { id: string; name: string; audioKey: string }
  isSelected: boolean
  isPlaying: boolean
  onToggle: (audioKey: string) => void
  disabled: boolean
}) {
  return (
    <Card
      key={voice.id}
      className={`p-0 rounded-2xl border-2 transition-all duration-300 ${
        isSelected
          ? "border-amber-400 bg-white/95 shadow-lg shadow-amber-400/20"
          : "border-white/30 bg-white/80 hover:border-white/50 hover:bg-white/90"
      }`}
    >
      <Label
        htmlFor={voice.id}
        className="flex items-center justify-between p-6 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <RadioGroupItem
            value={voice.id}
            id={voice.id}
            className="border-gray-400 text-amber-500"
            disabled={disabled}
          />
          <div className="space-y-1">
            <div className="font-semibold text-xl text-gray-800">
              {voice.name}
            </div>
            {disabled && (
              <div className="text-sm text-gray-500">Brzy k dispozici</div>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-14 w-14 rounded-full transition-all ${
            isSelected
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={(e) => {
            e.preventDefault()
            onToggle(voice.audioKey)
          }}
          disabled={disabled}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" />
          )}
        </Button>
      </Label>
    </Card>
  )
}
