
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoiceItem } from "@/types/invoice";
import LineItemsHeader from "./LineItemsHeader";
import LineItemRow from "./LineItemRow";

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
      <LineItemsHeader />
      {items.map((item, index) => (
        <LineItemRow
          key={index}
          item={item}
          index={index}
          onRemoveItem={onRemoveItem}
          onUpdateItem={onUpdateItem}
          canDelete={items.length > 1}
        />
      ))}
      <Button type="button" size="sm" onClick={onAddItem} className="mt-2">
        <Plus className="h-4 w-4 mr-2" />
        Add Line Item
      </Button>
    </div>
  );
};

export default LineItems;
