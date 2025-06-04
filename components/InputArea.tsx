"use client"

import UserInput from "@/components/UserInput"
import { useChatContext } from "@/context/ChatContext"
import type { InputAreaProps, Choice } from "@/interactions"
import { motion } from "framer-motion"

export default function InputArea({ currentInteraction, goToNextInteraction }: InputAreaProps) {
  const { handleUserInput, handleChoiceSelection } = useChatContext()

  switch (currentInteraction?.type) {
    case "input":
      return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <UserInput onSubmit={handleUserInput} placeholder={"Napiš odpověď..."} buttonText="Odeslat" />
          </motion.div>
      )
    case "multiple-choice":
      return (
          <div className="space-y-3">
            {currentInteraction.choices?.map((choice: Choice, index: number) => (
                <motion.button
                    key={index}
                    onClick={() => handleChoiceSelection(choice)}
                    className="w-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-400/90 hover:to-pink-400/90 transition-all duration-300 py-4 px-6 rounded-2xl text-white font-semibold text-lg shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 20px 40px -12px rgba(168, 85, 247, 0.4)",
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + index * 0.1 }}>
                    {choice.type}
                  </motion.span>
                </motion.button>
            ))}
          </div>
      )
    default:
      return <div />
  }
}
