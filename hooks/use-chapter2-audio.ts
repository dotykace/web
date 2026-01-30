"use client";

import { useRef, useCallback, useState, useEffect } from "react";

type AudioChannel = "voice" | "sfx";

interface UseChapter2AudioOptions {
  onFirstPlayComplete?: () => void;
}

export function useChapter2Audio(options?: UseChapter2AudioOptions) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);

  const CHANNEL_VOLUMES: Record<AudioChannel, number> = {
    voice: 1.0,
    sfx: 0.7,
  };

  const getAudioRef = (channel: AudioChannel) => {
    return channel === "voice" ? voiceAudioRef : sfxAudioRef;
  };

  const initializeAudio = useCallback(async () => {
    if (audioInitialized) return;

    try {
      // Play a silent audio to unlock audio context on mobile Safari
      const silentAudio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
      );
      silentAudio.volume = 0;
      await silentAudio.play();
      silentAudio.pause();
      setAudioInitialized(true);
    } catch (error) {
      console.warn("Audio initialization failed:", error);
    }
  }, [audioInitialized]);

  const playAudio = useCallback(
    async (
      src: string,
      channel: AudioChannel,
      loop = false,
      onFirstPlayComplete?: () => void
    ) => {
      if (!audioEnabled || !audioInitialized) {
        console.warn(
          `Audio playback skipped for ${channel} channel (${src}): audioEnabled=${audioEnabled}, audioInitialized=${audioInitialized}`
        );
        return;
      }

      const audioRef = getAudioRef(channel);
      const volume = CHANNEL_VOLUMES[channel];

      // Stop current audio on this channel and clear previous handlers
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.onended = null;
      }

      try {
        const audio = new Audio(`/audio/${src}`);
        audio.loop = loop;
        audio.volume = volume;
        audio.preload = "auto";
        audioRef.current = audio;

        // Handle first play completion for looping audio
        if (loop && onFirstPlayComplete) {
          audio.onended = () => {
            onFirstPlayComplete();
            audio.currentTime = 0;
            audio.play().catch(console.error);
          };
        }

        await audio.play();
      } catch (error) {
        console.warn(`Audio playback failed for ${channel} channel (${src}):`, error);
      }
    },
    [audioEnabled, audioInitialized]
  );

  const stopAllAudio = useCallback(() => {
    [voiceAudioRef, sfxAudioRef].forEach((audioRef) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.onended = null;
        audioRef.current = null;
      }
    });
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev);
  }, []);

  // Handle audio muting
  useEffect(() => {
    [voiceAudioRef, sfxAudioRef].forEach((audioRef) => {
      if (audioRef.current) {
        audioRef.current.muted = !audioEnabled;
      }
    });
  }, [audioEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  return {
    audioEnabled,
    audioInitialized,
    setAudioInitialized,
    initializeAudio,
    playAudio,
    stopAllAudio,
    toggleAudio,
    voiceAudioRef,
  };
}
