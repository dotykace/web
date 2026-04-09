import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { SkipForward } from "lucide-react"
import React from "react"

export default function SkipButton({
  onSkip,
  visible,
}: {
  onSkip: () => void
  visible?: boolean
}) {
  if (!onSkip || typeof onSkip !== "function") {
    return null
  }
  const skipText = "Přeskočit"
  return (
    <div className="flex justify-center pb-4 shrink-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: visible ? 1 : 0,
          y: visible ? 0 : 20,
        }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button
          disabled={!visible}
          onClick={onSkip}
          variant="ghost"
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm flex items-center gap-2 rounded-full px-4 py-2"
        >
          <SkipForward className="h-2 w-2" />
          {skipText}
        </Button>
      </motion.div>
    </div>
  )
}
