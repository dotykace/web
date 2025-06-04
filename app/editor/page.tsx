"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, Save, Plus, Settings, Eye, Home } from "lucide-react"
import { ReactFlowProvider } from "reactflow"
import InteractionFlowEditor from "@/components/editor/interaction-flow-editor"
import InteractionEditor from "@/components/editor/interaction-editor"
import FlowPreview from "@/components/editor/flow-preview"
import type { InteractionFlow, Interaction } from "@/types/interaction-system"
import { useRouter } from "next/navigation"

// Import all chapter flows
import preludeFlow from "@/data/prelude-flow.json"
import chapter1Flow from "@/data/chapter1-flow.json"
import chapter2Flow from "@/data/chapter2-flow.json"
import chapter3Flow from "@/data/chapter3-flow.json"
import chapter4Flow from "@/data/chapter4-flow.json"

export default function EditorPage() {
  const router = useRouter()
  const [selectedFlow, setSelectedFlow] = useState<string>("prelude")
  const [currentFlow, setCurrentFlow] = useState<InteractionFlow | null>(null)
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null)
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  // Available flows
  const availableFlows = {
    prelude: preludeFlow,
    chapter1: chapter1Flow,
    chapter2: chapter2Flow,
    chapter3: chapter3Flow,
    chapter4: chapter4Flow,
  }

  // Transform raw JSON data to InteractionFlow
  const transformRawData = (rawData: any): InteractionFlow => {
    const transformedInteractions: Record<string, Interaction> = {}

    Object.entries(rawData.interactions).forEach(([key, value]: [string, any]) => {
      transformedInteractions[key] = {
        id: key,
        type: value.type,
        maxDuration: value.duration || value.maxDuration || 3000,
        nextId: value.nextId,
        timeoutId: value.timeoutId,
        text: value.text,
        choices: value.choices,
        emojis: value.emojis,
        checkpoint: value.checkpoint || false,
      }
    })

    return {
      id: rawData.id,
      name: rawData.name,
      description: rawData.description,
      version: rawData.version,
      startInteractionId: rawData.startInteractionId,
      interactions: transformedInteractions,
    }
  }

  // Load selected flow
  useEffect(() => {
    if (selectedFlow && availableFlows[selectedFlow as keyof typeof availableFlows]) {
      const rawFlow = availableFlows[selectedFlow as keyof typeof availableFlows]
      const transformedFlow = transformRawData(rawFlow)
      setCurrentFlow(transformedFlow)
      setSelectedInteraction(null)
      setHasUnsavedChanges(false)
    }
  }, [selectedFlow])

  // Handle interaction updates
  const handleInteractionUpdate = (updatedInteraction: Interaction) => {
    if (!currentFlow) return

    const updatedInteractions = {
      ...currentFlow.interactions,
      [updatedInteraction.id]: updatedInteraction,
    }

    setCurrentFlow({
      ...currentFlow,
      interactions: updatedInteractions,
    })
    setHasUnsavedChanges(true)

    toast({
      title: "Interakcia aktualizovaná",
      description: `Interakcia ${updatedInteraction.id} bola aktualizovaná.`,
    })
  }

  // Handle interaction creation
  const handleInteractionAdd = (newInteraction: Interaction) => {
    if (!currentFlow) return

    const updatedInteractions = {
      ...currentFlow.interactions,
      [newInteraction.id]: newInteraction,
    }

    setCurrentFlow({
      ...currentFlow,
      interactions: updatedInteractions,
    })
    setHasUnsavedChanges(true)

    toast({
      title: "Interakcia pridaná",
      description: `Nová interakcia ${newInteraction.id} bola pridaná.`,
    })
  }

  // Handle interaction deletion
  const handleInteractionDelete = (id: string) => {
    if (!currentFlow) return

    const updatedInteractions = { ...currentFlow.interactions }
    delete updatedInteractions[id]

    // Remove references to deleted interaction
    Object.values(updatedInteractions).forEach((interaction) => {
      if (interaction.nextId === id) {
        interaction.nextId = undefined
      }
      if (interaction.timeoutId === id) {
        interaction.timeoutId = undefined
      }
      if (interaction.choices) {
        interaction.choices.forEach((choice) => {
          if (choice.nextId === id) {
            choice.nextId = ""
          }
        })
      }
    })

    setCurrentFlow({
      ...currentFlow,
      interactions: updatedInteractions,
    })
    setSelectedInteraction(null)
    setHasUnsavedChanges(true)

    toast({
      title: "Interakcia odstránená",
      description: `Interakcia ${id} bola odstránená.`,
    })
  }

  // Handle interaction duplication
  const handleInteractionDuplicate = (interaction: Interaction) => {
    const newId = `${interaction.id}_copy_${Date.now()}`
    const duplicatedInteraction: Interaction = {
      ...interaction,
      id: newId,
    }

    handleInteractionAdd(duplicatedInteraction)
  }

  // Export flow
  const handleExport = () => {
    if (!currentFlow) return

    // Convert back to raw format
    const rawInteractions: Record<string, any> = {}
    Object.entries(currentFlow.interactions).forEach(([key, interaction]) => {
      const { id, maxDuration, ...rest } = interaction
      rawInteractions[key] = {
        ...rest,
        duration: maxDuration,
      }
    })

    const exportData = {
      id: currentFlow.id,
      name: currentFlow.name,
      description: currentFlow.description,
      version: currentFlow.version,
      startInteractionId: currentFlow.startInteractionId,
      interactions: rawInteractions,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = `${currentFlow.id}-flow.json`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)

    toast({
      title: "Export úspešný",
      description: `Flow ${currentFlow.name} bol exportovaný.`,
    })
  }

  // Import flow
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const rawData = JSON.parse(e.target?.result as string)
        const transformedFlow = transformRawData(rawData)
        setCurrentFlow(transformedFlow)
        setSelectedInteraction(null)
        setHasUnsavedChanges(true)

        toast({
          title: "Import úspešný",
          description: `Flow ${transformedFlow.name} bol importovaný.`,
        })
      } catch (error) {
        toast({
          title: "Import neúspešný",
          description: "Neplatný formát JSON súboru.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  // Save to localStorage
  const handleSave = () => {
    if (!currentFlow) return

    try {
      localStorage.setItem(`flow_${currentFlow.id}`, JSON.stringify(currentFlow))
      setHasUnsavedChanges(false)

      toast({
        title: "Flow uložený",
        description: `Flow ${currentFlow.name} bol uložený do localStorage.`,
      })
    } catch (error) {
      toast({
        title: "Uloženie neúspešné",
        description: "Nepodarilo sa uložiť flow do localStorage.",
        variant: "destructive",
      })
    }
  }

  // Create new interaction
  const handleCreateNewInteraction = () => {
    const newId = `interaction_${Date.now()}`
    const newInteraction: Interaction = {
      id: newId,
      type: "narrative-text",
      maxDuration: 3000,
      text: "Nová interakcia",
    }

    setSelectedInteraction(newInteraction)
  }

  if (!currentFlow) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-700 text-lg">Načítava editor...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/")}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <Home className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                    Interaction Flow Editor
                  </h1>
                  <p className="text-slate-600">Upravte a spravujte interaktívne toky</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {hasUnsavedChanges && (
                    <Badge variant="destructive" className="animate-pulse bg-red-100 text-red-700 border-red-200">
                      Neuložené zmeny
                    </Badge>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges}
                    className="border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Uložiť
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Sidebar */}
            <div className="col-span-3 space-y-4">
              {/* Flow Selection */}
              <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-800">Vybrať Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedFlow} onValueChange={setSelectedFlow}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                      <SelectValue placeholder="Vyberte flow" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="prelude" className="text-slate-800 hover:bg-slate-100">
                        Prelude
                      </SelectItem>
                      <SelectItem value="chapter1" className="text-slate-800 hover:bg-slate-100">
                        Kapitola 1
                      </SelectItem>
                      <SelectItem value="chapter2" className="text-slate-800 hover:bg-slate-100">
                        Kapitola 2
                      </SelectItem>
                      <SelectItem value="chapter3" className="text-slate-800 hover:bg-slate-100">
                        Kapitola 3
                      </SelectItem>
                      <SelectItem value="chapter4" className="text-slate-800 hover:bg-slate-100">
                        Kapitola 4
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("file-import")?.click()}
                        className="w-full border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importovať Flow
                    </Button>
                    <input id="file-import" type="file" accept=".json" onChange={handleImport} className="hidden" />

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="w-full border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportovať Flow
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Flow Info */}
              <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-800">Informácie o Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Názov</p>
                    <p className="text-slate-800 font-semibold">{currentFlow.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">ID</p>
                    <p className="text-slate-800 font-semibold">{currentFlow.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Verzia</p>
                    <p className="text-slate-800 font-semibold">{currentFlow.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Interakcie</p>
                    <p className="text-slate-800 font-semibold">{Object.keys(currentFlow.interactions).length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Štartovacia interakcia</p>
                    <p className="text-slate-800 font-semibold">{currentFlow.startInteractionId}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-800">Rýchle akcie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateNewInteraction}
                      className="w-full border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nová interakcia
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab(activeTab === "editor" ? "preview" : "editor")}
                      className="w-full border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  >
                    {activeTab === "editor" ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Náhľad Flow
                        </>
                    ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Upraviť Flow
                        </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Editor Area */}
            <div className="col-span-6">
              <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-slate-800">
                      {activeTab === "editor" ? "Flow Editor" : "Náhľad Flow"}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button
                          variant={activeTab === "editor" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab("editor")}
                          className={
                            activeTab === "editor"
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                : "border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          }
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Editor
                      </Button>
                      <Button
                          variant={activeTab === "preview" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab("preview")}
                          className={
                            activeTab === "preview"
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                : "border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Náhľad
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-80px)] p-0">
                  <AnimatePresence mode="wait">
                    {activeTab === "editor" ? (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                          <ReactFlowProvider>
                            <InteractionFlowEditor
                                flow={currentFlow}
                                selectedInteraction={selectedInteraction}
                                onSelectInteraction={setSelectedInteraction}
                                onInteractionUpdate={handleInteractionUpdate}
                                onInteractionAdd={handleInteractionAdd}
                                onInteractionDelete={handleInteractionDelete}
                                onInteractionDuplicate={handleInteractionDuplicate}
                            />
                          </ReactFlowProvider>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                          <FlowPreview flow={currentFlow} />
                        </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>

            {/* Properties Panel */}
            <div className="col-span-3">
              <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-800">
                    {selectedInteraction ? "Upraviť interakciu" : "Vlastnosti"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
                  <InteractionEditor
                      interaction={selectedInteraction}
                      flow={currentFlow}
                      onUpdate={handleInteractionUpdate}
                      onAdd={handleInteractionAdd}
                      onDelete={handleInteractionDelete}
                      onDuplicate={handleInteractionDuplicate}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  )
}
