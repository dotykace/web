"use client"

import { useState } from "react"
import {AnimatePresence, motion} from "framer-motion"
import {Pause, Play} from "lucide-react"
import InteractiveEmoji from "@/components/InteractiveEmoji";

export default function CustomPlay({onClick, onFinish}) {
  const [showLogos, setShowLogos] = useState(false)
  const [logos, setLogos] = useState<>([])

  const logoData = [
    { emoji: "😥", text: "Přečte si tu zprávu včas?" },
    { emoji: "🙏", text: "Odesláno, snad to vyjde..." },
    { emoji: "😳", text: "Snad si tu mou zprávu nevyloží špatně..." },
    { emoji: "😈", text: "A máš to! Co asi teď odpoví?" },
  ]

  const generateLogoList = () => {
    const radius = 120
    const angleStep = Math.PI / (logoData.length + 1)

    const newEmojis = logoData.map((data, index) => {
      const angle = Math.PI + angleStep * (index + 1) // Left hemisphere angles
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      return {
        id: index,
        emoji: data.emoji,
        text: data.text,
        position: { x, y },
      }
    })
    setLogos(newEmojis)
  }

  const handleClick = () =>{
    generateLogoList()
    setShowLogos(prevState => !prevState)
    if (!showLogos) {
      if (onClick) {
        onClick()
      }
    }
    else {
      if (onFinish) {
        onFinish()
      }
    }

  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-white/40 text-black hover:bg-green-600 transition-colors shadow-lg"
        aria-label="Play or Pause"
      >
        {showLogos ? <Pause size={24} /> : <Play size={24} />}
      </button>

      <AnimatePresence>
        {showLogos &&
          logos.map((emoji, index) => (
            <div key={index}>
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
                    delay: Math.random() * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 10 * Math.random() +10,
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    {/* Emoji Button */}
                    <motion.button
                      className={`
                      relative text-3xl p-3 rounded-full bg-white shadow-lg
                      transition-all duration-300 hover:scale-110
                    `}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10">{emoji.emoji}</span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
      </AnimatePresence>
    </div>
  )
}
