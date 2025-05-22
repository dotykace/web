import UserInput from "@/components/UserInput";
import {useInteractions} from "@/hooks/use-interactions";
import {useEffect} from "react";
import {Interaction} from "@/interactions";
import {useChatContext} from "@/context/ChatContext";

export default function InputArea({currentInteraction, goToNextInteraction}) {

  const {handleUserInput, handleChoiceSelection} = useChatContext();
  // {/*todo fix the button styles*/}
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded p-4 border-t border-white/20">
      {currentInteraction?.type === "input" ? (
        <UserInput
          onSubmit={handleUserInput}
          placeholder={"Napiš odpověď..."}
          buttonText="Odeslat"
        />
      ) : currentInteraction?.type === "multiple-choice" ? (
        <div className="flex flex-wrap gap-2">
          {currentInteraction.choices?.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleChoiceSelection(choice)}
              className="bg-purple-300 hover:bg-white-400 transition-colors py-2 px-4 rounded-lg text-black font-medium flex-1"
            >
              {choice.type}
            </button>
          ))}
        </div>
      ) : (
        <div
          className="bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-lg text-white/70 text-center cursor-pointer"
          onClick={() => currentInteraction?.["next-id"] && goToNextInteraction(currentInteraction["next-id"])}
        >
          Klikni pro pokračování...
        </div>
      )}
    </div>
  )
}