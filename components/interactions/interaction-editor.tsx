"use client"

import { useState, useEffect } from "react"
import type { Interaction, Choice } from "@/app/interactions/interactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Save, ArrowLeft, Clock } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface InteractionEditorProps {
  interaction: Interaction | null
  interactions: Interaction[]
  onUpdate: (interaction: Interaction) => void
  onAdd: (interaction: Interaction) => void
  onDelete: (id: string) => void
}

export default function InteractionEditor({
  interaction,
  interactions,
  onUpdate,
  onAdd,
  onDelete,
}: InteractionEditorProps) {
  const [editedInteraction, setEditedInteraction] = useState<Interaction | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [hasTimeout, setHasTimeout] = useState(false)

  useEffect(() => {
    if (interaction) {
      const interactionCopy = JSON.parse(JSON.stringify(interaction))
      setEditedInteraction(interactionCopy)
      setHasTimeout(!!interactionCopy["timeout-id"])
      setIsCreating(false)
    } else {
      setEditedInteraction(null)
      setHasTimeout(false)
    }
  }, [interaction])

  const handleCreateNew = () => {
    const newId = `new_${Date.now()}`
    setEditedInteraction({
      id: newId,
      type: "message",
      duration: 5,
      text: "",
    })
    setIsCreating(true)
    setHasTimeout(false)
  }

  const handleSave = () => {
    if (!editedInteraction) return

    // If timeout is disabled, remove the timeout-id
    if (!hasTimeout && editedInteraction["timeout-id"]) {
      const { ["timeout-id"]: _, ...interactionWithoutTimeout } = editedInteraction
      if (isCreating) {
        onAdd(interactionWithoutTimeout as Interaction)
      } else {
        onUpdate(interactionWithoutTimeout as Interaction)
      }
    } else {
      if (isCreating) {
        onAdd(editedInteraction)
      } else {
        onUpdate(editedInteraction)
      }
    }

    setIsCreating(false)
  }

  const handleDelete = () => {
    if (!editedInteraction) return
    onDelete(editedInteraction.id)
    setEditedInteraction(null)
  }

  const handleChange = (field: keyof Interaction, value: any) => {
    if (!editedInteraction) return

    const updated = { ...editedInteraction, [field]: value }

    // If changing type from multiple-choice to something else, remove choices
    if (field === "type" && value !== "multiple-choice" && "choices" in updated) {
      delete updated.choices
    }

    // If changing to multiple-choice and no choices exist, add empty choices array
    if (field === "type" && value === "multiple-choice" && !updated.choices) {
      updated.choices = []
    }

    // If changing to input and no answer exists, add empty answer
    if (field === "type" && value === "input" && updated.answer === undefined) {
      updated.answer = ""
    }

    setEditedInteraction(updated)
  }

  const handleTimeoutToggle = (enabled: boolean) => {
    setHasTimeout(enabled)

    if (enabled && editedInteraction && !editedInteraction["timeout-id"]) {
      setEditedInteraction({
        ...editedInteraction,
        "timeout-id": "",
      })
    }
  }

  const handleAddChoice = () => {
    if (!editedInteraction || !editedInteraction.choices) return

    const newChoice: Choice = {
      type: "",
      "next-id": "",
    }

    setEditedInteraction({
      ...editedInteraction,
      choices: [...editedInteraction.choices, newChoice],
    })
  }

  const handleChoiceChange = (index: number, field: keyof Choice, value: string) => {
    if (!editedInteraction || !editedInteraction.choices) return

    const updatedChoices = [...editedInteraction.choices]
    updatedChoices[index] = {
      ...updatedChoices[index],
      [field]: value,
    }

    setEditedInteraction({
      ...editedInteraction,
      choices: updatedChoices,
    })
  }

  const handleRemoveChoice = (index: number) => {
    if (!editedInteraction || !editedInteraction.choices) return

    const updatedChoices = editedInteraction.choices.filter((_, i) => i !== index)

    setEditedInteraction({
      ...editedInteraction,
      choices: updatedChoices,
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "message":
        return "bg-blue-500"
      case "input":
        return "bg-emerald-500"
      case "multiple-choice":
        return "bg-violet-500"
      case "animation":
        return "bg-amber-500"
      case "notification":
        return "bg-pink-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!editedInteraction) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <p className="text-slate-300 mb-4">No interaction selected</p>
        <Button onClick={handleCreateNew} className="bg-indigo-600 hover:bg-indigo-700">
          Create New Interaction
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Card className="bg-slate-900 border-slate-700 text-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Badge className={`${getTypeColor(editedInteraction.type)} text-white`}>{editedInteraction.type}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditedInteraction(null)}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
          <CardTitle className="text-xl">
            {isCreating ? "Create New Interaction" : `Edit: ${editedInteraction.id}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id" className="text-slate-300">
              ID
            </Label>
            <Input
              id="id"
              value={editedInteraction.id}
              onChange={(e) => handleChange("id", e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="text" className="text-slate-300">
              Text Content
            </Label>
            <Textarea
              id="text"
              value={editedInteraction.text || ""}
              onChange={(e) => handleChange("text", e.target.value)}
              className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
              placeholder="Enter the text content for this interaction"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-slate-300">
              Type
            </Label>
            <Select value={editedInteraction.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="message">Message</SelectItem>
                <SelectItem value="input">Input</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="animation">Animation</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-slate-300">
              Duration (seconds)
            </Label>
            <Input
              id="duration"
              type="number"
              value={editedInteraction.duration}
              onChange={(e) => handleChange("duration", Number.parseInt(e.target.value) || 0)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {editedInteraction.type === "input" && (
            <div className="space-y-2">
              <Label htmlFor="answer" className="text-slate-300">
                Default Answer
              </Label>
              <Textarea
                id="answer"
                value={editedInteraction.answer || ""}
                onChange={(e) => handleChange("answer", e.target.value)}
                placeholder="Default answer or placeholder"
                className="bg-slate-800 border-slate-700 text-white"
              />
              {editedInteraction.id === "2" && (
                <p className="text-xs text-emerald-400 italic">
                  This input will be used as the user name (UN) in other interactions.
                </p>
              )}
            </div>
          )}

          {editedInteraction.type !== "multiple-choice" && (
            <div className="space-y-2">
              <Label htmlFor="next-id" className="text-slate-300">
                Next ID
              </Label>
              <Select
                value={editedInteraction["next-id"] || "none"}
                onValueChange={(value) => handleChange("next-id", value === "none" ? "" : value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select next interaction" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="none">None</SelectItem>
                  {interactions
                    .filter((i) => i.id !== editedInteraction.id)
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Timeout section */}
          <div className="pt-2 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-400" />
                <Label htmlFor="timeout-toggle" className="text-slate-300">
                  Timeout Path
                </Label>
              </div>
              <Switch id="timeout-toggle" checked={hasTimeout} onCheckedChange={handleTimeoutToggle} />
            </div>

            {hasTimeout && (
              <div className="mt-2 space-y-2">
                <Label htmlFor="timeout-id" className="text-slate-300">
                  Timeout Next ID
                </Label>
                <Select
                  value={editedInteraction["timeout-id"] || "none"}
                  onValueChange={(value) => handleChange("timeout-id", value === "none" ? "" : value)}
                >
                  <SelectTrigger id="timeout-id" className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select timeout next interaction" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="none">None</SelectItem>
                    {interactions
                      .filter((i) => i.id !== editedInteraction.id)
                      .map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.id}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-red-400 italic">
                  This path will be taken if the user doesn't respond within the duration time.
                </p>
              </div>
            )}
          </div>

          {editedInteraction.type === "multiple-choice" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Choices</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddChoice}
                  className="h-8 border-indigo-600 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Choice
                </Button>
              </div>

              {editedInteraction.choices?.map((choice, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-md border-slate-700 bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-indigo-600">Choice {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveChoice(index)}
                      className="h-8 text-red-400 hover:text-red-300 hover:bg-slate-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`choice-type-${index}`} className="text-slate-300">
                      Type
                    </Label>
                    <Input
                      id={`choice-type-${index}`}
                      value={choice.type}
                      onChange={(e) => handleChoiceChange(index, "type", e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`choice-next-id-${index}`} className="text-slate-300">
                      Next ID
                    </Label>
                    <Select
                      value={choice["next-id"] || "none"}
                      onValueChange={(value) => handleChoiceChange(index, "next-id", value === "none" ? "" : value)}
                    >
                      <SelectTrigger
                        id={`choice-next-id-${index}`}
                        className="bg-slate-800 border-slate-700 text-white"
                      >
                        <SelectValue placeholder="Select next interaction" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="none">None</SelectItem>
                        {interactions
                          .filter((i) => i.id !== editedInteraction.id)
                          .map((i) => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.id}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
