"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import useDB from "@/hooks/use-db";
import { useRouter } from "next/navigation";
import { readFromStorage, setToStorage } from "@/scripts/local-storage";
import AudioControl from "@/components/AudioControl";
import { SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChapterHeader from "@/components/ChapterHeader";

// Extracted components
import VoiceVisualization from "@/components/chapter2/VoiceVisualization";
import MusicStarAnimation from "@/components/chapter2/MusicStarAnimation";

// Types and constants
import {
  CHAPTER2_PROGRESS_KEY,
  TYPING_SPEED_MS,
  DEFAULT_DURATION_SECONDS,
  BUTTON_SHOW_DELAY_MS,
  type Chapter2Progress,
  type Interaction,
  type FlowData,
} from "@/components/chapter2/constants";

// Custom hooks
import { useChapter2Audio } from "@/hooks/use-chapter2-audio";

function Chapter2Content() {
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [currentInteractionId, setCurrentInteractionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [savedUserMessage, setSavedUserMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedExperience, setHasStartedExperience] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>();
  const [persistentDisplayText, setPersistentDisplayText] = useState<
    string | null
  >(null);

  // Use extracted audio hook
  const {
    audioEnabled,
    audioInitialized,
    setAudioInitialized,
    initializeAudio,
    playAudio,
    stopAllAudio,
    toggleAudio,
    voiceAudioRef,
  } = useChapter2Audio();

  // Refs for timers
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const buttonTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skipFlagRef = useRef(false);
  const mountedRef = useRef(true);

  const router = useRouter();
  const dbHook = useDB();

  useEffect(() => {
    setSelectedVoice(readFromStorage("selectedVoice"));
  }, []);

  // LocalStorage functions
  const saveProgressToLocalStorage = useCallback(
    (interactionId: string, message: string, started: boolean) => {
      const progress: Chapter2Progress = {
        currentInteractionId: interactionId,
        savedUserMessage: message,
        hasStartedExperience: started,
      };
      setToStorage(CHAPTER2_PROGRESS_KEY, progress);
    },
    [],
  );

  const loadProgressFromLocalStorage =
    useCallback((): Chapter2Progress | null => {
      return readFromStorage(CHAPTER2_PROGRESS_KEY);
    }, []);

  // Clear all timers helper
  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (buttonTimeoutRef.current) {
      clearTimeout(buttonTimeoutRef.current);
      buttonTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Load flow data
  useEffect(() => {
    const loadFlowData = async () => {
      try {
        const response = await fetch("/data/chapter2-flow.json");
        if (!response.ok) throw new Error("Failed to load flow data");
        const data: FlowData = await response.json();
        if (!mountedRef.current) return;

        setFlowData(data);

        const savedProgress = loadProgressFromLocalStorage();
        if (savedProgress) {
          setCurrentInteractionId(savedProgress.currentInteractionId);
          setSavedUserMessage(savedProgress.savedUserMessage);
          setHasStartedExperience(savedProgress.hasStartedExperience);
          setAudioInitialized(false);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading flow data:", error);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadFlowData();
  }, [loadProgressFromLocalStorage, setAudioInitialized]);

  // Save to Firestore
  const saveToFirestore = async (
    inputData: string,
    interactionId: string,
    choiceData?: { label: string; nextId: string },
  ) => {
    try {
      const docData: Record<string, unknown> = {
        interactionId,
        userInput: inputData,
        timestamp: serverTimestamp(),
        sessionId: `session_${Date.now()}`,
        chapter: "chapter2",
      };

      if (choiceData) {
        docData.choice = choiceData;
      }

      await addDoc(collection(db, "chapter2"), docData);
    } catch (error) {
      console.error("Error saving to Firestore:", error);
    }
  };

  // Type text animation
  const typeText = useCallback((text: string, callback?: () => void) => {
    if (!mountedRef.current) return;

    setIsTyping(true);
    setDisplayText("");

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    if (skipFlagRef.current) {
      setDisplayText(text);
      setIsTyping(false);
      skipFlagRef.current = false;
      if (callback) callback();
      return;
    }

    let charIndex = 0;
    let currentTypedText = "";

    typingIntervalRef.current = setInterval(() => {
      if (!mountedRef.current) {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        return;
      }

      if (charIndex < text.length) {
        currentTypedText += text[charIndex];
        setDisplayText(currentTypedText);
        charIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
        if (callback) callback();
      }
    }, TYPING_SPEED_MS);
  }, []);

  // Handle input save
  const handleInputSave = useCallback(
    async (interaction: Interaction) => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      if (inputValue.trim()) {
        await saveToFirestore(inputValue, currentInteractionId);
        if (interaction.label?.includes("Když držíš můj mobil")) {
          setSavedUserMessage(inputValue);
        }
      }

      setTimeLeft(null);
      setShowWarning(false);

      if (interaction["next-id"]) {
        setCurrentInteractionId(interaction["next-id"]);
      }
    },
    [inputValue, currentInteractionId],
  );

  // Process interaction
  const processInteraction = useCallback(
    (interaction: Interaction) => {
      if (!mountedRef.current) return;

      console.log(
        "Processing interaction:",
        currentInteractionId,
        interaction.type,
      );

      clearAllTimers();
      stopAllAudio();
      setShowButtons(false);
      setTimeLeft(null);
      setShowWarning(false);
      skipFlagRef.current = false;
      setIsTyping(false);
      setIsMusicPlaying(false);
      setHasPlayedOnce(false);

      const durationMs =
        (interaction.duration || DEFAULT_DURATION_SECONDS) * 1000;

      switch (interaction.type) {
        case "voice":
          if (interaction.sound) {
            const filePath = selectedVoice
              ? `${selectedVoice}/${interaction.sound}`
              : interaction.sound;

            const onFirstPlay =
              interaction.loop && interaction.button?.["show-after-first-play"]
                ? () => setHasPlayedOnce(true)
                : undefined;

            playAudio(filePath, "voice", interaction.loop, onFirstPlay);
          }
          setDisplayText(interaction.text || "");

          if (interaction.button) {
            if (interaction.button["show-after-first-play"]) {
              // Wait for first play callback
            } else if (interaction.button["wait_to_show"]) {
              buttonTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current) setShowButtons(true);
              }, interaction.button["wait_to_show"] * 1000);
            } else {
              setShowButtons(true);
            }
          } else if (interaction["next-id"]) {
            timeoutRef.current = setTimeout(() => {
              if (mountedRef.current)
                setCurrentInteractionId(interaction["next-id"]!);
            }, durationMs);
          }
          break;

        case "message":
          typeText(interaction.text || "", () => {
            if (!mountedRef.current) return;

            if (
              interaction.animation?.type === "normal" ||
              interaction.animation?.type === "choice"
            ) {
              timeoutRef.current = setTimeout(() => {
                if (mountedRef.current) setShowButtons(true);
              }, BUTTON_SHOW_DELAY_MS);
            } else if (interaction["next-id"]) {
              timeoutRef.current = setTimeout(() => {
                if (mountedRef.current)
                  setCurrentInteractionId(interaction["next-id"]!);
              }, durationMs);
            }
          });
          break;

        case "display":
          // Set persistent display text that stays at top until next display
          setPersistentDisplayText(interaction.text || "");
          if (interaction["next-id"]) {
            timeoutRef.current = setTimeout(
              () => {
                if (mountedRef.current)
                  setCurrentInteractionId(interaction["next-id"]!);
              },
              (interaction.duration || 2) * 1000,
            );
          }
          break;

        case "music":
          setCurrentInteractionId(interaction["next-id"]!);
          break;

        case "pause":
          setDisplayText("...");
          if (interaction["next-id"]) {
            timeoutRef.current = setTimeout(() => {
              if (mountedRef.current)
                setCurrentInteractionId(interaction["next-id"]!);
            }, durationMs);
          }
          break;

        case "loop":
          setDisplayText(interaction.text || "");
          setShowButtons(true);
          break;

        case "input":
          setDisplayText(interaction.text || interaction.label || "");
          setInputValue("");
          setShowButtons(true);

          if (interaction.duration) {
            setTimeLeft(interaction.duration);
            countdownIntervalRef.current = setInterval(() => {
              setTimeLeft((prev) => {
                if (!mountedRef.current || prev === null) return null;

                if (prev <= 1) {
                  handleInputSave(interaction);
                  return null;
                }

                if (
                  interaction["warning-after"] &&
                  prev === interaction["warning-after"]
                ) {
                  setShowWarning(true);
                }

                return prev - 1;
              });
            }, 1000);
          }
          break;

        case "show-message":
          setDisplayText(savedUserMessage || "Žádný vzkaz");
          if (interaction["next-id"]) {
            timeoutRef.current = setTimeout(() => {
              if (mountedRef.current)
                setCurrentInteractionId(interaction["next-id"]!);
            }, durationMs);
          }
          break;
      }
    },
    [
      currentInteractionId,
      typeText,
      playAudio,
      stopAllAudio,
      savedUserMessage,
      handleInputSave,
      selectedVoice,
      clearAllTimers,
    ],
  );

  // Handle delayed button display for voice interactions
  useEffect(() => {
    if (!flowData || !currentInteractionId) return;

    const currentInteraction = flowData.interactions[currentInteractionId];
    if (
      currentInteraction?.type === "voice" &&
      currentInteraction.button?.["show-after-first-play"] &&
      hasPlayedOnce
    ) {
      setShowButtons(true);
    }
  }, [hasPlayedOnce, currentInteractionId, flowData]);

  // Save progress to localStorage
  useEffect(() => {
    if (currentInteractionId && hasStartedExperience) {
      saveProgressToLocalStorage(
        currentInteractionId,
        savedUserMessage,
        hasStartedExperience,
      );
    }
  }, [
    currentInteractionId,
    savedUserMessage,
    hasStartedExperience,
    saveProgressToLocalStorage,
  ]);

  // Auto-initialize audio when loading from localStorage
  useEffect(() => {
    if (hasStartedExperience && !audioInitialized) {
      initializeAudio();
    }
  }, [hasStartedExperience, audioInitialized, initializeAudio]);

  // Handle button click
  const handleButtonClick = useCallback(
    async (button: { label: string; "next-id": string }) => {
      await initializeAudio();
      stopAllAudio();

      await saveToFirestore("", currentInteractionId, {
        label: button.label,
        nextId: button["next-id"],
      });

      setCurrentInteractionId(button["next-id"]);
    },
    [initializeAudio, stopAllAudio, currentInteractionId],
  );

  // Handle skip
  const handleSkip = useCallback(() => {
    if (!flowData || !currentInteractionId) return;

    const currentInteraction = flowData.interactions[currentInteractionId];

    // Stop any currently playing audio before advancing
    stopAllAudio();

    if (
      isTyping &&
      typingIntervalRef.current &&
      currentInteraction.type === "message"
    ) {
      skipFlagRef.current = true;
      typeText(currentInteraction.text || "");
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (currentInteraction["next-id"]) {
      setCurrentInteractionId(currentInteraction["next-id"]);
    }
  }, [flowData, currentInteractionId, isTyping, typeText, stopAllAudio]);

  // Process current interaction
  useEffect(() => {
    if (
      hasStartedExperience &&
      flowData &&
      currentInteractionId &&
      flowData.interactions[currentInteractionId]
    ) {
      processInteraction(flowData.interactions[currentInteractionId]);
    }
  }, [
    currentInteractionId,
    flowData,
    processInteraction,
    hasStartedExperience,
  ]);

  // Handle chapter completion
  useEffect(() => {
    if (flowData && currentInteractionId === "end" && dbHook) {
      dbHook.updateChapter(2, () => router.push("/menu")).then();
    }
  }, [currentInteractionId, flowData, dbHook, router]);

  const handleStartExperience = async () => {
    await initializeAudio();
    setHasStartedExperience(true);
    setCurrentInteractionId(flowData!.startInteractionId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-chapter2 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-white/30 border-t-purple-400 rounded-full animate-spin" />
          <span className="text-white/80 font-medium">Načítavam...</span>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (!flowData) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-chapter2 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl font-medium"
        >
          Chyba pri načítaní
        </motion.div>
      </div>
    );
  }

  // Start screen
  if (!hasStartedExperience) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-chapter2 flex items-center justify-center p-4 relative">
        {/* Decorative floating elements */}
        <div
          className="fixed w-20 h-20 bg-amber-400/30 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ top: "15%", left: "10%" }}
        />
        <div
          className="fixed w-16 h-16 bg-pink-400/25 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ top: "25%", right: "15%", animationDelay: "1s" }}
        />
        <div
          className="fixed w-24 h-24 bg-yellow-400/20 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ bottom: "20%", left: "20%", animationDelay: "2s" }}
        />
        <div
          className="fixed w-14 h-14 bg-fuchsia-400/25 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ bottom: "30%", right: "10%", animationDelay: "0.5s" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md space-y-6"
        >
          {/* Chapter number badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
            className="flex justify-center"
          >
            <div
              className="w-20 h-20 rounded-full bg-white border-2 border-purple-600 shadow-xl
                            flex items-center justify-center"
            >
              <span className="text-3xl font-bold text-purple-900">2</span>
            </div>
          </motion.div>

          {/* Main card */}
          <div className="bg-white rounded-2xl border-2 border-purple-600 p-8 text-center shadow-xl">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-2xl font-bold tracking-wide text-purple-900 mb-2"
            >
              Kapitola 2
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-purple-600 mb-8 font-medium tracking-wide text-sm"
            >
              Připrav se na další část příběhu
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartExperience}
              className="w-full bg-purple-600 hover:bg-purple-700 
                         text-white font-bold tracking-wide py-4 px-8 rounded-full shadow-lg shadow-purple-500/30
                         transition-all duration-300"
            >
              Spustit
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Resume screen
  if (hasStartedExperience && !audioInitialized) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-chapter2 flex items-center justify-center p-4 relative">
        {/* Decorative floating elements */}
        <div
          className="fixed w-20 h-20 bg-amber-400/30 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ top: "15%", left: "10%" }}
        />
        <div
          className="fixed w-16 h-16 bg-pink-400/25 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ top: "25%", right: "15%", animationDelay: "1s" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-white rounded-2xl border-2 border-purple-600 p-8 text-center shadow-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-600 shadow-lg shadow-purple-500/30
                        flex items-center justify-center"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold tracking-wide text-purple-900 mb-2">
            Pokračovat?
          </h2>
          <p className="text-purple-600 mb-8 font-medium tracking-wide text-sm">
            Klikni pro pokračování v příběhu
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              await initializeAudio();
              setAudioInitialized(true);
              processInteraction(flowData.interactions[currentInteractionId]);
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 
                       text-white font-bold tracking-wide py-4 px-8 rounded-full shadow-lg shadow-purple-500/30
                       transition-all duration-300"
          >
            Pokračovat
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentInteraction = flowData.interactions[currentInteractionId];
  const showSkipButton = true;

  return (
    <div className="h-screen overflow-hidden bg-gradient-chapter2 flex flex-col">
      {/* Chapter Header */}
      <ChapterHeader chapterNumber={2} />

      {/* Persistent Display Text - Shows below header */}
      <AnimatePresence mode="wait">
        {persistentDisplayText && (
          <motion.div
            key={persistentDisplayText}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="shrink-0 z-20 pt-2 px-4"
          >
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-full px-6 py-3 border-2 border-purple-600 shadow-lg">
                <p className="text-purple-900 text-center font-bold tracking-wider text-sm uppercase">
                  {persistentDisplayText}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 min-h-0">
        <div className="w-full max-w-lg relative">
          <AudioControl
            onClick={() => {
              initializeAudio();
              toggleAudio();
            }}
            audioEnabled={audioEnabled}
          />
          <div className="space-y-6">
            {/* Display Text with Voice/Music Visualization */}
            <div className="min-h-[200px] flex flex-col items-center justify-center">
              {currentInteraction?.type === "voice" ? (
                <>
                  <VoiceVisualization isActive={!isTyping} />
                  {displayText && (
                    <p className="text-white text-base leading-relaxed text-center mt-4 px-4 font-medium tracking-wide drop-shadow-lg">
                      {displayText}
                    </p>
                  )}
                </>
              ) : currentInteraction?.type === "music" ? (
                <>
                  <MusicStarAnimation isActive={isMusicPlaying} />
                  {displayText && (
                    <p className="text-white text-xl leading-relaxed text-center font-semibold tracking-wide drop-shadow-lg">
                      {displayText}
                    </p>
                  )}
                </>
              ) : (
                <div className="min-h-[120px] flex items-center justify-center px-4">
                  <p className="text-white text-xl leading-relaxed text-center font-semibold tracking-wide drop-shadow-lg">
                    {displayText}
                    {isTyping && (
                      <span className="animate-pulse ml-1 text-white/70">
                        |
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Input Field */}
            {currentInteraction?.type === "input" && showButtons && (
              <div className="space-y-4">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Napiš svou odpověď..."
                  className="bg-white/10 border-2 border-white/30 text-white placeholder:text-white/50 
                             resize-none rounded-2xl font-medium tracking-wide focus:border-white/50 focus:ring-white/20 backdrop-blur-sm"
                  rows={3}
                />
                {timeLeft !== null && (
                  <div className="text-center">
                    <div className="text-white font-bold text-sm tracking-wide drop-shadow-md">
                      Zostáva: {Math.floor(timeLeft / 60)}:
                      {(timeLeft % 60).toString().padStart(2, "0")}
                    </div>
                    {showWarning && currentInteraction["warning-text"] && (
                      <div className="text-yellow-300 text-sm mt-2 font-bold tracking-wide drop-shadow-md">
                        {currentInteraction["warning-text"]}
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => handleInputSave(currentInteraction)}
                  disabled={!inputValue.trim()}
                  className="w-full bg-white hover:bg-white/90 
                             disabled:bg-white/30 disabled:text-white/50
                             text-purple-900 font-bold tracking-wide py-4 px-8 rounded-full shadow-lg
                             disabled:shadow-none transition-all duration-300 active:scale-[0.98]"
                >
                  {currentInteraction["save-label"] || "Uložiť"}
                </button>
              </div>
            )}

            {/* Choice Buttons */}
            {showButtons && currentInteraction?.animation?.buttons && (
              <div className="space-y-3">
                {currentInteraction.animation.buttons.map((button, index) => (
                  <button
                    key={index}
                    onClick={() => handleButtonClick(button)}
                    className="w-full bg-white hover:bg-white/90 
                               text-purple-900 font-bold tracking-wide py-4 px-8 rounded-full shadow-lg
                               transition-all duration-300 active:scale-[0.98]"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            )}

            {/* Loop/Continue Button */}
            {showButtons && currentInteraction?.button && (
              <button
                onClick={() => handleButtonClick(currentInteraction.button!)}
                className="w-full bg-white hover:bg-white/90 
                           text-purple-900 font-bold tracking-wide py-4 px-8 rounded-full shadow-lg
                           transition-all duration-300 active:scale-[0.98]"
              >
                {currentInteraction.button.label}
              </button>
            )}
          </div>
        </div>

        {/* Skip Button */}
        {showSkipButton && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleSkip}
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
          <Progress
            value={Math.min(
              100,
              (Object.keys(flowData.interactions).indexOf(
                currentInteractionId,
              ) /
                Object.keys(flowData.interactions).length) *
                100,
            )}
            className="h-3 bg-white/20 border border-white/30 rounded-full [&>div]:bg-white [&>div]:rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function Chapter2() {
  return <Chapter2Content />;
}
