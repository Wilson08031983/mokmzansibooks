
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceFooterProps {
  notes?: string;
  terms?: string;
  bankingDetails?: string;
  onNotesChange: (notes: string) => void;
  onTermsChange: (terms: string) => void;
  onBankingDetailsChange: (bankingDetails: string) => void;
}

const InvoiceFooter: React.FC<InvoiceFooterProps> = ({
  notes = "",
  terms = "",
  bankingDetails = "",
  onNotesChange,
  onTermsChange,
  onBankingDetailsChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional information or special comments"
          rows={4}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="terms">Terms</Label>
        <Textarea
          id="terms"
          placeholder="Payment terms, deadlines, etc."
          rows={4}
          value={terms}
          onChange={(e) => onTermsChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="bankingDetails">Banking Details</Label>
        <Textarea
          id="bankingDetails"
          placeholder="Bank name, account number, etc."
          rows={4}
          value={bankingDetails}
          onChange={(e) => onBankingDetailsChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InvoiceFooter;
