"use client"

import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export default function Card({ children, onClick, className = "" }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 
                  overflow-hidden transform transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  )
}
