import Image from "next/image"
import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState, useRef, useCallback } from "react"
import { GalleryModal } from "@/components/chapter4/GalleryModal"
import { setToStorage } from "@/scripts/local-storage"
import { useSharedAudio } from "@/context/AudioContext"
import AudioControl from "@/components/AudioControl"
import { motion, AnimatePresence } from "framer-motion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

export default function Gallery({
  images,
  helpText,
  onFinish,
  audio,
}: {
  images: string[]
  helpText: string
  onFinish: (image: string) => void
  audio: { filename: string; type: "sound" | "voice"; onFinish: () => void }
}) {
  const { playOnce, toggleOnce, isPlaying, stop } = useSharedAudio()
  const confirmText = "Potvrdit"
  const hasPlayedRef = useRef(false)
  const strings = images.slice(0, 5)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [api, setApi] = useState<CarouselApi>()
  const [showModal, setShowModal] = useState(false)

  // Sync carousel with current index
  useEffect(() => {
    if (!api) return

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap())
    })
  }, [api])

  const handleSelect = useCallback(() => {
    setSelectedIndex((prev) => (prev === currentIndex ? null : currentIndex))
  }, [currentIndex])

  const handleDownload = (imagePath: string) => {
    const link = document.createElement("a")
    link.href = imagePath
    link.download = "Dotykace-Result.jpg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const saveSelection = (download: boolean) => {
    const selectedImage = strings[selectedIndex ?? 0]
    if (download) {
      handleDownload(selectedImage)
    }
    setToStorage("gallerySelection", selectedImage)
    if (onFinish) {
      onFinish(selectedImage)
    }
    setShowModal(false)
  }

  useEffect(() => {
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true
      playOnce(audio)
    }
  }, [audio, playOnce])

  return (
    <div className="w-full h-full overflow-hidden relative flex flex-col">
      {/* Audio control */}
      <AudioControl
        onClick={() => toggleOnce(audio)}
        audioEnabled={isPlaying[audio?.filename] || false}
        disabled={!audio}
      />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full"
            style={{
              background: `radial-gradient(circle, ${
                [
                  "rgba(168,85,247,0.3)",
                  "rgba(59,130,246,0.3)",
                  "rgba(236,72,153,0.3)",
                ][i % 3]
              } 0%, transparent 70%)`,
              left: `${(i * 20) % 100}%`,
              top: `${(i * 15 + 10) % 100}%`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        className="shrink-0 pt-2 pb-1 px-4 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <motion.div
            className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/20"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />
            <span className="text-white text-xs font-medium">{helpText}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Carousel */}
      <div className="flex-1 min-h-0 px-4 z-10 py-2 flex items-center overflow-hidden">
        <Carousel
          setApi={setApi}
          className="w-full max-w-md mx-auto h-full"
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 h-full">
            {strings.map((src, index) => (
              <CarouselItem key={index} className="pl-2 basis-[85%] h-full">
                <motion.div
                  className="relative w-full h-full flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Card glow effect */}
                  <AnimatePresence>
                    {selectedIndex === index && (
                      <motion.div
                        className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl blur-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Image card */}
                  <motion.div
                    style={{ aspectRatio: "4/5" }}
                    className={`relative h-full max-w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      selectedIndex === index
                        ? "ring-4 ring-white shadow-2xl"
                        : currentIndex === index
                          ? "ring-2 ring-white/50"
                          : "ring-1 ring-white/20 opacity-60 scale-95"
                    }`}
                    whileTap={{ scale: 0.98 }}
                    onClick={currentIndex === index ? handleSelect : undefined}
                  >
                    <Image
                      src={src}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                    />

                    {/* Selection overlay */}
                    <AnimatePresence>
                      {selectedIndex === index && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-green-500/40 to-transparent"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Selection badge */}
                    <motion.div
                      className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        selectedIndex === index
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                          : "bg-black/40 backdrop-blur-sm border-2 border-white"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {selectedIndex === index && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Check className="w-6 h-6" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Image number */}
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-sm font-medium">
                        {index + 1} / {strings.length}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Bottom controls */}
      <div className="shrink-0 px-4 pb-4 pt-2 z-10">
        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mb-2">
          {strings.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === i
                  ? "bg-white w-6"
                  : selectedIndex === i
                    ? "bg-green-400 w-1.5"
                    : "bg-white/30 w-1.5"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 max-w-md mx-auto">
          <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSelect}
              className={`w-full py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${
                selectedIndex === currentIndex
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-white hover:bg-white/90 text-indigo-900"
              }`}
            >
              {selectedIndex === currentIndex ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> Vybráno
                </span>
              ) : (
                "Vybrat"
              )}
            </Button>
          </motion.div>

          <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                stop(audio.filename)
                setShowModal(true)
              }}
              disabled={selectedIndex === null}
              className={`w-full py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${
                selectedIndex !== null
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-white/20 text-white/50 cursor-not-allowed"
              }`}
            >
              {confirmText}
            </Button>
          </motion.div>
        </div>
      </div>

      <GalleryModal isOpen={showModal} onClose={saveSelection} />
    </div>
  )
}
