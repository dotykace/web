"use client"

import type React from "react"
import Modal from "@/components/Modal"

export function GalleryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: (save: boolean) => void
}) {
  const closeModal = (save: boolean) => {
    if (save) {
      return onClose(true)
    }
    onClose(false)
  }

  const title = "Chceš si obrázek stáhnout do telefonu?"
  const approveText = "Ano, uložit obrázek"
  const declineText = "Ne, díky"

  const footer = (
    <>
      <button
        onClick={() => closeModal(false)}
        className="px-4 py-2 text-sm font-medium text-white bg-gray-500 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {declineText}
      </button>
      <button
        onClick={() => closeModal(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {approveText}
      </button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal(false)}
      title={title}
      footer={footer}
    />
  )
}
