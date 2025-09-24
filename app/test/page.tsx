"use client";

import { useAudioManager } from "@/hooks/use-audio";

export default function Home() {
  const { play, pause, toggle, stop, isPlaying } = useAudioManager();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Layered Audio Example</h1>

      {/* Background Music */}
      <div className="space-x-2">
        <button
          onClick={() => play("background", "/audio/playful_intro_loop.mp3", { loop: true })}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Play Background
        </button>
        <button
          onClick={() => pause("background")}
          className="px-4 py-2 rounded bg-yellow-600 text-white"
        >
          Pause Background
        </button>
        <button
          onClick={() => stop("background")}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          Stop Background
        </button>
        <span>
          {isPlaying.background ? "🎶 Playing BG" : "⏹️ BG Stopped"}
        </span>
      </div>

      {/* Primary Sound */}
      <div className="space-x-2">
        <button
          onClick={() => toggle("primary", "/audio/track0.mp3")}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          {isPlaying.primary ? "Pause Primary" : "Play Primary"}
        </button>
        <button
          onClick={() => stop("primary")}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          Stop Primary
        </button>
        <span>
          {isPlaying.primary ? "🔊 Playing Primary" : "⏹️ Primary Stopped"}
        </span>
      </div>
    </div>
  );
}
