"use client";

import Chat from "@/components/Chat";
import ChapterPage from "@/components/ChapterPage";


export default function Part1Page() {
  const chapter1Metadata = {
    chapterNumber: 1,
    interactionsFileName: "chapter1-flow",
    ViewComponent: Chat,
  }
  return <ChapterPage {...chapter1Metadata} />
}
