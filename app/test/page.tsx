"use client";

import DraggableCircle from "@/components/chapter4/DraggableCircle";
import ScaleTemplate from "@/components/chapter4/ScaleTemplate";

export default function Home() {
  return (
    <ScaleTemplate
      topText="Top Text"
      bottomText="Bottom Text"
      centerComponent={<DraggableCircle/>}
      onLeftClick={() => alert("Left clicked")}
      onRightClick={() => alert("Right clicked")}
    />
  );
}
