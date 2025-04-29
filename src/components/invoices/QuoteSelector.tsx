
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";

interface Quote {
  id: string;
  quoteNumber: string;
  clientName: string;
  dateCreated: string;
  total: number;
}

interface QuoteSelectorProps {
  quotes: Quote[];
  selectedQuote: string | null;
  onQuoteSelect: (quoteId: string) => void;
}

const QuoteSelector: React.FC<QuoteSelectorProps> = ({ 
  quotes, 
  selectedQuote, 
  onQuoteSelect 
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-md mb-6">
      <Label className="mb-2 block">Select a saved quote</Label>
      <Select value={selectedQuote || ""} onValueChange={onQuoteSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a quote" />
        </SelectTrigger>
        <SelectContent>
          {quotes.map(quote => (
            <SelectItem key={quote.id} value={quote.id}>
              {quote.quoteNumber} - {quote.clientName} ({formatCurrency(quote.total, "ZAR")})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default QuoteSelector;
