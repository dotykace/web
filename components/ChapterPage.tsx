"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { readFromStorage } from "@/scripts/local-storage";
import { useInteractions } from "@/hooks/use-interactions";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { ChatProvider } from "@/context/ChatContext";

interface ChapterPageProps {
  chapterNumber: number;
  interactionsFileName: string;
  ViewComponent: React.ComponentType<any>;
}

export default function ChapterPage({
  chapterNumber,
  interactionsFileName,
  ViewComponent,
}: ChapterPageProps) {
  const [chapterChecked, setChapterChecked] = useState(false);
  const [hasValidChapter, setHasValidChapter] = useState(false);
  const router = useRouter();

  const {
    state,
    currentInteraction,
    goToNextInteraction,
    handleUserInput,
    handleChoiceSelection,
  } = useInteractions(interactionsFileName);

  // Check localStorage for chapter on client-side only
  useEffect(() => {
    const storedChapter = readFromStorage("chapter");
    // Chapter is valid if it exists (including 0)
    const isValid = storedChapter !== undefined && storedChapter !== null;

    if (!isValid) {
      console.log("No chapter found in localStorage, redirecting to root");
      router.push("/");
    } else {
      setHasValidChapter(true);
    }
    setChapterChecked(true);
  }, [router]);

  // Show loading while checking chapter or loading interactions
  if (
    !chapterChecked ||
    !hasValidChapter ||
    !state ||
    state === "loading" ||
    !currentInteraction
  ) {
    return <LoadingScreen />;
  }

  return (
    <ChatProvider
      handleUserInput={handleUserInput}
      handleChoiceSelection={handleChoiceSelection}
      currentInteraction={currentInteraction}
      goToNextInteraction={goToNextInteraction}
    >
      <ViewComponent />
    </ChatProvider>
  );
}
