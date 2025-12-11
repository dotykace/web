"use client";
import { AnimatePresence, motion } from "framer-motion";
import InputArea from "@/components/InputArea";
import { useEffect, useState, useRef } from "react";
import { useChatContext } from "@/context/ChatContext";
import { useAudioManager } from "@/hooks/use-audio";
import { useRouter } from "next/navigation";

const MESSAGE_DELAY_MS = 200;

export default function CardSequence() {
  const { currentInteraction, goToNextInteraction } = useChatContext();
  const [history, setHistory] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { preloadAll, playPreloaded } = useAudioManager();
  const soundMap = {
    "sound-test": { filename: "vykreslovanie TECKY.mp3" },
    "game-confirm": { filename: "JINGEL - pozitiv.mp3" },
  };

  useEffect(() => {
    preloadAll(soundMap).then(() => {
      console.log("All sounds preloaded");
    });
  }, []);

  useEffect(() => {
    if (!currentInteraction) return;
    if (currentInteraction.type === "music") {
      playPreloaded(currentInteraction.key);
      return;
    }
    setHistory((prev) => {
      const last = prev.at(-1);
      if (last?.id === currentInteraction.id) {
        return prev;
      }
      return [...prev, currentInteraction];
    });
  }, [currentInteraction]);

  useEffect(() => {
    if (history.length === 0) {
      setDisplayCount(0);
      return;
    }

    const needsMoreMessages = displayCount < history.length;
    if (!needsMoreMessages) return;

    const timer = setTimeout(() => {
      setDisplayCount((prev) => Math.min(history.length, prev + 1));
    }, MESSAGE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [history.length, displayCount]);

  const visibleHistory = history.slice(0, displayCount);
  const router = useRouter();

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleHistory.length]);

  useEffect(() => {
    if (currentInteraction?.type === "checkpoint") {
      router.push("/menu");
    }
  }, [currentInteraction, router]);

  const prevVisibleCountRef = useRef(0);
  useEffect(() => {
    if (visibleHistory.length > prevVisibleCountRef.current) {
      setCurrentIndex(visibleHistory.length - 1);
    }
    prevVisibleCountRef.current = visibleHistory.length;
  }, [visibleHistory.length]);

  const handleMessageClick = () => {
    if (currentInteraction?.type === "message") {
      goToNextInteraction();
    }
  };

  const goToMessage = (index: number) => {
    if (visibleHistory.length === 0) return;
    const boundedIndex = Math.min(
      visibleHistory.length - 1,
      Math.max(0, index)
    );
    setDisplayCount((prev) => Math.max(prev, boundedIndex + 1));
    setCurrentIndex(boundedIndex);

    if (!scrollContainerRef.current) return;
    const messageElement = scrollContainerRef.current.children[0]?.children[
      boundedIndex
    ] as HTMLElement;
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const renderMessage = (interaction: any, index: number) => {
    const isActive = index === currentIndex;
    const isInput =
      interaction.type === "input" || interaction.type === "multiple-choice";

    return (
      <motion.div
        key={interaction.id || index}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.35 }}
        className={`mb-4 flex ${
          isInput ? "justify-end pr-4" : "justify-start pl-2"
        }`}
        onClick={handleMessageClick}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md transition-all duration-300 ${
            isInput
              ? "bg-white/10 backdrop-blur-sm border border-white/20"
              : "bg-white/95 backdrop-blur-sm"
          } ${isActive ? "ring-2 ring-white/50" : ""}`}
        >
          <p
            className={`text-base leading-relaxed ${
              isInput ? "text-white" : "text-gray-800"
            }`}
          >
            {typeof interaction.text === "function"
              ? interaction.text()
              : interaction.text}
          </p>
          {isInput && currentInteraction?.id === interaction.id && (
            <div className="mt-3">
              <InputArea />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      <div className="w-full max-w-2xl mx-auto flex h-screen flex-col px-4">
        {/* Header */}
        <div className="sticky top-0 z-20 pt-8 pb-2 backdrop-blur-md">
          <div className="bg-white/10 rounded-2xl border border-white/20 px-6 py-4">
            <h2 className="text-white text-lg font-semibold">Zprávy</h2>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto pb-28 pt-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
          }}
        >
          <div className="py-4">
            <AnimatePresence>
              {visibleHistory.map((interaction, index) =>
                renderMessage(interaction, index)
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Navigation */}
        {visibleHistory.length > 1 && (
          <div className="sticky bottom-0 z-20 pb-6 pt-2 backdrop-blur-md">
            <div className="bg-white/10 rounded-2xl border border-white/20 px-4 py-3">
              <div className="flex items-center justify-between mb-2"></div>
              <div className="flex gap-2 justify-center overflow-x-auto pb-1">
                {visibleHistory.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToMessage(index)}
                    className={`flex-shrink-0 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-white w-8"
                        : "bg-white/30 w-2 hover:bg-white/50"
                    }`}
                    aria-label={`Go to message ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
