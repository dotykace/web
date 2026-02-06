import Link from "next/link"
import { motion } from "framer-motion"
import { Settings } from "lucide-react"

export default function EditorButton() {
  return (
    <div className="absolute top-4 right-4 z-50 hidden md:block">
      <Link href="/interactions">
        <motion.div
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-full backdrop-blur-sm shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Editor interakcí</span>
        </motion.div>
      </Link>
    </div>
  )
}
