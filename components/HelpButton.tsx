// components/HelpButton.tsx
import { FlagTriangleRight } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/Modal";

interface HelpButtonProps {
  variant?: "fixed" | "inline";
}

export default function HelpButton({ variant = "fixed" }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const baseStyles =
    "text-sm flex items-center gap-2 transition-all duration-300";

  const variantStyles =
    variant === "fixed"
      ? "fixed top-4 right-4 z-50 p-2.5 px-4 bg-white/90 backdrop-blur-md text-orange-600 font-semibold rounded-full shadow-lg shadow-black/10 hover:bg-white hover:shadow-xl border border-orange-100"
      : "p-1.5 px-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/30 border border-white/20";

  return (
    <div>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        className={`${baseStyles} ${variantStyles}`}
      >
        <FlagTriangleRight className="w-4 h-4" />
        Pomoz mi
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Technický Problém"
        content={"Zvedni ruku a počkej na pomoc ;)"}
      />
    </div>
  );
}
