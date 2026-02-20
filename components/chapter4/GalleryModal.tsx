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
    <div className="flex flex-col gap-2 w-full">
      <button
        onClick={() => closeModal(true)}
        className="w-full rounded-full py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {approveText}
      </button>
      <button
        onClick={() => closeModal(false)}
        className="w-full rounded-full py-2 text-sm font-semibold text-black bg-white hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {declineText}
      </button>
    </div>
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
