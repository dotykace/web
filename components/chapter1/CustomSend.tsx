"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"
import InteractiveEmoji, {EmojiParams} from "@/components/InteractiveEmoji";

export default function CustomSend({onClick, isGlowing}) {
  const handleSendClick = () => {
    if (isGlowing()){
      onClick && onClick()
    }
  }

  return (
    <div className="relative">
      {/* Send Button */}
      <button
        onClick={handleSendClick}
        className={"px-3 py-3 text-white rounded-full transition bg-blue-600 hover:bg-blue-700"+(isGlowing()?" ring-2 ring-blue-400":"")}>
        <Send/>
      </button>
    </div>
  )
}
