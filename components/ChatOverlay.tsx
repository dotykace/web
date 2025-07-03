import MobileNotification from "@/components/mobile-notification";
import {useEffect, useState} from "react";
import {MessageSquare} from "lucide-react";
import GlowingDot from "@/components/GlowingDot";
import SpecialPlace from "@/components/SpecialPlace";

export default function ChatOverlay({ currentInteraction, goToNextInteraction}) {
  const [showNotification, setShowNotification] = useState(false)

  const [showDot, setShowDot] = useState(false)
  const [dotPosition, setDotPosition] = useState({ left: "50%", top: "50%" })

  const [showPlace, setShowPlace] = useState(false)
  const [place, setPlace] = useState("")

  const resetDot = () => {
    setShowDot(false);
    setShowPlace(true);
  }

  useEffect(() => {
    if (currentInteraction?.type === "notification") {
      setShowNotification(true)
    } else {
      setShowNotification(false)
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
      setDotPosition({left: "calc(80% - 4px)", top: "50%"})
      setShowDot(true)
    }
  }, [currentInteraction]);

  const notificationProps ={
    title: "New Message",
    message: currentInteraction?.text() ?? "",
    icon: <MessageSquare className="h-6 w-6 text-white" />,}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      {showNotification && (
        <MobileNotification
        {...notificationProps}
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        duration={currentInteraction?.duration * 1000}
        onNotificationClick={() => {
          if(currentInteraction?.id === "input-place-2") {
            setShowPlace(false)
            goToNextInteraction("place-3")
          }
        }}
      />)}
      <GlowingDot visible={showDot} position={dotPosition} onClick={() => resetDot()}/>
      <div
        style={{
          position: "absolute",
          left: dotPosition.left,
          top: dotPosition.top,
        }}
      >
        <SpecialPlace visible={showPlace} place={place} goToNextInteraction={goToNextInteraction} currentInteraction={currentInteraction} onFinish={()=>setShowPlace(false)}/>
      </div>

    </div>
  );
}