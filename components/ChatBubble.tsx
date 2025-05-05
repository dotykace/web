"use client"

import { motion } from "framer-motion"

interface ChatBubbleProps {
  text: string
  isUser: boolean
}

export default function ChatBubble({ text, isUser }: ChatBubbleProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`max-w-[80%] p-3 rounded-2xl ${
          isUser ? "bg-purple-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none shadow-md"
        }`}
      >
        {text}
      </motion.div>
    </div>
  )
}
