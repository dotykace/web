import { useChatContext } from "@/context/ChatContext";
import Scales from "@/components/chapter4/Scales";
import Gallery from "@/components/chapter4/Gallery";
import React, { useEffect, useState } from "react";
import BasicAudioVisual from "@/components/BasicAudioVisual";
import AudioWrapper from "@/components/audio/AudioWrapper";
import CountDownInput from "@/components/CountDownInput";
import { useRouter } from "next/navigation";
import useDB from "@/hooks/use-db";

const coloring = "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900";

const soundMap = {};

interface Interpretation {
  secondary: string;
  percentage: number;
  class: number;
  combo?: string;
}

export default function ScalesAndGallery() {
  return (
    <AudioWrapper soundMap={soundMap} setLoaded={() => {}}>
      <ScalesAndGalleryContent />
    </AudioWrapper>
  );
}

function ScalesAndGalleryContent() {
  const { currentInteraction, goToNextInteraction } = useChatContext();
  const [data, setData] = useState<Record<string, Interpretation> | null>(null);
  const dbHook = useDB();
  const router = useRouter();

  const collectData = (data: Record<string, Interpretation>) => {
    console.log("Collected data:", data);
    // todo save to firestore
    setData(data);
    goToNextInteraction();
  };

  const pickGalleryImages = (): string[] => {
    if (!currentInteraction) return [];
    if (!data) return [];
    return Object.entries(data).map(
      ([key, value]) => `/images/scales/${key}/${value.combo}.jpg`
    );
  };

  if (!currentInteraction) return null;
  if (data) {
    if (currentInteraction.id === "gallery") {
      const images = pickGalleryImages();
      const audio = {
        filename: currentInteraction.voice as string,
        type: "voice" as const,
        onFinish: () => {
          console.log("Played gallery audio:", currentInteraction.voice);
        },
      };
      return (
        <Gallery
          images={images}
          helpText={currentInteraction.text()}
          onFinish={() => goToNextInteraction()}
          audio={audio}
        />
      );
    }
  }
  const finishChapter = (finalResponse: string) => {
    console.log("Final response:", finalResponse);
    if (dbHook) {
      dbHook.updateChapter(4, () => router.push("/video")).then();
    }
  };

  if (currentInteraction.id === "scales")
    return (
      <Scales
        currentInteraction={currentInteraction}
        onComplete={collectData}
      />
    );
  else {
    if (currentInteraction.type === "voice") {
      const audio = {
        filename: currentInteraction.filename as string,
        type: "voice" as const,
        onFinish: () => goToNextInteraction(),
      };
      return (
        <BasicAudioVisual
          id={currentInteraction.id}
          coloring={coloring}
          audio={audio}
        />
      );
    }
    if (currentInteraction.type === "input") {
      return (
        <BasicAudioVisual
          id={currentInteraction.id}
          coloring={coloring}
          audio={null}
        >
          <CountDownInput
            questionText={currentInteraction.text()}
            countdownSeconds={currentInteraction.duration}
            onSave={finishChapter}
          />
        </BasicAudioVisual>
      );
    } else
      return (
        <BasicAudioVisual
          id={currentInteraction.id}
          coloring={coloring}
          audio={null}
        />
      );
  }
}
