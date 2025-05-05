"use client"

import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  onClick?: () => void
}

export default function Card({ children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="p-2 bg-purple-600 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <h1 className="text-xl font-bold">PhoneCard 📱✨</h1>
        <div className="text-sm">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </div>
      {children}
    </div>
  )
}
