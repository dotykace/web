import {useEffect, useRef, useState} from "react";
import {MessageSquare} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import UserInput from "@/components/UserInput";
import {useChatContext} from "@/context/ChatContext";
import MobileNotification from "@/components/mobile-notification";
import {Interaction} from "@/interactions";
import EmojiReactionButton from "@/components/EmojiReactions";

import ChatOverlay from "@/components/ChatOverlay";

export default function Chat({ currentInteraction, goToNextInteraction}) {
  const [mode, setMode] = useState<"default"|"overlay">("default")
  const messagesEndRef = useRef<HTMLDivElement|null>(null)

  const [showNotification, setShowNotification] = useState(false)
  const {handleUserInput} = useChatContext()
  const [showInput, setShowInput] = useState(false)
  const [showEmojiReactions, setShowEmojiReactions] = useState(false);


  const [history, setHistory] = useState([])

  const notificationProps ={
    title: "New Message",
    message: currentInteraction?.text() ?? "",
    icon: <MessageSquare className="h-6 w-6 text-white" />,}

  useEffect(() => {
    if (!currentInteraction) return;
    setHistory((prev) => [...prev, currentInteraction])
    if (currentInteraction.id === "1.12") {
      setShowEmojiReactions(true);
    }
    if (currentInteraction.id === "1.5"){
      setShowNotification(true);
    }
    if(currentInteraction.type === "checkpoint"){
      if (currentInteraction.id === "overlay-on") {
        setMode("overlay");
      }
      if (currentInteraction.id === "overlay-off") {
        console.log("Setting mode to default");
        setMode("default");
      }
      if(currentInteraction?.id === "input-on") {
        console.log("opening input")
        setShowInput(true)
      }
    }
  }, [currentInteraction]);

  // Scroll to bottom when history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])
  const addUserInputToHistory = (input: string, type?: string) => {
    const userMessage: Interaction = {
      id: `user-${Date.now()}-${Math.random()}`, // FIXED: Ensure unique IDs
      type: "user-message"+ (type ? `-${type}` : ""),
      text: input,
      duration: 0,
    }
    setHistory((prev) => [...prev, userMessage]);
  }

  return(
    <div className="w-full max-w-md mx-auto flex flex-col p-2 h-[calc(100vh)] bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      {(mode==="overlay" )&& <ChatOverlay currentInteraction={currentInteraction} goToNextInteraction={goToNextInteraction}/>}
      <div className="bg-white/10 backdrop-blur-sm rounded-t-xl p-3 flex items-center gap-3 border-b border-white/20">
        <MessageSquare className="w-6 h-6 text-white" />
        <h1 className="text-xl font-semibold text-white">Interaktivní chat</h1>
      </div>

      <div>
        {currentInteraction?.type === "notification" && (
          <MobileNotification
            {...notificationProps}
            isOpen={showNotification}
            duration={currentInteraction?.duration * 1000}
            onClose={() => setShowNotification(false)}
          />
        )}
      </div>

      {/* Chat history */}
      {history.length > 0 && (<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5 backdrop-blur-sm">
        {history.map((interaction, index) => (
          <div
            key={`${interaction.id}-${index}`}
            className={`max-w-[80%] ${interaction.type.includes("user-message")  ? "ml-auto" : "mr-auto"}`}
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
                ) : interaction.type === "user-message-emoji" ? (
                  <div className="flex justify-end items-center h-20 w-full max-w-full mx-auto">
                    <div className="text-5xl border-indigo-600 border-4 bg-indigo-600/50 rounded-xl rounded-tr-none p-3">
                      {interaction.text}
                    </div>
                  </div>
                ): interaction.type === "message" ? (
                  <div className="bg-white/20 text-white p-3 rounded-xl rounded-tl-none">
                    <p>{interaction.text()}</p>
                  </div>
                ): interaction.type === "animation" ? (
                  <div className="flex justify-center items-center h-20 w-full max-w-full mx-auto">
                    <div className="animate-bounce text-4xl">✨</div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>)}

      {/* Input area */}
      {/*
      // todo make it function properly in greater context
      // todo either dont have user input as interaction or make it work properly
      // todo maybe separate user inputs and interactions
      */}
      <div className="bg-white/10 backdrop-blur-sm rounded-b-xl p-4 border-t border-white/20">
        {showInput && (showEmojiReactions? (
          <EmojiReactionButton onSelect={(emoji)=>{
            console.log("Selected emoji:", emoji);
            setShowEmojiReactions(false)
            addUserInputToHistory(emoji, "emoji");
            goToNextInteraction("1.13")
          }}/>
          ) : (
          <UserInput onSubmit={(input)=>{
            handleUserInput(input)
            addUserInputToHistory(input);
            console.log("User input submitted:", input);
          }}
         placeholder={"Napiš odpověď..."}
         buttonText="Odeslat"
          />
        ))}
      </div>
    </div>
  )
}