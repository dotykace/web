import MobileNotification from "@/components/mobile-notification";
import AnimatedDot from "@/components/AnimatedDot";
import CustomSend from "@/components/CustomSend";
import {useEffect, useState} from "react";
import {MessageSquare} from "lucide-react";

export default function ChatOverlay({ currentInteraction, goToNextInteraction}) {
  const [isVisible, setIsVisible] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  const [place, setPlace] = useState({})

  const placesMetadata = {
    "place-1": {
      revealComponent:  <CustomSend onFinish={() => {
        setIsVisible(false)
        goToNextInteraction("place-2")
      }}/>,
      position: { x: "calc(90% - 20px)", y: "calc(60% - 20px)" },
      onAnimationComplete: () => {
        goToNextInteraction("1.10")
      }
    },
  }

  useEffect(() => {
    if (currentInteraction?.type === "notification") {
      setShowNotification(true)
    } else {
      setShowNotification(false)
    }
    if(currentInteraction?.id === "place-1") {
      setIsVisible(true)
      setPlace(placesMetadata["place-1"])
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
        duration={currentInteraction?.duration * 1000}
        onNotificationClick={() => console.log("Notification clicked")}
      />)}
      <AnimatedDot
        animationDuration={
          {grow: currentInteraction.duration,
            pulse: currentInteraction.duration * 0.5,
            reveal: currentInteraction.duration * 0.5,
            expand: currentInteraction.duration * 1.5}
        }
        isVisible={isVisible}
        dotColor={"white"}
        glowColor={"white"}
        position={place.position ?? { x: "50%", y: "50%" }}
        revealComponent={ place.revealComponent??<div/>}
        onAnimationComplete={ place.onAnimationComplete ?? (() => goToNextInteraction()) }
      />
    </div>
  );
}