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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop/Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="mb-4">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900 text-center">
            {title || "Modal Title"}
          </h2>
        </div>

        {content && (
          <div className="mb-6">
            {content}
          </div>
        )}

        <div className="flex justify-center space-x-3">
          {footer || (<button className={"bg-primary text-primary-foreground font-medium rounded-xl shadow-md px-5 py-2.5"} onClick={onClose}>OK</button>)}
        </div>
      </div>
    </div>
  )

}