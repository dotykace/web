"use client";

import Chat from "@/components/Chat";
import {useInteractions} from "@/hooks/use-interactions";
import {redirect} from "next/navigation";
import Card from "@/components/Card";
import {ChatProvider} from "@/context/ChatContext";
import {readFromStorage} from "@/scripts/local-storage";


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
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
        <div className="w-full max-w-md mx-auto">
          <Card>
            <div className="p-6 text-center">
              <div className="animate-pulse">Načítání interakcí...</div>
            </div>
          </Card>
        </div>
      </main>
    )
  }
  return (
    <ChatProvider handleUserInput={handleUserInput} handleChoiceSelection={handleChoiceSelection}>
      <Chat currentInteraction={currentInteraction} goToNextInteraction={goToNextInteraction}/>
    </ChatProvider>
    )
}
