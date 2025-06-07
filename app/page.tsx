"use client"
import CardSequence from "@/components/CardSequence"
import ChapterPage from "@/components/ChapterPage";


export default function Home() {
  const introductionMetadata = {
    chapterNumber: 0,
    interactionsFileName: "intro-flow",
    ViewComponent: CardSequence,
  }
  return <ChapterPage {...introductionMetadata} />
}
