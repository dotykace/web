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
        <div className="flex flex-wrap gap-3 justify-center">
          {currentInteraction.choices?.map((choice, index) => (
            ButtonElement ? ButtonElement(choice) : <button
              key={index}
              onClick={() => handleChoiceSelection(choice)}
              className="active:scale-95 transition-all py-3 px-6 rounded-full text-white font-semibold shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#0EA5E9' }}
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