"use client"

import type React from "react"

import { useState } from "react"
import {redirect, useRouter} from "next/navigation"
import { motion } from "framer-motion"
import { Lock, CheckCircle, Triangle, Square, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import {readFromStorage} from "@/scripts/local-storage";

// Define the section types and states
type SectionState = "locked" | "unlocked" | "completed"

interface Section {
  id: number
  title: string
  subtitle: string
  path: string
  state: SectionState
  icon: React.ReactNode
}

export default function MenuPage() {
  const router = useRouter()
  const chapter = readFromStorage("chapter") as number

  // Initial sections data with states
  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      title: "Chapter 1",
      subtitle: "Place & Touch",
      path: "/chapter1",
      state: "unlocked",
      icon: <Triangle className="w-6 h-6" />,
    },
    {
      id: 2,
      title: "Part 2",
      subtitle: "Mental & Physical Habits",
      path: "/part2",
      state: "locked",
      icon: <Square className="w-6 h-6" />,
    },
    {
      id: 3,
      title: "Part 3",
      subtitle: "Relationships",
      path: "/part3",
      state: "locked",
      icon: <Circle className="w-6 h-6" />,
    },
    {
      id: 4,
      title: "Part 4",
      subtitle: "Relationships",
      path: "/part4",
      state: "locked",
      icon: <Triangle className="w-6 h-6" />,
    },
  ])

  // Handle section click
  const handleSectionClick = (section: Section) => {
    if (section.state !== "locked") {
      router.push(section.path)
    }
  }

  // Get state indicator component
  const getStateIndicator = (state: SectionState) => {
    switch (state) {
      case "locked":
        return <Lock className="w-5 h-5 text-gray-400" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return null
    }
  }

  if( chapter == undefined || chapter === 0) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 max-w-md mx-auto">
      {/* Logo placeholder - smaller for mobile */}
      <div className="flex justify-center mb-6 mt-4">
        <motion.div
          className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          LOGO
        </motion.div>
      </div>

      {/* Menu grid - single column for mobile */}
      <div className="grid grid-cols-1 gap-4">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            className={cn(
              "bg-white rounded-xl p-5 shadow-md cursor-pointer transition-all duration-300 relative overflow-hidden",
              section.state === "locked" ? "opacity-70" : "active:bg-gray-50",
              section.state === "completed" ? "border-2 border-green-400" : "",
            )}
            onClick={() => handleSectionClick(section)}
            whileTap={section.state !== "locked" ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: section.id * 0.1 }}
          >
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full opacity-30" />

            {/* Content */}
            <div className="flex items-center space-x-4 relative z-10">
              <div className="bg-gray-100 p-3 rounded-lg flex-shrink-0">{section.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">{section.title}</h2>
                  {getStateIndicator(section.state)}
                </div>
                <p className="text-sm text-gray-600 mt-1">{section.subtitle}</p>
              </div>
            </div>

            {/* Locked overlay */}
            {section.state === "locked" && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
