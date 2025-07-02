"use client"
import { motion } from "framer-motion"
export default function ScrollLine() {
  return (
    <div className="w-5 h-screen bg-white opacity-30">
      {/* Glowing effect */}
      <motion.div
        className="w-5 h-20  bg-white rounded-full"
        style={{
          boxShadow:
            "0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.8)",
        }}
        animate={{
          y: ["100vh", 0],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 0.5,
        }}
      />
    </div>
  )
}