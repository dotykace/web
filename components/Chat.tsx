import {useEffect, useRef, useState} from "react";
import {MessageSquare} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import InputArea from "@/components/InputArea";

export default function Chat({history, processText}) {
  const [mode, setMode] = useState<"default"|"overlay">("default")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  return(
    <div className="w-full max-w-md mx-auto flex flex-col h-[calc(100vh-2rem)]">
      <div className="bg-white/10 backdrop-blur-sm rounded-t-xl p-3 flex items-center gap-3 border-b border-white/20">
        <MessageSquare className="w-6 h-6 text-white" />
        <h1 className="text-xl font-semibold text-white">Interaktivní chat</h1>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5 backdrop-blur-sm">
        {history.map((interaction, index) => (
          <div
            key={`${interaction.id}-${index}`}
            className={`max-w-[80%] ${interaction.type === "user-message" ? "ml-auto" : "mr-auto"}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {interaction.type === "user-message" ? (
                  <div className="bg-indigo-600 text-white p-3 rounded-xl rounded-tr-none">
                    <p>{interaction.text}</p>
                  </div>
                ) : interaction.type === "message" ? (
                  <div className="bg-white/20 text-white p-3 rounded-xl rounded-tl-none">
                    <p>{processText(interaction.text)}</p>
                  </div>
                ) : interaction.type === "notification" ? (
                  <div className="bg-gray-800/50 text-white p-3 rounded-xl text-center w-full max-w-full mx-auto">
                    <p>{processText(interaction.text)}</p>
                  </div>
                ) : interaction.type === "animation" ? (
                  <div className="flex justify-center items-center h-20 w-full max-w-full mx-auto">
                    <div className="animate-bounce text-4xl">✨</div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {/*<InputArea />*/}
    </div>
  )
}