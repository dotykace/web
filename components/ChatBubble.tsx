"use client"

import {AnimatePresence, motion} from "framer-motion"

interface ChatBubbleProps {
  type: string
  text: string | (() => string)
}

export default function ChatBubble({ text, type }: ChatBubbleProps) {
  const renderText = typeof text === "function" ? text() : text;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        {type === "user-message" ? (
          <div className="bg-[#0EA5E9] text-white px-4 py-3 rounded-2xl shadow-md">
            <p className="text-base leading-relaxed">{renderText}</p>
          </div>
        ) : type === "user-message-emoji" ? (
          <div className="flex justify-end items-center h-20 w-full max-w-full mx-auto">
            <div className="text-5xl border-[#0EA5E9] border-4 bg-[#0EA5E9]/50 rounded-2xl p-3 shadow-md">
              {renderText}
            </div>
          </div>
        ): type === "message" ? (
          <div className="bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-3 rounded-2xl shadow-md">
            <p className="text-base leading-relaxed">{renderText}</p>
          </div>
        ): null}
      </motion.div>
    </AnimatePresence>
  )
}
