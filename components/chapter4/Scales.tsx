import {useState} from "react";
import ScaleTemplate from "@/components/chapter4/ScaleTemplate";

export default function Scales() {
  const [currentScaleIndex, setCurrentScaleIndex] =  useState(0);
  const scales = [
    {
    "type": "scale",
    "name": "A",
    "secondary": "B",
    "top": "propojení",
    "bottom": "osamělost",
    },
    {
      "type": "scale",
      "name": "B",
      "secondary": "D",
      "top": "klid a bezpečí",
      "bottom": "napětí a úzkost",
    }
  ]

  const updateScale = (number) => {
    console.log(number)
    setCurrentScaleIndex((currentScaleIndex + 1) % scales.length);
  }

  const currentScale = scales[currentScaleIndex];

  return <ScaleTemplate topText={currentScale.top} bottomText={currentScale.bottom} onConfirm={updateScale} />


}