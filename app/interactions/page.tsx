"use client"

import { useState, useEffect } from "react"
import InteractionFlow from "@/components/interactions/interaction-flow"
import InteractionEditor from "@/components/interactions/interaction-editor"
import type { Interaction, InteractionsData, RawInteraction } from "@/interactions"
import initialData from "@/data/interactions.json"
import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ReactFlowProvider } from "reactflow"

export default function Home() {
  // FIXED: Convert object format to array format for easier processing
  // Old format was array, new format is object with keys as IDs
  const initialInteractions = Object.entries((initialData as InteractionsData).interactions).map(
      ([id, interaction]) => ({
        id,
        ...interaction,
      }),
  ) as Interaction[]

  const [interactions, setInteractions] = useState<Interaction[]>(initialInteractions)
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null)
  const { toast } = useToast()

  // Auto-save to localStorage whenever interactions change
  useEffect(() => {
    try {
      // FIXED: Convert back to object format when saving
      const interactionsObject: Record<string, RawInteraction> = interactions.reduce(
          (acc, interaction) => {
            const { id, ...interactionData } = interaction
            acc[id] = interactionData as RawInteraction
            return acc
          },
          {} as Record<string, RawInteraction>,
      )

      localStorage.setItem("interactions", JSON.stringify({ interactions: interactionsObject }))
      console.log("Auto-saved interactions to localStorage")
    } catch (error) {
      console.error("Failed to auto-save interactions:", error)
    }
  }, [interactions])

  // Load from localStorage on initial load if available
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("interactions")
      if (savedData) {
        const parsedData = JSON.parse(savedData) as InteractionsData
        // FIXED: Convert object format to array format
        const interactionsArray = Object.entries(parsedData.interactions).map(([id, interaction]) => ({
          id,
          ...interaction,
        })) as Interaction[]
        setInteractions(interactionsArray)
        console.log("Loaded interactions from localStorage")
      }
    } catch (error) {
      console.error("Failed to load interactions from localStorage:", error)
    }
  }, [])

  const handleInteractionUpdate = (updatedInteraction: Interaction) => {
    setInteractions(
        interactions.map((interaction) => (interaction.id === updatedInteraction.id ? updatedInteraction : interaction)),
    )
    toast({
      title: "Interaction updated",
      description: `Interaction ${updatedInteraction.id} has been updated.`,
    })
  }

  const handleInteractionAdd = (newInteraction: Interaction) => {
    setInteractions([...interactions, newInteraction])
    toast({
      title: "Interaction added",
      description: `New interaction ${newInteraction.id} has been added.`,
    })
  }

  const handleInteractionDelete = (id: string) => {
    setInteractions(interactions.filter((interaction) => interaction.id !== id))
    setSelectedInteraction(null)
    toast({
      title: "Interaction deleted",
      description: `Interaction ${id} has been deleted.`,
    })
  }

  const exportData = () => {
    // FIXED: Convert back to object format when exporting
    const interactionsObject: Record<string, RawInteraction> = interactions.reduce(
        (acc, interaction) => {
          const { id, ...interactionData } = interaction
          acc[id] = interactionData as RawInteraction
          return acc
        },
        {} as Record<string, RawInteraction>,
    )

    const dataStr = JSON.stringify({ interactions: interactionsObject }, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })

    // Create a download link and trigger it
    const downloadLink = document.createElement("a")
    const url = URL.createObjectURL(blob)

    downloadLink.href = url
    downloadLink.download = "interactions.json"
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    // Clean up the URL object
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)

    toast({
      title: "Export successful",
      description: "Your interactions have been exported as JSON.",
    })
  }

  const addNewInteraction = () => {
    setSelectedInteraction({
      id: `new_${Date.now()}`,
      type: "message",
      maxDuration: 5,
      text: "",
    })
  }

  return (
      <main className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="flex-1 h-full relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button onClick={exportData} variant="secondary" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={addNewInteraction} variant="secondary" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
          <ReactFlowProvider>
            <InteractionFlow
                interactions={interactions}
                onSelectInteraction={setSelectedInteraction}
                selectedInteractionId={selectedInteraction?.id}
            />
          </ReactFlowProvider>
        </div>
        <div className="w-96 border-l border-slate-700 overflow-y-auto bg-slate-800">
          <InteractionEditor
              interaction={selectedInteraction}
              interactions={interactions}
              onUpdate={handleInteractionUpdate}
              onAdd={handleInteractionAdd}
              onDelete={handleInteractionDelete}
          />
        </div>
      </main>
  )
}
