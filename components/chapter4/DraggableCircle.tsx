"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";

export default function DraggableCircle({percentageCallback, scaleKey}) {
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
      percentageCallback(Number(percent.toFixed(2)));
    };

    const unsubscribe = y.on("change", updatePercentage);
    return () => unsubscribe();
  }, [y]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex flex-1 items-center justify-center"
    >
      <div className="absolute top-1/2 left-0 w-full border-t-4 border-dashed border-gray-400 transform -translate-y-1/2" />
      <motion.div
        key={scaleKey}
        ref={circleRef}
        drag="y"
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false} // 👈 disables the physics-based inertia
        style={{ y }}
        className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-500 shadow-lg cursor-grab active:cursor-grabbing touch-none"
      />
    </div>
  );
}
