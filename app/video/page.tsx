"use client"


import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import HelpButton from "@/components/HelpButton";

interface VideoItem {
    id: number
    title: string
    description: string
    filename: string // videos are stored in public/videos/
}

const videos: VideoItem[] = [
    {
        id: 1,
        title: "Dopamin",
        description: "Popis videa o dopamíne a jeho vplyve na naše správanie v digitálnom svete.",
        fileName: "DOPAMIN27.10.mp4",
    },
]

export default function Chapter4Page() {

  const pageHeader = "Kapitola 4"
  const pageSubheader = "Náučné videá o technológiách a nás"

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center p-4 sm:p-6 md:p-8">
            <HelpButton/>

            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8 mt-12 sm:mt-16"
            >
                <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">{pageHeader}</h1>
                <p className="text-white/80 text-lg sm:text-xl mt-2">{pageSubheader}</p>
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
                                  <video
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={`/videos/${video.fileName}`}
                                    title={video.title}
                                    controls
                                    playsInline
                                  />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
