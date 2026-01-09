"use client";
import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { readFromStorage, setToStorage } from "@/scripts/local-storage";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DotykaceParticipant, DotykaceRoom } from "@/lib/dotykace-types";
import HelpButton from "@/components/HelpButton";
import { useAudioManager } from "@/hooks/use-audio";
import DotykaceLogo from "@/components/DotykaceLogo";
import MenuSectionCard from "@/components/MenuSectionCard";
import { chapterConfigs } from "@/app/chapter/[id]/ChapterClient";
import { Info } from "lucide-react";

type SectionState = "locked" | "unlocked" | "completed";

interface Section {
  id: number;
  title: string;
  path: string;
  state: SectionState;
}

const chapterString = "Kapitola";
const defaultSections = Object.values(chapterConfigs)
  .filter((config) => config.chapterNumber !== 0)
  .map(
    (config) =>
      ({
        id: config.chapterNumber,
        title: `${chapterString} ${config.chapterNumber}`,
        path: `/chapter/${config.chapterNumber}`,
        state: "locked",
      }) as Section
  );

export default function MenuPage() {
  const router = useRouter();
  const [chapter, setChapter] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allowedChapters, setAllowedChapters] = useState<number[]>([0]);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);

  const [sections, setSections] = useState<Section[]>(defaultSections);

  const audioManager = useAudioManager();

  // Initialize client-side data and check Firestore for intro completion
  useEffect(() => {
    setIsClient(true);

    const storedChapter = readFromStorage("chapter") as number;
    const storedUserName = (readFromStorage("UN") as string) || "";
    const storedRoomId = readFromStorage("roomId") as string;
    const storedPlayerId = readFromStorage("playerId") as string;

    const selectedVoice = readFromStorage("selectedVoice") as string;
    if (!selectedVoice) {
      setToStorage("selectedVoice", "male");
    }

    setChapter(storedChapter);
    setUserName(storedUserName);
    setRoomId(storedRoomId);
    setPlayerId(storedPlayerId);

    // Check Firestore for completed chapters (source of truth)
    const checkIntroCompletion = async () => {
      if (storedRoomId && storedPlayerId) {
        try {
          const participantRef = doc(
            db,
            "rooms",
            storedRoomId,
            "participants",
            storedPlayerId
          );
          const participantDoc = await getDoc(participantRef);

          if (participantDoc.exists()) {
            const participant = participantDoc.data() as DotykaceParticipant;
            const firestoreCompletedChapters =
              participant.completedChapters || [];

            if (!firestoreCompletedChapters.includes(0)) {
              console.log(
                "Firestore says chapter 0 not completed, redirecting"
              );
              router.push("/chapter/0");
              return;
            }

            // Sync to localStorage
            setToStorage("completedChapters", firestoreCompletedChapters);
            setCompletedChapters(firestoreCompletedChapters);
          } else {
            // Participant doesn't exist, redirect to chapter 0
            console.log("Participant not found, redirecting to chapter 0");
            router.push("/chapter/0");
            return;
          }
        } catch (error) {
          console.error("Error checking intro completion:", error);
        }
      } else {
        // No room/player ID - check localStorage as fallback
        const storedCompletedChapters =
          (readFromStorage("completedChapters") as number[]) || [];

        if (!storedCompletedChapters.includes(0)) {
          console.log("localStorage says chapter 0 not completed, redirecting");
          router.push("/chapter/0");
          return;
        }
      }

      setIsLoading(false);
    };

    checkIntroCompletion();
  }, [router]);

  // Handle audio separately to avoid infinite loop
  useEffect(() => {
    if (!isClient) return;

    audioManager
      .preloadAll({
        "menu-background": {
          filename: "CAKAREN.mp3",
          opts: { loop: true, volume: 0.3 },
        },
      })
      .then(() => {
        if (!audioManager.isPlaying["menu-background"]) {
          audioManager.playPreloaded("menu-background");
        }
      });

    return () => {
      const ctx = (audioManager as any).audioContextRef?.current;
      if (ctx && ctx.state !== "closed") ctx.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  const getState = useCallback(
    (id: number): SectionState => {
      if (completedChapters.includes(id)) {
        return "completed";
      } else if (allowedChapters.includes(id)) {
        return "unlocked";
      } else {
        return "locked";
      }
    },
    [completedChapters, allowedChapters]
  );

  const updateSectionsState = useCallback(() => {
    setSections((prevSections) => {
      return prevSections.map((section) => ({
        ...section,
        state: getState(section.id),
      }));
    });
  }, [getState]);

  useEffect(() => {
    updateSectionsState();
  }, [updateSectionsState]);

  // Listen to room changes to get updated permissions
  useEffect(() => {
    console.log(
      "Setting up room listener for roomId:",
      roomId,
      "and playerId:",
      playerId
    );
    if (!isClient || !roomId || !playerId) {
      return;
    }

    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (document) => {
      if (document.exists()) {
        const roomData = document.data() as DotykaceRoom;
        const permissions = roomData.chapterPermissions?.[playerId];

        if (permissions) {
          setAllowedChapters(permissions.allowedChapters);
        }
      }
    });
    const participantRef = doc(db, "rooms", roomId, "participants", playerId);
    const unsubscribeParticipant = onSnapshot(
      participantRef,
      (participantSnap) => {
        if (participantSnap.exists()) {
          const participant = participantSnap.data() as DotykaceParticipant;
          setCompletedChapters(participant.completedChapters || []);
          const savedChapter = readFromStorage("chapter");
          const dbChapter = participant.currentChapter;
          if (dbChapter !== savedChapter) {
            console.log(
              `Synchronizing chapter from ${savedChapter} to ${dbChapter}`
            );
            setToStorage("chapter", dbChapter);
          }
          console.log("Participant data updated:", participant);
        } else {
          console.log("Participant document does not exist.");
        }
      }
    );

    return () => {
      unsubscribe();
      unsubscribeParticipant();
    };
  }, [roomId, playerId, isClient]);

  // Handle section click
  const handleSectionClick = (section: Section) => {
    const currentState = getState(section.id);
    if (currentState !== "locked") {
      router.push(section.path);
    }
  };

  // Filter allowed chapters to only show 1-4
  const displayableAllowedChapters = allowedChapters.filter(
    (ch) => ch >= 1 && ch <= 4
  );
  const hasNoAllowedChapters = displayableAllowedChapters.length === 0;

  // Show loading state while client-side data is being loaded
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-menu flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin-smooth rounded-full border-3 border-white/30 border-t-white h-10 w-10 mx-auto mb-4" />
          <p className="text-white/90 font-medium">Načítavam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-menu flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <HelpButton />

      {/* Logo */}
      <motion.div
        className="p-4 pb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DotykaceLogo width={280} />
      </motion.div>

      {/* Chapters Grid */}
      <motion.div
        className="grid grid-cols-2 gap-6 relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {sections.map((section) => (
          <MenuSectionCard
            key={section.id}
            section={section}
            handleSectionClick={handleSectionClick}
          />
        ))}
      </motion.div>

      {/* Admin status message */}
      {roomId && (
        <motion.div
          className="mt-10 text-center relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 shadow-lg">
            {hasNoAllowedChapters ? (
              <div className="flex items-center gap-2 text-white/90">
                <Info className="w-4 h-4" />
                <p className="text-sm font-medium">
                  Čakáte na povolenie od administrátora
                </p>
              </div>
            ) : (
              <p className="text-white/90 text-sm font-medium">
                Máte povolené kapitoly: {displayableAllowedChapters.join(", ")}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
