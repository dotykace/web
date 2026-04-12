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
  "happy",
  "happy_1",
  "mad",
  "mute",
  "nerd",
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
      {/* Speech bubble */}
      <div className="relative max-w-md rounded-2xl bg-sky-500 px-5 py-4 text-white shadow-md">
        <p className="text-lg leading-snug">
          {text}
        </p>

        {/* bubble tail */}
        <div className="absolute left-4 -bottom-2 h-4 w-4 rotate-45 bg-sky-500" />
      </div>
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