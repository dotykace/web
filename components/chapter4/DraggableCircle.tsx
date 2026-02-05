"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import Image from "next/image"

export default function DraggableCircle({
  percentageCallback,
}: {
  percentageCallback: (percentage: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  const [currentPercent, setCurrentPercent] = useState(50)

  // Create color interpolation based on y position
  const backgroundColor = useTransform(
    y,
    [-200, 0, 200],
    ["#22c55e", "#f59e0b", "#ef4444"], // green -> amber -> red
  )

  useEffect(() => {
    const updatePercentage = () => {
      if (!containerRef.current) return
      const circleHeight = circleRef.current?.offsetHeight || 0
      const containerHeight = containerRef.current.offsetHeight - circleHeight

      const yValue = -y.get()
      const halfHeight = containerHeight / 2
      const currentY = halfHeight + yValue
      const clampedY = Math.max(0, Math.min(containerHeight, currentY))
      const percent = (clampedY / containerHeight) * 100
      const rounded = Number(percent.toFixed(0))
      setCurrentPercent(rounded)
      percentageCallback(rounded)
    }

    const unsubscribe = y.on("change", updatePercentage)
    return () => unsubscribe()
  }, [y, percentageCallback])

  // Get Doty expression based on percentage
  const getDotyExpression = () => {
    if (currentPercent >= 67) return "/images/doty/happy.svg"
    if (currentPercent >= 34) return "/images/doty/ok.svg"
    return "/images/doty/sad.svg"
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
    >
      {/* Vertical track */}
      <div className="absolute left-1/2 -translate-x-1/2 w-4 h-[70%] rounded-full bg-gradient-to-b from-green-400 via-amber-400 to-red-400 opacity-40" />

      {/* Draggable circle with Doty expression */}
      <motion.div
        ref={circleRef}
        drag="y"
        dragConstraints={containerRef}
        dragElastic={0.1}
        dragMomentum={false}
        style={{ y, backgroundColor }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 1.15 }}
        className="absolute w-28 h-28 md:w-32 md:h-32 rounded-full shadow-2xl cursor-grab active:cursor-grabbing touch-none flex items-center justify-center border-4 border-white z-10"
      >
        {/* Doty face */}
        <Image
          src={getDotyExpression()}
          alt="Doty expression"
          width={80}
          height={80}
          className="w-16 h-16 md:w-20 md:h-20 select-none drop-shadow-lg"
        />
      </motion.div>

      {/* Instruction text */}
      <motion.p
        className="absolute bottom-1 left-0 right-0 text-center text-white/70 text-xs font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ↕ Táhni nahoru nebo dolů
      </motion.p>
    </div>
  )
}
