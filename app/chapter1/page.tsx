"use client";

import Chat from "@/components/Chat";
import {useInteractions} from "@/hooks/use-interactions";
import {redirect} from "next/navigation";
import Card from "@/components/Card";
import {ChatProvider} from "@/context/ChatContext";
import {readFromStorage} from "@/scripts/local-storage";
import LoadingScreen from "@/components/LoadingScreen";


export default function Part1Page() {
  const chapter = readFromStorage("chapter") as number
  const {
    state,
    currentInteraction,
    goToNextInteraction,
    handleUserInput,
    handleChoiceSelection,
  } = useInteractions("chapter1-flow")

  if((chapter && chapter !== 1)|| chapter == undefined) {
    console.log("Redirecting to root from chapter", chapter)
    redirect("/")
  }

  if (!state || state==="loading" || !currentInteraction ) {
    return <LoadingScreen/>
  }
  return (
    <ChatProvider handleUserInput={handleUserInput} handleChoiceSelection={handleChoiceSelection}>
      <Chat currentInteraction={currentInteraction} goToNextInteraction={goToNextInteraction}/>
    </ChatProvider>
    )
}
