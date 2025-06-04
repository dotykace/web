"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Copy, Plus } from "lucide-react"
import type { InteractionFlow, Interaction, Choice } from "@/types/interaction-system"

interface InteractionEditorProps {
  interaction: Interaction | null
  flow: InteractionFlow
  onUpdate: (interaction: Interaction) => void
  onAdd: (interaction: Interaction) => void
  onDelete: (id: string) => void
  onDuplicate: (interaction: Interaction) => void
}

const interactionTypes = [
  "narrative-text",
  "title-card",
  "title-screen",
  "input",
  "text-input",
  "multiple-choice",
  "binary-choice",
  "chat-message-bot",
  "chat-input",
  "notification",
  "expanding-dot",
  "message-circle",
  "center-dot-to-play",
  "social-media-storm",
  "turn-instruction",
  "rotating-bubble",
  "scroll-line",
  "scroll-line-timeout",
  "back-to-chat",
  "chapter-complete",
  "continue-button",
  "pause-moment",
  "scenario-text",
  "show-saved-message",
  "voice-selection",
  "voice-demo",
  "audio-visualization",
  "video-intro",
  "video-grid",
  "video-player",
  "video-reflection",
  "video-conclusion",
]

export default function InteractionEditor({
                                            interaction,
                                            flow,
                                            onUpdate,
                                            onAdd,
                                            onDelete,
                                            onDuplicate,
                                          }: InteractionEditorProps) {
  const [editedInteraction, setEditedInteraction] = useState<Interaction | null>(null)

  useEffect(() => {
    setEditedInteraction(interaction)
  }, [interaction])

  const handleSave = () => {
    if (!editedInteraction) return

    if (flow.interactions[editedInteraction.id]) {
      onUpdate(editedInteraction)
    } else {
      onAdd(editedInteraction)
    }
  }

  const handleDelete = () => {
    if (!editedInteraction) return
    onDelete(editedInteraction.id)
  }

  const handleDuplicate = () => {
    if (!editedInteraction) return
    onDuplicate(editedInteraction)
  }

  const updateField = (field: keyof Interaction, value: any) => {
    if (!editedInteraction) return
    setEditedInteraction({
      ...editedInteraction,
      [field]: value,
    })
  }

  const addChoice = () => {
    if (!editedInteraction) return
    const newChoice: Choice = {
      type: "Nová voľba",
      nextId: "",
    }
    const choices = editedInteraction.choices || []
    updateField("choices", [...choices, newChoice])
  }

  const updateChoice = (index: number, field: keyof Choice, value: string) => {
    if (!editedInteraction || !editedInteraction.choices) return
    const updatedChoices = [...editedInteraction.choices]
    updatedChoices[index] = {
      ...updatedChoices[index],
      [field]: value,
    }
    updateField("choices", updatedChoices)
  }

  const removeChoice = (index: number) => {
    if (!editedInteraction || !editedInteraction.choices) return
    const updatedChoices = editedInteraction.choices.filter((_, i) => i !== index)
    updateField("choices", updatedChoices)
  }

  if (!editedInteraction) {
    return (
        <div className="p-4 text-center text-slate-700">
          <p className="mb-4">Vyberte interakciu na úpravu alebo vytvorte novú</p>
          <Button
              onClick={() => {
                const newInteraction: Interaction = {
                  id: `interaction_${Date.now()}`,
                  type: "narrative-text",
                  maxDuration: 3000,
                  text: "Nová interakcia",
                }
                setEditedInteraction(newInteraction)
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Vytvoriť novú interakciu
          </Button>
        </div>
    )
  }

  const availableInteractions = Object.keys(flow.interactions)

  return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            {flow.interactions[editedInteraction.id] ? "Upraviť" : "Vytvoriť"} interakciu
          </h3>
          <div className="flex space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                className="border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="border-red-300 text-red-700 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Basic Properties */}
        <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-800">Základné vlastnosti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="id" className="text-slate-700 font-medium">
                ID
              </Label>
              <Input
                  id="id"
                  value={editedInteraction.id}
                  onChange={(e) => updateField("id", e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 placeholder-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="type" className="text-slate-700 font-medium">
                Typ
              </Label>
              <Select value={editedInteraction.type} onValueChange={(value) => updateField("type", value)}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {interactionTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-slate-900 hover:bg-slate-100">
                        {type}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration" className="text-slate-700 font-medium">
                Trvanie (ms)
              </Label>
              <Input
                  id="duration"
                  type="number"
                  value={editedInteraction.maxDuration}
                  onChange={(e) => updateField("maxDuration", Number.parseInt(e.target.value) || 3000)}
                  className="bg-white border-slate-300 text-slate-900 placeholder-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="text" className="text-slate-700 font-medium">
                Text
              </Label>
              <Textarea
                  id="text"
                  value={editedInteraction.text || ""}
                  onChange={(e) => updateField("text", e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                  rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-800">Navigácia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nextId" className="text-slate-700 font-medium">
                Nasledujúca interakcia
              </Label>
              <Select
                  value={editedInteraction.nextId || ""}
                  onValueChange={(value) => updateField("nextId", value || undefined)}
              >
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue placeholder="Vyberte nasledujúcu interakciu" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="none" className="text-slate-900 hover:bg-slate-100">
                    Žiadna
                  </SelectItem>
                  <SelectItem value="menu" className="text-slate-900 hover:bg-slate-100">
                    Menu
                  </SelectItem>
                  {availableInteractions.map((id) => (
                      <SelectItem key={id} value={id} className="text-slate-900 hover:bg-slate-100">
                        {id}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timeoutId" className="text-slate-700 font-medium">
                Timeout interakcia
              </Label>
              <Select
                  value={editedInteraction.timeoutId || ""}
                  onValueChange={(value) => updateField("timeoutId", value || undefined)}
              >
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue placeholder="Vyberte timeout interakciu" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="none" className="text-slate-900 hover:bg-slate-100">
                    Žiadna
                  </SelectItem>
                  {availableInteractions.map((id) => (
                      <SelectItem key={id} value={id} className="text-slate-900 hover:bg-slate-100">
                        {id}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Choices */}
        {(editedInteraction.type === "multiple-choice" || editedInteraction.type === "binary-choice") && (
            <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-slate-800">Voľby</CardTitle>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={addChoice}
                      className="border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Pridať voľbu
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {editedInteraction.choices?.map((choice, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                          value={choice.type}
                          onChange={(e) => updateChoice(index, "type", e.target.value)}
                          placeholder="Text voľby"
                          className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 flex-1"
                      />
                      <Select value={choice.nextId} onValueChange={(value) => updateChoice(index, "nextId", value)}>
                        <SelectTrigger className="bg-white border-slate-300 text-slate-900 w-40">
                          <SelectValue placeholder="Ďalej" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="" className="text-slate-900 hover:bg-slate-100">
                            Žiadna
                          </SelectItem>
                          <SelectItem value="menu" className="text-slate-900 hover:bg-slate-100">
                            Menu
                          </SelectItem>
                          {availableInteractions.map((id) => (
                              <SelectItem key={id} value={id} className="text-slate-900 hover:bg-slate-100">
                                {id}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeChoice(index)}
                          className="border-red-300 text-red-700 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                ))}
              </CardContent>
            </Card>
        )}

        {/* Flags */}
        <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-800">Príznaky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                  type="checkbox"
                  id="checkpoint"
                  checked={editedInteraction.checkpoint || false}
                  onChange={(e) => updateField("checkpoint", e.target.checked)}
                  className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="checkpoint" className="text-slate-700 font-medium">
                Checkpoint
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          {flow.interactions[editedInteraction.id] ? "Aktualizovať" : "Vytvoriť"} interakciu
        </Button>
      </div>
  )
}
