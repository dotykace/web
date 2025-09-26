"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"
import InteractiveEmoji, {EmojiParams} from "@/components/InteractiveEmoji";

export default function CustomSend({onClick, onFinish}) {
  const [state, setState] = useState<"default"|"gray"|"glow">("default")

  const handleSendClick = () => {

    switch (state) {
      case "gray":
        return
      case "glow":
        onFinish()
        return;
      case "default":
        setState("gray")
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
    </div>
  )
}
