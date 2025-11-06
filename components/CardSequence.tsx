import {AnimatePresence, motion} from "framer-motion";
import Card from "@/components/Card";
import InputArea from "@/components/InputArea";
import {useEffect, useState} from "react";
import {useChatContext} from "@/context/ChatContext";
import {useAudioManager} from "@/hooks/use-audio";

export default function CardSequence(){

  const {currentInteraction, goToNextInteraction} = useChatContext()
  const [history, setHistory] = useState([])

  const { preloadAll, playPreloaded } = useAudioManager();
  const soundMap = {
    "sound-test": {filename: "vykreslovanie TECKY.mp3"},
    "game-confirm": {filename: "JINGEL - pozitiv.mp3"},
  }
  useEffect(() => {
    preloadAll(soundMap).then(() => {
      console.log("All sounds preloaded");
    });
  }, []);

  useEffect(() => {
    if (!currentInteraction) return;
    if (currentInteraction.type === "music" ) {
      playPreloaded(currentInteraction.key)
      return;
    }
    setHistory((prev) => [...prev, currentInteraction] )
  }, [currentInteraction]);

  // todo maybe dont go to the next interaction automatically
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      <div className="w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentInteraction?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card
              onClick={()=>{
              if(currentInteraction.type === "message"){
                goToNextInteraction()
              }
            }}>
              <div className="p-6">
                <p className="text-lg mb-4">{currentInteraction?.text()}</p>

                {(currentInteraction?.type === "input" || currentInteraction?.type === "multiple-choice") && (
                  <InputArea/>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {history.map((interaction, index) => (
              <div
              key={index}
              className={`w-2 h-2 rounded-full ${index+1 === history.length ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}