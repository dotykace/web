"use client"

import { useEffect, useState } from "react"
import { readFromStorage } from "@/scripts/local-storage"
import DefaultWaitingScreen from "@/components/DefaultWaitingScreen"
export default function DotykacePage() {
  const [finished, setFinished] = useState(false)
  const finishHeader = "Zážitek dokončen"
  const finishSubheader =
    "Dokončili jste interaktivní zkušenost s mobilem.\nDěkujeme!"

  useEffect(() => {
    const isFinished = readFromStorage("dotykaceFinished")
    console.log(isFinished)
    setFinished(() => !!isFinished)
  }, [])
  return (
    <DefaultWaitingScreen
      subheader={finished ? finishSubheader : undefined}
      header={finished ? finishHeader : undefined}
    />
  )
}
