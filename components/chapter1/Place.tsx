import GlowingDot from "@/components/GlowingDot";
import SineWaveObject from "@/components/chapter1/SinWaveObject";

export default function Place({dotPosition, revealComponent, onAnimationEnd, onReveal}) {
  const sinWaveProps = {
    endXPercent: dotPosition.x ?? 0.5,
    endYPercent: dotPosition.y ?? 0.5,
    offset: dotPosition.offset ?? 20,
    startX: dotPosition.start ?? 0
  }
  const animatedObject = <div className={"h-5 w-5 rounded-full"} style={{backgroundColor: "white"}}/>
  const object = <GlowingDot onClick={onReveal} visible={true} revealComponent={revealComponent} size={40}/>
  return <SineWaveObject onFinish={onAnimationEnd} animatedObject={animatedObject} object={object} {...sinWaveProps}/>
}