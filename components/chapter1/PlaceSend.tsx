import CustomSend from "@/components/chapter1/CustomSend";
import {useCallback} from "react";
import Place from "@/components/chapter1/Place";
import {useSharedAudio} from "@/context/AudioContext";

export default function PlaceSend({current, goToNext}) {
  const dotPosition = { x: 0.9, y: 0.6, offset: 20 }
  const {play} = useSharedAudio();
  const sendGlowing = useCallback(() => current.type === "request", [current]);
  const handleClick = useCallback(() => {
    if( current.type === "request" ){
      play("send").then(goToNext)
    }
  },[current, goToNext, play])

  const Request = ({text, visible}) => {
    if (!visible) return null;
    return (
      <div className={"request absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center text-3xl p-6 py-8 bg-black/50 rounded-3xl "}>{text}</div>
    )
  }

  return (
    <>
      <Request text={current.text()} visible={current.type === "request"}/>
      <Place
        dotPosition={dotPosition}
        onAnimationEnd={() => goToNext("1.10")}
        onReveal={() => goToNext("1.11")}
      >
        {() => <div
          style={{position: "absolute", left: "calc(90% - 20px)", top: "calc(60% - 20px)"}}
        >
          {CustomSend({onClick: handleClick, isGlowing: sendGlowing})}
        </div>}
      </Place>
    </>
    )
}