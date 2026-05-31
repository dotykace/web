import {AnimatePresence, motion} from "framer-motion";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {readFromStorage, setToStorage} from "@/scripts/local-storage";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {db} from "@/lib/firebase";

export default function AudioChapterInput({currentInteraction, coloring, chapterString, stopAll, goToNextInteraction}: {}) {
  const {id, type} = currentInteraction

  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  useEffect(() => {
    if (currentInteraction?.type !== "input" || !currentInteraction.duration)
      return

    setTimeLeft(currentInteraction.duration)
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          goToNextInteraction()
          return null
        }
        if (
          currentInteraction["warning-after"] &&
          prev === currentInteraction["warning-after"]
        ) {
          setShowWarning(true)
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [currentInteraction?.id])

  const saveToFirestore = async (
    value: string,
    interactionId: string,
    interactionType: string,
  ) => {
    try {
      const docData: Record<string, unknown> = {
        interactionId,
        interactionType,
        responseValue: value,
        chapter: chapterString,
        userId: readFromStorage("playerId") || "anonymous",
        roomId: readFromStorage("roomId") || "no-room",
        sessionId: `session_${Date.now()}`,
        timestamp: serverTimestamp(),
      }
      await addDoc(collection(db, chapterString), docData)
    } catch (error) {
      console.error("Error saving to Firestore:", error)
    }
  }

  const handleChoiceClick = useCallback(
    (choice: { label: string; "next-id": string }) => {
      stopAll()
      if (currentInteraction) {
        saveToFirestore(choice.label, currentInteraction.id, "choice")
      }
      goToNextInteraction(choice["next-id"])
    },
    [currentInteraction, stopAll, goToNextInteraction],
  )

  const handleInputSave = useCallback(() => {
    if (!currentInteraction) return
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (inputValue.trim()) {
      saveToFirestore(inputValue, currentInteraction.id, "input")
      if (id === "pairs-text-field") {
        setToStorage("pairs-text-field", inputValue)
      }
    }
    goToNextInteraction()
  }, [inputValue, currentInteraction, goToNextInteraction])

  const generateContent = () => {
    switch (type){
      case "multiple-choice":
        return (
          <div className="px-2 flex flex-col min-h-0 flex-1 overflow-hidden w-full">
            <p className="text-white text-base sm:text-lg mb-2 flex-shrink-0 text-center font-semibold tracking-wide drop-shadow-lg">
              {currentInteraction.text()}
            </p>
            <div className="space-y-1.5 sm:space-y-2 overflow-y-auto flex-1 min-h-0 pb-2">
              {(
                currentInteraction.choices as Array<{
                  label: string
                  "next-id": string
                }>
              )?.map((choice, index) => (
                <motion.div
                  key={choice.label}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <button
                    onClick={() => handleChoiceClick(choice)}
                    className={`w-full bg-white hover:bg-white/90
                             ${coloring.text} font-semibold text-xs sm:text-base sm:py-2.5 px-2.5 tracking-wide py-2 rounded-full shadow-lg
                             transition-all duration-300 active:scale-[0.98]`}
                  >
                    {choice.label}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )
      case "input":
        return (
          <div className="space-y-4 w-full px-4">
            <p className="text-white text-lg text-center font-medium">
              {currentInteraction.text()}
            </p>
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Napíš svou odpověď..."
              className="bg-white/10 border-2 border-white/30 text-white placeholder:text-white/50
                     resize-none rounded-2xl font-medium tracking-wide focus:border-white/50 focus:ring-white/20 backdrop-blur-sm"
              rows={3}
            />
            {timeLeft !== null && (
              <div className="text-center">
                <div className="text-white font-bold text-sm tracking-wide drop-shadow-md">
                  Zůstává: {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </div>
                {showWarning && currentInteraction["warning-text"] && (
                  <div className="text-yellow-300 text-sm mt-2 font-bold tracking-wide drop-shadow-md">
                    {currentInteraction["warning-text"]}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleInputSave}
              disabled={!inputValue.trim()}
              className={`w-full bg-white hover:bg-white/90
                disabled:bg-white/30 disabled:text-white/50
                ${coloring.text} font-bold tracking-wide py-2 rounded-full shadow-lg
                disabled:shadow-none transition-all duration-300 active:scale-[0.98]`}
            >
              {currentInteraction["save-label"] || "Uložit"}
            </button>
          </div>
        )
      case "message":
        return (
          <div className="w-full space-y-6">
            <p className="text-white text-xl leading-relaxed text-center font-semibold tracking-wide drop-shadow-lg">
              {currentInteraction.text()}
            </p>
          </div>
        )
      case "show-message":
        return (
          <div className="w-full">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl">
              <p className="text-white text-lg leading-relaxed text-center font-medium">
                {readFromStorage("pairs-text-field") || "Žádný vzkaz"}
              </p>
            </div>
          </div>
        )
      default:
        return (
          <div>
            Chyba: Neznámý typ interakce. Nahlaste tento problém vývojářům.
          </div>
        )
    }
  }
  if (!currentInteraction) {
    return (
      <div>
        Chyba: Interakce nebyla poskytnuta. Nahlaste tento problém vývojářům.
      </div>
    )
  }
  return (
    <div className={`flex-1 min-h-0 flex flex-col ${coloring.bg} `}>
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md flex flex-col items-center justify-center text-center min-h-0 max-h-full"
          >
            {generateContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}