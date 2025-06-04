"use client"

import type React from "react"
import { useCallback, useEffect } from "react"
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  Handle,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import type { InteractionFlow, Interaction } from "@/types/interaction-system"
import { Badge } from "@/components/ui/badge"

// Custom node component with better contrast and visibility
const InteractionNode = ({ data, selected }: { data: Interaction; selected: boolean }) => {
  const getNodeColor = (type: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      "narrative-text": {
        bg: "bg-blue-50",
        border: "border-blue-300",
        text: "text-blue-900",
        badge: "bg-blue-100 text-blue-800 border-blue-200",
      },
      "title-card": {
        bg: "bg-purple-50",
        border: "border-purple-300",
        text: "text-purple-900",
        badge: "bg-purple-100 text-purple-800 border-purple-200",
      },
      input: {
        bg: "bg-green-50",
        border: "border-green-300",
        text: "text-green-900",
        badge: "bg-green-100 text-green-800 border-green-200",
      },
      "text-input": {
        bg: "bg-green-50",
        border: "border-green-300",
        text: "text-green-900",
        badge: "bg-green-100 text-green-800 border-green-200",
      },
      "multiple-choice": {
        bg: "bg-yellow-50",
        border: "border-yellow-300",
        text: "text-yellow-900",
        badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      "binary-choice": {
        bg: "bg-orange-50",
        border: "border-orange-300",
        text: "text-orange-900",
        badge: "bg-orange-100 text-orange-800 border-orange-200",
      },
      "chat-message-bot": {
        bg: "bg-cyan-50",
        border: "border-cyan-300",
        text: "text-cyan-900",
        badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
      },
      "chat-input": {
        bg: "bg-teal-50",
        border: "border-teal-300",
        text: "text-teal-900",
        badge: "bg-teal-100 text-teal-800 border-teal-200",
      },
      notification: {
        bg: "bg-red-50",
        border: "border-red-300",
        text: "text-red-900",
        badge: "bg-red-100 text-red-800 border-red-200",
      },
      "chapter-complete": {
        bg: "bg-emerald-50",
        border: "border-emerald-300",
        text: "text-emerald-900",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      },
      "audio-visualization": {
        bg: "bg-indigo-50",
        border: "border-indigo-300",
        text: "text-indigo-900",
        badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
      },
      "video-intro": {
        bg: "bg-pink-50",
        border: "border-pink-300",
        text: "text-pink-900",
        badge: "bg-pink-100 text-pink-800 border-pink-200",
      },
      "video-player": {
        bg: "bg-rose-50",
        border: "border-rose-300",
        text: "text-rose-900",
        badge: "bg-rose-100 text-rose-800 border-rose-200",
      },
    }
    return (
        colors[type] || {
          bg: "bg-slate-50",
          border: "border-slate-300",
          text: "text-slate-900",
          badge: "bg-slate-100 text-slate-800 border-slate-200",
        }
    )
  }

  const nodeStyle = getNodeColor(data.type)
  const isSelected = selected

  return (
      <div
          className={`
        ${nodeStyle.bg} ${nodeStyle.border} ${nodeStyle.text}
        border-2 rounded-xl p-4 min-w-[220px] max-w-[280px] shadow-lg backdrop-blur-sm
        ${isSelected ? "ring-2 ring-indigo-400 ring-opacity-60 shadow-xl" : "shadow-md"}
        transition-all duration-200 hover:shadow-xl
      `}
      >
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400 border-2 border-slate-600" />

        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm truncate flex-1">{data.id}</div>
            {data.checkpoint && <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">CP</Badge>}
          </div>

          {/* Type */}
          <Badge variant="outline" className={`text-xs ${nodeStyle.badge}`}>
            {data.type}
          </Badge>

          {/* Text content */}
          {data.text && (
              <div className="text-xs leading-relaxed opacity-90 line-clamp-3 font-medium">
                {data.text.length > 80 ? `${data.text.substring(0, 80)}...` : data.text}
              </div>
          )}

          {/* Choices indicator */}
          {data.choices && data.choices.length > 0 && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">{data.choices.length} volieb</Badge>
          )}

          {/* Duration */}
          <div className="text-xs opacity-70 font-medium">{(data.maxDuration / 1000).toFixed(1)}s</div>
        </div>

        {/* Output handles */}
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400 border-2 border-slate-600" />
        {data.choices && data.choices.length > 1 && (
            <>
              <Handle
                  type="source"
                  position={Position.Right}
                  id="choice-1"
                  className="w-3 h-3 bg-blue-500 border-2 border-blue-700"
              />
              {data.choices.length > 2 && (
                  <Handle
                      type="source"
                      position={Position.Left}
                      id="choice-2"
                      className="w-3 h-3 bg-blue-500 border-2 border-blue-700"
                  />
              )}
            </>
        )}
        {data.timeoutId && (
            <Handle
                type="source"
                position={Position.Right}
                id="timeout"
                className="w-3 h-3 bg-red-500 border-2 border-red-700"
            />
        )}
      </div>
  )
}

