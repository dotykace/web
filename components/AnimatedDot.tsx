"use client"

import { useState, useEffect, type ReactNode, JSX } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"

type AnimatedDotProps = {
  isVisible: boolean
  position: { x: number | string; y: number | string }
  revealComponent: JSX.Element
  onAnimationComplete?: () => void
  dotSize?: number
  dotColor?: string
  glowColor?: string
  animationDuration?: {
    grow?: number
    pulse?: number
    reveal?: number
  }
  className?: string
}

export default function AnimatedDot({
  isVisible = false,
  position,
  revealComponent,
  onAnimationComplete,
  dotSize = 30,
  glowSize = 1.5 * dotSize,
  dotColor = "#3b82f6",
  glowColor = "#60a5fa",
  animationDuration = {
    grow: 0.5,
    pulse: 2,
    reveal: 0.5,
    expand: 1,
  },
  className = "",
}: AnimatedDotProps) {
  const [state, setState] = useState<
    "disabled" | "growing" | "pulsing" | "expanding" | "revealed"
  >("disabled")

  useEffect(() => {
    if (isVisible && state === "disabled") {
      setState("growing")
    } else if (!isVisible && state !== "disabled") {
      setState("disabled")
    }
  }, [isVisible, state])

  const handleClick = () => {
    if (state === "pulsing") {
      setState("expanding")
      if (onAnimationComplete) {
        onAnimationComplete()
      }
      setTimeout(() => {
        setState("revealed")
      }, animationDuration.expand) // Start revealing when glow is 30% expanded
    }
  }

  const handleExpandComplete = () => {
    setTimeout(() => {
      setState("revealed")
    }, animationDuration.reveal * 1000)
  }
  const dotVariants: Variants = {
    disabled: {
      scale: 0,
      opacity: 0,
    },
    growing: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: animationDuration.grow,
        ease: "easeIn",
      },
    },
    pulsing: {
      scale: 1, // Keep the dot at its final size
      opacity: 1,
      transition: {
        duration: 0,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  const glowVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    pulsing: {
      opacity: [0, 0.6, 0],
      scale: [1, 2, 1],
      transition: {
        duration: animationDuration.pulse,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      },
    },
    expanding: {
      opacity: 0.8,
      scale: 100, // Scale up to cover the screen
      transition: {
        duration: animationDuration.expand,
        ease: "easeOut",
      },
    },
    fadeOut: {
      opacity: 0,
      transition: {
        duration: 0.5,
        delay: animationDuration.reveal * 0.7, // Start fading out when component is mostly revealed
      },
      exit: {
        opacity: 0,
        scale: 0,
        transition: {
          duration: 0.3,
        },
      },
    },
  }

  const revealVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: animationDuration.reveal,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: 50,
      }}
      className={className}
    >
      <AnimatePresence mode="wait">
        {state !== "disabled" && state !== "revealed" && (
          <div className="flex items-center justify-center">
            {/* Glow effect - only shown during pulsing state */}
            {(state === "pulsing" || state === "expanding") && (
              <motion.div
                key="glow"
                variants={glowVariants}
                initial="hidden"
                animate={
                  state === "expanding" ? ["expanding", "fadeOut"] : "pulsing"
                }
                exit="exit"
                style={{
                  position: "absolute",
                  width: glowSize,
                  height: glowSize,
                  borderRadius: "50%",
                  backgroundColor: glowColor,
                  zIndex: 49,
                  filter: "blur(4px)",
                }}
                onAnimationComplete={(definition) => {
                  if (definition === "expanding") {
                    handleExpandComplete()
                  }
                }}
              />
            )}

            {/* Main dot */}
            <motion.div
              key="dot"
              variants={dotVariants}
              initial="disabled"
              animate={state}
              exit="exit"
              style={{
                width: dotSize,
                height: dotSize,
                backgroundColor: dotColor,
                borderRadius: "50%",
                cursor: state === "pulsing" ? "pointer" : "default",
                zIndex: 50,
              }}
              onClick={handleClick}
              onAnimationComplete={(definition) => {
                if (definition === "growing") {
                  setState("pulsing")
                }
              }}
            />
          </div>
        )}

        {state === "revealed" && (
          <motion.div
            key="reveal"
            variants={revealVariants}
            initial="hidden"
            animate="visible"
          >
            {revealComponent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
