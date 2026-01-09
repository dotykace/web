"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useChatContext } from "@/context/ChatContext";
import { useAudioManager } from "@/hooks/use-audio";
import { useRouter } from "next/navigation";
import UserInput from "@/components/UserInput";

const MESSAGE_DELAY_MS = 200;
const MAX_VISIBLE_CARDS = 4;

export default function CardSequence() {
  const {
    currentInteraction,
    goToNextInteraction,
    handleUserInput,
    handleChoiceSelection,
  } = useChatContext();
  const [history, setHistory] = useState<any[]>([]);
  const [displayCount, setDisplayCount] = useState(0);
  const { preloadAll, playPreloaded } = useAudioManager();
  const router = useRouter();

  const soundMap = {
    "sound-test": { filename: "vykreslovanie TECKY.mp3" },
    "game-confirm": { filename: "JINGEL - pozitiv.mp3" },
  };

  // Add user response to history and then call the original handler
  const handleUserResponse = useCallback(
    (text: string) => {
      const userMessage = {
        id: `user-response-${Date.now()}`,
        text: text,
        isUserResponse: true,
      };
      setHistory((prev) => [...prev, userMessage]);
      setDisplayCount((prev) => prev + 1);
      handleUserInput(text);
    },
    [handleUserInput]
  );

  const handleChoiceResponse = useCallback(
    (choice: any) => {
      const userMessage = {
        id: `user-choice-${Date.now()}`,
        text: choice.type || choice.label || choice,
        isUserResponse: true,
      };
      setHistory((prev) => [...prev, userMessage]);
      setDisplayCount((prev) => prev + 1);
      handleChoiceSelection(choice);
    },
    [handleChoiceSelection]
  );

  const handleContinue = () => {
    if (currentInteraction?.type === "message") {
      goToNextInteraction();
    }
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

  useEffect(() => {
    if (currentInteraction?.type === "checkpoint") {
      router.push("/menu");
    }
  }, [currentInteraction, router]);

  const visibleHistory = history.slice(0, displayCount);

  // Get the last N cards for the stack effect
  const stackedCards = visibleHistory.slice(-MAX_VISIBLE_CARDS);
  const stackStartIndex = Math.max(
    0,
    visibleHistory.length - MAX_VISIBLE_CARDS
  );

  // Check interaction types
  const needsInput = currentInteraction?.type === "input";
  const needsChoice = currentInteraction?.type === "multiple-choice";
  const isMessage = currentInteraction?.type === "message";

  const renderCard = (
    interaction: any,
    stackIndex: number,
    totalInStack: number
  ) => {
    const isTopCard = stackIndex === totalInStack - 1;
    const depth = totalInStack - 1 - stackIndex; // 0 for top card, 1 for second, etc.

    // Calculate stack effect values
    const scale = 1 - depth * 0.05;
    const yOffset = depth * -12;
    const opacity = isTopCard ? 1 : Math.max(0.3, 1 - depth * 0.25);
    const zIndex = totalInStack - depth;

    return (
      <motion.div
        key={interaction.id || `card-${stackStartIndex + stackIndex}`}
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{
          opacity,
          y: yOffset,
          scale,
        }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute inset-x-0 mx-auto w-full max-w-md px-4"
        style={{ zIndex }}
      >
        <div
          className={`rounded-3xl px-6 py-8 shadow-2xl transition-all duration-300 ${
            interaction.isUserResponse
              ? "bg-amber-400/95 text-gray-900"
              : "bg-white/95 backdrop-blur-md text-gray-800"
          } ${isTopCard ? "ring-2 ring-white/30" : ""}`}
        >
          <p className="text-lg leading-relaxed text-center">
            {typeof interaction.text === "function"
              ? interaction.text()
              : interaction.text}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-chapter0">
      <div className="w-full max-w-2xl mx-auto flex h-screen flex-col px-4">
        {/* Card Stack Container */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="relative w-full h-64">
            <AnimatePresence mode="popLayout">
              {stackedCards.map((interaction, index) =>
                renderCard(interaction, index, stackedCards.length)
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="w-full max-w-2xl mx-auto px-4 pb-8 pt-4">
            {/* Continue Button - for message type */}
            {isMessage && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={handleContinue}
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 
                           text-white font-semibold py-4 px-8 rounded-2xl shadow-lg
                           transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
              >
                Pokračovat
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            )}

            {/* Input Field - for input type */}
            {needsInput && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4"
              >
                <UserInput
                  onSubmit={handleUserResponse}
                  placeholder="Napiš odpověď..."
                  buttonText="Odeslat"
                />
              </motion.div>
            )}

            {/* Choice Buttons - for multiple-choice type */}
            {needsChoice && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-3 justify-center"
              >
                {currentInteraction.choices?.map(
                  (choice: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleChoiceResponse(choice)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30
                               text-white font-semibold py-3 px-6 rounded-full shadow-lg
                               transition-all duration-200 active:scale-95"
                    >
                      {choice.type}
                    </button>
                  )
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Dots */}
        {visibleHistory.length > 1 && (
          <div className="fixed top-8 left-0 right-0 z-20">
            <div className="w-full max-w-2xl mx-auto px-4">
              <div className="flex gap-1.5 justify-center">
                {visibleHistory.slice(-10).map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === visibleHistory.slice(-10).length - 1
                        ? "bg-white w-6"
                        : "bg-white/30 w-1.5"
                    }`}
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
