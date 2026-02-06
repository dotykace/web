import MobileNotification from "@/components/mobile-notification"
import React, { useCallback, useEffect, useState } from "react"
import { useChatContext } from "@/context/ChatContext"
import { LocalSvgRenderer } from "@/components/LocalSvgRenderer"
import HelpButton from "@/components/HelpButton"
import PlaceSend from "@/components/chapter1/PlaceSend"
import PlacePlay from "@/components/chapter1/PlacePlay"
import PlaceScroll from "@/components/chapter1/PlaceScroll"

export default function ChatOverlay() {
  const { currentInteraction, goToNextInteraction } = useChatContext()
  const [showNotification, setShowNotification] = useState(false)

  const [place, setPlace] = useState("")

  const [dotyFace, setDotyFace] = useState("happy_1")

  const renderPlace = useCallback(() => {
    switch (place) {
      case "place-1":
        return (
          <PlaceSend
            current={currentInteraction}
            goToNext={goToNextInteraction}
          />
        )
      case "place-2":
        return (
          <PlacePlay
            current={currentInteraction}
            goToNext={goToNextInteraction}
          />
        )
      case "place-3":
        return (
          <PlaceScroll
            current={currentInteraction}
            goToNext={goToNextInteraction}
          />
        )
    }
  }, [place, currentInteraction, goToNextInteraction])

  useEffect(() => {
    if (!currentInteraction) return
    if (currentInteraction.face && currentInteraction.face !== dotyFace) {
      setDotyFace(currentInteraction.face)
    }
    if (currentInteraction?.type === "notification") {
      if (currentInteraction?.id === "input-place-2") {
        setShowNotification(false)
        return
      }
      setShowNotification(true)
    } else {
      setShowNotification(false)
    }
    if (currentInteraction.id === "place-1") {
      setPlace("place-1")
    }
    if (currentInteraction?.id === "place-2") {
      setPlace("place-2")
    }
    if (currentInteraction?.id === "place-3") {
      setPlace("place-3")
    }
  }, [currentInteraction])

  const notificationProps = {
    id: currentInteraction.id,
    title: "New Message",
    message: currentInteraction?.text() ?? "",
    icon: <LocalSvgRenderer filename={dotyFace} className="w-8 h-8" />,
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <HelpButton />
      <MobileNotification
        {...notificationProps}
        isOpen={showNotification}
        onClose={() => {
          setShowNotification(false)
          goToNextInteraction()
        }}
        duration={currentInteraction?.duration * 1000}
      />
      {renderPlace()}
    </div>
  )
}
