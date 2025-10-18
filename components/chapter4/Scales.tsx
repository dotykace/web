import {useEffect, useState} from "react";
import ScaleTemplate from "@/components/chapter4/ScaleTemplate";

const classifyData = (number) => {
  if (number >= 67) return "high"; // high
  if (number <= 33) return "low"; // low
  return "medium"; // medium
}
// connections = {A: B, B: C, C: A}
const interpretData = (connections, data) => {
  const interpretations = {};
  for (const key in data){
    interpretations[key] = {
      secondary: connections[key],
      percentage: data[key],
      class: classifyData(data[key]),
    };
  }
  for (const key in interpretations){
    const secondaryKey = connections[key];
    interpretations[key].combo = `${interpretations[key].class} + ${interpretations[secondaryKey].class}`;
  }
  return interpretations;
}

export default function Scales({currentInteraction, onComplete}) {

  const [data, setData] = useState({});
  const [dataCollected, setDataCollected] = useState(false);

  useEffect(() => {
    if(dataCollected){
      console.log("Final data:", data);
      const connections = {}
      for (const key in scalesObject){
        connections[key] = scalesObject[key].secondary;
      }
      const result = interpretData(connections, data);
      onComplete(result);
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