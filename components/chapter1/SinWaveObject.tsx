"use client"

import { AnimatePresence, motion, useAnimationFrame } from "framer-motion"
import React, { useEffect, useState } from "react"

interface SineWaveObjectProps {
  periods?: number // Number of sine wave periods
  margin?: number // Margin from edges
  speed?: number // Speed of the animation
  endXPercent?: number // End X position as percentage of width
  endYPercent?: number // End Y position as percentage of height
  offset?: number // Offset to account for circle size
  startX?: number // Starting X position
  animatedObject?: React.ReactElement // The object to animate (e.g., a div with styles)
  object: React.ReactElement // The object to animate (e.g., a div with styles)
  onFinish?: () => void // Callback when animation finishes
}
export default function SineWaveObject(props: SineWaveObjectProps) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [progress, setProgress] = useState(0)

  const {
    periods = 3,
    margin = 50,
    speed = 0.0035,
    endXPercent = 0.5,
    endYPercent = 0.5,
    offset = 0,
    startX = 0,
  } = props

  const isFinished = progress >= 1

  // Track window size (responsive)
  useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])
  useEffect(() => {
    if (isFinished && props.onFinish) {
      props.onFinish()
    }
  }, [progress])

  // Animate progress 0 → 1
  useAnimationFrame(() => {
    setProgress((p) => (p + speed > 1 ? 1 : p + speed)) // stop at end
  })

  if (!size.width || !size.height) return null

  // --- Derived values ---
  const amplitude = (size.width - margin * 2) / 2
  const endX = endXPercent * size.width - offset
  const endY = endYPercent * size.height - offset

  // Linear X path
  const linearX = startX + (endX - startX) * progress

  // Oscillation (vanishes at t=0 and t=1)
  const theta = periods * Math.PI * progress
  const sineOffset = amplitude * Math.sin(theta) * (1 - progress)

  // Final coords
  const x = linearX + sineOffset
  const y = endY * progress
  // ----------------------

  return (
    <AnimatePresence mode={"wait"}>
      <div className="relative w-full h-screen overflow-hidden">
        {isFinished ? (
          <motion.div
            className="absolute"
            style={{
              transform: `translate(${endX}px, ${endY}px)`,
            }}
          >
            {props.object}
          </motion.div>
        ) : (
          <motion.div
            key={"moving-object"}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {props.animatedObject || props.object}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}
