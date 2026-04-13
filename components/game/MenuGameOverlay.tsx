import React from "react";

const CHAPTER_META = {
  2: {
    rotation: -6,
    offsetY: -5,
    text: "Čekáš? Dej si pár fun faktů!"
  },
  3: {
    rotation: 4,
    offsetY: -10,
    text: "Čekáš? Dej si dalších pár fun faktů."
  }
}

export default function MenuGameOverlay({chapterNumber}: {chapterNumber: number}) {
  const {rotation, offsetY, text} = CHAPTER_META[chapterNumber]

  return (
    <>
      {/* Sticky note */}
      <div
        className="relative px-5 py-4 shadow-xl border bg-yellow-200 text-yellow-900 border-yellow-300"
        style={{
          transform: `rotate(${rotation}deg) translate(0px, ${offsetY}px)`
        }}
      >
        {text}

        {/* Top-left tape */}
        <div className="absolute -top-2 -left-2 w-8 h-3 bg-white/80 rotate-[-25deg] rounded-sm shadow-sm"></div>
        {/* Bottom-right tape */}
        <div className="absolute -bottom-2 -right-2 w-8 h-3 bg-white/80 rotate-[-25deg] rounded-sm shadow-sm"></div>
      </div>

    </>
  )
}