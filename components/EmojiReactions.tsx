"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRightIcon } from "lucide-react"
import EmojiList from "@/components/EmojiList"
import UserInput from "./UserInput"

export default function EmojiReactionButton({
  onSelect,
}: {
  onSelect: (emoji: string) => void
}) {
  // Start with emojis visible so user can select one
  const [showEmojis, setShowEmojis] = useState(true)
  const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"]

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji)
    setShowEmojis(false)
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Fake input button */}
      <UserInput
        onSubmit={(input) => {
          onSelect(input)
          setShowEmojis(false)
        }}
        placeholder={"Napiš odpověď..."}
        buttonText="Odeslat"
      />

      {/* Emoji reactions */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-0 right-0 top-[-65px]"
          >
            <EmojiList
              className="p-2"
              onEmojiClick={handleEmojiClick}
              emojis={emojis}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
