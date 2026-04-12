import Image from "next/image";
import React from "react";
// todo: make this automated based on the contents of doty folder
const DOTY_NAMES = [
  "wink",
  "wow",
  "alert",
  "aweful",
  "blush",
  "cheer",
  "cheering",
  "confused",
  "cry",
  "happy",
  "happy_1",
  "mad",
  "mute",
  "nerd",
  "ok",
  "pressure",
  "puzzled",
  "sad",
  "smile",
  "strange",
  "thrilled"
]
const DotySpeechBubble = ({text}) => {
  const pickRandomDotyFace = () => {
    return DOTY_NAMES[Math.floor(Math.random() * DOTY_NAMES.length)];
  }

  return (
    <>
      <p className="mt-2 mb-6">
        {text}
      </p>
      <Image
        src={`/images/doty/${pickRandomDotyFace()}.svg`}
        alt="Doty"
        width={96}
        height={96}
        className="w-24 h-24 drop-shadow-lg"
      />
    </>
  )
}

export default DotySpeechBubble