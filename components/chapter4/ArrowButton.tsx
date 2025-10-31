// components/ArrowButton.tsx
import React from "react";

export default function ArrowButton({
                                      disabled = false,
                                      color = "bg-blue-600",
                                      label = "",
                                      onClick,
                                    }: {
  disabled?: boolean;
  color?: string;
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${color} text-white font-medium pr-8 py-6
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:brightness-90'}
        transition-all duration-200
        [clip-path:polygon(0%_25%,70%_25%,70%_0%,100%_50%,70%_100%,70%_75%,0%_75%)]
        items-center justify-center shadow-md
      `}
    >
      <div className="m-2">
        {label}
      </div>
    </button>

  );
}
