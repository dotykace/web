// components/HelpButton.tsx
import { FlagTriangleRight } from "lucide-react";
import {useState} from "react";
import Modal from "@/components/Modal";

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);


  return (
    <div>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        className="fixed text-sm top-4 right-4 z-50 flex items-center gap-2 p-2 px-3 bg-orange-500/80 text-white font-bold rounded-full shadow-lg hover:bg-orange-700 transition-all"
      >
        <FlagTriangleRight className="w-4 h-4" />
        Pomoz mi
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Technický Problém" content={"Zvedni ruku a počkej na pomoc ;)"}/>
    </div>
  );
}
