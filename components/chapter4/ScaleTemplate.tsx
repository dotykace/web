// components/CenteredLayout.tsx
"use client";

import { useState} from "react";
import DraggableCircle from "@/components/chapter4/DraggableCircle";
import ArrowButton from "@/components/chapter4/ArrowButton";

interface CenteredLayoutProps {
  topText: string;
  bottomText: string;
  onConfirm?: (percentage) => void;
  confirmationText?: string;
}

export default function ScaleTemplate({
                                         topText,
                                         bottomText,
                                         onConfirm,
                                         confirmationText = "Potvrdit a pokračovat"
                                       }: CenteredLayoutProps) {
  const [percentage, setPercentage] = useState(50);
  const handleConfirm = () => {
    console.log("Confirmed percentage:", percentage);
    if (onConfirm) {
      onConfirm(percentage);
    }
  }

  return (
    <div className="flex flex-col min-h-screen text-center">
      <h1 className="text-2xl font-semibold mt-8">{topText}</h1>
      <DraggableCircle percentageCallback={setPercentage}/>
      <h2 className="text-2xl font-semibold mb-8">{bottomText}</h2>
      <div className="m-2 ml-8">
        <ArrowButton onClick={handleConfirm} label={confirmationText} />
      </div>
    </div>
  );
}
