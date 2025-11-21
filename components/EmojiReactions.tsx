"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import EmojiList from "@/components/EmojiList";

export default function EmojiReactionButton({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
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
  );
}
