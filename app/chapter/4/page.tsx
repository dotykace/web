"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface VideoItem {
    id: number
    title: string
    description: string
    youtubeId: string // Only the video ID, e.g., "dQw4w9WgXcQ"
}

const videos: VideoItem[] = [
    {
        id: 1,
        title: "Ako funguje dotyk na smartfóne?",
        description: "Krátke video vysvetľujúce princípy kapacitných dotykových obrazoviek a ako reagujú na náš dotyk.",
        youtubeId: "dQw4w9WgXcQ", // Placeholder: Rick Astley - Never Gonna Give You Up
    },
    {
        id: 2,
        title: "Vplyv technológií na mozog",
        description:
            "Preskúmajte, ako moderné technológie a neustále pripojenie ovplyvňujú naše kognitívne funkcie a správanie.",
        youtubeId: "xvFZjo5PgG0", // Placeholder: Kurzgesagt – In a Nutshell
    },
    {
        id: 3,
        title: "Digitálny detox: Prečo a ako?",
        description:
            "Tipy a triky, ako si dať pauzu od digitálneho sveta, nájsť rovnováhu a zlepšiť svoje duševné zdravie.",
        youtubeId: "k_okcNVZzCg", // Placeholder: The School of Life
    },
    {
        id: 4,
        title: "Budúcnosť interakcie s technológiami",
        description: "Pozrite sa na inovatívne spôsoby, akými by sme mohli v budúcnosti interagovať s našimi zariadeniami.",
        youtubeId: "Y_9vd4Jb_1Q", // Placeholder: TED Talk
    },
]

export default function Chapter4Page() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center p-4 sm:p-6 md:p-8">
            {/* Back Button */}
            <div className="absolute top-4 left-4 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/menu")}
                    className="text-white hover:bg-white/20"
                >
                    <ArrowLeft className="h-6 w-6" />
                    <span className="sr-only">Späť do menu</span>
                </Button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8 mt-12 sm:mt-16"
            >
                <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">Kapitola 4</h1>
                <p className="text-white/80 text-lg sm:text-xl mt-2">Náučné videá o technológiách a nás</p>
            </motion.div>

            <div className="w-full max-w-3xl space-y-8 mb-12">
                {videos.map((video, index) => (
                    <motion.div
                        key={video.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    >
                        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl rounded-xl overflow-hidden">
                            <CardContent className="p-4 sm:p-6">
                                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">{video.title}</h2>
                                <p className="text-white/80 text-sm sm:text-base mb-4">{video.description}</p>
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                                    <iframe
                                        className="absolute top-0 left-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                        title={video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: videos.length * 0.1 + 0.5 }}
                className="w-full max-w-xs"
            >
                <Button
                    onClick={() => router.push("/menu")}
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200 hover:scale-105"
                >
                    Späť do menu
                </Button>
            </motion.div>
        </div>
    )
}
