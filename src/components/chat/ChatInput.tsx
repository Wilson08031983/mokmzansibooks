
import { useRef, useEffect } from "react";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  isChatOpen: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export const ChatInput = ({ 
  input, 
  isLoading, 
  isChatOpen,
  onInputChange, 
  onSend 
}: ChatInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isChatOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      <Separator />
      <CardFooter className="p-2">
        <div className="flex w-full items-center gap-2">
          <Textarea
            ref={inputRef}
            placeholder="Ask me anything..."
            className="flex-1 min-h-10 resize-none"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />
          <Button 
            onClick={onSend} 
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
    </>
  );
};
