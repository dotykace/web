"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const cardData = [
  {
    id: 1,
    title: "First Card",
    content: "This is the first card. Scroll down to see the next one!",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Second Card",
    content: "Welcome to the second card. Keep scrolling for more!",
    color: "bg-green-500",
  },
  {
    id: 3,
    title: "Third Card",
    content: "You've reached the third card. One more to go!",
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "Fourth Card",
    content: "This is the final card. You can scroll back up too!",
    color: "bg-red-500",
  },
]

export default function ScrollCardsPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
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
    const newIndex = currentCardIndex + 1
    if(newIndex >= cardData.length) return;
    setIsTransitioning(true)
    setCurrentCardIndex(newIndex)
    lastWheelTime.current = now
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
  }, [currentCardIndex, isTransitioning])

  const currentCard = cardData[currentCardIndex]

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
              <Card className="w-full h-full shadow-2xl border-0">
                <CardHeader className={`${currentCard.color} text-white rounded-t-lg`}>
                  <CardTitle className="text-2xl font-bold text-center">{currentCard.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-8 bg-white rounded-b-lg flex items-center justify-center">
                  <p className="text-gray-700 text-center text-lg leading-relaxed">{currentCard.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
