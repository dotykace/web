"use client"

import {AnimatePresence, motion} from "framer-motion"
import {Interaction} from "@/interactions";

interface ChatBubbleProps {
  type: string
  text: string | (() => string)
}

export default function ChatBubble({ text, type }: ChatBubbleProps) {
  const renderText = typeof text === "function" ? text() : text;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {type === "user-message" ? (
          <div className="bg-indigo-600 text-white p-3 rounded-xl rounded-tr-none">
            <p>{renderText}</p>
          </div>
        ) : type === "user-message-emoji" ? (
          <div className="flex justify-end items-center h-20 w-full max-w-full mx-auto">
            <div className="text-5xl border-indigo-600 border-4 bg-indigo-600/50 rounded-xl rounded-tr-none p-3">
              {renderText}
            </div>
          </div>
        ): type === "message" ? (
          <div className="bg-white/20 text-white p-3 rounded-xl rounded-tl-none">
            <p>{renderText}</p>
          </div>
        ): null}
      </motion.div>
    </AnimatePresence>
  )
}
