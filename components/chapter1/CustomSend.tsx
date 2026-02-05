"use client";

import { useCallback } from "react";
import { Send } from "lucide-react";

export default function CustomSend({
  onClick,
  isGlowing,
}: {
  onClick: () => void;
  isGlowing: () => boolean;
}) {
  return (
    <div className="relative">
      {/* Send Button */}
      <button
        onClick={onClick}
        className={
          "px-3 py-3 text-white rounded-full transition bg-blue-600 hover:bg-blue-700" +
          (isGlowing() ? " ring ring-blue-400" : "")
        }
      >
        <Send />
      </button>
    </div>
  );
}
