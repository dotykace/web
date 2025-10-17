import {useEffect, useState} from "react";
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
    },
    {
      "type": "scale",
      "name": "D",
      "secondary": "E",
      "top": "sebevědomí",
      "bottom": "stud",
      "next-id": "scale-E"
    },
    {
      "type": "scale",
      "name": "C",
      "secondary": "A",
      "top": "vděk",
      "bottom": "rozhořčení",
      "next-id": "scale-D"
    },
    {
      "type": "scale",
      "name": "E",
      "secondary": "C",
      "top": "zábava a inspirace",
      "bottom": "prázdnota",
      "next-id": "gallery"
    },
  ]

  const [data, setData] = useState({});
  const [dataCollected, setDataCollected] = useState(false);

  useEffect(() => {
    if(dataCollected){
      console.log("Final data:", data);
    }
  }, [data]);


  const updateData = (key, value) => {
    setData(prev => ({
      ...prev,
      [key]: value, // dynamically update key
    }));
  };

  const updateScale = (number) => {
    updateData(scales[currentScaleIndex].name, number);
    setCurrentScaleIndex((currentScaleIndex + 1) % scales.length);
    if (isLastScale){
      setDataCollected(true);
    }
  }

  const currentScale = scales[currentScaleIndex];
  const isLastScale = currentScaleIndex === scales.length - 1;

  return (
    <ScaleTemplate
      topText={currentScale.top}
      bottomText={currentScale.bottom}
      onConfirm={updateScale}
      confirmationText={isLastScale ? "Potvrdit a dokončit" : undefined}
    />
  )
}