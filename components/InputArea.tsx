import UserInput from "@/components/UserInput";
import { useInteractions } from "@/hooks/use-interactions";
import { useEffect } from "react";
import { Interaction } from "@/interactions";
import { useChatContext } from "@/context/ChatContext";

export default function InputArea() {
  const { handleUserInput, handleChoiceSelection, currentInteraction } =
    useChatContext();

  switch (currentInteraction?.type) {
    case "input":
      return (
        <UserInput
          onSubmit={handleUserInput}
          placeholder={"Napiš odpověď..."}
          buttonText="Odeslat"
        />
      );
    case "multiple-choice":
      return (
        <div className="flex flex-wrap gap-2">
          {currentInteraction.choices?.map((choice: any, index: number) => (
            <button
              key={index}
              onClick={() => handleChoiceSelection(choice)}
              className="bg-purple-300 hover:bg-white-400 transition-colors py-2 px-4 rounded text-black font-medium flex-1"
            >
              {choice.type}
            </button>
          ))}
        </div>
      );
    default:
      return <div />;
    // todo let them choose on the meeting if they want to let them continue by their own
    // if (currentInteraction?.["next-id"]) {
    //   return (
    //     <div
    //       className="bg-white/10 hover:bg-white/20 transition-colors p-3 rounded text-white/70 text-center cursor-pointer"
    //       onClick={goToNextInteraction}
    //     >
    //       Klikni pro pokračování...
    //     </div>
    //   )
    // }
    // else {
    //   return (
    //     <div className="bg-white/10 p-3 rounded text-white/70 text-center">
    //       Přemýšlím...
    //     </div>
    //   )
    // }
  }
}
