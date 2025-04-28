
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { InvoiceItem } from "@/types/invoice";
import { formatCurrency } from "@/utils/formatters";

interface LineItemsProps {
  items: InvoiceItem[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: any) => void;
}

const LineItems: React.FC<LineItemsProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}) => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-6 gap-4 mb-2">
        <Label>Item No</Label>
        <Label>Description</Label>
        <Label>Quantity</Label>
        <Label>Unit Price</Label>
        <Label>Discount (%)</Label>
        <Label>Amount</Label>
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-6 gap-4 mb-2">
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
              disabled={items.length <= 1}
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" size="sm" onClick={onAddItem} className="mt-2">
        <Plus className="h-4 w-4 mr-2" />
        Add Line Item
      </Button>
    </div>
  );
};

export default LineItems;
