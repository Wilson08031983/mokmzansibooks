
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/formatters";

interface InvoiceTotalsProps {
  subtotal: number;
  tax: number;
  total: number;
  vatRate: string;
  onVatRateChange: (rate: string) => void;
}

const InvoiceTotals: React.FC<InvoiceTotalsProps> = ({
  subtotal,
  tax,
  total,
  vatRate,
  onVatRateChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <Label htmlFor="vatRate">VAT Rate (%)</Label>
        <Input
          type="number"
          id="vatRate"
          name="vatRate"
          value={vatRate}
          onChange={(e) => onVatRateChange(e.target.value)}
        />
      </div>
      <div>
        <Label>Subtotal</Label>
        <div className="font-bold">{formatCurrency(subtotal)}</div>
      </div>
      <div>
        <Label>Tax</Label>
        <div className="font-bold">{formatCurrency(tax)}</div>
      </div>
      <div>
        <Label>Total</Label>
        <div className="font-bold">{formatCurrency(total)}</div>
      </div>
    </div>
  );
};

export default InvoiceTotals;
