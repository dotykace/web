"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"
import InteractiveEmoji, {EmojiParams} from "@/components/InteractiveEmoji";

export default function CustomSend({onClick, onFinish}) {
  const [state, setState] = useState<"default"|"gray"|"glow">("default")
  const [showEmojis, setShowEmojis] = useState(false)
  const [emojis, setEmojis] = useState<EmojiParams[]>([])
  const [clickedEmojis, setClickedEmojis] = useState<number[]>([])

  const emojiData = [
    { emoji: "😥", text: "Přečte si tu zprávu včas?" },
    { emoji: "🙏", text: "Odesláno, snad to vyjde..." },
    { emoji: "😳", text: "Snad si tu mou zprávu nevyloží špatně..." },
    { emoji: "😈", text: "A máš to! Co asi teď odpoví?" },
  ]

  const handleEmojiClick = (id: number) => {
    console.log(clickedEmojis, emojiData)
    if (!clickedEmojis.includes(id)) {
      setClickedEmojis((prev) => [...prev, id])
      console.log("Emoji clicked:", id)
      if (clickedEmojis.length + 1  === emojiData.length) {
        setState("glow")
      }
    }
  }

  const generateEmojiList = () => {
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
  }

  const handleSendClick = () => {

    switch (state) {
      case "gray":
        return
      case "glow":
        setShowEmojis(false)
        onFinish()
        return;
      case "default":
        setState("gray")
        generateEmojiList()
        setShowEmojis(true)
        onClick()
        break
    }
  }

  return (
    <div className="relative">
      {/* Send Button */}
      <button
        onClick={handleSendClick}
        className={"px-3 py-3 text-white rounded-full transition"+((state === "gray")? " bg-gray-500" :" bg-blue-600 hover:bg-blue-700 ")}>
        <Send/>
      </button>

      {/* Emoji Reactions */}
      <AnimatePresence>
        {showEmojis &&
          emojis.map((emoji, index) => (
            <div key={index}>
              <InteractiveEmoji emoji={emoji} clickCallback={handleEmojiClick}/>
            </div>
          ))}
      </AnimatePresence>
    </div>
  )
}
