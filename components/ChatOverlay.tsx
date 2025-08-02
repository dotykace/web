import MobileNotification from "@/components/mobile-notification";
import React, {useEffect, useState} from "react";
import {MessageSquare} from "lucide-react";
import GlowingDot from "@/components/GlowingDot";
import SpecialPlace from "@/components/SpecialPlace";
import {Button} from "@/components/ui/button";
import EmojiList from "@/components/EmojiList";
import {useChatContext} from "@/context/ChatContext";
import {LocalSvgRenderer} from "@/components/LocalSvgRenderer";
import HelpButton from "@/components/HelpButton";

export default function ChatOverlay() {

  const { currentInteraction, goToNextInteraction} = useChatContext()
  const [showNotification, setShowNotification] = useState(false)

  const [showDot, setShowDot] = useState(false)
  const [dotPosition, setDotPosition] = useState({ left: "50%", top: "50%" })

  const [showPlace, setShowPlace] = useState(false)
  const [place, setPlace] = useState("")

  const [showBackToChat, setShowBackToChat] = useState(false)

  const [dotyFace, setDotyFace] = useState("happy_1")

  const resetDot = () => {
    setShowDot(false);
    setShowPlace(true);
  }

  useEffect(() => {
    if (currentInteraction.face && currentInteraction.face !== dotyFace) {
      setDotyFace(currentInteraction.face);
    }
    if (currentInteraction?.type === "notification") {
      setShowNotification(true)
    } else {
      setShowNotification(false)
    }
    if (currentInteraction?.id === "back-to-chat") {
      setShowDot(false);
      setShowPlace(false);
      setShowBackToChat(true);
    }
    if(currentInteraction?.id === "place-1") {
      setPlace("place-1")
      setDotPosition({left: "calc(90% - 20px)", top: "calc(60% - 20px)"})
      setShowDot(true)
    }
    if(currentInteraction?.id === "place-2") {
      setPlace("place-2")
      setDotPosition({left: "50%", top: "50%"})
      setShowDot(true)
    }
    if(currentInteraction?.id === "place-3") {
      setPlace("place-3")
      setDotPosition({left: "50%", top: "50%"})
      setShowDot(true)
    }
  }, [currentInteraction]);

  const notificationProps ={
    id: currentInteraction.id,
    title: "New Message",
    message: currentInteraction?.text() ?? "",
    icon: <LocalSvgRenderer filename={dotyFace} className="w-8 h-8"/>,}

  const PREDEFINED_EMOJIS = ["🍽","️😋","🤤","🥴","🤢","☠️"]
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const handleEmojiClick = (emoji: string) => {
    setAnimatingEmoji(emoji)
    setIsAnimating(true)
    setShowNotification(false)
    setShowPlace(false)

    // Reset animation after completion
    setTimeout(() => {
      setIsAnimating(false)
      setAnimatingEmoji(null)
      goToNextInteraction("place-3")
    }, 1500)
  }

  const callBackForContent = () => {
    if (currentInteraction?.id === "input-place-2") {
      return (
        () => <EmojiList onEmojiClick={handleEmojiClick} emojis={PREDEFINED_EMOJIS} />
      );
    } else {
      return undefined;
    }
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <HelpButton />
      <MobileNotification
        {...notificationProps}
        isOpen={showNotification}
        onClose={() => {
          setShowNotification(false)
        }}
        duration={currentInteraction?.duration * 1000}
        content={callBackForContent()}
      />
      {showBackToChat && (
        <Button
          style={
            {
              position: "absolute",
              bottom: "50%",
              left: "5%",
              width: "90%",
            }
          }
          key={"back-to-chat-button"}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out"
          onClick={() => goToNextInteraction("overlay-off")}
        >
          Zpět do chatu
        </Button>

      )}

      <GlowingDot visible={showDot} position={dotPosition} onClick={() => resetDot()}/>
      <div
        style={{
          position: "absolute",
          left: dotPosition.left,
          top: dotPosition.top,
        }}
      >
        <SpecialPlace visible={showPlace} place={place} onFinish={()=>setShowPlace(false)}/>
      </div>
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

    </div>
  );
}