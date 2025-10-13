"use client";

import { useAudioManager } from "@/hooks/use-audio";
import {useEffect} from "react";

export default function Home() {
  const soundMap = {
    "overlay-on": { url: "/audio/vykreslovanie TECKY.wav" },
    "overlay-off": { url: "/audio/KONIEC ROZHRANIA.wav" },
    "loop": { url: "/audio/ZVUKOVY PODKRES.wav", opts: {loop:true} },
    "input-on": { url: "/audio/ODOMKNUTIE CHATU.wav" },
  }
  const { play, toggle, isPlaying, preloadAll } = useAudioManager();

  useEffect(() => {
    preloadAll(soundMap).then(() => {
      console.log("All sounds preloaded");
    });
  }, [preloadAll]);

  return (
    <>
      <button onClick={() => play("overlay-off")}>Click sound</button>
      <button onClick={() => toggle("loop")}>{isPlaying["loop"] ? "Pause" : "Play"} BG</button>
    </>
  );
}
