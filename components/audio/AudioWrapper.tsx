import {AudioProvider, useSharedAudio} from "@/context/AudioContext";
import {useEffect} from "react";

function AudioInitializer({soundMap}) {
  const { preloadAll } = useSharedAudio();

  useEffect(() => {
    preloadAll(soundMap).then(() => console.log("Sounds loaded"));
  }, [preloadAll]);

  return null;
}
export default function AudioWrapper({ children, soundMap }) {
  return (
    <AudioProvider>
      <AudioInitializer soundMap={soundMap}/>
      {children}
    </AudioProvider>
  );
}