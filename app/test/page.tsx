"use client";

import DraggableCircle from "@/components/chapter4/DraggableCircle";
import ScaleTemplate from "@/components/chapter4/ScaleTemplate";
import ArrowButton from "@/components/chapter4/ArrowButton";

export default function Home() {
  return (
    <ScaleTemplate
      topText="Top Text"
      bottomText="Bottom Text"
    />
  );
  // return (
  //   <main className="flex items-center justify-center min-h-screen bg-gray-100">
  //     <ArrowButton label="Potvrdit a pokračovat" onClick={() => alert("Arrow button clicked!")} />
  //   </main>
  // )
}
