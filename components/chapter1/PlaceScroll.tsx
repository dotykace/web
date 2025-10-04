import React, {useCallback, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {setToStorage} from "@/scripts/local-storage";
import ScrollableCards from "@/components/ScrollableCard";
import Place from "@/components/chapter1/Place";
import {useAudioManager} from "@/hooks/use-audio";


export default function PlaceScroll({ current, goToNext }) {
  const [showBackToChat, setShowBackToChat] = useState(false)

  const dotPosition = { start: 200 }

  const {play} = useAudioManager();

  useEffect(() => {
    if (current?.id === "back-to-chat") {
      setShowBackToChat(true);
    }
    console.log(current)
  }, [current]);

  const onScrollCard = useCallback(() => {
    if( current.type !== "card" ) {
      goToNext()
      return
    }
    else {
      if (current.nextCard) {
        play("primary", "/audio/SCROLLOVANIE.wav").then(()=>
        goToNext(current.nextCard))
      }
    }
  }, [ current, goToNext])

  const choiceCallback = (option, choice) => {
    console.log(option)
    if (option === "compare") {
      setShowBackToChat(true)
      goToNext("back-to-chat");
      return;
    }
    if (option === "choice") {
      setToStorage("finger-choice", choice);
      goToNext("finger-compare");
    }
  }
  return(
    <>
      {showBackToChat ? (
        <Button
          style={
            {
              position: "absolute",
              bottom: "50%",
              left: "5%",
              width: "90%",
            }
          }
          key={"back-to-chat-button"}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out"
          onClick={() => goToNext("overlay-off_a")}
        >
          Zpět do chatu
        </Button>
      ):(
        <Place
          dotPosition={dotPosition}
          onAnimationEnd={() => goToNext()}
          onReveal={() => {}}
        >
          {()=><ScrollableCards onScroll={onScrollCard} currentInteraction={current} onFinish={choiceCallback}/>}
        </Place>
      )}
    </>
  )
}