import { motion, AnimatePresence } from "framer-motion";
import React from "react";

export default function GlowingDot({
  onClick,
  size = 30,
  color = "white",
}: {
  onClick: () => void;
  size: number;
  color: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        onClick={onClick}
        key="dot"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
        transition={{ duration: 0.3 }}
        style={{
          position: "relative",
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: "50%",
          zIndex: 49,
          cursor: "pointer",
        }}
      >
        {/* Pulsating rings with staggered delays */}
        {[0, 0.5, 1].map((delay, index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.5, 2],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay,
            }}
            exit={{
              scale: 9,
              opacity: 0,
              transition: {
                duration: 1,
                ease: "easeInOut",
              },
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: "50%",
              border: `2px solid ${color}`,
              boxSizing: "border-box",
              pointerEvents: "none",
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
