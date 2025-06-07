"use client"

import ChapterPage from "@/components/ChapterPage"
import { notFound } from "next/navigation"
import Chat from "@/components/Chat"
import CardSequence from "@/components/CardSequence"

// Chapter configuration
const chapterConfigs = {
  "0": {
    chapterNumber: 0,
    interactionsFileName: "intro-flow",
    ViewComponent: CardSequence,
    title: "Introduction",
  },
  "1": {
    chapterNumber: 1,
    interactionsFileName: "chapter1-flow",
    ViewComponent: Chat,
    title: "Place & Touch",
  },
  "2": {
    chapterNumber: 2,
    interactionsFileName: "chapter2-flow",
    ViewComponent: Chat,
    title: "Mental & Physical Habits",
  },
  "3": {
    chapterNumber: 3,
    interactionsFileName: "chapter3-flow",
    ViewComponent: Chat,
    title: "Relationships",
  },
  "4": {
    chapterNumber: 4,
    interactionsFileName: "chapter4-flow",
    ViewComponent: Chat,
    title: "Advanced Relationships",
  },
} as const

type ChapterId = keyof typeof chapterConfigs

interface PageProps {
  params: { id: string }
}

export default function Chapter({ params }: PageProps) {
  const { id } = params

  // Check if the chapter exists
  if (!(id in chapterConfigs)) {
    notFound()
  }

  const chapterConfig = chapterConfigs[id as ChapterId]

  return <ChapterPage {...chapterConfig} />
}
