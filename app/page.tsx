"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if prelude was completed
    const preludeCompleted = localStorage.getItem("preludeCompleted")

    if (preludeCompleted === "true") {
      // Redirect to menu if prelude was already completed
      router.push("/menu")
    } else {
      // Redirect to prelude
      setTimeout(() => {
        router.push("/prelude")
      }, 2000)
    }
  }, [router])

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center"
        >
          <div className="bg-white p-8 rounded-full shadow-2xl mb-8">
            <h1 className="text-6xl font-bold text-sky-500 mb-2">dotykáče</h1>
            <p className="text-sky-700 text-xl">Interaktívna skúsenosť</p>
          </div>

          <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-white text-lg"
          >
            Načítavam...
          </motion.div>
        </motion.div>
      </div>
  )
}
