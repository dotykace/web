import CustomSend from "@/components/CustomSend";
import CustomPlay from "@/components/CustomPlay";
import {useEffect, useState} from "react";
import {readFromStorage, setToStorage} from "@/scripts/local-storage";
import ScrollableCards from "@/components/ScrollableCard";

export default function SpecialPlace({ currentInteraction, goToNextInteraction, visible, place, onFinish }) {
  if (!visible) return null;

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
      return <Testing currentInteraction={currentInteraction} goToNextInteraction={goToNextInteraction}/>
  }
}
function Testing({currentInteraction, goToNextInteraction}) {
  const [currentCard, setCurrentCard] = useState<{}|undefined>(undefined)
  const botName = readFromStorage("BN") ?? "Bot"

  const createCard = (interaction) => {
    let newCard = {
      avatar: "/placeholder.svg",
      username: botName,
      content: interaction.text(),
      delay: interaction.duration * 1000 || 0,
    }

    if (currentInteraction.id === "finger-choice") {
      console.log("Creating card for finger-choice interaction")
      newCard = {
        ...newCard,
        choices: [
          {text: "palec", callback: () => choiceCallback("palec")},
          {text: "ukazovák", callback: () => choiceCallback("ukazovák")},
          {text: "prostředníček", callback: () => choiceCallback("prostředníček")},
          {text: "prsteníček", callback: () => choiceCallback("prsteníček")},
          {text: "malíček", callback: () => choiceCallback("malíček")},
        ],
      }
    }
    return newCard;
  }

  const choiceCallback = (choice) => {
    setToStorage("finger-choice", choice);
    console.log("Choice selected:", choice);
    goToNextInteraction("back-to-chat");
  }

  const onScrollCard = () => {
    console.log("onScrollCard")
    if( !currentCard ) {
      console.log("No current card, skipping interaction")
      goToNextInteraction("1.31")
      return
    }
    goToNextInteraction()
  }

  useEffect(() => {
    console.log(currentCard)
  }, [currentCard]);

  useEffect(() => {
    if (currentInteraction?.type === "card") {
      console.log("PICE2")
      const newCard = createCard(currentInteraction);
      console.log("New Card:", newCard);
      setCurrentCard(newCard);
    }
  }, [currentInteraction]);

  return <ScrollableCards currentCard={ currentCard} onScroll={onScrollCard} nextCard={currentInteraction.id !== "finger-choice"} />
}