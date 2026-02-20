"use client"

import { useEffect, useState } from "react"
import { readFromStorage } from "@/scripts/local-storage"
import { PartyPopper, Smartphone } from "lucide-react"
import DefaultWaitingScreen from "@/components/DefaultWaitingScreen";

export default function DotykacePage() {
  const [finished, setFinished] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const isFinished = readFromStorage("dotykaceFinished")
    setFinished(!!isFinished)
    setLoaded(true)
  }, [])

  if (!loaded) {
    return (
      <div className="fixed inset-0 bg-gradient-warm flex items-center justify-center">
        <div className="animate-spin-smooth rounded-full border-3 border-white/30 border-t-white h-10 w-10" />
      </div>
    )
  }

  const waitingScreenProps = finished ? ({
    header: "Zážitek dokončen!",
    subheader: (<>Dokončili jste zážitek Dotykáče.<br/> Děkujeme za vaši účast!</>),
    icon: <PartyPopper className="w-10 h-10 text-orange-500" />
  }): ({
    header: "Dotykáče",
    subheader: "Interaktivní zkušenost s mobilem",
    icon: <Smartphone className="w-10 h-10 text-orange-500" />
  })

  return <DefaultWaitingScreen {...waitingScreenProps} />
}
