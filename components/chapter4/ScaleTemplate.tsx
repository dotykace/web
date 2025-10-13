// components/CenteredLayout.tsx
"use client";

import { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CenteredLayoutProps {
  topText: string;
  bottomText: string;
  centerComponent: ReactNode;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  leftDisabled?: boolean;
  rightDisabled?: boolean;
}

export default function CenteredLayout({
                                         topText,
                                         bottomText,
                                         centerComponent,
                                         onLeftClick,
                                         onRightClick,
                                         leftDisabled = false,
                                         rightDisabled = false,
                                       }: CenteredLayoutProps) {
  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen text-center overflow-hidden">
      {/* Top header */}
      <h1 className="text-2xl font-semibold mt-8">{topText}</h1>

      {/* Middle area - full height flex container */}
      <div className="relative flex-1 w-full flex items-center justify-between">
        {/* Full area for center component */}


        {/* Left button */}
        <button
          onClick={onLeftClick}
          disabled={leftDisabled}
          className={`absolute left-8 w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-400
            ${leftDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 active:scale-95 transition"}`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {centerComponent}
        </div>

        {/* Right button */}
        <button
          onClick={onRightClick}
          disabled={rightDisabled}
          className={`absolute right-8 w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-400
            ${rightDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 active:scale-95 transition"}`}
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom header */}
      <h2 className="text-xl font-medium mb-8">{bottomText}</h2>
    </div>
  );
}
