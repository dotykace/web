"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Lock } from "lucide-react"

export default function MenuPage() {
    const router = useRouter()
    const [completedChapters, setCompletedChapters] = useState<number[]>([])
    const [unlockedChapters, setUnlockedChapters] = useState<number[]>([1])
    const [userName, setUserName] = useState("")

    useEffect(() => {
        // Check if prelude was completed
        const preludeCompleted = localStorage.getItem("preludeCompleted")
        if (preludeCompleted !== "true") {
            router.push("/")
            return
        }

        // Load user name from prelude
        const preludeVariables = localStorage.getItem("preludeVariables")
        if (preludeVariables) {
            const variables = JSON.parse(preludeVariables)
            setUserName(variables.userName || "")
        }

        // Load completed chapters from localStorage
        const savedCompletedChapters = localStorage.getItem("completedChapters")
        console.log("Saved completed chapters:", savedCompletedChapters)

        if (savedCompletedChapters) {
            const completed = JSON.parse(savedCompletedChapters)
            setCompletedChapters(completed)

            // Unlock next chapter after completed ones
            const maxCompleted = Math.max(...completed, 0)
            const unlocked = []

            // Always unlock chapter 1
            unlocked.push(1)

            // Unlock subsequent chapters based on completion
            for (let i = 2; i <= 4; i++) {
                if (completed.includes(i - 1)) {
                    unlocked.push(i)
                }
            }

            console.log("Unlocked chapters:", unlocked)
            setUnlockedChapters(unlocked)
        }
    }, [router])

    const handleChapterSelect = (chapterNum: number) => {
        if (unlockedChapters.includes(chapterNum)) {
            router.push(`/chapter/${chapterNum}`)
        }
    }

    const chapters = [
        { id: 1, title: "Place & Touch", subtitle: "Miesto a dotyk" },
        { id: 2, title: "Mental & Physical Habits", subtitle: "Mentálne a fyzické návyky" },
        { id: 3, title: "Relationships", subtitle: "Vzťahy" },
        { id: 4, title: "Videos", subtitle: "Videá" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex flex-col items-center justify-center p-4">
            {/* Welcome message */}
            {userName && (
                <motion.div
                    className="mb-8 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
                        <p className="text-sky-700 font-medium">Vítaj späť, {userName}!</p>
                    </div>
                </motion.div>
            )}

            {/* Logo */}
            <motion.div
                className="mb-12"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="relative">
                    <div className="bg-white rounded-full p-8 shadow-2xl">
                        <h1 className="text-4xl font-bold text-sky-500 text-center">dotykáče</h1>
                    </div>
                    <motion.div
                        className="absolute -top-2 -right-2 w-12 h-12 bg-amber-300 rounded-full flex items-center justify-center shadow-lg"
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                        }}
                    >
                        <div className="text-amber-700 text-xl">^_^</div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-2 gap-6 max-w-md w-full">
                {chapters.map((chapter, index) => {
                    const isUnlocked = unlockedChapters.includes(chapter.id)
                    const isCompleted = completedChapters.includes(chapter.id)

                    return (
                        <motion.div
                            key={chapter.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                        >
                            <Card
                                className={`relative overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                                    isUnlocked
                                        ? "border-amber-300 bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 shadow-lg hover:shadow-xl"
                                        : "border-gray-300 bg-gradient-to-br from-gray-200 to-gray-300 opacity-60"
                                } rounded-2xl`}
                                onClick={() => handleChapterSelect(chapter.id)}
                            >
                                <div className="p-6 flex flex-col items-center relative">
                                    <div className="text-6xl font-bold mb-2 text-amber-700">{chapter.id}</div>
                                    <div className="text-amber-900 font-semibold text-center text-sm">Part {chapter.id}</div>
                                    <div className="text-amber-700 text-xs text-center mt-1">{chapter.subtitle}</div>

                                    {/* Completed checkmark */}
                                    {isCompleted && (
                                        <motion.div
                                            className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </motion.div>
                                    )}

                                    {/* Locked overlay */}
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                            <div className="bg-gray-600 rounded-full p-2 shadow-lg">
                                                <Lock className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Debug info */}
            <div className="mt-8 text-white/70 text-sm text-center">
                <div>Dokončené kapitoly: {completedChapters.join(", ") || "žiadne"}</div>
                <div>Odomknuté kapitoly: {unlockedChapters.join(", ")}</div>
            </div>
        </div>
    )
}
