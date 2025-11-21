import { useEffect, useState } from "react";
import ScaleTemplate from "@/components/chapter4/ScaleTemplate";
import { useSharedAudio } from "@/context/AudioContext";
import type { ProcessedInteraction } from "@/interactions";

interface Interpretation {
  secondary: string;
  percentage: number;
  class: number;
  combo?: string;
}

interface Scale {
  id: string;
  voice?: string;
  next?: string;
  top: string;
  bottom: string;
  secondary: string;
}

const classifyData = (number: number) => {
  if (number >= 67) return 1; // high
  if (number <= 33) return 5; // low
  return 3; // medium
};
// connections = {A: B, B: C, C: A}
const interpretData = (
  connections: Record<string, string>,
  data: Record<string, number>
): Record<string, Interpretation> => {
  const interpretations: Record<string, Interpretation> = {};
  for (const key in data) {
    interpretations[key] = {
      secondary: connections[key],
      percentage: data[key],
      class: classifyData(data[key]),
    };
  }
  for (const key in interpretations) {
    const secondaryKey = connections[key];
    interpretations[
      key
    ].combo = `${key}${interpretations[key].class}${secondaryKey}${interpretations[secondaryKey].class}`;
  }
  return interpretations;
};

export default function Scales({
  currentInteraction,
  onComplete,
}: {
  currentInteraction: ProcessedInteraction;
  onComplete: (result: Record<string, Interpretation>) => void;
}) {
  const [data, setData] = useState<Record<string, number>>({});
  const [dataCollected, setDataCollected] = useState(false);

  const { playOnce, isPlaying, stop } = useSharedAudio();

  const scalesObject =
    (currentInteraction.scales as Record<string, Scale>) || {};
  const [currentScale, setCurrentScale] = useState<Scale | undefined>(
    scalesObject["A"]
  );

  useEffect(() => {
    if (dataCollected) {
      console.log("Final data:", data);
      const connections: Record<string, string> = {};
      for (const key in scalesObject) {
        connections[key] = scalesObject[key].secondary;
      }
      const result = interpretData(connections, data);
      onComplete(result);
    }
  }, [data, dataCollected, scalesObject, onComplete]);

  const updateData = (key: string, value: number) => {
    setData((prev) => ({
      ...prev,
      [key]: value, // dynamically update key
    }));
  };

  const updateScale = (number: number) => {
    if (!currentScale) return;
    updateData(currentScale.id, number);
    if (currentScale.voice) {
      stop(currentScale.voice);
    }
    if (!currentScale.next) {
      setDataCollected(true);
      return;
    }
    setCurrentScale(scalesObject[currentScale.next]);
  };

  useEffect(() => {
    if (!currentScale) return;
    if (currentScale.voice) {
      if (isPlaying[currentScale.voice]) return;
      const audio = {
        filename: currentScale.voice,
        type: "voice" as const,
        onFinish: () => {
          console.log("Played sound for scales:", currentScale.voice);
        },
      };
      playOnce(audio);
    }
  }, [currentScale, isPlaying, playOnce, stop]);

  if (!currentScale) return null;

  return (
    <ScaleTemplate
      topText={currentScale.top}
      bottomText={currentScale.bottom}
      onConfirm={updateScale}
      disabled={currentScale.voice ? isPlaying[currentScale.voice] : false}
      confirmationText={!currentScale.next ? "Potvrdit a dokončit" : undefined}
    />
  );
}
