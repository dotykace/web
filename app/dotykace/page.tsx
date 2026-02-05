"use client"

import { useEffect, useState } from "react"
import { readFromStorage } from "@/scripts/local-storage"
export default function DotykacePage() {
  const [finished, setFinished] = useState(false)
  const defaultText = "Dotykace"
  const finishText = `Dokončili jste zážitek Dotykace.\nDěkujeme!`
  useEffect(() => {
    const isFinished = readFromStorage("dotykaceFinished")
    console.log(isFinished)
    setFinished(() => !!isFinished)
  }, [])
  return (
    <main className="flex h-screen overflow-hidden flex-col items-center justify-center p-4 bg-gradient-warm">
      <div className="text-center text-white animate-fade-in">
        {finished ? (
          <div className="glass-card px-8 py-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 whitespace-pre-line">
              {finishText}
            </h1>
          </div>
        ) : (
          <h1 className="text-4xl font-bold">{defaultText}</h1>
        )}
      </div>
    </main>
  )
}
