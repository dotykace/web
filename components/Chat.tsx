import {useEffect, useRef, useState} from "react";
import {MessageSquare, Send} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import InputArea from "@/components/InputArea";
import {Button} from "@/components/ui/button";
import AnimatedDot from "@/components/AnimatedDot";
import UserInput from "@/components/UserInput";
import {useChatContext} from "@/context/ChatContext";
import MobileNotification from "@/components/mobile-notification";

export default function Chat({ processText, currentInteraction, goToNextInteraction}) {
  const [mode, setMode] = useState<"default"|"overlay">("default")
  const [isVisible, setIsVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement|null>(null)

  // const {handleUserInput} = useChatContext()
  const [showNotification, setShowNotification] = useState(false)
  const [showInput, setShowInput] = useState(false)

  const [history, setHistory] = useState([])

  const notificationProps ={
    title: "New Message",
    message: currentInteraction?.text ?? "",
    //message: processText(currentInteraction? currentInteraction?.text : ""),
    icon: <MessageSquare className="h-6 w-6 text-white" />,}

  useEffect(() => {
    if (!currentInteraction) return;
    setHistory((prev) => [...prev, currentInteraction])
    
    if(currentInteraction.type === "checkpoint"){
      if( currentInteraction.id === "overlay") {
        setMode("overlay")
      }
    }
  }, [currentInteraction]);

  // Scroll to bottom when history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  useEffect(() => {
    if (currentInteraction?.type === "notification") {
      if(currentInteraction?.id === "1.5") {
        console.log("opening input")
        setShowInput(true)
      }
      if(currentInteraction?.id === "1.9") {
        setIsVisible(true)
      }
      setShowNotification(true)
      console.log("Notification triggered for interaction:", currentInteraction?.id);
    }
  }, [currentInteraction]);

  return(
    <div className="w-full max-w-md mx-auto flex flex-col p-2 h-[calc(100vh)] bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      {(mode==="overlay" )&& (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          {showNotification && (
            <MobileNotification
              {...notificationProps}
              isOpen={showNotification}
              duration={currentInteraction?.duration * 1000}
              onClose={() => setShowNotification(false)}
              onNotificationClick={() => console.log("Notification clicked")}
            />
          )}
          <AnimatedDot
            animationDuration={
              {grow: currentInteraction.duration,
                pulse: currentInteraction.duration * 0.5,
                reveal: currentInteraction.duration * 0.5,
                expand: currentInteraction.duration * 1.5}
            }
            isVisible={isVisible}
            dotColor={"white"}
            glowColor={"white"}
            position={{ x: "calc(90% - 20px)", y: "calc(60% - 20px)" }}
            revealComponent={
              <button className="px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                <Send/>
              </button>
            }
            onAnimationComplete={() => {
              goToNextInteraction("1.10")
            }}
          />
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-sm rounded-t-xl p-3 flex items-center gap-3 border-b border-white/20">
        <MessageSquare className="w-6 h-6 text-white" />
        <h1 className="text-xl font-semibold text-white">Interaktivní chat</h1>
      </div>

      <div>
        {currentInteraction?.type === "notification" && (
          <MobileNotification
            {...notificationProps}
            isOpen={showNotification}
            onClose={() => setShowNotification(false)}
            onNotificationClick={() => console.log("Notification clicked")}
          />
        )}
      </div>

      {/* Chat history */}
      {history.length > 0 && (<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5 backdrop-blur-sm">
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
        {showInput && (
          <UserInput onSubmit={(input)=>{
            //setShowInput(false);
            //handleUserInput(input)
            console.log("User input submitted:", input);
          }}
         placeholder={"Napiš odpověď..."}
         buttonText="Odeslat"
          />
        )}
      </div>
    </div>
  )
}