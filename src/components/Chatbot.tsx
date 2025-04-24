import { useState, useEffect, useRef } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, X, Loader2, Bot, ArrowRight, CornerDownLeft, QrCode } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const Chatbot = () => {
  const { messages, isLoading, isChatOpen, setChatOpen, sendMessage, cannotAnswerQuestion } = useChatbot();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const whatsappLink = "https://wa.me/27645504029";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isChatOpen]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderWhatsAppQR = (message: ChatMessage) => {
    if (message.role === 'assistant' && cannotAnswerQuestion(message.content)) {
      return (
        <div className="mt-4 flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            For more detailed assistance, contact us on WhatsApp:
          </p>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <QrCode className="h-5 w-5" />
            <span>Open WhatsApp Chat</span>
          </a>
        </div>
      );
    }
    return null;
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
        <CardHeader className="bg-primary text-primary-foreground py-2 px-4 flex flex-row justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span>MOKMzansi AI Assistant</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
            onClick={() => setChatOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <ScrollArea className="h-[400px] overflow-auto">
          <CardContent className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                <Bot className="h-12 w-12 mb-4" />
                <h3 className="font-semibold">How can I help you today?</h3>
                <p className="text-sm max-w-xs mt-2">
                  Ask me anything about MOKMzansi Books platform and features
                </p>
                <div className="grid grid-cols-1 gap-2 mt-6 w-full max-w-sm">
                  {["How do I create an invoice?", "What HR features are available?", "How does the accounting module work?"].map((question) => (
                    <Button 
                      key={question} 
                      variant="outline"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => {
                        setInput(question);
                        setTimeout(() => {
                          inputRef.current?.focus();
                        }, 100);
                      }}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.filter(m => m.role !== "system").map((message, index) => (
                <div key={index}>
                  <div
                    className={cn(
                      "flex items-start gap-3 group",
                      message.role === "user" ? "flex-row-reverse" : ""
                    )}
                  >
                    <Avatar className={cn(
                      "h-8 w-8",
                      message.role === "user" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-foreground"
                    )}>
                      <div className="text-xs">
                        {message.role === "user" ? "You" : "AI"}
                      </div>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 max-w-[85%]",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                  {renderWhatsAppQR(message)}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 bg-muted text-foreground">
                  <div className="text-xs">AI</div>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2 max-w-[85%] flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </ScrollArea>
        
        <Separator />
        
        <CardFooter className="p-2">
          <div className="flex w-full items-center gap-2">
            <Textarea
              ref={inputRef}
              placeholder="Ask me anything..."
              className="flex-1 min-h-10 resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CornerDownLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Chatbot;
