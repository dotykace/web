import React from "react";

export default function FullScreenVideo({videoSrc, onEnded}) {
  return (
    <div className="relative w-screen h-screen aspect-video rounded-lg overflow-hidden shadow-lg">
      <video
        onEnded={onEnded}
        className="absolute top-0 left-0 w-full h-full"
        src={`/videos/${videoSrc}`}
        playsInline
        autoPlay={true}
      />
    </div>
  )
}