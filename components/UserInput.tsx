"use client"

import type React from "react"

import { useState } from "react"
import { PaperAirplaneIcon } from "@heroicons/react/24/solid"

interface UserInputProps {
  onSubmit: (input: string) => void
  placeholder: string
  buttonText: string
}

export default function UserInput({ onSubmit, placeholder, buttonText }: UserInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSubmit(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
        autoFocus
      />
      <button type="submit" className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors">
        <PaperAirplaneIcon className="h-5 w-5" />
        <span className="sr-only">{buttonText}</span>
      </button>
    </form>
  )
}
