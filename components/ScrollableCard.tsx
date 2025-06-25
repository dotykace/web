"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SocialMediaPost from "@/components/SocialMediaPost";

export default function ScrollCardsPage({currentCard, onScroll}) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const lastWheelTime = useRef(0)
  const wheelCooldown = 800 // milliseconds between card changes

  // Touch handling
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const minSwipeDistance = 50 // minimum distance for a swipe
  const changeCard = () => {
    if (isTransitioning) return
    const now = Date.now()
    if (now - lastWheelTime.current < wheelCooldown) return
    setIsTransitioning(true)
    lastWheelTime.current = now
    onScroll()
    setTimeout(() => {
      setIsTransitioning(false)
    }, 600)
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      changeCard()
    }
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault() // Prevent scrolling
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY.current = e.changedTouches[0].clientY
      handleSwipe()
    }
    const handleSwipe = () => {
      const swipeDistance = touchStartY.current - touchEndY.current
      const absSwipeDistance = Math.abs(swipeDistance)

      if (absSwipeDistance > minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swiped up - show next card
          changeCard()
        }
      }
    }

    // Add event listeners
    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [currentCard, isTransitioning])

  return (
    <div className="h-screen bg-gray-50 overflow-hidden touch-none">
      {/* Fixed container for the card */}
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-96 h-64">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{
                y: 100,
                opacity: 0,
                rotateX:  15,
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
                rotateX: 0,
              }}
              exit={{
                y:  -100 ,
                opacity: 0,
                rotateX: -15,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                duration: 0.8,
              }}
              className="w-full h-full"
              style={{ perspective: "1000px" }}
            >
              <SocialMediaPost username={"Bot"} avatar={"Bot"} content={currentCard.content} timestamp={currentCard.title}/>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
