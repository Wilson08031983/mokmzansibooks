
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { InvoiceItem } from "@/types/invoice";
import { formatCurrency } from "@/utils/formatters";

interface LineItemRowProps {
  item: InvoiceItem;
  index: number;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: any) => void;
  canDelete: boolean;
}

const LineItemRow: React.FC<LineItemRowProps> = ({
  item,
  index,
  onRemoveItem,
  onUpdateItem,
  canDelete
}) => {
  return (
    <div className="grid grid-cols-7 gap-4 mb-2">
      <Input
        type="text"
        value={item.itemNo}
        onChange={(e) => onUpdateItem(index, 'itemNo', e.target.value)}
      />
      <Input
        type="text"
        value={item.description}
        onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
      />
      <Input
        type="number"
        min="0"
        value={item.quantity}
        onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value))}
      />
      <Input
        type="number"
        min="0"
        value={item.unitPrice}
        onChange={(e) => onUpdateItem(index, 'unitPrice', parseFloat(e.target.value))}
      />
      <Input
        type="number"
        min="0"
        max="100"
        value={item.markupPercentage || 0}
        onChange={(e) => onUpdateItem(index, 'markupPercentage' as keyof InvoiceItem, parseFloat(e.target.value) || 0)}
      />
      <Input
        type="number"
        min="0"
        max="100"
        value={item.discount}
        onChange={(e) => onUpdateItem(index, 'discount', parseFloat(e.target.value))}
      />
      <div className="flex justify-between items-center">
        <span className="font-medium">{formatCurrency(item.amount, "ZAR")}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(index)}
          disabled={!canDelete}
        >
          <Trash className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
};

export default LineItemRow;
