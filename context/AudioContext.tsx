// context/AudioContext.tsx
import React, {createContext, useContext, useEffect} from "react";
import { useAudioManager } from "@/hooks/use-audio";

const AudioContext = createContext<ReturnType<typeof useAudioManager> | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioManager = useAudioManager();

  useEffect(() => {
    return () => {
      // Close the shared AudioContext on app exit
      const ctx = (audioManager as any).audioContextRef?.current;
      if (ctx && ctx.state !== "closed") ctx.close();
    };
  }, [audioManager]);

  return <AudioContext.Provider value={audioManager}>{children}</AudioContext.Provider>;
};


export const useSharedAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useSharedAudio must be used within <AudioProvider>");
  }
  return ctx;
};
