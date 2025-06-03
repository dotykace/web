"use client"

import { useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeTypes,
  useEdgesState,
  useNodesState,
  MiniMap,
  Panel,
  useReactFlow,
} from "reactflow"
import "reactflow/dist/style.css"
import type { Interaction } from "@/interactions"
import InteractionNode from "./interaction-node"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"
import dagre from "dagre"

interface InteractionFlowProps {
  interactions: Interaction[]
  onSelectInteraction: (interaction: Interaction) => void
  selectedInteractionId?: string
}

const nodeTypes: NodeTypes = {
  interaction: InteractionNode,
}

// This helper function uses dagre to create a nice layout
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: direction })

  // Set node dimensions
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 80 })
  })

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Calculate the layout
  dagre.layout(dagreGraph)

  // Apply the layout to the nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90, // Center the node
        y: nodeWithPosition.y - 40,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

export default function InteractionFlow({
  interactions,
  onSelectInteraction,
  selectedInteractionId,
}: InteractionFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const reactFlowInstance = useReactFlow()

  // Create nodes and edges from interactions
  useEffect(() => {
    if (!interactions.length) return

    const newNodes: Node[] = []
    const newEdges: Edge[] = []

    // First pass: create nodes
    interactions.forEach((interaction) => {
      newNodes.push({
        id: interaction.id,
        type: "interaction",
        position: { x: 0, y: 0 }, // Will be calculated by dagre
        data: {
          interaction,
          isSelected: interaction.id === selectedInteractionId,
          onClick: () => onSelectInteraction(interaction),
        },
      })
    })

    // Second pass: create edges
    interactions.forEach((interaction) => {
      if (interaction["nextId"]) {
        newEdges.push({
          id: `${interaction.id}-${interaction["nextId"]}`,
          source: interaction.id,
          target: interaction["nextId"],
          animated: true,
          style: { stroke: "#6366f1" },
        })
      }

      // Add timeout edges if they exist
      if (interaction["timeout-id"]) {
        newEdges.push({
          id: `${interaction.id}-timeout-${interaction["timeout-id"]}`,
          source: interaction.id,
          target: interaction["timeout-id"],
          animated: true,
          style: { stroke: "#ef4444", strokeDasharray: "5,5" },
          label: "Timeout",
          labelStyle: { fill: "#ef4444", fontWeight: 500 },
          labelBgStyle: { fill: "rgba(239, 68, 68, 0.1)", fillOpacity: 0.7 },
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
        })
      }

      // Add edges for multiple choice options
      if (interaction.type === "multiple-choice" && interaction.choices) {
        interaction.choices.forEach((choice, index) => {
          if (choice["nextId"]) {
            newEdges.push({
              id: `${interaction.id}-${choice["nextId"]}-${index}`,
              source: interaction.id,
              target: choice["nextId"],
              animated: true,
              label: choice.type,
              labelStyle: { fill: "#f3f4f6", fontWeight: 500 },
              labelBgStyle: { fill: "rgba(99, 102, 241, 0.7)", fillOpacity: 0.7 },
              labelBgPadding: [8, 4],
              labelBgBorderRadius: 4,
              style: { stroke: getChoiceColor(index) },
            })
          }
        })
      }
    })

    // Apply layout
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: "TB" })

    // Set node dimensions
    newNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 180, height: 80 })
    })

    // Add edges to the graph
    newEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    // Calculate the layout
    dagre.layout(dagreGraph)

    // Apply the layout to the nodes
    const layoutedNodes = newNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 90, // Center the node
          y: nodeWithPosition.y - 40,
        },
      }
    })

    setNodes(layoutedNodes)
    setEdges(newEdges)

    // Use a timeout to ensure the nodes are rendered before fitting the view
    const timer = setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [interactions, selectedInteractionId, onSelectInteraction, setNodes, setEdges, reactFlowInstance])

  const zoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn()
    }
  }

  const zoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut()
    }
  }

  const fitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 })
    }
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { strokeWidth: 2 },
        }}
      >
        <Background color="#475569" gap={16} size={1} />
        <Controls className="bg-slate-700 border-slate-600 rounded-md" />
        <MiniMap
          nodeColor={(node) => getNodeColor(node.data.interaction.type)}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="bg-slate-800 border-slate-700 rounded-md"
        />
        <Panel position="top-right" className="flex gap-2">
          <Button onClick={zoomIn} variant="secondary" size="icon" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={zoomOut} variant="secondary" size="icon" className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={fitView} variant="secondary" size="icon" className="h-8 w-8">
            <Maximize className="h-4 w-4" />
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  )
}

function getNodeColor(type: string) {
  switch (type) {
    case "message":
      return "#3b82f6" // blue
    case "input":
      return "#10b981" // emerald
    case "multiple-choice":
      return "#8b5cf6" // violet
    case "animation":
      return "#f59e0b" // amber
    case "notification":
      return "#ec4899" // pink
    default:
      return "#6b7280" // gray
  }
}

function getChoiceColor(index: number) {
  const colors = [
    "#6366f1", // indigo
    "#ec4899", // pink
    "#f59e0b", // amber
    "#06b6d4", // cyan
    "#84cc16", // lime
  ]
  return colors[index % colors.length]
}
