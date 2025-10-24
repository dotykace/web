"use client"

import type React from "react"
import { readFromStorage } from "@/scripts/local-storage"
import { useInteractions } from "@/hooks/use-interactions"
import { redirect, usePathname } from "next/navigation"
import LoadingScreen from "@/components/LoadingScreen"
import { ChatProvider } from "@/context/ChatContext"

interface ChapterPageProps {
  chapterNumber: number
  interactionsFileName: string
  ViewComponent: React.ComponentType<any>
}

export default function ChapterPage({ chapterNumber, interactionsFileName, ViewComponent }: ChapterPageProps) {
  const chapter = readFromStorage("chapter") as number
  const { state, currentInteraction, goToNextInteraction, handleUserInput, handleChoiceSelection } =
      useInteractions(interactionsFileName)

  const pathname = usePathname()

  if (chapter == undefined && pathname !== "/") {
    console.log("Redirecting to root")
    redirect("/")
  }
  if (chapter && chapter !== chapterNumber && pathname !== "/menu") {
    // todo remove chapter 4 after full integration of the gallery
    if (chapterNumber !== 4 ){
      console.log("Redirecting to menu from chapter", chapter)
      redirect("/menu")
    }
  }

  if (!state || state === "loading" || !currentInteraction) {
    return <LoadingScreen />
  }

  return (
      <ChatProvider handleUserInput={handleUserInput} handleChoiceSelection={handleChoiceSelection} currentInteraction={currentInteraction} goToNextInteraction={goToNextInteraction}>
        <ViewComponent/>
      </ChatProvider>
  )
}
