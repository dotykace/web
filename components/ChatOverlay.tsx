import MobileNotification from "@/components/mobile-notification";
import AnimatedDot from "@/components/AnimatedDot";
import CustomSend from "@/components/CustomSend";
import {useEffect, useState} from "react";
import {MessageSquare} from "lucide-react";

export default function ChatOverlay({ currentInteraction, goToNextInteraction}) {
  const [isVisible, setIsVisible] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if(currentInteraction?.id === "1.9") {
      setIsVisible(true)
    }
    if (currentInteraction?.type === "notification") {
      setShowNotification(true)
    } else {
      setShowNotification(false)
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
        position={{ x: "calc(90% - 20px)", y: "calc(60% - 20px)" }}
        revealComponent={
          <CustomSend onFinish={() => {
            goToNextInteraction("place-2")
          }}/>
        }
        onAnimationComplete={() => {
          goToNextInteraction("1.10")
        }}
      />
    </div>
  );
}