"use client";

import { motion } from "framer-motion";
import { readFromStorage, setToStorage } from "@/scripts/local-storage";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import useDB from "@/hooks/use-db";
import { useRouter } from "next/navigation";
import type { DocumentReference } from "firebase/firestore";
import { ThumbsUp, Share2, ChevronDown, ChevronUp } from "lucide-react";

interface VideoItem {
  id: number;
  title: string;
  description: string;
  fileName: string;
  channel: string;
  views: string;
}

const videos: VideoItem[] = [
  {
    id: 1,
    title: "Mobil a mozek",
    description:
      "Co je dopamin, jak používání mobilu ovlivňuje jeho vyplavování do mozku, a proč je to důležité?",
    fileName: "DOPAMIN.mp4",
    channel: "Dotykače",
    views: "Pro tebe",
  },
];

type UseDBReturn =
  | {
      updateVoice: (newVoice: string) => Promise<void>;
      updateChapter: (
        chapterNumber: number,
        onFinish: () => void
      ) => Promise<void>;
      participantRef: DocumentReference;
    }
  | undefined;

export default function VideoPage() {
  const finishButtonText = "Dokončit zážitek";

  const [selectedVoice, setSelectedVoice] = useState<string>();
  const dbHook = useDB() as UseDBReturn;
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [filePathLoaded, setFilePathLoaded] = useState(false);
  const [showFinishButton, setShowFinishButton] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const savedVoice = readFromStorage("selectedVoice") || "male";
    if (savedVoice) {
      setSelectedVoice(savedVoice);
      setFilePathLoaded(true);
    }
    setTimeout(() => {
      setShowFinishButton(true);
    }, 1000 * 2 * 60); // Show finish button after 2 minutes
  }, []);

  const handleFinish = () => {
    if (dbHook) {
      dbHook.updateChapter(5, () => setToStorage("dotykaceFinished", true));
    }
    router.push("/dotykace");
  };

  const filePath = `/videos/${selectedVoice}/`;
  const video = videos[0];

  if (!filePathLoaded) {
    return (
      <div className="h-screen overflow-hidden bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 border-2 border-white/30 border-t-red-500 rounded-full animate-spin" />
          <span className="text-white/70">Načítavam...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-black">

      {/* Video Player - Full Width */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-black"
      >
        <div className="relative w-full aspect-video max-h-[40vh] sm:max-h-[50vh]">
          <video
            ref={videoRef}
            className="w-full h-full object-contain bg-black"
            src={`${filePath}${video.fileName}`}
            title={video.title}
            controls
            playsInline
            controlsList="nodownload"
          />
        </div>
      </motion.div>

      {/* Video Info - YouTube Style */}
      <div className="flex-1 overflow-y-auto bg-zinc-900">
        <div className="p-4">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white text-lg sm:text-xl font-semibold leading-tight"
          >
            {video.title}
          </motion.h1>

          {/* Views & Channel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mt-2 text-sm text-zinc-400"
          >
            <span>{video.views}</span>
            <span>•</span>
            <span>{video.channel}</span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mt-4 overflow-x-auto pb-2"
          >
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                liked
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>Líbí se mi</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-all">
              <Share2 className="w-4 h-4" />
              <span>Sdílet</span>
            </button>
          </motion.div>

          {/* Description Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-xl p-4 text-left transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-zinc-300 text-sm ${showDescription ? "" : "line-clamp-2"}`}>
                    {video.description}
                  </p>
                </div>
                <div className="ml-2 text-zinc-400">
                  {showDescription ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </button>
          </motion.div>

          {/* Finish Button */}
          {showFinishButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Button
                onClick={handleFinish}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-6 text-lg font-semibold transition-all duration-200"
              >
                {finishButtonText}
              </Button>
            </motion.div>
          )}

          {/* Spacer for bottom padding */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
