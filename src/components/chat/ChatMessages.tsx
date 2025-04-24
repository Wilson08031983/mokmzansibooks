
import { useRef, useEffect } from "react";
import { Bot, ArrowRight, QrCode, Loader2, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/contexts/ChatbotContext";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  cannotAnswerQuestion: (message: string) => boolean;
  onQuickQuestionClick: (question: string) => void;
  whatsappLink: string;
}

export const ChatMessages = ({ 
  messages, 
  isLoading, 
  cannotAnswerQuestion, 
  onQuickQuestionClick,
  whatsappLink 
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const getMessageType = (content: string): {
    icon: typeof ThumbsUp | typeof ThumbsDown | typeof Lightbulb | typeof HelpCircle;
    label: string;
    className: string;
  } => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('thank') || lowerContent.includes('great') || lowerContent.includes('good')) {
      return { icon: ThumbsUp, label: 'Compliment', className: 'text-green-500' };
    }
    if (lowerContent.includes('suggest') || lowerContent.includes('maybe') || lowerContent.includes('could')) {
      return { icon: Lightbulb, label: 'Suggestion', className: 'text-amber-500' };
    }
    if (lowerContent.includes('not working') || lowerContent.includes('error') || lowerContent.includes('problem')) {
      return { icon: ThumbsDown, label: 'Complaint', className: 'text-red-500' };
    }
    return { icon: HelpCircle, label: 'Assistance', className: 'text-blue-500' };
  };

  const renderWhatsAppQR = (message: ChatMessage) => {
    if (message.role === 'assistant' && cannotAnswerQuestion(message.content)) {
      return (
        <div className="mt-4 flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            For more detailed assistance, contact us directly on WhatsApp:
          </p>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <QrCode className="h-5 w-5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      );
    }
    return null;
  };

  const renderMessageType = (content: string) => {
    const { icon: Icon, label, className } = getMessageType(content);
    return (
      <div className={cn("flex items-center gap-1 text-xs mt-2", className)}>
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
    );
  };

  const renderEmptyState = () => (
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
            onClick={() => onQuickQuestionClick(question)}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            {question}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <ScrollArea className="h-[400px] overflow-auto">
      <CardContent className="p-4 space-y-4">
        {messages.length === 0 ? (
          renderEmptyState()
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
                <div className={cn(
                  "rounded-lg px-3 py-2 max-w-[85%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.role === "user" && renderMessageType(message.content)}
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
  );
};
