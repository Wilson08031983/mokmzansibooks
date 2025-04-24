
import { useState } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessages } from "./chat/ChatMessages";
import { ChatInput } from "./chat/ChatInput";

const Chatbot = () => {
  const { messages, isLoading, isChatOpen, setChatOpen, sendMessage, cannotAnswerQuestion } = useChatbot();
  const [input, setInput] = useState("");
  const whatsappLink = "https://wa.me/27645504029";

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  if (!isChatOpen) {
    return (
      <Button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-4 right-4 p-3 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full sm:w-[400px] shadow-xl">
      <Card className="border rounded-lg overflow-hidden">
        <ChatHeader onClose={() => setChatOpen(false)} />
        <ChatMessages 
          messages={messages}
          isLoading={isLoading}
          cannotAnswerQuestion={cannotAnswerQuestion}
          onQuickQuestionClick={setInput}
          whatsappLink={whatsappLink}
        />
        <ChatInput 
          input={input}
          isLoading={isLoading}
          isChatOpen={isChatOpen}
          onInputChange={setInput}
          onSend={handleSend}
        />
      </Card>
    </div>
  );
};

export default Chatbot;
