"use client";

import { useAudioManager } from "@/hooks/use-audio";
import {useEffect} from "react";

export default function Home() {
  const soundMap = {
    "overlay-on": { url: "/audio/vykreslovanie TECKY.mp3" },
    "overlay-off": { url: "/audio/KONIEC ROZHRANIA.mp3" },
    "loop": { url: "/audio/ZVUKOVY PODKRES.mp3", opts: {loop:true} },
    "input-on": { url: "/audio/ODOMKNUTIE CHATU.mp3" },
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
