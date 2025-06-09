"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

export default function EmojiReactionButton({onSelect}) {
  const [showEmojis, setShowEmojis] = useState(false);
  const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  const handleButtonClick = () => {
    setShowEmojis(true);
  };

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);
    setShowEmojis(false);
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Fake input button */}
      <button
        onClick={handleButtonClick}
        className="w-full bg-gray-900 text-gray-400 rounded-full py-4 px-6 text-left focus:outline-none"
        style={{
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          background: "#1e1e24",
        }}
      >
        Napiš odpověď...
      </button>

      {/* Arrow button */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <div className="bg-purple-600 rounded-full p-3 flex items-center justify-center">
          <ArrowRightIcon className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Emoji reactions */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-0 right-0 top-[-70px] bg-white rounded-full p-2 flex justify-around shadow-lg"
          >
            {emojis.map((emoji, index) => (
              <motion.button
                key={emoji}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.05 },
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl cursor-pointer p-2"
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
