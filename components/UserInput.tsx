"use client"

import type React from "react"
import { useState } from "react"
import { ArrowRightIcon } from "lucide-react"

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
        <form onSubmit={handleSubmit} className="flex gap-3">
            <input
                type="text"
                value={input}
                placeholder={placeholder}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/20 backdrop-blur-sm"
                autoFocus
            />
            <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors disabled:opacity-50"
                disabled={!input.trim()}
            >
                <ArrowRightIcon className="h-5 w-5" />
                <span className="sr-only">{buttonText}</span>
            </button>
        </form>
    )
}
