import React, { useState, useRef, useEffect } from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription 
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, X, MessageCircle, HelpCircle, Navigation, Workflow, Target, Zap } from 'lucide-react';
import { 
  useAIAssistant, 
  AIMessage, 
  APPLICATION_KNOWLEDGE_BASE 
} from '@/contexts/AIAssistantContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    clearConversation, 
    getContextualHelp 
  } = useAIAssistant();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleMessageClick = (message: AIMessage) => {
    // Handle special message types
    if (message.type === 'navigation' && message.content.includes('[Click to Navigate]')) {
      const route = Object.entries(APPLICATION_KNOWLEDGE_BASE.routes).find(
        ([_, routeInfo]) => message.content.includes(routeInfo.name)
      );

      if (route) {
        navigate(route[0]);
        setIsOpen(false);
      }
    } else if (message.type === 'route') {
      navigate(message.content);
      setIsOpen(false);
    }
  };

  const renderMessageIcon = (type?: AIMessage['type']) => {
    switch (type) {
      case 'navigation':
        return <Navigation className="h-4 w-4 text-blue-500" />;
      case 'suggestion':
        return <HelpCircle className="h-4 w-4 text-green-500" />;
      case 'help':
        return <HelpCircle className="h-4 w-4 text-purple-500" />;
      case 'workflow':
        return <Workflow className="h-4 w-4 text-orange-500" />;
      case 'next_action':
        return <Target className="h-4 w-4 text-teal-500" />;
      case 'optimization':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="h-6 w-6 text-primary" />
      </Button>

      {/* AI Assistant Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="h-[80vh] max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                AI Assistant
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    const help = getContextualHelp();
                    sendMessage(help);
                  }}
                  title="Get Contextual Help"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DrawerTitle>
            <DrawerDescription>
              Your intelligent assistant for navigating the application
            </DrawerDescription>
          </DrawerHeader>

          {/* Message Area */}
          <div className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-[calc(80vh-250px)] pr-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "mb-4 max-w-[80%] p-3 rounded-lg cursor-pointer",
                    msg.sender === 'user' 
                      ? "bg-primary text-primary-foreground self-end ml-auto" 
                      : "bg-muted text-muted-foreground self-start mr-auto"
                  )}
                  onClick={() => handleMessageClick(msg)}
                >
                  <div className="flex items-start gap-2">
                    {msg.sender === 'ai' && renderMessageIcon(msg.type)}
                    <div>{msg.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t flex items-center gap-2">
            <Input 
              placeholder="Ask me anything about the application..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button 
              variant="default" 
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? <MessageCircle className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {/* Clear Conversation Button */}
          {messages.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute bottom-16 left-4"
              onClick={clearConversation}
            >
              Clear Conversation
            </Button>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};
