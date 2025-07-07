"use client"
import { motion } from "framer-motion"

export default function ScrollLine() {
  return (
    <div className="w-4 h-screen bg-white opacity-30 mr-3 items-center">
      {/* Glowing effect */}
      <motion.div
        className="w-4 h-20  bg-white rounded-full"
        style={{
          boxShadow:
            "0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.8)",
        }}
        animate={{
          y: ["100vh", 0],
          opacity: [0.1, 1, 1, 0.1],
        }}
        transition={{
          duration: 1,
          ease: "easeInOut",
          times: [0, 0.1, 0.9, 1],
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 0.8,
        }}
      />
    </div>
  )
}