"use client"

import { useState } from "react"
import {AnimatePresence, motion} from "framer-motion"
import {Pause, Play} from "lucide-react"
import {useSharedAudio} from "@/context/AudioContext";

export default function CustomPlay({onClick}) {
  const [showLogos, setShowLogos] = useState(false)
  const [logos, setLogos] = useState<>([])

  const logoData = [
    "Facebook",
    "Instagram",
    "TikTok",
    "YouTube",
  ]

  const generateLogoList = () => {
    const radius = 110
    const angleStep = Math.PI / (logoData.length + 1)

    const newEmojis = logoData.map((data, index) => {
      const angle = Math.PI + angleStep * (index + 1) // Left hemisphere angles
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      return {
        id: index,
        text: data,
        position: { x, y },
      }
    })
    setLogos(newEmojis)
  }

  const {play, stop} = useSharedAudio()

  const handleClick = () =>{
    generateLogoList()
    if (!showLogos) {
      if (onClick) {
        play("chaos").then(()=> {
          stop("loop")
          onClick()
        })
      }
    }
    setShowLogos(prevState => !prevState)
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white/50 text-black shadow-lg"
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
                    opacity: 0,
                    transition: { duration: 0.2 },
                    x: 0,
                    y: 0,
                  }}
                  transition={{
                    delay: Math.random() * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 10 * Math.random() +10,
                  }}
                  className="absolute top-0 left-0 "
                >
                  <img src={"/logos/" + emoji.text +"_logo.svg"} alt={"My Icon "+emoji.text} className="w-20 h-20" />
                </motion.div>
              </div>
            </div>
          ))}
      </AnimatePresence>
    </div>
  )
}
