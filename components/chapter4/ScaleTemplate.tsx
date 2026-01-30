// components/CenteredLayout.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DraggableCircle from "@/components/chapter4/DraggableCircle";
import { Button } from "@/components/ui/button";

export default function ScaleTemplate({
  disabled,
  topText,
  bottomText,
  onConfirm,
  confirmationText = "Potvrdit a pokračovat",
}: {
  disabled: boolean;
  topText: string;
  bottomText: string;
  onConfirm: (percentage: number) => void;
  confirmationText?: string;
}) {
  const [percentage, setPercentage] = useState(50);
  const [resetKey, setResetKey] = useState(0);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(percentage);
    }
    setResetKey((k) => k + 1);
    setPercentage(50);
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Top label with emoji */}
      <motion.div
        className="shrink-0 py-1 px-4 z-10 flex justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-green-500/20 backdrop-blur-md rounded-full px-3 py-1 border border-green-400/30 flex items-center gap-1">
          <span className="text-sm">😊</span>
          <span className="text-xs font-bold text-white tracking-wide">
            {topText}
          </span>
        </div>
      </motion.div>

      {/* Draggable area */}
      <div className="flex-1 min-h-0 relative">
        <DraggableCircle percentageCallback={setPercentage} key={resetKey} />
      </div>

      {/* Bottom label with emoji */}
      <motion.div
        className="shrink-0 py-1 px-4 z-10 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-red-500/20 backdrop-blur-md rounded-full px-3 py-1 border border-red-400/30 flex items-center gap-1">
          <span className="text-sm">😔</span>
          <span className="text-xs font-bold text-white tracking-wide">
            {bottomText}
          </span>
        </div>
      </motion.div>

      {/* Confirm button */}
      <motion.div
        className="shrink-0 px-3 py-2 z-10 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.button
          disabled={disabled}
          onClick={handleConfirm}
          whileHover={{ scale: disabled ? 1 : 1.03 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
            disabled
              ? "bg-white/30 text-white/50 cursor-not-allowed"
              : "bg-white text-indigo-900 hover:bg-white/90 shadow-lg hover:shadow-xl"
          }`}
        >
          {confirmationText}
        </motion.button>
      </motion.div>
    </div>
  );
}
