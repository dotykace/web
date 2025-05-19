import {useInteractions} from "@/hooks/use-interactions";
import {AnimatePresence, motion} from "framer-motion";
import Card from "@/components/Card";
import InputArea from "@/components/InputArea";
import {useEffect} from "react";

export default function CardSequence({currentInteraction, history, goToNextInteraction, processText}){

  useEffect(() => {
    console.log("Current interaction:", currentInteraction);
  }, [currentInteraction]);

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
            <Card onClick={()=> goToNextInteraction(currentInteraction["next-id"])}>
              <div className="p-6">
                <p className="text-lg mb-4">{processText(currentInteraction?.text)}</p>

                {/*{currentInteraction?.type === "input" && (*/}
                {/*  <InputArea currentInteraction={currentInteraction} />*/}
                {/*)}*/}

                {/*{!showInput && <div className="text-center text-sm text-gray-500 mt-4">Klikni pro pokračování ✨</div>}*/}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {history.map((interaction) => (
              <div
                key={interaction.id}
                className={`w-2 h-2 rounded-full ${interaction.id === currentInteraction?.id ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
//
//
//
// "use client"
//
// import { useState } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { texts } from "@/data/texts"
// import Card from "@/components/Card"
// import UserInput from "@/components/UserInput"
// import {useInteractions} from "@/hooks/use-interactions";
// import InputArea from "@/components/InputArea";
//
// export default function Home() {
//   const [currentStep, setCurrentStep] = useState(0)
//   const [username, setUsername] = useState("")
//   const [showInput, setShowInput] = useState(true)
//
//   const handleUserInput = (input: string) => {
//     setUsername(input)
//     setShowInput(false)
//     setCurrentStep(1)
//   }
//
//
//   // Replace "UN" placeholder with the actual username
//   const getCardText = (text: string) => {
//     return text.replace(/UN/g, username)
//   }
//
// }
