import React, { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import UserInput from "@/components/UserInput";
import { useChatContext } from "@/context/ChatContext";
import MobileNotification from "@/components/mobile-notification";
import { Interaction } from "@/interactions";
import EmojiReactionButton from "@/components/EmojiReactions";

import ChatOverlay from "@/components/ChatOverlay";
import ChatBubble from "@/components/ChatBubble";
import { LocalSvgRenderer } from "@/components/LocalSvgRenderer";
import HelpButton from "@/components/HelpButton";
import { useSharedAudio } from "@/context/AudioContext";
import AudioWrapper from "@/components/audio/AudioWrapper";
import ScreenTransition from "@/components/chapter1/ScreenTransition";
import VoiceRoom from "@/components/chapter1/VoiceRoom";
import { setToStorage } from "@/scripts/local-storage";
import useDB from "@/hooks/use-db";

const soundMap = {
  "overlay-on": { filename: "vykreslovanie TECKY.mp3" },
  "overlay-off": { filename: "KONIEC ROZHRANIA.mp3" },
  loop: { filename: "ZVUKOVY PODKRES.mp3", opts: { loop: true } },
  "input-on": { filename: "ODOMKNUTIE CHATU.mp3" },
  send: { filename: "SEND.mp3" },
  chaos: { filename: "CHAOS.mp3" },
  click: { filename: "KLIK.mp3" },

  "voice-male": { filename: "sample_muz.mp3" },
  "voice-female": { filename: "sample_zena.mp3" },
  "voice-loop": { filename: "SVET HLASOV.mp3", opts: { loop: true } },
};

export default function Chat() {
  const { currentInteraction, goToNextInteraction } = useChatContext();
  const dbHook = useDB();
  const finishChapter = (voice: string) => {
    console.log("Selected voice:", voice);
    setToStorage("selectedVoice", voice);
    dbHook?.updateVoice(voice).then(() => goToNextInteraction());
  };

  return (
    <AudioWrapper soundMap={soundMap} setLoaded={() => {}}>
      <ScreenTransition
        showSecond={currentInteraction.id === "voice-room"}
        firstScreen={<ChatContent />}
        secondScreen={<VoiceRoom onFinish={finishChapter} />}
      />
    </AudioWrapper>
  );
}

function ChatContent() {
  const { currentInteraction, goToNextInteraction } = useChatContext();
  const { playPreloaded } = useSharedAudio();

  const [dotyFace, setDotyFace] = useState("happy_1");

  const [mode, setMode] = useState<"default" | "overlay">("default");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { handleUserInput } = useChatContext();
  const [showInput, setShowInput] = useState(false);
  const [showEmojiReactions, setShowEmojiReactions] = useState(false);

  const [history, setHistory] = useState<Interaction[]>([]);

  useEffect(() => {
    if (!currentInteraction) return;
    if (currentInteraction.type === "music") {
      playPreloaded(currentInteraction.key).then(() => goToNextInteraction());
      return;
    }
    if (currentInteraction.type === "message") {
      setHistory((prev) => [...prev, currentInteraction]);
      playPreloaded("click");
    }

    if (currentInteraction.face && currentInteraction.face !== dotyFace) {
      setDotyFace(currentInteraction.face);
    }
    if (currentInteraction.id === "1.12") {
      setShowEmojiReactions(true);
    }
    if (currentInteraction.type === "checkpoint") {
      if (currentInteraction.id === "overlay-on") {
        setMode("overlay");
      }
      if (currentInteraction.id === "overlay-off") {
        console.log("Setting mode to default");
        setMode("default");
      }
      if (currentInteraction?.id === "input-on") {
        console.log("opening input");
        setShowInput(true);
      }
    }
  }, [currentInteraction]);

  // Scroll to bottom when history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);
  const addUserInputToHistory = (input: string, type?: string) => {
    const userMessage: Interaction = {
      id: `user-${Date.now()}-${Math.random()}`, // FIXED: Ensure unique IDs
      type: "user-message",
      text: input,
      duration: 0,
    };
    setHistory((prev) => [...prev, userMessage]);
  };

  if (!currentInteraction) {
    return <div>Loading...</div>;
  }

  const notificationProps = {
    id: currentInteraction.id,
    title: "New Message",
    message: currentInteraction?.text() ?? "",
    icon: <MessageSquare className="h-6 w-6 text-white" />,
  };

  return (
    <main className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600">
      <HelpButton />
      {mode === "overlay" && <ChatOverlay />}

      <div className="w-full max-w-2xl mx-auto flex flex-1 flex-col px-4 overflow-hidden">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 pt-8 pb-2">
          <div className="bg-white/10 rounded-2xl border border-white/20 px-6 py-4 flex items-center gap-3">
            <LocalSvgRenderer filename={dotyFace} className="w-8 h-8" />
            <h2 className="text-white text-lg font-semibold">Zprávy</h2>
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
                (interaction.type as string) === "user-message-emoji";
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
              );
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
                      console.log("Selected emoji:", emoji);
                      setShowEmojiReactions(false);
                      addUserInputToHistory(emoji, "emoji");
                      goToNextInteraction("1.03");
                    }}
                  />
                ) : (
                  <UserInput
                    onSubmit={(input) => {
                      handleUserInput(input);
                      addUserInputToHistory(input);
                      console.log("User input submitted:", input);
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
  );
}
