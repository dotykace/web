// hooks/useAudioManager.tsx
import { useEffect, useRef, useState, useCallback } from "react";

interface UseAudioManagerOptions {
  loop?: boolean;
  volume?: number; // 0.0 to 1.0
}

interface Sound {
  buffer: AudioBuffer;
  loop: boolean;
  volume: number;
}

interface PlayingInstance {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
}

export function useAudioManager() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Preloaded sounds map: key -> Sound
  const soundsRef = useRef<Record<string, Sound>>({});

  // Playing instances map: key -> currently playing sources
  const playingRef = useRef<Record<string, PlayingInstance[]>>({});

  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      console.log("Creating new AudioContext");
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  // --- Load a sound and decode it
  const loadSound = useCallback(async (key: string, url: string, opts?: UseAudioManagerOptions) => {
    const context = getAudioContext();
    if (!context) return;
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await context.decodeAudioData(arrayBuffer);

    soundsRef.current[key] = {
      buffer,
      loop: opts?.loop ?? false,
      volume: opts?.volume ?? 1,
    };
    setIsPlaying((prev) => ({ ...prev, [key]: false }));
  }, []);

  // --- Preload multiple sounds at once
  const preloadAll = useCallback(
    async (soundMap: Record<string, { url: string; opts?: UseAudioManagerOptions }>) => {
      const promises = Object.entries(soundMap).map(([key, { url, opts }]) =>
        loadSound(key, url, opts)
      );
      await Promise.all(promises);
    },
    [loadSound]
  );

  // --- Play a sound by key
  const play = useCallback(
    async (key: string) => {
      const sound = soundsRef.current[key];
      if (!sound) {
        console.warn(`Sound ${key} not loaded`);
        return;
      }

      const context = getAudioContext();
      if(!context) {
        console.warn("AudioContext not available");
        return;
      }
      if (context.state === "suspended") {
        console.log("Resuming suspended AudioContext");
        await context.resume();
      }
      console.log(`Playing sound ${key}`);
      const gainNode = context.createGain();
      gainNode.gain.value = sound.volume;

      const source = context.createBufferSource();
      source.buffer = sound.buffer;
      source.loop = sound.loop;

      source.connect(gainNode).connect(context.destination);
      source.start();
      console.log(`Started sound ${key}`);

      // Track instance
      if (!playingRef.current[key]) playingRef.current[key] = [];
      playingRef.current[key].push({ source, gainNode });

      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
        playingRef.current[key] = playingRef.current[key].filter(
          (inst) => inst.source !== source
        );
        if (playingRef.current[key].length === 0) {
          setIsPlaying((prev) => ({ ...prev, [key]: false }));
        }
      };

      setIsPlaying((prev) => ({ ...prev, [key]: true }));
    },
    []
  );

  // --- Stop all instances of a sound
  const stop = useCallback((key: string) => {
    const instances = playingRef.current[key];
    if (!instances) return;

    instances.forEach(({ source, gainNode }) => {
      source.stop();
      source.disconnect();
      gainNode.disconnect();
    });

    playingRef.current[key] = [];
    setIsPlaying((prev) => ({ ...prev, [key]: false }));
  }, []);

  // --- Toggle a sound
  const toggle = useCallback(
    (key: string) => {
      if (isPlaying[key]) {
        stop(key);
      } else {
        console.log("Toggling play for", key);
        play(key);
      }
    },
    [isPlaying, play, stop]
  );

  // --- Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(playingRef.current).forEach(stop);
      // audioContextRef.current?.close();
    };
  }, [stop]);

  return { preloadAll, play, stop, toggle, isPlaying };
}
