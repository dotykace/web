"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"
import InteractiveEmoji, {EmojiParams} from "@/components/InteractiveEmoji";

export default function CustomSend() {
  const [showEmojis, setShowEmojis] = useState(false)
  const [emojis, setEmojis] = useState<EmojiParams[]>([])

  const emojiData = [
    { emoji: "❤️", text: "Love it!" },
    { emoji: "😂", text: "So funny!" },
    { emoji: "👍", text: "Great job!" },
    { emoji: "🔥", text: "Amazing!" },
  ]

  const handleSendClick = () => {

    // Calculate positions in left hemisphere (semicircle)
    const radius = 120
    const angleStep = Math.PI / (emojiData.length + 1)

    const newEmojis = emojiData.map((data, index) => {
      const angle = Math.PI/2 + angleStep * (index + 1) // Left hemisphere angles
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      return {
        id: index,
        emoji: data.emoji,
        text: data.text,
        position: { x, y },
      }
    })
    setEmojis(newEmojis)
    setShowEmojis(true)
  }

  return (
    <div className="relative">
      {/* Send Button */}
      <button
        onClick={handleSendClick}
        className="px-3 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
        <Send/>
      </button>

      {/* Emoji Reactions */}
      <AnimatePresence>
        {showEmojis &&
          emojis.map((emoji, index) => (
            <div key={index}>
              <InteractiveEmoji {...emoji}/>
            </div>
          ))}
      </AnimatePresence>
    </div>
  )
}
