"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Volume2, VolumeX, Check, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChapterHeader from "@/components/ChapterHeader";
import useDB from "@/hooks/use-db";
import { useRouter } from "next/navigation";
import { readFromStorage } from "@/scripts/local-storage";
import AudioControl from "@/components/AudioControl";

// Voice Visualization Component (similar to Chapter 2)
const VoiceVisualization = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
      {/* Background animated circles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-orange-100 animate-pulse`}
            style={{
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
      {/* Central phone character with pulsing effect */}
      <div className="relative z-10">
        <div
          className={`relative transition-all duration-1000 ${
            isActive ? "animate-pulse scale-110" : "scale-100"
          }`}
        >
          <img
            src="/images/phone-character-simple.png"
            alt="Phone Character"
            className="w-24 h-24 drop-shadow-lg"
          />
          {/* Animated rings around character */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping" />
              <div
                className="absolute inset-0 rounded-full border-2 border-orange-300 animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute inset-0 rounded-full border-2 border-orange-200 animate-ping"
                style={{ animationDelay: "1s" }}
              />
            </>
          )}
        </div>
        {/* Sound waves */}
        {isActive && (
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 bg-orange-500 rounded-full animate-pulse"
                style={{
                  height: `${20 + i * 8}px`,
                  right: `${i * 8}px`,
                  top: "50%",
                  transform: "translateY(-50%)",
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AnimationStyles = () => (
  <style jsx>{`
    @keyframes twinkle {
      0%,
      100% {
        opacity: 0.3;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
    }
    .animate-twinkle {
      animation: twinkle 1.5s ease-in-out infinite;
    }
  `}</style>
);

interface Interaction {
  type: string;
  text?: string;
  duration?: number;
  "next-id"?: string;
  animation?: {
    type: string;
    buttons?: Array<{
      label: string;
      "next-id": string;
    }>;
    options?: string[];
    button?: {
      label: string;
      "next-id": string;
    };
  };
  src?: string;
  sound?: string; // For voice type
  loop?: boolean;
  label?: string;
  "save-label"?: string;
  "warning-after"?: number;
  "warning-text"?: string;
  "countdown-last"?: number;
  pause?: number;
  button?: {
    label: string;
    "next-id": string;
    persistent?: boolean;
  };
  source?: string;
}

interface FlowData {
  id: string;
  startInteractionId: string;
  interactions: Record<string, Interaction>;
}

function Chapter3Content() {
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [currentInteractionId, setCurrentInteractionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [hasStartedExperience, setHasStartedExperience] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);

  // Audio channels
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const skipFlagRef = useRef(false);
  const mountedRef = useRef(true);
  const currentInteractionIdRef = useRef<string>("");
  const lastProcessedIdRef = useRef<string>("");
  const processInteractionRef = useRef<
    ((interaction: Interaction) => void) | null
  >(null);

  // Refs for functions used in processInteraction to avoid stale closures
  const playAudioRef = useRef<
    | ((
        src: string,
        channel: "voice" | "sfx" | "music",
        loop?: boolean,
        onEnded?: () => void,
      ) => Promise<void>)
    | null
  >(null);
  const typeTextRef = useRef<
    ((text: string, callback?: () => void) => void) | null
  >(null);
  const handleInputSaveRef = useRef<
    ((interaction: Interaction) => Promise<void>) | null
  >(null);
  const selectedVoiceRef = useRef<string | undefined>(undefined);

  const [selectedVoice, setSelectedVoice] = useState<string | undefined>();

  const router = useRouter();

  const dbHook = useDB();

  useEffect(() => {
    const voice = readFromStorage("selectedVoice") as string | undefined;
    setSelectedVoice(voice);
    selectedVoiceRef.current = voice;
  }, []);

  // Keep refs in sync with state to avoid circular dependencies
  useEffect(() => {
    currentInteractionIdRef.current = currentInteractionId;
  }, [currentInteractionId]);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  // Detect if device is desktop/laptop
  useEffect(() => {
    const checkIsDesktop = () => {
      // Check screen width (notebooks are typically 1024px+)
      const isLargeScreen = window.innerWidth >= 1024;
      // Check if device has hover capability (typically desktop/laptop)
      const hasHover = window.matchMedia("(hover: hover)").matches;
      // Check if device has fine pointer (mouse)
      const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

      setIsDesktop(isLargeScreen && hasHover && hasFinePointer);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
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
    // Clean up all remaining audio channels
    [voiceAudioRef, sfxAudioRef].forEach((audioRef) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    });
  }, []);

  // Initialize audio context for mobile Safari
  const initializeAudio = useCallback(async () => {
    if (audioInitialized) return;
    try {
      // Play a silent audio to unlock audio context
      const silentAudio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
      );
      silentAudio.volume = 0;
      await silentAudio.play();
      silentAudio.pause();
      setAudioInitialized(true);
    } catch (error) {
      console.warn("Audio initialization failed:", error);
    }
  }, [audioInitialized]);

  useEffect(() => {
    mountedRef.current = true; // Reset on mount (fixes React Strict Mode issue)
    loadFlowData();
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  const loadFlowData = async () => {
    try {
      const response = await fetch("/data/chapter3-flow.json");
      if (!response.ok) throw new Error("Failed to load flow data");
      const data: FlowData = await response.json();
      if (!mountedRef.current) return;
      setFlowData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading flow data:", error);
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Enhanced saveToFirestore to include choice data
  const saveToFirestore = useCallback(
    async (
      inputData: string | string[],
      interactionId: string,
      interactionType: string,
      choiceData?: { label: string; nextId: string },
    ) => {
      try {
        const docData: any = {
          interactionId,
          responseValue: inputData,
          interactionType,
          timestamp: serverTimestamp(),
          sessionId: `session_${Date.now()}`,
          chapter: "chapter3",
        };
        // Add choice data if provided
        if (choiceData) {
          docData.choice = choiceData;
        }
        await addDoc(collection(db, "chapter3"), docData);
      } catch (error) {
        console.error("Error saving to Firestore:", error);
      }
    },
    [],
  );

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
    }, 30);
  }, []);

  // Keep typeText ref in sync
  useEffect(() => {
    typeTextRef.current = typeText;
  }, [typeText]);

  // Multi-channel audio playback
  const playAudio = useCallback(
    async (
      src: string,
      channel: "voice" | "sfx" | "music",
      loop = false,
      onEnded?: () => void,
    ) => {
      if (!audioEnabled || !audioInitialized) {
        console.warn(
          `Audio playback skipped for ${channel} channel (${src}): audioEnabled=${audioEnabled}, audioInitialized=${audioInitialized}`,
        );
        return;
      }
      let audioRef: React.MutableRefObject<HTMLAudioElement | null>;
      let volume: number;
      switch (channel) {
        case "voice":
          audioRef = voiceAudioRef;
          volume = 1.0;
          break;
        case "sfx":
          audioRef = sfxAudioRef;
          volume = 0.7;
          break;
        case "music":
          audioRef = musicAudioRef;
          volume = 0.8;
          break;
      }
      // Stop current audio on this channel
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      try {
        const audio = new Audio(`/audio/${src}`);
        audio.loop = loop;
        audio.volume = volume;
        audio.preload = "auto";
        // Handle audio end event
        audioRef.current = audio;
        audio.onended = () => {
          if (mountedRef.current && audioRef.current === audio) {
            if (loop) {
              audio.currentTime = 0;
              audio.play().catch(console.error);
            } else if (onEnded) {
              onEnded();
            }
          }
        };
        await audio.play();
      } catch (error) {
        console.warn(
          `Audio playback failed for ${channel} channel (${src}):`,
          error,
        );
      }
    },
    [audioEnabled, audioInitialized],
  );

  // Keep playAudio ref in sync
  useEffect(() => {
    playAudioRef.current = playAudio;
  }, [playAudio]);

  // Stop all audio
  const stopAllAudio = useCallback(() => {
    [voiceAudioRef, sfxAudioRef, musicAudioRef].forEach((audioRef) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    });
  }, []);

  const handleInputSave = useCallback(
    async (interaction: Interaction) => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (inputValue.trim()) {
        await saveToFirestore(
          inputValue,
          currentInteractionIdRef.current,
          "input",
        );
      }
      setTimeLeft(null);
      setShowWarning(false);
      if (interaction["next-id"]) {
        setCurrentInteractionId(interaction["next-id"]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputValue],
  );

  // Keep handleInputSave ref in sync
  useEffect(() => {
    handleInputSaveRef.current = handleInputSave;
  }, [handleInputSave]);

  const processInteraction = useCallback(
    (interaction: Interaction) => {
      if (!mountedRef.current) return;

      // Vyčisti časovače
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);

      // Resetuj iba voice a sfx (hudbu nechaj)
      [voiceAudioRef, sfxAudioRef].forEach((audioRef) => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
          audioRef.current = null;
        }
      });

      setShowButtons(false);
      setTimeLeft(null);
      setShowWarning(false);
      setSelectedOptions([]);
      skipFlagRef.current = false;
      setIsTyping(false);

      switch (interaction.type) {
        case "voice":
          if (interaction.sound) {
            const onAudioEnd = () => {
              if (!mountedRef.current) return;
              if (
                interaction.animation?.type === "choice" ||
                interaction.animation?.type === "multiselect"
              ) {
                setShowButtons(true);
              } else if (interaction["next-id"]) {
                setCurrentInteractionId(interaction["next-id"]!);
              }
            };
            const voice = selectedVoiceRef.current;
            const filePath = voice
              ? `${voice}/${interaction.sound}`
              : interaction.sound;
            console.log("Interaction sound file path:", filePath);
            if (playAudioRef.current) {
              playAudioRef.current(
                filePath,
                "voice",
                interaction.loop,
                onAudioEnd,
              );
            }
          }
          setDisplayText(interaction.text || "");
          if (interaction.button) setShowButtons(true);
          break;

        case "input":
          setDisplayText(interaction.text || interaction.label || "");
          setInputValue(""); // <-- toto nechaj, aby sa input pole vždy vyresetovalo
          setShowButtons(true);
          if (interaction.duration) {
            setTimeLeft(interaction.duration);
            countdownIntervalRef.current = setInterval(() => {
              setTimeLeft((prev) => {
                if (!mountedRef.current || prev === null) return null;
                if (prev <= 1) {
                  if (handleInputSaveRef.current) {
                    handleInputSaveRef.current(interaction);
                  }
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

        // ostatné typy nechaj tak ako sú...
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Keep processInteraction in a ref to avoid dependency issues
  useEffect(() => {
    processInteractionRef.current = processInteraction;
  }, [processInteraction]);

  // Enhanced handleButtonClick to save choice data
  const handleButtonClick = useCallback(
    async (button: { label: string; "next-id": string }) => {
      await initializeAudio(); // Ensure audio is initialized on any user interaction
      stopAllAudio();
      // Save choice to Firestore
      await saveToFirestore("", currentInteractionIdRef.current, "choice", {
        label: button.label,
        nextId: button["next-id"],
      });
      setCurrentInteractionId(button["next-id"]);
    },
    [initializeAudio, stopAllAudio],
  );

  const handleOptionToggle = useCallback((option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  }, []);

  const handleMultiselectSave = useCallback(
    async (interaction: Interaction) => {
      await saveToFirestore(
        selectedOptions,
        currentInteractionIdRef.current,
        "multiselect",
      );
      if (interaction.animation?.button?.["next-id"]) {
        setCurrentInteractionId(interaction.animation.button["next-id"]);
      }
    },
    [selectedOptions],
  );

  const handleSkip = useCallback(() => {
    if (!flowData || !currentInteractionId) return;
    const currentInteraction = flowData.interactions[currentInteractionId];

    // Stop any currently playing audio before advancing
    [voiceAudioRef, sfxAudioRef, musicAudioRef].forEach((audioRef) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    });

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
  }, [flowData, currentInteractionId, isTyping, typeText]);

  // Process current interaction only if experience has started
  useEffect(() => {
    if (
      hasStartedExperience &&
      flowData &&
      currentInteractionId &&
      flowData.interactions[currentInteractionId] &&
      lastProcessedIdRef.current !== currentInteractionId && // Prevent re-processing same interaction
      processInteractionRef.current
    ) {
      lastProcessedIdRef.current = currentInteractionId;
      processInteractionRef.current(
        flowData.interactions[currentInteractionId],
      );
    }
  }, [currentInteractionId, flowData, hasStartedExperience]);

  // Handle chapter completion
  useEffect(() => {
    if (flowData && currentInteractionId === "end" && dbHook) {
      dbHook.updateChapter(3, () => router.push("/menu")).then();
    }
  }, [currentInteractionId, flowData, dbHook, router]);

  // Handle audio muting
  useEffect(() => {
    [voiceAudioRef, sfxAudioRef].forEach((audioRef) => {
      if (audioRef.current) {
        audioRef.current.muted = !audioEnabled;
      }
    });
  }, [audioEnabled]);

  const handleStartExperience = async () => {
    await initializeAudio();
    setHasStartedExperience(true);
    setCurrentInteractionId(flowData!.startInteractionId); // Set initial interaction after start
  };

  if (isLoading) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-white/30 border-t-orange-200 rounded-full animate-spin" />
          <span className="text-white/80 font-medium">Načítavam...</span>
        </motion.div>
      </div>
    );
  }

  if (!flowData) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
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

  // Show start button if experience hasn't started
  if (!hasStartedExperience) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
        {/* Decorative elements */}
        <div
          className="fixed w-24 h-24 bg-yellow-300/30 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ top: "15%", left: "10%" }}
        />
        <div
          className="fixed w-20 h-20 bg-orange-300/25 rounded-full pointer-events-none blur-xl animate-pulse"
          style={{ top: "25%", right: "15%", animationDelay: "1s" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md space-y-6"
        >
          {/* Chapter badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-white border-2 border-orange-500 shadow-xl flex items-center justify-center">
              <span className="text-3xl font-bold text-orange-600">3</span>
            </div>
          </motion.div>

          {/* Main card */}
          <div className="bg-white rounded-2xl border-2 border-orange-500 p-8 text-center shadow-xl">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-2xl font-bold text-orange-600 mb-2"
            >
              Kapitola 3
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-orange-500 mb-8 font-medium text-sm"
            >
              Pre spustenie zážitku kliknite na tlačidlo
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Button
                onClick={handleStartExperience}
                className="w-full bg-orange-500 hover:bg-orange-600 
                           text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-orange-500/30
                           transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Spustiť
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentInteraction = flowData.interactions[currentInteractionId];

  const showSkipButton = true;
  // isDesktop && // Only show on desktop/laptop devices
  // currentInteraction &&
  // currentInteraction["next-id"] &&
  // !currentInteraction.animation?.buttons &&
  // currentInteraction.type !== "input" &&
  // currentInteraction.type !== "loop" &&
  // !currentInteraction.button &&
  // currentInteraction.animation?.type !== "multiselect"

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 flex flex-col relative">
      {/* Chapter Header */}
      <ChapterHeader chapterNumber={3} />

      <AnimationStyles />
      {/* Decorative background pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300/25 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-32 right-16 w-20 h-20 bg-orange-300/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-28 h-28 bg-yellow-200/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-40 right-10 w-16 h-16 bg-red-300/25 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 min-h-0">
        <div className="w-full max-w-lg">
          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentInteractionId}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <AudioControl
                  onClick={() => {
                    initializeAudio();
                    setAudioEnabled(!audioEnabled);
                  }}
                  audioEnabled={audioEnabled}
                />
                <div className="space-y-6">
                  {/* Display Text with Voice Visualization */}
                  <div className="min-h-[200px] flex flex-col items-center justify-center">
                    {currentInteraction?.type === "voice" ? (
                      <>
                        <VoiceVisualization isActive={!isTyping} />
                        {displayText && (
                          <p className="text-white text-sm leading-relaxed text-center mt-4 px-4 font-medium drop-shadow-lg">
                            {displayText}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="min-h-[120px] flex items-center justify-center px-4">
                        <p className="text-white text-xl leading-relaxed text-center font-semibold drop-shadow-lg">
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
                        placeholder="Napíš svoju odpoveď..."
                        className="bg-white/10 border-2 border-white/30 text-white placeholder:text-white/50 
                                   resize-none rounded-2xl font-medium focus:border-white/50 focus:ring-white/20 backdrop-blur-sm"
                        rows={3}
                      />
                      {timeLeft !== null && (
                        <div className="text-center">
                          <div className="text-white text-sm font-bold drop-shadow-md">
                            Zostáva: {Math.floor(timeLeft / 60)}:
                            {(timeLeft % 60).toString().padStart(2, "0")}
                          </div>
                          {showWarning &&
                            currentInteraction["warning-text"] && (
                              <div className="text-yellow-300 text-sm mt-1 font-bold drop-shadow-md">
                                {currentInteraction["warning-text"]}
                              </div>
                            )}
                        </div>
                      )}
                      <Button
                        onClick={() => handleInputSave(currentInteraction)}
                        className="w-full bg-white hover:bg-white/90 
                                   disabled:bg-white/30 disabled:text-white/50
                                   text-orange-600 font-bold rounded-full shadow-lg disabled:shadow-none
                                   transition-all duration-300 active:scale-[0.98]"
                        disabled={!inputValue.trim()}
                      >
                        {currentInteraction["save-label"] || "Uložiť"}
                      </Button>
                    </div>
                  )}

                  {/* Choice Buttons */}
                  {showButtons &&
                    currentInteraction?.animation?.type === "choice" &&
                    currentInteraction.animation.buttons && (
                      <div className="space-y-3">
                        {currentInteraction.animation.buttons.map(
                          (button, index) => (
                            <motion.div
                              key={index}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Button
                                onClick={() => handleButtonClick(button)}
                                className="w-full bg-white hover:bg-white/90 
                                           text-orange-600 font-bold rounded-full py-3 h-auto whitespace-normal 
                                           shadow-lg transition-all duration-300 active:scale-[0.98]"
                              >
                                {button.label}
                              </Button>
                            </motion.div>
                          ),
                        )}
                      </div>
                    )}

                  {/* Multiselect Options */}
                  {showButtons &&
                    currentInteraction?.animation?.type === "multiselect" &&
                    currentInteraction.animation.options && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          {currentInteraction.animation.options.map(
                            (option, index) => (
                              <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Button
                                  onClick={() => handleOptionToggle(option)}
                                  className={`w-full rounded-full font-bold py-3 h-auto whitespace-normal transition-all duration-300 ${
                                    selectedOptions.includes(option)
                                      ? "bg-white text-orange-600 shadow-lg"
                                      : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                                  }`}
                                >
                                  {selectedOptions.includes(option) && (
                                    <Check className="h-4 w-4 mr-2" />
                                  )}
                                  {option}
                                </Button>
                              </motion.div>
                            ),
                          )}
                        </div>
                        {currentInteraction.animation.button && (
                          <Button
                            onClick={() =>
                              handleMultiselectSave(currentInteraction)
                            }
                            className="w-full bg-white hover:bg-white/90 
                                       text-orange-600 font-bold rounded-full shadow-lg mt-4
                                       transition-all duration-300 active:scale-[0.98]"
                          >
                            {currentInteraction.animation.button.label}
                          </Button>
                        )}
                      </div>
                    )}

                  {/* Loop/Continue Button */}
                  {showButtons && currentInteraction?.button && (
                    <Button
                      onClick={() =>
                        handleButtonClick(currentInteraction.button!)
                      }
                      className="w-full bg-white hover:bg-white/90 
                                 text-orange-600 font-bold rounded-full shadow-lg
                                 transition-all duration-300 active:scale-[0.98]"
                    >
                      {currentInteraction.button.label}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Skip Button - Below the card */}
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
      </div>

      {/* Progress Indicator */}
      <div className="p-6 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="h-3 bg-white/20 border border-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  100,
                  (Object.keys(flowData.interactions).indexOf(
                    currentInteractionId,
                  ) /
                    Object.keys(flowData.interactions).length) *
                    100,
                )}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Chapter3() {
  return <Chapter3Content />;
}
