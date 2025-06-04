"use client"

import { useEffect, useRef, useMemo } from "react"
import { MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import InputArea from "@/components/InputArea"
import type { ChatProps, Interaction } from "@/interactions"

export default function Chat({ history, processText, currentInteraction, goToNextInteraction }: ChatProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Stable orb positions that don't change on re-renders
    const orbData = useMemo(
        () =>
            Array.from({ length: 8 }, (_, i) => ({
                id: i,
                color: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff", "#5f27cd"][i],
                size: 100 + i * 50,
                initialX: Math.random() * 100,
                initialY: Math.random() * 100,
                duration: 10 + i * 2,
                delay: i * 1.5,
            })),
        [],
    )

    // Scroll to bottom when history updates
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [history])

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-500/20" />

            {/* Floating orbs with stable positions */}
            {orbData.map((orb) => (
                <motion.div
                    key={orb.id}
                    className="absolute rounded-full mix-blend-screen filter blur-xl opacity-70"
                    style={{
                        background: `radial-gradient(circle, ${orb.color}, transparent)`,
                        width: `${orb.size}px`,
                        height: `${orb.size}px`,
                        left: `${orb.initialX}%`,
                        top: `${orb.initialY}%`,
                    }}
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: orb.duration,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: orb.delay,
                    }}
                />
            ))}

            {/* Chat container - simple fixed positioning */}
            <div className="absolute inset-4 flex flex-col max-w-md mx-auto">
                {/* Header */}
                <motion.div
                    className="bg-white/10 backdrop-blur-sm rounded-t-xl p-4 flex items-center gap-3 border-b border-white/20 shadow-lg"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <MessageSquare className="w-6 h-6 text-white" />
                    <h1 className="text-xl font-semibold text-white">Interaktivní chat</h1>
                </motion.div>

                {/* Messages area */}
                <div className="flex-1 bg-white/5 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {history.map((interaction: Interaction, index: number) => (
                            <div
                                key={`${interaction.id}-${index}`}
                                className={`flex ${interaction.type === "user-message" ? "justify-end" : "justify-start"}`}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={`max-w-[80%] ${
                                        interaction.type === "user-message"
                                            ? "bg-indigo-600/90 text-white rounded-xl rounded-tr-none"
                                            : interaction.type === "message"
                                                ? "bg-white/20 text-white rounded-xl rounded-tl-none border border-white/10"
                                                : interaction.type === "notification"
                                                    ? "bg-gray-800/50 text-white rounded-xl text-center border border-white/10"
                                                    : ""
                                    } p-3 backdrop-blur-sm shadow-lg`}
                                >
                                    {interaction.type === "animation" ? (
                                        <div className="flex justify-center items-center h-12">
                                            <motion.div
                                                className="text-3xl"
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    rotate: [0, 10, -10, 0],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                ✨
                                            </motion.div>
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-relaxed">
                                            {interaction.type === "user-message" ? interaction.text : processText(interaction.text)}
                                        </p>
                                    )}
                                </motion.div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input area */}
                <motion.div
                    className="bg-white/10 backdrop-blur-sm rounded-b-xl p-4 border-t border-white/20 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <InputArea currentInteraction={currentInteraction} goToNextInteraction={goToNextInteraction} />
                </motion.div>
            </div>
        </div>
    )
}
