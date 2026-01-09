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
    const depth = totalInStack - 1 - stackIndex;

    // Calculate stack effect values
    const scale = 1 - depth * 0.04;
    const yOffset = depth * -16;
    const opacity = isTopCard ? 1 : Math.max(0.4, 1 - depth * 0.2);
    const zIndex = totalInStack - depth;
    const blur = isTopCard ? 0 : depth * 1;

    return (
      <motion.div
        key={interaction.id || `card-${stackStartIndex + stackIndex}`}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{
          opacity,
          y: yOffset,
          scale,
          filter: `blur(${blur}px)`,
        }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute inset-x-0 mx-auto w-full max-w-md px-6"
        style={{ zIndex }}
      >
        <div
          className={`rounded-3xl px-8 py-10 shadow-2xl transition-all duration-300 
                      backdrop-blur-md border ${
                        interaction.isUserResponse
                          ? "bg-white/20 border-white/30"
                          : "bg-white/10 border-white/20"
                      } ${isTopCard ? "ring-1 ring-white/20" : ""}`}
        >
          <p className="text-xl leading-relaxed text-center text-white font-light tracking-wide">
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
        {/* Progress Indicator */}
        {visibleHistory.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 left-0 right-0 z-20"
          >
            <div className="w-full max-w-md mx-auto px-6">
              <div className="backdrop-blur-md bg-white/5 rounded-full border border-white/10 px-4 py-2">
                <div className="flex gap-2 justify-center items-center">
                  {visibleHistory.slice(-8).map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`rounded-full transition-all duration-300 ${
                        index === visibleHistory.slice(-8).length - 1
                          ? "bg-white h-2 w-8"
                          : "bg-white/30 h-2 w-2"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Card Stack Container */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="relative w-full h-72">
            <AnimatePresence mode="popLayout">
              {stackedCards.map((interaction, index) =>
                renderCard(interaction, index, stackedCards.length)
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="w-full max-w-md mx-auto px-6 pb-10 pt-4">
            <AnimatePresence mode="wait">
              {/* Continue Button - for message type */}
              {isMessage && (
                <motion.button
                  key="continue"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  onClick={handleContinue}
                  className="w-full backdrop-blur-md bg-white/10 hover:bg-white/20 
                             border border-white/20 hover:border-white/30
                             text-white font-light tracking-wide py-4 px-8 rounded-3xl shadow-2xl
                             transition-all duration-300 active:scale-[0.98] 
                             flex items-center justify-center gap-3"
                >
                  <span className="text-lg">Pokračovat</span>
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </motion.svg>
                </motion.button>
              )}

              {/* Input Field - for input type */}
              {needsInput && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-5 shadow-2xl"
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
                  key="choices"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-3"
                >
                  {currentInteraction.choices?.map(
                    (choice: any, index: number) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        onClick={() => handleChoiceResponse(choice)}
                        className="w-full backdrop-blur-md bg-white/10 hover:bg-white/20 
                                   border border-white/20 hover:border-white/30
                                   text-white font-light tracking-wide py-4 px-6 rounded-3xl shadow-2xl
                                   transition-all duration-300 active:scale-[0.98]"
                      >
                        {choice.type}
                      </motion.button>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
