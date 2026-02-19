import React, { useEffect, useRef, useState } from "react"
import { MessageSquare } from "lucide-react"
import UserInput from "@/components/UserInput"
import { useChatContext } from "@/context/ChatContext"
import MobileNotification from "@/components/mobile-notification"
import { Interaction } from "@/interactions"
import EmojiReactionButton from "@/components/EmojiReactions"
import { motion } from "framer-motion"

import ChatOverlay from "@/components/ChatOverlay"
import ChatBubble from "@/components/ChatBubble"
import { LocalSvgRenderer } from "@/components/LocalSvgRenderer"
import HelpButton from "@/components/HelpButton"
import { useSharedAudio } from "@/context/AudioContext"
import ScreenTransition from "@/components/chapter1/ScreenTransition"
import VoiceRoom from "@/components/chapter1/VoiceRoom"
import { setToStorage } from "@/scripts/local-storage"
import useDB from "@/hooks/use-db"
import FullScreenVideo from "@/components/FullScreenVideo"

export default function Chat() {
  const { currentInteraction, goToNextInteraction } = useChatContext()
  const dbHook = useDB()
  const [hasStarted, setHasStarted] = useState(false)

  const finishChapter = (voice: string) => {
    console.log("Selected voice:", voice)
    setToStorage("selectedVoice", voice)
    dbHook?.updateVoice(voice).then(() => goToNextInteraction())
  }

  if (!hasStarted) {
    return (
      <div className="h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
        <div
          className="fixed w-40 h-40 bg-blue-100 rounded-full pointer-events-none blur-3xl"
          style={{ top: "8%", left: "5%" }}
        />
        <div
          className="fixed w-32 h-32 bg-sky-100 rounded-full pointer-events-none blur-3xl"
          style={{ bottom: "12%", right: "8%" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md space-y-6 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-blue-500 border-2 border-blue-500 shadow-xl flex items-center justify-center">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
          </motion.div>

          <div className="w-full bg-white rounded-3xl p-8 text-center shadow-xl">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Kapitola 1
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-blue-500 mb-8 font-medium text-sm"
            >
              Jsi ready?
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <button
                onClick={() => setHasStarted(true)}
                className="w-full bg-blue-500 hover:bg-blue-600
                           text-white font-bold py-2 px-2 rounded-full shadow-lg shadow-blue-300/40
                           transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Spustit
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <ScreenTransition
      showSecond={currentInteraction.id === "voice-room"}
      firstScreen={<ChatContent />}
      secondScreen={<VoiceRoom onFinish={finishChapter} />}
    />
  )
}

function ChatContent() {
  const { currentInteraction, goToNextInteraction } = useChatContext()
  const { playPreloaded } = useSharedAudio()

  const [dotyFace, setDotyFace] = useState("happy_1")

  const [mode, setMode] = useState<"default" | "overlay">("default")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const { handleUserInput } = useChatContext()
  const [showInput, setShowInput] = useState(false)
  const [showEmojiReactions, setShowEmojiReactions] = useState(false)

  const [history, setHistory] = useState<Interaction[]>([])

  useEffect(() => {
    if (!currentInteraction) return
    if (currentInteraction.type === "music") {
      playPreloaded(currentInteraction.key).then(() => goToNextInteraction())
      return
    }
    if (currentInteraction.type === "message") {
      setHistory((prev) => [...prev, currentInteraction])
      playPreloaded("click")
    }

    if (currentInteraction.face && currentInteraction.face !== dotyFace) {
      setDotyFace(currentInteraction.face)
    }
    if (currentInteraction.id === "1.12") {
      setShowEmojiReactions(true)
    }
    if (currentInteraction.type === "checkpoint") {
      if (currentInteraction.id === "overlay-on") {
        setMode("overlay")
      }
      if (currentInteraction.id === "overlay-off") {
        console.log("Setting mode to default")
        setMode("default")
      }
      if (currentInteraction?.id === "input-on") {
        console.log("opening input")
        setShowInput(true)
      }
    }
  }, [currentInteraction])

  // Scroll to bottom when history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])
  const addUserInputToHistory = (input: string, type?: string) => {
    const userMessage: Interaction = {
      id: `user-${Date.now()}-${Math.random()}`, // FIXED: Ensure unique IDs
      type: "user-message",
      text: input,
      duration: 0,
    }
    setHistory((prev) => [...prev, userMessage])
  }

  if (currentInteraction.type === "video") {
    return (
      <FullScreenVideo
        videoSrc={currentInteraction.source}
        onEnded={() => goToNextInteraction()}
      />
    )
  }

  const notificationProps = {
    id: currentInteraction.id,
    title: "Nová zpráva",
    message: currentInteraction?.text() ?? "",
    icon: <MessageSquare className="h-6 w-6 text-white" />,
  }

  return (
    <main className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600">
      {mode === "overlay" && <ChatOverlay />}

      <div className="w-full max-w-2xl mx-auto flex flex-1 flex-col px-4 overflow-hidden">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 pt-8 pb-2">
          <div className="bg-white/10 rounded-2xl border border-white/20 px-6 py-4 flex items-center gap-3">
            <LocalSvgRenderer filename={dotyFace} className="w-8 h-8" />
            <h2 className="text-white text-lg font-semibold">Zprávy</h2>
            <div className="flex-1" />
            <HelpButton variant="inline" />
          </div>
        </div>

        <div className="flex-shrink-0">
          {currentInteraction?.id === "first-notification" && (
            <MobileNotification
              {...notificationProps}
              isOpen={true}
              duration={currentInteraction?.duration * 1000}
              onClose={() => goToNextInteraction()}
            />
          )}
        </div>

        {/* Chat history - Scrollable */}
        <div
          className="flex-1 overflow-y-auto pt-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
            paddingBottom: showInput ? "140px" : "40px",
          }}
        >
          <div className="py-4">
            {history.map((interaction, index) => {
              const isUserMessage =
                (interaction.type as string) === "user-message" ||
                (interaction.type as string) === "user-message-emoji"
              return (
                <div
                  key={`${interaction.id}-${index}`}
                  className={`mb-4 flex ${
                    isUserMessage ? "justify-end pr-4" : "justify-start pl-2"
                  }`}
                >
                  <div className="max-w-[85%]">
                    <ChatBubble
                      type={interaction.type}
                      text={interaction.text || ""}
                    />
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Input Area at Bottom - Messenger Style */}
        {showInput && (
          <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md bg-gradient-to-t from-indigo-600/90 to-transparent">
            <div className="w-full max-w-2xl mx-auto px-4 pb-6 pt-4">
              <div className="bg-white/10 rounded-2xl border border-white/20 p-4">
                {showEmojiReactions ? (
                  <EmojiReactionButton
                    onSelect={(emoji: string) => {
                      console.log("Selected emoji:", emoji)
                      setShowEmojiReactions(false)
                      addUserInputToHistory(emoji, "emoji")
                      goToNextInteraction("1.03")
                    }}
                  />
                ) : (
                  <UserInput
                    onSubmit={(input) => {
                      handleUserInput(input)
                      addUserInputToHistory(input)
                      console.log("User input submitted:", input)
                    }}
                    placeholder={"Napiš odpověď..."}
                    buttonText="Odeslat"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
