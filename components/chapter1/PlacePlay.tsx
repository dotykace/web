import Place from "@/components/chapter1/Place";
import CustomPlay from "@/components/CustomPlay";
import React, {useEffect, useState} from "react";
import {LocalSvgRenderer} from "@/components/LocalSvgRenderer";
import MobileNotification from "@/components/mobile-notification";
import EmojiList from "@/components/EmojiList";

export default function PlacePlay({current, goToNext}) {
  const dotPosition = { x: 0.5, y: 0.5, start: 100 }
  const revealComponent = <CustomPlay onClick={()=>goToNext("input-place-2")}/>

  const PREDEFINED_EMOJIS = ["🍽","️😋","🤤","🥴","🤢","☠️"]
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [placeVisible, setPlaceVisible] = useState(true)

  const notificationProps ={
    id: current.id,
    title: "New Message",
    message: current?.text() ?? "",
    icon: <LocalSvgRenderer filename={current.face??"happy_1"} className="w-8 h-8"/>,}

  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (!current) return;
    if (current.id === "input-place-2") {
      setShowNotification(true)
      return
    }
  }, [current]);

  const handleEmojiClick = (emoji: string) => {
    setPlaceVisible(false)
    setAnimatingEmoji(emoji)
    setIsAnimating(true)
    setShowNotification(false)
    setPlaceVisible(false)

    // Reset animation after completion
    setTimeout(() => {
      setIsAnimating(false)
      setAnimatingEmoji(null)
      goToNext("place-3")
    }, 1500)
  }

  return(
    <>
      {
        placeVisible && (
          <Place
            dotPosition={dotPosition}
            revealComponent={revealComponent}
            onAnimationEnd={() => goToNext("1.20")}
            onReveal={() => goToNext("1.21")}
          />
        )
      }

      <MobileNotification
        {...notificationProps}
        isOpen={showNotification}
        onClose={() => {
          setShowNotification(false)
        }}
        duration={current?.duration * 1000}
        content={() => <EmojiList onEmojiClick={handleEmojiClick} emojis={PREDEFINED_EMOJIS} />}
      />
      {isAnimating && animatingEmoji && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div
            className="text-8xl animate-emoji-explosion"
            style={{
              animation: "emojiExplosion 1.5s ease-out forwards",
            }}
          >
            {animatingEmoji}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes emojiExplosion {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(8);
            opacity: 0.8;
          }
          100% {
            transform: scale(12);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}