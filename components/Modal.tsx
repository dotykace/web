import React, {useEffect} from "react";

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  content?: React.ReactNode
  footer?: React.ReactNode

}

export default function Modal({ isOpen, onClose, title, content, footer }: ModalProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
//zvedni ruku a počkej na pomoc

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop/Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="mb-5">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900 text-center">
            {title || "Modal Title"}
          </h2>
        </div>

        {content && (
          <div className="mb-8 text-gray-600 text-center leading-relaxed">
            {content}
          </div>
        )}

        <div className="flex justify-center space-x-3">
          {footer || (
            <button 
              className="btn-primary px-8 py-3 font-semibold"
              onClick={onClose}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  )

}