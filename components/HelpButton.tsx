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
        className="fixed text-sm top-4 right-4 z-50 flex items-center gap-2 p-2.5 px-4 
                   bg-white/90 backdrop-blur-md text-orange-600 font-semibold rounded-full 
                   shadow-lg shadow-black/10 hover:bg-white hover:shadow-xl 
                   transition-all duration-300 border border-orange-100"
      >
        <FlagTriangleRight className="w-4 h-4" />
        Pomoz mi
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Technický Problém" content={"Zvedni ruku a počkej na pomoc ;)"}/>
    </div>
  );
}
