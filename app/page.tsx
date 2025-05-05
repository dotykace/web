"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { texts } from "@/data/texts"
import ChatBubble from "@/components/ChatBubble"
import UserInput from "@/components/UserInput"

export default function Home() {
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState("")
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([{ text: texts.intro, isUser: false }])

  const handleUserInput = (input: string) => {
    if (step === 1) {
      setUsername(input)
      setMessages([
        ...messages,
        { text: input, isUser: true },
        { text: texts.nameResponse.replace("UN", input), isUser: false },
      ])
      setStep(2)

      // Schedule the next messages with delays
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: texts.purpose, isUser: false }])
        setStep(3)
      }, 1000)

      setTimeout(() => {
        setMessages((prev) => [...prev, { text: texts.game, isUser: false }])
        setStep(4)
      }, 2500)

      setTimeout(() => {
        setMessages((prev) => [...prev, { text: texts.youAreYou.replace("UN", input), isUser: false }])
        setStep(5)
      }, 4000)

      setTimeout(() => {
        setMessages((prev) => [...prev, { text: texts.phoneRole, isUser: false }])
        setStep(6)
      }, 5500)

      setTimeout(() => {
        setMessages((prev) => [...prev, { text: texts.imagination, isUser: false }])
        setStep(7)
      }, 7000)

      setTimeout(() => {
        setMessages((prev) => [...prev, { text: texts.usualMessage, isUser: false }])
        setStep(8)
      }, 8500)
    } else {
      setMessages([...messages, { text: input, isUser: true }])

      // Respond with a random emoji
      const emojis = ["🔋", "📱", "✨", "🤖", "👾", "💬", "🎮"]
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: `${randomEmoji} ${texts.batteryLow}`,
            isUser: false,
          },
        ])
      }, 1000)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 bg-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold">PhoneChat 📱✨</h1>
          <div className="text-sm">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        </div>

        <div className="h-[70vh] overflow-y-auto p-4 bg-gray-100">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChatBubble text={message.text} isUser={message.isUser} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t">
          {step === 1 ? (
            <UserInput onSubmit={handleUserInput} placeholder="Jak ti mám říkat?" buttonText="Odeslat" />
          ) : (
            <UserInput onSubmit={handleUserInput} placeholder="Napiš zprávu..." buttonText="Odeslat" />
          )}
        </div>
      </div>
    </main>
  )
}
