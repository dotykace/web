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
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <input
        type="text"
        value={input}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        className="w-full bg-gray-900 text-gray-400 rounded-full py-4 px-6 text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
        //autoFocus
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <button
          type="submit"
          className="bg-purple-600 rounded-full p-3 flex items-center justify-center hover:bg-purple-700 transition-colors"
        >
          <ArrowRightIcon className="h-5 w-5 text-white" />
          <span className="sr-only">{buttonText}</span>
        </button>
      </div>
    </form>
  )
}
