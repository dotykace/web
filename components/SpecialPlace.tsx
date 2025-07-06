import CustomSend from "@/components/CustomSend";
import CustomPlay from "@/components/CustomPlay";
import {useCallback, useEffect, useState} from "react";
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
      return <Testing currentInteraction={currentInteraction} goToNextInteraction={goToNextInteraction} onFinish={onFinish}/>
  }
}
function Testing({currentInteraction, goToNextInteraction, onFinish}) {
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
    onFinish();
    goToNextInteraction("back-to-chat");
  }

  const onScrollCard = () => {
    console.log("onScrollCard")
    if( currentInteraction.id === "1.30" ) {
      console.log("No current card, skipping interaction")
      goToNextInteraction("1.31")
      return
    }
    else {
      if (currentInteraction.type === "card" && currentInteraction.nextCard) {
        console.log("Scrolling card, changing interaction")
        goToNextInteraction(currentInteraction.nextCard)
      }
    }
  }

  useEffect(() => {
    console.log("Testing component mounted with interaction:", currentInteraction);
  }, [currentInteraction]);

  const getCurrentCard = useCallback(() => {
    if (currentInteraction?.type === "card") {
      console.log("Creating card for interaction:", currentInteraction);
      return createCard(currentInteraction);
    }
    return undefined;
  },[currentInteraction])

  return <ScrollableCards currentCard={ getCurrentCard()} onScroll={onScrollCard} nextCard={currentInteraction.id !== "finger-choice"} />
}