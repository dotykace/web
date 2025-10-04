// hooks/useAudioManager.tsx
import { useEffect, useRef, useState, useCallback } from "react";

type LayerName = "background" | "primary" | "music";

interface UseAudioManagerOptions {
  loop?: boolean;
  volume?: number;
}

export function useAudioManager() {
  // Keep refs per layer
  const audioRefs = useRef<Record<LayerName, HTMLAudioElement | null>>({
    background: null,
    primary: null,
    music: null,
  });

  // Track playback state
  const [isPlaying, setIsPlaying] = useState<Record<LayerName, boolean>>({
    background: false,
    primary: false,
    music: false,
  });

  const initAudio = useCallback(
    (layer: LayerName, src: string, opts: UseAudioManagerOptions = {}) => {
      if (audioRefs.current[layer]) {
        audioRefs.current[layer]?.pause();
        audioRefs.current[layer]!.src = "";
        audioRefs.current[layer]?.load();
        audioRefs.current[layer] = null;
      }

      if (!src) {
        console.warn("Audio initialization failed: no source");
        return null;
      }

      const audio = new Audio();

      // Explicitly set type if it's a wav
      if (src.endsWith(".wav")) {
        const source = document.createElement("source");
        source.src = src;
        source.type = "audio/wav";
        audio.appendChild(source);
      } else {
        audio.src = src;
      }

      audio.loop = opts.loop ?? false;
      audio.volume = opts.volume ?? 1.0;

      audio.addEventListener("ended", () => {
        setIsPlaying((prev) => ({ ...prev, [layer]: false }));
      });

      audioRefs.current[layer] = audio;
      return audio;
    },
    []
  );

  // --- Play a track in a given layer
  // IMPORTANT: This will re-init the audio element each time
  // so use toggle() to pause/resume instead
  const play = useCallback(
    async (layer: LayerName, src: string, opts?: UseAudioManagerOptions) => {
      const audio = initAudio(layer, src, opts);
      if (!audio) return;

      try {
        await audio.play();
        setIsPlaying((prev) => ({ ...prev, [layer]: true }));
      } catch (err) {
        console.error(`Failed to play ${layer} audio:`, err);
        setIsPlaying((prev) => ({ ...prev, [layer]: false }));
      }
    },
    [initAudio]
  );

  // --- Pause a specific layer
  const pause = useCallback((layer: LayerName) => {
    const audio = audioRefs.current[layer];
    if (audio && !audio.paused) {
      audio.pause();
      setIsPlaying((prev) => ({ ...prev, [layer]: false }));
    }
  }, []);

  // --- Stop (pause + cleanup)
  const stop = useCallback((layer: LayerName) => {
    const audio = audioRefs.current[layer];
    if (audio) {
      audio.pause();
      audio.src = "";
      audio.load();
      audioRefs.current[layer] = null;
      setIsPlaying((prev) => ({ ...prev, [layer]: false }));
    }
  }, []);

  const toggle = useCallback(
    async (layer: LayerName, src: string, opts?: UseAudioManagerOptions) => {
      const audio = audioRefs.current[layer];

      // If no audio exists OR new src → init & play fresh
      if (!audio || audio.src !== new URL(src, window.location.href).href) {
        await play(layer, src, opts);
        return;
      }

      // If paused → resume
      if (audio.paused) {
        try {
          await audio.play();
          setIsPlaying((prev) => ({ ...prev, [layer]: true }));
        } catch (err) {
          console.error(`Failed to resume ${layer} audio:`, err);
        }
      } else {
        // If playing → pause
        audio.pause();
        setIsPlaying((prev) => ({ ...prev, [layer]: false }));
      }
    },
    [play]
  );

  // --- Cleanup all on unmount
  useEffect(() => {
    return () => {
      (Object.keys(audioRefs.current) as LayerName[]).forEach((layer) => {
        stop(layer);
      });
    };
  }, [stop]);

  return { play, pause, toggle, stop, isPlaying };
}
