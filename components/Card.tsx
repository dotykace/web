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
      {children}
    </div>
  )
}
