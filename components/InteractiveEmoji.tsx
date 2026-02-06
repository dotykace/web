import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

export interface EmojiParams {
  id: number
  emoji: string
  text: string
  position: { x: number; y: number }
}
export default function InteractiveEmoji({ emoji, clickCallback }) {
  const [clicked, setClicked] = useState(false)
  const [showText, setShowText] = useState(false)

  const handleEmojiClick = (id: number) => {
    if (!clicked) {
      setClicked(true)
      clickCallback(id)
    }
    setShowText(true)
    // Auto-hide text after 3 seconds
    setTimeout(() => {
      setShowText(false)
    }, 3000)
  }

  return (
    <div>
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
          delay: emoji.id * 0.1,
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
            {!clicked && (
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
            {showText && (
              <motion.div
                initial={{ opacity: 0, x: 0, scale: 0.8 }}
                animate={{ opacity: 1, x: -160, y: -20, scale: 1 }}
                exit={{ opacity: 0, x: 0, scale: 0.8 }}
                className="absolute transform whitespace-nowrap z-50"
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
    </div>
  )
}
