import {useEffect, useState} from "react";
import ScaleTemplate from "@/components/chapter4/ScaleTemplate";

export default function Scales({currentInteraction, onComplete}) {

  const [data, setData] = useState({});
  const [dataCollected, setDataCollected] = useState(false);

  useEffect(() => {
    if(dataCollected){
      console.log("Final data:", data);
    }
  }, [data]);

  const scalesObject = currentInteraction.scales;
  const [currentScale, setCurrentScale] = useState(scalesObject["A"]);

  const updateData = (key, value) => {
    setData(prev => ({
      ...prev,
      [key]: value, // dynamically update key
    }));
  };

  const updateScale = (number) => {
    if(!currentScale) return;
    updateData(currentScale.id, number);
    if(!currentScale.next){
      setDataCollected(true);
      return;
    }
    setCurrentScale(scalesObject[currentScale.next])
  }

  if (!currentScale) return null;

  return (
    <ScaleTemplate
      topText={currentScale.top}
      bottomText={currentScale.bottom}
      onConfirm={updateScale}
      confirmationText={!(currentScale.next) ? "Potvrdit a dokončit" : undefined}
    />
  )
}