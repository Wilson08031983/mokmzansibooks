
import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface ChatbotContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  cannotAnswerQuestion: (message: string) => boolean;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const setChatOpen = (open: boolean) => {
    setIsChatOpen(open);
  };

  const cannotAnswerQuestion = (message: string) => {
    const cantAnswerPhrases = [
      "i don't know",
      "i cannot",
      "i can't",
      "contact support",
      "don't have information",
      "unable to assist",
      "can't help",
      "cannot help",
    ];
    
    return cantAnswerPhrases.some(phrase => 
      message.toLowerCase().includes(phrase)
    );
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: message };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Filter out system messages for the API call
      const chatHistory = messages.filter(msg => msg.role !== 'system');
      
      const { data, error } = await supabase.functions.invoke('ai-chatbot', {
        body: { message, chatHistory }
      });

      if (error) {
        console.error('Error calling AI chatbot:', error);
        const fallbackResponse = "I'm sorry, I'm having trouble connecting to the server right now. You can reach out to support on WhatsApp for immediate assistance.";
        
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: fallbackResponse
          }
        ]);
        return;
      }

      // Add AI response to chat
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Error in chat:', error);
      const fallbackResponse = "I'm sorry, I'm having trouble connecting to the server right now. You can reach out to support on WhatsApp for immediate assistance.";
      
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: fallbackResponse 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <ChatbotContext.Provider 
      value={{ 
        messages, 
        isLoading, 
        isChatOpen, 
        setChatOpen, 
        sendMessage, 
        clearChat,
        cannotAnswerQuestion
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};
