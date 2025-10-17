import React, {useEffect, useRef, useState} from "react";
import {MessageSquare} from "lucide-react";
import UserInput from "@/components/UserInput";
import {useChatContext} from "@/context/ChatContext";
import MobileNotification from "@/components/mobile-notification";
import {Interaction} from "@/interactions";
import EmojiReactionButton from "@/components/EmojiReactions";

import ChatOverlay from "@/components/ChatOverlay";
import ChatBubble from "@/components/ChatBubble";
import {LocalSvgRenderer} from "@/components/LocalSvgRenderer";
import HelpButton from "@/components/HelpButton";
import {useSharedAudio} from "@/context/AudioContext";
import AudioWrapper from "@/components/audio/AudioWrapper";

const soundMap = {
  "overlay-on": { url: "/audio/vykreslovanie TECKY.mp3" },
  "overlay-off": { url: "/audio/KONIEC ROZHRANIA.mp3" },
  "loop": { url: "/audio/ZVUKOVY PODKRES.mp3", opts: {loop:true} },
  "input-on": { url: "/audio/ODOMKNUTIE CHATU.mp3" },
  "send": { url: "/audio/SEND.mp3" },
  "chaos": { url: "/audio/CHAOS.mp3" },
  "click": { url: "/audio/KLIK.mp3" },
}

export default function Chat() {
  return (
    <AudioWrapper soundMap={soundMap}>
      <ChatContent />
    </AudioWrapper>
  );
}

function ChatContent() {
  const { currentInteraction, goToNextInteraction} = useChatContext()
  const { play, isPlaying, toggle } = useSharedAudio();

  const [dotyFace, setDotyFace] = useState("happy_1")

  const [mode, setMode] = useState<"default"|"overlay">("default")
  const messagesEndRef = useRef<HTMLDivElement|null>(null)

  const {handleUserInput} = useChatContext()
  const [showInput, setShowInput] = useState(false)
  const [showEmojiReactions, setShowEmojiReactions] = useState(false);


  const [history, setHistory] = useState([])

  const notificationProps = {
    id: currentInteraction.id,
    title: "New Message",
    message: currentInteraction?.text() ?? "",
    icon: <MessageSquare className="h-6 w-6 text-white" />,}

  useEffect(() => {
    if (!currentInteraction) return;
    if (currentInteraction.type === "music" ) {
      play(currentInteraction.key).then(()=>goToNextInteraction())
      return;
    }
    if (currentInteraction.type === "message"){
      setHistory((prev) => [...prev, currentInteraction])
      play("click")
    }

    if (currentInteraction.face && currentInteraction.face !== dotyFace) {
      setDotyFace(currentInteraction.face);
    }
    if (currentInteraction.id === "1.12") {
      setShowEmojiReactions(true);
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
      <HelpButton />
      {(mode==="overlay" )&& <ChatOverlay/>}
      <div className="bg-white/10 backdrop-blur-sm rounded-t-xl p-3 flex items-center gap-3 border-b border-white/20">
        <LocalSvgRenderer filename={dotyFace} className="w-8 h-8" />
        <h1 className="text-xl font-semibold text-white">Interaktivní chat</h1>
      </div>

      <div>
        {currentInteraction?.id === "first-notification" && (
          <MobileNotification
            {...notificationProps}
            isOpen={true}
            duration={currentInteraction?.duration * 1000}
            onClose={() => goToNextInteraction()}
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
            <ChatBubble type={interaction.type} text={interaction.text}/>
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
            goToNextInteraction("1.03")
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