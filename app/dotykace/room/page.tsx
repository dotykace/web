"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DotykaceRoom, DotykaceParticipant } from "@/lib/dotykace-types";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { readFromStorage, setToStorage } from "@/scripts/local-storage";

import DotykaceLogo from "@/components/DotykaceLogo";

export default function DotykaceRoomPage() {
  const [room, setRoom] = useState<DotykaceRoom | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedPlayerName = readFromStorage("playerName") as string;
    const storedRoomId = readFromStorage("roomId") as string;
    const storedPlayerId = readFromStorage("playerId") as string;

    if (!storedPlayerName || !storedRoomId) {
      router.push("/");
      return;
    }

    if (!storedPlayerId) {
      console.log("Player ID not found in localStorage. Redirecting to root");
      router.push("/");
    }

    const roomRef = doc(db, "rooms", storedRoomId);
    const unsubscribe = onSnapshot(
      roomRef,
      async (document) => {
        if (document.exists()) {
          const roomData = document.data() as DotykaceRoom;
          setRoom(roomData);
          setConnectionError(false);
          console.log(
            `Connected to room "${storedRoomId}" as player "${storedPlayerName}"`
          );

          // Skontroluj či hráč už existuje v miestnosti
          const participantRef = doc(
            db,
            "rooms",
            storedRoomId,
            "participants",
            storedPlayerId
          );
          const participantDoc = await getDoc(participantRef);
          const existingParticipant = participantDoc.exists()
            ? (participantDoc.data() as DotykaceParticipant)
            : null;
          console.log("Existing participant data:", existingParticipant);

          // Ak sa miestnosť spustila, automaticky začni introduction
          if (roomData.isStarted) {
            let currentChapter = readFromStorage("chapter");
            if (!currentChapter) {
              currentChapter = existingParticipant?.currentChapter ?? 0;
              setToStorage("chapter", currentChapter);
            }
            if (currentChapter > 0) {
              console.log(
                "Current chapter from existing participant:",
                currentChapter
              );
              router.push(`/menu`);
            } else {
              console.log("Current chapter is 0, redirecting to chapter 0");
              router.push("/chapter/0");
            }
          }
        } else {
          router.push("/");
        }
      },
      (error) => {
        console.error("Connection error:", error);
        setConnectionError(true);
      }
    );

    return () => unsubscribe();
  }, [router]);

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8 mx-auto mb-4" />
          {connectionError && (
            <div className="text-white text-sm">
              Problém s pripojením... Skúšam znovu...
            </div>
          )}
        </div>
      </div>
    );
  }

  const waitingHeader = "Čekáme na začátek";
  const waitingSubheader =
    "Administrátor ještě nespustil Dotykáče: interaktivní zkušenost s mobilem";

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <DotykaceLogo />

        {/* Waiting Screen */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-xl">
          <CardContent className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-sky-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {waitingHeader}
            </h3>
            <p className="text-gray-600 mb-4">{waitingSubheader}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
