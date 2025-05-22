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
      className="bg-white rounded-3xl shadow-xl overflow-hidden transform transition-transform"
    >
      {children}
    </div>
  )
}
