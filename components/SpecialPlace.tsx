import CustomSend from "@/components/CustomSend";
import CustomPlay from "@/components/CustomPlay";
import {useCallback, useEffect, useRef} from "react";
import {setToStorage} from "@/scripts/local-storage";
import ScrollableCards from "@/components/ScrollableCard";
import {useChatContext} from "@/context/ChatContext";

export default function SpecialPlace({ visible, place, onFinish }) {
  if (!visible) return null;

  const {goToNextInteraction} = useChatContext()

  const finishCustomSend = () => {
    goToNextInteraction("place-2");
    onFinish();
  }
  switch (place){
    case "place-1":
      return <CustomSend onFinish={finishCustomSend} onClick={()=> goToNextInteraction("1.10")}/>
    case "place-2":
      return <CustomPlay onClick={()=>goToNextInteraction("1.21")} onFinish={()=>goToNextInteraction("input-place-2")}/>
    case "place-3":
      return <CustomScroll goToNextInteraction={goToNextInteraction} onFinish={onFinish}/>
  }
}
function CustomScroll({goToNextInteraction, onFinish}) {

  const {currentInteraction} = useChatContext()
  const interactionRef = useRef(currentInteraction);

// Always keep it updated
  useEffect(() => {
    interactionRef.current = currentInteraction;
  }, [currentInteraction]);

  const choiceCallback = (option, choice) => {
    console.log(option)
    if (option === "compare") {
      onFinish();
      goToNextInteraction("back-to-chat");
      return;
    }
    if (option === "choice") {
      setToStorage("finger-choice", choice);
      goToNextInteraction("finger-compare");
    }
  }

  const onScrollCard = useCallback(() => {

    const interaction = interactionRef.current;
    if( interaction.id === "1.30" ) {
      goToNextInteraction("1.31")
      return
    }
    else {
      if (interaction.type === "card" && interaction.nextCard) {
        goToNextInteraction(interaction.nextCard)
      }
    }
  }, [ goToNextInteraction])

  return <ScrollableCards onScroll={onScrollCard} currentInteraction={currentInteraction} onFinish={choiceCallback}/>
}