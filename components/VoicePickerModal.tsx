"use client"

import type React from "react"

import {useEffect, useState} from "react"
import VoicePicker from "@/components/VoicePicker";

interface ModalProps {
  isOpen: boolean
  onClose: (voiceId) => void
  title?: string
  children?: React.ReactNode
}

const sampleVoices = [
  {
    id: "female",
    name: "Ženský hlas",
    audioUrl: "/placeholder.mp3?voice=sarah",
  },
  {
    id: "male",
    name: "Mužský hlas",
    audioUrl: "/placeholder.mp3?voice=james",
  },
  {
    id: "neutral",
    name: "Neutrální hlas",
    audioUrl: "/placeholder.mp3?voice=emma",
  },
]

export function VoicePickerModal({ isOpen, onClose}: ModalProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>("male")
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(selectedVoice)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop/Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="mb-4">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900 text-center">
            Jak na tebe mám mluvit?
          </h2>
        </div>

        <div className={"mb-6"} >
          <VoicePicker voices={sampleVoices} selectedVoice={selectedVoice} onVoiceSelect={setSelectedVoice} />
        </div>

        {/* Modal Footer with Buttons */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Pokračovat
          </button>
        </div>
      </div>
    </div>
  )
}
