// components/HelpButton.tsx
import { AlertTriangle } from "lucide-react";
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
        className="fixed text-sm top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-600/80 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition-all"
      >
        <AlertTriangle className="w-4 h-4" />
        Problém
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Technický Problém" content={"Zvedni ruku a počkej na pomoc ;)"}/>
    </div>
  );
}
