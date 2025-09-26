import CustomSend from "@/components/chapter1/CustomSend";
import SineWaveObject from "@/components/chapter1/SinWaveObject";
import GlowingDot from "@/components/GlowingDot";
import {useChatContext} from "@/context/ChatContext";
import {useCallback, useEffect} from "react";

export default function PlaceSend({current, goToNext}) {
  const dotPosition = { x: 0.9, y: 0.6, offset: 20 }
  const handleClick = useCallback(() => {
    goToNext()
  },[current, goToNext])

  const sendGlowing = () => {
    if (!current) return false;
    return current.type === "request";
  }

  const revealComponent = CustomSend({handleClick, isGlowing: sendGlowing})
  return <Place
    dotPosition={dotPosition}
    revealComponent={revealComponent}
    onAnimationEnd={() => goToNext("1.10")}
    onReveal={() => goToNext("1.11")}
  />

}

function Place({dotPosition, revealComponent, onAnimationEnd, onReveal}) {
  const animatedObject = <div className={"h-10 w-10 rounded-full"} style={{backgroundColor: "blue"}}/>
  const object = <GlowingDot onClick={onReveal} color={"red"} visible={true} revealComponent={revealComponent} size={40}/>
  return <SineWaveObject onFinish={onAnimationEnd} animatedObject={animatedObject} object={object} endXPercent={dotPosition.x} endYPercent={dotPosition.y} offset={dotPosition.offset}/>
}