"use client"

import {useState, useEffect, useRef, useCallback} from "react"
import { motion, AnimatePresence } from "framer-motion"
import SocialMediaPost from "@/components/SocialMediaPost";
import {Progress} from "@/components/ui/progress";
import {Pause, Play} from "lucide-react";
import ScrollLine from "@/components/ScrollLine";
import AnimatedCard from "@/components/AnimatedCard";
import {readFromStorage} from "@/scripts/local-storage";
const generateChoiceObject = (text,callback) => {
  return {
    text: text,
    callback: () => callback(text)
  }
}
const FINGERS = [
  "palec",
  "ukazovák",
  "prostředníček",
  "prsteníček",
  "malíček"
]
const createCard = (interaction, botName, onFinish) => {
  if (interaction.type !== "card") return undefined
  let newCard = {
    id: interaction.id,
    avatar: "/placeholder.svg",
    username: botName,
    content: interaction.text(),
  }

  if (interaction.id === "finger-choice") {
    newCard = {
      ...newCard,
      choices: FINGERS.map((text) => generateChoiceObject(text,(choice) => onFinish("choice", choice))),
    }
  }
  if (interaction.id === "finger-compare"){
    newCard = {
      ...newCard,
      choices: [generateChoiceObject("Pokračovat\n",() => onFinish("compare"))],
    }
  }
  return newCard;
}
export default function ScrollableCards({currentInteraction, onScroll, onFinish}) {
  // scrolling cooldown
  const [isTransitioning, setIsTransitioning] = useState(false)
  const lastWheelTime = useRef(0)
  const wheelCooldown = 800 // milliseconds between card changes

  const nextCard = (()=> currentInteraction.id !== "finger-choice" && currentInteraction.id!== "finger-compare");
  const validCard = (() => currentInteraction.type === "card")

  const botName = readFromStorage("BN") ?? "Bot"


  const autoScrollDelay = currentInteraction.duration * 1000 ?? 4000 // 4 seconds
  const intervalMs = (autoScrollDelay/100)*0.75;
  // const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  // const toggleAutoScroll = () => {
  //   setIsAutoScrolling(!isAutoScrolling)
  // }
  // Touch handling
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const minSwipeDistance = 50 // minimum distance for a swipe

  const changeCard = () => {
    // cooldown logic
    if (isTransitioning) return
    const now = Date.now()
    if (now - lastWheelTime.current < wheelCooldown) return
    setIsTransitioning(true)
    lastWheelTime.current = now
    // here goes actual change of card
    setProgress(0)
    onScroll()
    // here is cooldown again
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
  }, [])

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!validCard() || !nextCard()) return
    // if (!isAutoScrolling ) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval)
  }, [currentInteraction])

  useEffect(() => {
    if (progress === 100 ) {
      changeCard()
    }
  }, [progress]);

  return (
    <div className="h-screen overflow-hidden touch-none w-screen fixed top-0 left-0">
      {/*{*/}
      {/*  validCard() && nextCard() && (*/}
      {/*    <div className="absolute bottom-10  left-4 right-11 z-20 flex items-center justify-end gap-2">*/}
      {/*    <Progress value={progress} />*/}
      {/*    /!* Auto-scroll Toggle *!/*/}
      {/*    <button*/}
      {/*      onClick={toggleAutoScroll}*/}
      {/*      className="bg-black/50 backdrop-blur-sm rounded-full p-2 border border-white/20"*/}
      {/*    >*/}
      {/*      {isAutoScrolling ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}*/}
      {/*    </button>*/}
      {/*  </div>)*/}
      {/*}*/}
      <div className="flex flex-row-reverse justify-evenly items-center h-full w-full">
        {nextCard() && <ScrollLine />}
        <AnimatedCard currentCard={createCard(currentInteraction,botName,onFinish)} visible={validCard()}/>
      </div>
    </div>
  )
}
