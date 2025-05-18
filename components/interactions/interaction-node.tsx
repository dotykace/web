"use client"

import { memo } from "react"
import { Handle, Position } from "reactflow"
import type { Interaction } from "@/types/interactions"
import { MessageSquare, MessageSquareText, List, HelpCircle, Play, Bell, Clock } from "lucide-react"

interface InteractionNodeProps {
  data: {
    interaction: Interaction
    isSelected: boolean
    onClick: () => void
  }
}

function getNodeIcon(type: string) {
  switch (type) {
    case "message":
      return <MessageSquare className="w-5 h-5" />
    case "input":
      return <MessageSquareText className="w-5 h-5" />
    case "multiple-choice":
      return <List className="w-5 h-5" />
    case "animation":
      return <Play className="w-5 h-5" />
    case "notification":
      return <Bell className="w-5 h-5" />
    default:
      return <HelpCircle className="w-5 h-5" />
  }
}

function getNodeColor(type: string) {
  switch (type) {
    case "message":
      return "from-blue-500 to-blue-600 border-blue-400"
    case "input":
      return "from-emerald-500 to-emerald-600 border-emerald-400"
    case "multiple-choice":
      return "from-violet-500 to-violet-600 border-violet-400"
    case "animation":
      return "from-amber-500 to-amber-600 border-amber-400"
    case "notification":
      return "from-pink-500 to-pink-600 border-pink-400"
    default:
      return "from-gray-500 to-gray-600 border-gray-400"
  }
}

function InteractionNode({ data }: InteractionNodeProps) {
  const { interaction, isSelected, onClick } = data
  const colorClasses = getNodeColor(interaction.type)

  // Truncate text for display in the node
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <div
      className={`px-4 py-3 rounded-lg shadow-lg w-[180px] transition-all duration-200 
        bg-gradient-to-br ${colorClasses} 
        ${isSelected ? "ring-2 ring-white scale-105" : "opacity-90 hover:opacity-100 hover:scale-102"}
        border border-opacity-30`}
      onClick={onClick}
    >
      <Handle type="target" position={Position.Top} className="!bg-white !border-0 !w-3 !h-3" />

      <div className="flex items-center gap-2 font-medium text-white">
        {getNodeIcon(interaction.type)}
        <span className="truncate">{interaction.id}</span>
      </div>

      {interaction.text && (
        <div className="text-xs text-white text-opacity-90 mt-1 line-clamp-2 overflow-hidden">
          {truncateText(interaction.text, 50)}
        </div>
      )}

      <div className="text-xs text-white text-opacity-80 mt-1">Type: {interaction.type}</div>

      <div className="text-xs text-white text-opacity-80">Duration: {interaction.duration}s</div>

      {interaction["next-id"] && (
        <div className="text-xs text-white text-opacity-80">Next: {interaction["next-id"]}</div>
      )}

      {interaction["timeout-id"] && (
        <div className="flex items-center gap-1 text-xs text-red-300 mt-1">
          <Clock className="w-3 h-3" />
          <span>Timeout: {interaction["timeout-id"]}</span>
        </div>
      )}

      {interaction.type === "input" && interaction.answer !== undefined && (
        <div className="text-xs text-white text-opacity-80 mt-1">
          Answer: {interaction.answer ? truncateText(interaction.answer, 20) : "(empty)"}
        </div>
      )}

      {interaction.type === "multiple-choice" && interaction.choices && (
        <div className="text-xs text-white text-opacity-80 mt-1">Choices: {interaction.choices.length}</div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-white !border-0 !w-3 !h-3" />
    </div>
  )
}

export default memo(InteractionNode)
