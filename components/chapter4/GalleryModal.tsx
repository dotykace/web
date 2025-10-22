"use client"

import type React from "react"

import {useState} from "react"
import VoicePicker from "@/components/VoicePicker";
import Modal from "@/components/Modal";

export function GalleryModal({ isOpen, onClose }) {
  const closeModal = (save) => {
    if (save) {
      // Logic to save the image goes here
      console.log("Image saved!")
    }
    onClose()
  }

  const title = "Do you want to save your selected image?"

  const content = "You can now save the image to your device or share it with others."

  const footer =
    <>
      <button
      onClick={()=>closeModal(true)}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
    >
      Ano, uložit obrázek
    </button>
      <button
        onClick={()=>closeModal(false)}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        Ne, diky!
      </button>
    </>


  return <Modal isOpen={isOpen} onClose={closeModal} title={title} content={content} footer={footer} />
}
