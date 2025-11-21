import React from "react";
import { AudioProvider, useSharedAudio } from "@/context/AudioContext";
import { useEffect } from "react";
import type { SoundMap } from "@/hooks/use-audio";

function AudioInitializer({
  soundMap,
  setLoaded,
}: {
  soundMap: SoundMap;
  setLoaded: (loaded: boolean) => void;
}) {
  const { preloadAll } = useSharedAudio();

  useEffect(() => {
    if (!soundMap) return;
    preloadAll(soundMap).then(() => {
      console.log("Sounds loaded");
      setLoaded?.(true);
    });
  }, [preloadAll, soundMap, setLoaded]);

  return null;
}
export default function AudioWrapper({
  children,
  soundMap,
  setLoaded,
}: {
  children: React.ReactNode;
  soundMap: SoundMap;
  setLoaded: (loaded: boolean) => void;
}) {
  return (
    <AudioProvider>
      <AudioInitializer soundMap={soundMap} setLoaded={setLoaded} />
      {children}
    </AudioProvider>
  );
}
