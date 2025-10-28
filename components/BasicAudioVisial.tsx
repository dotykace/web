import {Card, CardContent} from "@/components/ui/card";
import React from "react";
import {AnimatePresence, motion} from "framer-motion";
import VoiceVisualization from "@/components/VoiceVisualization";

export default function BasicAudioVisial({id, children, coloring = "bg-white/10"}: {children?: React.ReactNode, coloring?: string}) {
  return (
    <div className={"min-h-screen flex items-center justify-center p-4 "+ coloring}>
      <AnimatePresence mode="wait">
        <motion.div
          key={id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={"w-full flex items-center justify-center"}
        >
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl rounded-xl">
          <CardContent className="p-8 text-center">
            {children ?? <VoiceVisualization/>}
          </CardContent>
        </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}