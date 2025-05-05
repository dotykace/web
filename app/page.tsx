"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { texts } from "@/data/texts"
import Card from "@/components/Card"
import UserInput from "@/components/UserInput"

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [username, setUsername] = useState("")
  const [showInput, setShowInput] = useState(true)

  const handleUserInput = (input: string) => {
    setUsername(input)
    setShowInput(false)
    setCurrentStep(1)
  }

  const handleNextCard = () => {
    if (currentStep < texts.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Replace "UN" placeholder with the actual username
  const getCardText = (text: string) => {
    return text.replace(/UN/g, username)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      <div className="w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card onClick={handleNextCard}>
              <div className="p-6">
                <p className="text-lg mb-4">{getCardText(texts[currentStep])}</p>

                {showInput && currentStep === 0 && (
                  <UserInput onSubmit={handleUserInput} placeholder="Jak ti mám říkat?" buttonText="Pokračovat" />
                )}

                {!showInput && <div className="text-center text-sm text-gray-500 mt-4">Klikni pro pokračování ✨</div>}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {texts.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
