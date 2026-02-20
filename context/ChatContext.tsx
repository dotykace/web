// context/ChatContext.tsx
import { createContext, useContext, ReactNode } from "react"
import { Choice } from "@/interactions"

type ChatContextType = {
  state: "loading" | "initialized" | "error" | null
  handleUserInput: (input: string) => void
  handleChoiceSelection: (choice: Choice) => void
  currentInteraction: any // Define this type based on your interaction structure
  goToNextInteraction: (nextId?: string) => void // Optional, if you want to navigate to the next interaction
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({
  children,
  state,
  handleUserInput,
  handleChoiceSelection,
  currentInteraction,
  goToNextInteraction,
}: ChatContextType & { children: ReactNode }) => {
  return (
    <ChatContext.Provider
      value={{
        state,
        handleUserInput,
        handleChoiceSelection,
        currentInteraction,
        goToNextInteraction,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context)
    throw new Error("useChatContext must be used within ChatProvider")
  return context
}
