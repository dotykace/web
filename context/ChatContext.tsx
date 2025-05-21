// context/ChatContext.tsx
import { createContext, useContext, ReactNode } from "react";
import {Choice} from "@/interactions";

type ChatContextType = {
  handleUserInput: (input: string) => void;
  handleChoiceSelection: (choice: Choice) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({
                               children,
                               handleUserInput,
                               handleChoiceSelection,
                             }: {
  children: ReactNode;
  handleUserInput: (input: string) => void;
  handleChoiceSelection: (choice: Choice) => void;
}) => {
  return (
    <ChatContext.Provider value={{ handleUserInput, handleChoiceSelection }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChatContext must be used within ChatProvider");
  return context;
};
