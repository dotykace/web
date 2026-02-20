"use client"

import type React from "react"
import { useState } from "react"
import { ArrowRightIcon } from "lucide-react"

interface UserInputProps {
  onSubmit: (input: string) => void
  placeholder: string
  buttonText: string
}

export default function UserInput({
  onSubmit,
  placeholder,
  buttonText,
}: UserInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSubmit(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={input}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        className="w-full bg-white/90 text-gray-800 placeholder-gray-500 rounded-full py-4 px-6 pr-14 text-left focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] shadow-inner"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-[#0EA5E9] hover:bg-[#0284C7] rounded-full p-3 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <ArrowRightIcon className="h-5 w-5 text-white" />
          <span className="sr-only">{buttonText}</span>
        </button>
      </div>
    </form>
  )
}
