// components/CenteredLayout.tsx
"use client";

import { useState } from "react";
import DraggableCircle from "@/components/chapter4/DraggableCircle";
import ArrowButton from "@/components/chapter4/ArrowButton";

export default function ScaleTemplate({
  disabled,
  topText,
  bottomText,
  onConfirm,
  confirmationText = "Potvrdit a pokračovat",
}: {
  disabled: boolean;
  topText: string;
  bottomText: string;
  onConfirm: (percentage: number) => void;
  confirmationText?: string;
}) {
  const [percentage, setPercentage] = useState(50);
  const [resetKey, setResetKey] = useState(0);
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(percentage);
    }
    setResetKey((k) => k + 1);
    setPercentage(50);
  };

  return (
    <div className="flex flex-col min-h-screen text-center">
      <h1 className="text-2xl font-semibold mt-8">{topText}</h1>
      <DraggableCircle percentageCallback={setPercentage} key={resetKey} />
      <h2 className="text-2xl font-semibold mb-8">{bottomText}</h2>
      <div className="m-2 ml-8">
        <ArrowButton
          disabled={disabled}
          onClick={handleConfirm}
          label={confirmationText}
        />
      </div>
    </div>
  );
}
