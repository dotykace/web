"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"

interface EmojiReaction {
  id: number
  emoji: string
  text: string
  clicked: boolean
  position: { x: number; y: number }
}

export default function CustomSend() {
  const [showEmojis, setShowEmojis] = useState(false)
  const [emojis, setEmojis] = useState<EmojiReaction[]>([])

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
        clicked: false,
        position: { x, y },
      }
    })

    setEmojis(newEmojis)
    setShowEmojis(true)
  }

  const handleEmojiClick = (id: number) => {
    setEmojis((prev) => prev.map((emoji) => (emoji.id === id ? { ...emoji, clicked: true } : emoji)))

    // Auto-hide text after 3 seconds
    setTimeout(() => {
      setEmojis((prev) => prev.map((emoji) => (emoji.id === id ? { ...emoji, clicked: false } : emoji)))
    }, 3000)
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
            <motion.div
              key={emoji.id}
              initial={{
                scale: 0,
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                x: emoji.position.x,
                y: emoji.position.y,
                opacity: 1,
              }}
              exit={{
                scale: 0,
                opacity: 0,
                transition: { duration: 0.2 },
              }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                {/* Emoji Button */}
                <motion.button
                  onClick={() => handleEmojiClick(emoji.id)}
                  className={`
                      relative text-3xl p-3 rounded-full bg-white shadow-lg
                      transition-all duration-300 hover:scale-110
                    `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Glow effect for unclicked emojis */}
                  {!emoji.clicked && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-yellow-400 opacity-10 blur-sm"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                  <span className="relative z-10">{emoji.emoji}</span>
                </motion.button>

                {/* Text that appears after click */}
                <AnimatePresence>
                  {emoji.clicked && (
                    <motion.div
                      initial={{ opacity: 0, x: 0, scale: 0.8 }}
                      animate={{ opacity: 1, x: -60, scale: 1 }}
                      exit={{ opacity: 0, x:0, scale: 0.8 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap"
                    >
                      <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm">
                        <em>{emoji.text}</em>
                      </div>
                      {/* Speech bubble arrow */}
                      <div className="absolute left-full -ml-0.5 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-black/80" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}
