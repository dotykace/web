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
    <div className="flex flex-col min-h-screen text-center">
      {/* Top header */}
      <h1 className="text-2xl font-semibold mt-8">{topText}</h1>

      {/* Middle area */}
      <div className="flex flex-1 w-full px-8">
        {/* Left button */}
        <div className="flex items-center">
          <button
            onClick={onLeftClick}
            disabled={leftDisabled}
            className={`w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-400
        ${leftDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 active:scale-95 transition"}`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>


        {/* Center area */}
        <div className="flex-1 flex items-center justify-center mx-6">
          <div className="w-full h-full flex items-center justify-center">
            {centerComponent}
          </div>
        </div>

        {/* Right button */}
        <div className="flex items-center">
          <button
            onClick={onRightClick}
            disabled={rightDisabled}
            className={`w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-400
        ${rightDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 active:scale-95 transition"}`}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </div>

      {/* Bottom header */}
      <h2 className="text-2xl font-semibold mb-8">{bottomText}</h2>
    </div>

  );
}
