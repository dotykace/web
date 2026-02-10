import GlowingDot from "@/components/GlowingDot"
import SineWaveObject from "@/components/chapter1/SinWaveObject"
import { useState } from "react"

export default function Place({
  dotPosition,
  onAnimationEnd,
  onReveal,
  children,
}) {
  const sinWaveProps = {
    endXPercent: dotPosition.x ?? 0.5,
    endYPercent: dotPosition.y ?? 0.5,
    offset: dotPosition.offset ?? 20,
    startX: dotPosition.start ?? 0,
  }
  const [revealed, setRevealed] = useState(false)
  const handleReveal = () => {
    if (revealed) return
    setRevealed(true)
    if (onReveal) onReveal()
  }
  if (revealed) return children()
  const animatedObject = (
    <div
      className={"h-5 w-5 rounded-full"}
      style={{ backgroundColor: "white" }}
    />
  )
  const object = <GlowingDot onClick={handleReveal} visible={true} size={40} />
  return (
    <SineWaveObject
      speed={0.007}
      onFinish={onAnimationEnd}
      animatedObject={animatedObject}
      object={object}
      {...sinWaveProps}
    />
  )
}
