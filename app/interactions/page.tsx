"use client"

import { useState, useEffect } from "react"
import InteractionFlow from "@/components/interactions/interaction-flow"
import InteractionEditor from "@/components/interactions/interaction-editor"
import type { Interaction } from "@/interactions"
import initialData from "@/data/interactions.json"
import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ReactFlowProvider } from "reactflow"

export default function Home() {
  const [interactions, setInteractions] = useState<Interaction[]>(initialData.interactions)
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null)
  const { toast } = useToast()

  // Auto-save to localStorage whenever interactions change
  useEffect(() => {
    try {
      localStorage.setItem("interactions", JSON.stringify({ interactions }))
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
        const parsedData = JSON.parse(savedData)
        setInteractions(parsedData.interactions)
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
    const dataStr = JSON.stringify({ interactions }, null, 2)
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
      duration: 5,
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
