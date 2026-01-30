"use client";

import { Star } from "lucide-react";

interface MusicStarAnimationProps {
  isActive: boolean;
}

export default function MusicStarAnimation({ isActive }: MusicStarAnimationProps) {
  if (!isActive) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Star
        className="text-fuchsia-300 drop-shadow-lg animate-star-scale-pulse"
        size={100}
      />
      {/* Subtle glowing rings around the star */}
      <div className="absolute w-24 h-24 rounded-full bg-fuchsia-300/30 animate-ping-slow" />
      <div
        className="absolute w-32 h-32 rounded-full bg-violet-300/20 animate-ping-slow"
        style={{ animationDelay: "0.5s" }}
      />
    </div>
  );
}
