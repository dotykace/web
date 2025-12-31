"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { useChatContext } from "@/context/ChatContext";
import { useAudioManager } from "@/hooks/use-audio";
import { useRouter } from "next/navigation";
import UserInput from "@/components/UserInput";

const MESSAGE_DELAY_MS = 200;

export default function CardSequence() {
  const { currentInteraction, goToNextInteraction, handleUserInput, handleChoiceSelection } = useChatContext();
  const [history, setHistory] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { preloadAll, playPreloaded } = useAudioManager();
  const soundMap = {
    "sound-test": { filename: "vykreslovanie TECKY.mp3" },
    "game-confirm": { filename: "JINGEL - pozitiv.mp3" },
  };

  // Add user response to history and then call the original handler
  const handleUserResponse = useCallback((text: string) => {
    // Add user's response as a message bubble
    const userMessage = {
      id: `user-response-${Date.now()}`,
      text: text,
      isUserResponse: true,
    };
    setHistory((prev) => [...prev, userMessage]);
    setDisplayCount((prev) => prev + 1);
    
    // Call the original handler
    handleUserInput(text);
  }, [handleUserInput]);

  const handleChoiceResponse = useCallback((choice: any) => {
    // Add user's choice as a message bubble
    const userMessage = {
      id: `user-choice-${Date.now()}`,
      text: choice.type || choice.label || choice,
      isUserResponse: true,
    };
    setHistory((prev) => [...prev, userMessage]);
    setDisplayCount((prev) => prev + 1);
    
    // Call the original handler
    handleChoiceSelection(choice);
  }, [handleChoiceSelection]);

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

  // Check if current interaction needs input
  const needsInput =
    currentInteraction?.type === "input" ||
    currentInteraction?.type === "multiple-choice";

  const renderMessage = (interaction: any, index: number) => {
    const isActive = index === currentIndex;
    // User responses are shown on the right (these are messages with isUserResponse flag)
    const isUserResponse = interaction.isUserResponse === true;
    // Input prompts are shown on the left like regular messages
    const isInputPrompt =
      interaction.type === "input" || interaction.type === "multiple-choice";

    return (
      <motion.div
        key={interaction.id || index}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.35 }}
        className={`mb-4 flex ${
          isUserResponse ? "justify-end pr-4" : "justify-start pl-2"
        }`}
        onClick={handleMessageClick}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md transition-all duration-300 ${
            isUserResponse
              ? "bg-amber-400 text-gray-900"
              : "bg-white/95 backdrop-blur-sm text-gray-800"
          } ${isActive ? "ring-2 ring-amber-400/70" : ""}`}
        >
          <p className="text-base leading-relaxed">
            {typeof interaction.text === "function"
              ? interaction.text()
              : interaction.text}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600">
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
          className="flex-1 overflow-y-auto pt-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
            paddingBottom: needsInput ? "180px" : "100px",
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

        {/* Fixed Input Area at Bottom - Messenger Style */}
        {needsInput && (
          <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md bg-gradient-to-t from-indigo-600/90 to-transparent">
            <div className="w-full max-w-2xl mx-auto px-4 pb-6 pt-4">
              <div className="bg-white/10 rounded-2xl border border-white/20 p-4">
                {currentInteraction?.type === "input" ? (
                  <UserInput
                    onSubmit={handleUserResponse}
                    placeholder="Napiš odpověď..."
                    buttonText="Odeslat"
                  />
                ) : currentInteraction?.type === "multiple-choice" ? (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {currentInteraction.choices?.map((choice: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleChoiceResponse(choice)}
                        className="bg-amber-400 hover:bg-amber-500 active:scale-95 transition-all py-3 px-6 rounded-full text-gray-900 font-semibold shadow-lg hover:shadow-xl"
                      >
                        {choice.type}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Carousel Navigation - Only show when not in input mode */}
        {visibleHistory.length > 1 && !needsInput && (
          <div className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-md">
            <div className="w-full max-w-2xl mx-auto px-4 pb-6 pt-2">
              <div className="bg-white/10 rounded-2xl border border-white/20 px-4 py-3">
                <div className="flex gap-2 justify-center overflow-x-auto pb-1">
                  {visibleHistory.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToMessage(index)}
                      className={`flex-shrink-0 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "bg-amber-400 w-8"
                          : "bg-white/30 w-2 hover:bg-amber-300/50"
                      }`}
                      aria-label={`Go to message ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
