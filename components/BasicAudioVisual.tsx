import {Card, CardContent} from "@/components/ui/card";
import React from "react";
import {AnimatePresence, motion} from "framer-motion";
import VoiceVisualization from "@/components/VoiceVisualization";
import {useSharedAudio} from "@/context/AudioContext";
import SkipButton from "@/components/SkipButton";
import AudioControl from "@/components/AudioControl";

export default function BasicAudioVisual({ audio=null, id, children, coloring = "bg-white/10", canSkip}: {children?: React.ReactNode, coloring?: string, canSkip?:boolean}) {

  const {playOnce, stop, toggleOnce, isPlaying} = useSharedAudio()
  React.useEffect(() => {
    if (audio) {
      playOnce(audio);
    }
  }, [audio, playOnce]);

  const skipInteraction = () => {
    stop(audio.filename)
    if (audio.onFinish){
      audio.onFinish()
    }
  }
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${coloring}`}>
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
          <AudioControl
            onClick={() => toggleOnce(audio)}
            audioEnabled={isPlaying[audio?.filename] || false}
            disabled={!audio}
          />
          <CardContent className="p-8 text-center">
            {children ?? <VoiceVisualization/>}
          </CardContent>
        </Card>
        </motion.div>
      </AnimatePresence>
      <SkipButton onSkip={skipInteraction} visible={audio && canSkip}/>
    </div>
  )
}