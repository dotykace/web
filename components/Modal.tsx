import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  content,
  footer,
}: ModalProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop/Overlay with gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-sky-500/80 via-blue-600/80 to-indigo-700/80 backdrop-blur-md"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 animate-scale-in border border-white/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2
            id="modal-title"
            className="text-2xl font-bold text-white text-center"
          >
            {title || "Modal Title"}
          </h2>
        </div>

        {content && (
          <div className="mb-8 text-white/90 text-center leading-relaxed text-lg">
            {content}
          </div>
        )}

        <div className="flex justify-center space-x-3">
          {footer || (
            <button
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 
                         text-white font-semibold py-4 px-8 rounded-2xl shadow-lg
                         transition-all duration-200 active:scale-95"
              onClick={onClose}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
