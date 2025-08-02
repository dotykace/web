"use client"

import type React from "react"

import {useState} from "react"
import VoicePicker from "@/components/VoicePicker";
import Modal from "@/components/Modal";

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

export function VoicePickerModal({ isOpen, onClose}) {
  const [selectedVoice, setSelectedVoice] = useState<string>("male")

  const closeModal = () => {
    onClose(selectedVoice)
  }

  const title = "Jak na tebe mám mluvit?"

  const content = <VoicePicker voices={sampleVoices} selectedVoice={selectedVoice} onVoiceSelect={setSelectedVoice} />

  const footer =
  <button
    onClick={onClose}
    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
  >
    Pokračovat
  </button>

  return <Modal isOpen={isOpen} onClose={closeModal} title={title} content={content} footer={footer} />
}
