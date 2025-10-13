"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";

export default function DraggableCircle() {
  const [percentage, setPercentage] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  useEffect(() => {
    const updatePercentage = () => {
      if (!containerRef.current) return;
      const circleHeight = circleRef.current.offsetHeight;
      const containerHeight = containerRef.current.offsetHeight - circleHeight;

      // When starting from center, y = 0 → middle of screen
      // Up movement => positive y, Down => negative y
      const yValue = -y.get();

      const halfHeight = containerHeight / 2;
      const currentY = halfHeight + yValue;

      // Clamp within container
      const clampedY = Math.max(0, Math.min(containerHeight, currentY));

      // Convert to percentage (0% bottom → 100% top)
      const percent = (clampedY / containerHeight) * 100;
      setPercentage(Number(percent.toFixed(2)));
    };

    const unsubscribe = y.on("change", updatePercentage);
    return () => unsubscribe();
  }, [y]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center"
    >
      <motion.div
        ref={circleRef}
        drag="y"
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false} // 👈 disables the physics-based inertia
        style={{ y }}
        className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-500 shadow-lg cursor-grab active:cursor-grabbing touch-none"
      />

      <div className="absolute top-5 right-5 bg-white bg-opacity-80 px-4 py-2 rounded-xl shadow-md text-gray-800 text-sm md:text-base font-medium">
        Position: {percentage}%
      </div>
    </div>
  );
}
