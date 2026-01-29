import UserInput from "@/components/UserInput";
import {useChatContext} from "@/context/ChatContext";

export default function InputArea({InputElement, ButtonElement}: {InputElement?: () => React.ReactNode, ButtonElement?: (choice) => React.ReactNode}) {

  const {handleUserInput, handleChoiceSelection, currentInteraction} = useChatContext();

  switch (currentInteraction?.type) {
    case "input":
      return InputElement ? InputElement() : <UserInput
        onSubmit={handleUserInput}
        placeholder={"Napiš odpověď..."}
        buttonText="Odeslat"
      />
    case "multiple-choice":
      return  (
        <div className="flex flex-wrap gap-2">
          {currentInteraction.choices?.map((choice, index) => (
            ButtonElement ? ButtonElement(choice) : <button
              key={index}
              onClick={() => handleChoiceSelection(choice)}
              className="bg-purple-300 hover:bg-white-400 transition-colors py-2 px-4 rounded text-black font-medium flex-1"
            >
              {choice.label}
            </button>
          ))}
        </div>
      )
    default:
      return <div/>
  }
}