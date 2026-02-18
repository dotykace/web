"use client"
import Chat from "@/components/Chat"
import CardSequence from "@/components/CardSequence"
import ChapterPage from "@/components/ChapterPage"
import { notFound } from "next/navigation"
import ScalesAndGallery from "@/components/chapter4/ScalesAndGallery"
import Chapter2 from "@/components/audio/Chapter2"

export const chapterConfigs = {
  "0": {
    chapterNumber: 0,
    interactionsFileName: "intro-flow",
    ViewComponent: CardSequence,
  },
  "1": {
    chapterNumber: 1,
    interactionsFileName: "chapter1-flow",
    ViewComponent: Chat,
  },
  "2": {
    chapterNumber: 2,
    interactionsFileName: "chapter2-flow",
    ViewComponent: Chapter2,
    coloring: "bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600",
    showHeader: true,
    showAudioControl: true,
  },
  "3": {
    chapterNumber: 3,
    interactionsFileName: "chapter3-flow",
    ViewComponent: Chat,
  },
  "4": {
    chapterNumber: 4,
    interactionsFileName: "chapter4-flow",
    ViewComponent: ScalesAndGallery,
    coloring: "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
    showHeader: true,
    showAudioControl: true,
  },
}

type ChapterId = keyof typeof chapterConfigs

interface ChapterClientProps {
  id: string
}

export default function ChapterClient({ id }: ChapterClientProps) {
  // Check if the chapter exists
  if (!(id in chapterConfigs)) {
    notFound()
  }

  const chapterConfig = chapterConfigs[id as ChapterId]

  return <ChapterPage {...chapterConfig} />
}
