import React, { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import VoiceVisualization from "@/components/VoiceVisualization";
import { useSharedAudio } from "@/context/AudioContext";
import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";

interface AudioItem {
  filename: string;
  onFinish: () => void;
  type?: "sound" | "voice";
}

export default function BasicAudioVisual({
  audio = null,
  id,
  children,
  coloring = "bg-white/10",
  progress = 50,
}: {
  audio: AudioItem | null;
  id: string;
  children?: React.ReactNode;
  coloring?: string;
  progress?: number;
}) {
  const playedForIdRef = useRef<string | null>(null);
  const audioRef = useRef(audio);

  // Keep audioRef in sync
  audioRef.current = audio;

  const { playOnce, stop } = useSharedAudio();

  React.useEffect(() => {
    // Only play if we have audio and haven't played for this id yet
    if (audioRef.current && playedForIdRef.current !== id) {
      playedForIdRef.current = id;
      playOnce({
        filename: audioRef.current.filename,
        onFinish: audioRef.current.onFinish,
        type: audioRef.current.type || "sound",
      });
    }
  }, [id, playOnce]);

  const skipInteraction = () => {
    // Use ref to get current audio value (avoids stale closure)
    const currentAudio = audioRef.current;
    if (!currentAudio) return;

    // Stop the audio first (this marks it as manually stopped)
    stop(currentAudio.filename);

    // Then call onFinish to advance to next interaction
    if (currentAudio.onFinish) {
      currentAudio.onFinish();
    }
  };

  return (
    <div className={`h-full overflow-hidden flex flex-col ${coloring}`}>
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md flex flex-col items-center justify-center text-center"
          >
            {children ?? <VoiceVisualization />}
          </motion.div>
        </AnimatePresence>

        {/* Skip Button - centered below content */}
        {audio && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={skipInteraction}
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm flex items-center gap-2 rounded-full px-4 py-2"
            >
              <SkipForward className="h-4 w-4" />
              <span>Přeskočit</span>
            </Button>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="p-6">
        <div className="max-w-lg mx-auto">
          <div className="h-3 bg-white/20 border border-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
