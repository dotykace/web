"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useMemo } from "react"
import Card from "@/components/Card"
import InputArea from "@/components/InputArea"
import type { CardSequenceProps, Interaction } from "@/interactions"

export default function CardSequence({
                                         currentInteraction,
                                         history,
                                         goToNextInteraction,
                                         processText,
                                     }: CardSequenceProps) {
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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
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
            </div>

            <div className="w-full max-w-md mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentInteraction?.id}
                        initial={{ opacity: 0, y: 50, rotateX: -15 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, y: -50, rotateX: 15 }}
                        transition={{
                            duration: 0.6,
                            type: "spring",
                            stiffness: 100,
                            damping: 15,
                        }}
                        className="w-full perspective-1000"
                    >
                        <Card
                            onClick={() => {
                                if (currentInteraction?.type === "message" && currentInteraction["nextId"]) {
                                    goToNextInteraction(currentInteraction["nextId"])
                                }
                            }}
                            className="transform-gpu"
                        >
                            <div className="p-8">
                                {/* Message content with enhanced typography */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="mb-6"
                                >
                                    <p className="text-xl leading-relaxed font-medium text-white/95 tracking-wide">
                                        {processText(currentInteraction?.text)}
                                    </p>
                                </motion.div>

                                {/* Input/Choice area */}
                                {(currentInteraction?.type === "input" || currentInteraction?.type === "multiple-choice") && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5, duration: 0.4 }}
                                    >
                                        <InputArea currentInteraction={currentInteraction} goToNextInteraction={goToNextInteraction} />
                                    </motion.div>
                                )}

                                {/* Click hint for message types */}
                                {currentInteraction?.type === "message" && currentInteraction?.["nextId"] && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1, duration: 0.5 }}
                                        className="text-center mt-6"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.05, 1],
                                                opacity: [0.7, 1, 0.7],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "easeInOut",
                                            }}
                                            className="inline-flex items-center gap-2 text-white/70 text-sm font-medium"
                                        >
                                            <span>Klikni pre pokračování</span>
                                            <motion.span
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                ✨
                                            </motion.span>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Progress indicators */}
                <motion.div
                    className="flex justify-center mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <div className="flex space-x-3">
                        {history.map((interaction: Interaction, index: number) => (
                            <motion.div
                                key={interaction.id}
                                className={`relative overflow-hidden rounded-full ${
                                    interaction.id === currentInteraction?.id
                                        ? "w-8 h-3 bg-gradient-to-r from-pink-400 to-purple-400"
                                        : "w-3 h-3 bg-white/30"
                                }`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                                whileHover={{ scale: 1.2 }}
                            >
                                {interaction.id === currentInteraction?.id && (
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Number.POSITIVE_INFINITY,
                                            ease: "easeInOut",
                                        }}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
