
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <CardHeader className="bg-primary text-primary-foreground py-2 px-4 flex flex-row justify-between items-center">
      <CardTitle className="text-base flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <span>MOKMzansi AI Assistant</span>
      </CardTitle>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
};