const nodeTypes = {
  interaction: InteractionNode,
}

const defaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: "#64748b",
  },
  style: {
    stroke: "#64748b",
    strokeWidth: 2,
  },
}

interface InteractionFlowEditorProps {
  flow: InteractionFlow
  selectedInteraction: Interaction | null
  onSelectInteraction: (interaction: Interaction | null) => void
  onInteractionUpdate: (interaction: Interaction) => void
  onInteractionAdd: (interaction: Interaction) => void
  onInteractionDelete: (id: string) => void
  onInteractionDuplicate: (interaction: Interaction) => void
}

export default function InteractionFlowEditor({
                                                flow,
                                                selectedInteraction,
                                                onSelectInteraction,
                                                onInteractionUpdate,
                                                onInteractionAdd,
                                                onInteractionDelete,
                                                onInteractionDuplicate,
                                              }: InteractionFlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView } = useReactFlow()

  // Create nodes and edges from flow with better layout
  useEffect(() => {
    if (!flow) return

    const newNodes: Node[] = []
    const newEdges: Edge[] = []

    // Create a more intelligent layout
    const interactions = Object.values(flow.interactions)
    const startInteraction = flow.interactions[flow.startInteractionId]

    // Build a tree structure starting from the start interaction
    const visited = new Set<string>()
    const positions = new Map<string, { x: number; y: number }>()

    const layoutNodes = (interaction: Interaction, x: number, y: number, level: number) => {
      const depth = 0
      if (depth > 10 || visited.has(interaction.id)) return
      visited.add(interaction.id)

      positions.set(interaction.id, { x, y })

      let childIndex = 0
      const childSpacing = 300
      const levelSpacing = 200

      // Layout next interaction
      if (interaction.nextId && flow.interactions[interaction.nextId] && !visited.has(interaction.nextId)) {
        layoutNodes(flow.interactions[interaction.nextId], x, y + levelSpacing, level + 1)
      }

      // Layout timeout interaction
      if (interaction.timeoutId && flow.interactions[interaction.timeoutId] && !visited.has(interaction.timeoutId)) {
        layoutNodes(flow.interactions[interaction.timeoutId], x + childSpacing, y + levelSpacing, level + 1)
        childIndex++
      }

      // Layout choice interactions
      if (interaction.choices) {
        interaction.choices.forEach((choice, index) => {
          if (choice.nextId && flow.interactions[choice.nextId] && !visited.has(choice.nextId)) {
            const offsetX = (index - (interaction.choices!.length - 1) / 2) * childSpacing
            layoutNodes(flow.interactions[choice.nextId], x + offsetX, y + levelSpacing, level + 1)
          }
        })
      }
    }

    // Start layout from the start interaction
    if (startInteraction) {
      layoutNodes(startInteraction, 0, 0, 0)
    }

    // Layout remaining unvisited interactions
    interactions.forEach((interaction, index) => {
      if (!positions.has(interaction.id)) {
        const row = Math.floor(index / 4)
        const col = index % 4
        positions.set(interaction.id, { x: col * 300 + 1000, y: row * 200 })
      }
    })

    // Create nodes
    interactions.forEach((interaction) => {
      const position = positions.get(interaction.id) || { x: 0, y: 0 }
      const node: Node = {
        id: interaction.id,
        type: "interaction",
        position,
        data: interaction,
        selected: selectedInteraction?.id === interaction.id,
      }
      newNodes.push(node)
    })

    // Create edges with better styling
    interactions.forEach((interaction) => {
      // Main next edge
      if (interaction.nextId && flow.interactions[interaction.nextId]) {
        const edge: Edge = {
          id: `${interaction.id}-${interaction.nextId}`,
          source: interaction.id,
          target: interaction.nextId,
          label: "next",
          labelStyle: {
            fontSize: 12,
            fill: "#1e293b",
            fontWeight: "600",
            background: "white",
            padding: "2px 6px",
            borderRadius: "4px",
          },
          style: { stroke: "#3b82f6", strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: "#3b82f6" },
        }
        newEdges.push(edge)
      }

      // Timeout edge
      if (interaction.timeoutId && flow.interactions[interaction.timeoutId]) {
        const edge: Edge = {
          id: `${interaction.id}-${interaction.timeoutId}-timeout`,
          source: interaction.id,
          target: interaction.timeoutId,
          sourceHandle: "timeout",
          label: "timeout",
          labelStyle: {
            fontSize: 12,
            fill: "#dc2626",
            fontWeight: "600",
            background: "white",
            padding: "2px 6px",
            borderRadius: "4px",
          },
          style: { stroke: "#ef4444", strokeWidth: 2, strokeDasharray: "8,4" },
          markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: "#ef4444" },
        }
        newEdges.push(edge)
      }

      // Choice edges
      if (interaction.choices) {
        interaction.choices.forEach((choice, index) => {
          if (choice.nextId && flow.interactions[choice.nextId]) {
            const colors = ["#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316"]
            const color = colors[index % colors.length]

            const edge: Edge = {
              id: `${interaction.id}-${choice.nextId}-choice-${index}`,
              source: interaction.id,
              target: choice.nextId,
              sourceHandle: index === 0 ? "choice-1" : index === 1 ? "choice-2" : undefined,
              label: choice.type.length > 15 ? `${choice.type.substring(0, 15)}...` : choice.type,
              labelStyle: {
                fontSize: 11,
                fill: "#1e293b",
                fontWeight: "600",
                background: "white",
                padding: "2px 6px",
                borderRadius: "4px",
              },
              style: { stroke: color, strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color },
            }
            newEdges.push(edge)
          }
        })
      }
    })

    setNodes(newNodes)
    setEdges(newEdges)

    // Fit view after a short delay
    setTimeout(() => {
      fitView({ padding: 0.1, duration: 800 })
    }, 100)
  }, [flow, setNodes, setEdges, fitView, selectedInteraction])

  const onConnect = useCallback(
      (params: Connection) => {
        setEdges((eds) => addEdge(params, eds))
      },
      [setEdges],
  )

  const onNodeClick = useCallback(
      (event: React.MouseEvent, node: Node) => {
        const interaction = flow.interactions[node.id]
        if (interaction) {
          onSelectInteraction(interaction)
        }
      },
      [flow.interactions, onSelectInteraction],
  )

  const onPaneClick = useCallback(() => {
    onSelectInteraction(null)
  }, [onSelectInteraction])

  return (
      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            className="bg-gradient-to-br from-slate-50 to-blue-50"
            minZoom={0.1}
            maxZoom={2}
        >
          <Controls className="bg-white/90 border-slate-200 backdrop-blur-sm [&>button]:bg-white [&>button]:border-slate-200 [&>button]:text-slate-700 [&>button:hover]:bg-slate-50" />
          <Background color="#cbd5e1" gap={20} size={1} className="opacity-30" />
        </ReactFlow>
      </div>
  )
}
