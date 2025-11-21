"use client";

import { useState, useEffect, useRef } from "react";
import ScrollLine from "@/components/ScrollLine";
import AnimatedCard from "@/components/AnimatedCard";
import { readFromStorage } from "@/scripts/local-storage";
import { useSwipeNavigation } from "@/hooks/use-scroll";
import type { ProcessedInteraction } from "@/interactions";

interface CardData {
  id?: string;
  username?: string;
  content?: string;
  choices?: { text: string; callback: () => {} }[];
}

const generateChoiceObject = (
  text: string,
  callback: (text: string) => void
) => {
  return {
    text: text,
    callback: () => {
      callback(text);
      return {};
    },
  };
};
const FINGERS = ["palec", "ukazovák", "prostředníček", "prsteníček", "malíček"];
const createCard = (
  interaction: ProcessedInteraction | null | undefined,
  botName: string,
  onFinish: (type: string, choice?: string) => void
): CardData | undefined => {
  if (!interaction) return undefined;
  if (interaction.type !== "card") return undefined;
  let newCard: CardData = {
    id: interaction.id,
    username: botName,
    content: interaction.text(),
  };

  if (interaction.id === "finger-choice") {
    newCard = {
      ...newCard,
      choices: FINGERS.map((text) =>
        generateChoiceObject(text, (choice) => onFinish("choice", choice))
      ),
    };
  }
  if (interaction.id === "finger-compare") {
    newCard = {
      ...newCard,
      choices: [
        generateChoiceObject("Pokračovat\n", () => onFinish("compare")),
      ],
    };
  }
  return newCard;
};
export default function ScrollableCards({
  currentInteraction,
  onScroll,
  onFinish,
}: {
  currentInteraction: ProcessedInteraction | null | undefined;
  onScroll: () => void;
  onFinish: (type: string, choice?: string) => void;
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastWheelTime = useRef(0);
  const wheelCooldown = 800; // milliseconds between card changes

  const nextCard = () => {
    if (!currentInteraction) return false;
    return (
      currentInteraction.id !== "finger-choice" &&
      currentInteraction.id !== "finger-compare"
    );
  };
  const validCard = () => {
    if (!currentInteraction) return false;
    return currentInteraction.type === "card";
  };

  const botName = readFromStorage("BN") ?? "Bot";

  const [dotyFace, setDotyFace] = useState("happy_1");

  useEffect(() => {
    if (!currentInteraction) return;
    if (currentInteraction.face && currentInteraction.face !== dotyFace) {
      setDotyFace(currentInteraction.face);
    }
  }, [currentInteraction]);

  const autoScrollDelay = currentInteraction
    ? currentInteraction.duration * 1000
    : 4000; // 4 seconds
  const intervalMs = (autoScrollDelay / 100) * 0.75;

  const changeCard = () => {
    // cooldown logic
    if (isTransitioning) return;
    const now = Date.now();
    if (now - lastWheelTime.current < wheelCooldown) return;
    setIsTransitioning(true);
    lastWheelTime.current = now;
    // here goes actual change of card
    setProgress(0);
    onScroll();
    // here is cooldown again
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  const swipeCallback = (direction: "up" | "down") => {
    if (direction === "up") {
      changeCard();
    }
  };
  useSwipeNavigation(swipeCallback);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!validCard() || !nextCard()) return;
    // if (!isAutoScrolling ) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [currentInteraction]);

  useEffect(() => {
    if (progress === 100) {
      changeCard();
    }
  }, [progress]);

  return (
    <div className="h-screen w-screen flex relative items-center justify-center">
      {nextCard() && (
        <div className="absolute">
          <ScrollLine />
        </div>
      )}
      <div className="z-10">
        <AnimatedCard
          currentCard={createCard(currentInteraction, botName, onFinish)}
          visible={validCard()}
          dotyFace={dotyFace}
        />
      </div>
    </div>
  );
}
