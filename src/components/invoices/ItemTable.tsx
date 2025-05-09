
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

// Common interface for invoice/quote items
export interface InvoiceItem {
  itemNo: number;
  description: string;
  quantity: number;
  amount: number;
  markupPercentage: number;
  discount: number;
  total: number;
}

interface ItemTableProps {
  items: InvoiceItem[];
  updateItem: (index: number, field: keyof InvoiceItem, value: any) => void;
  removeItem: (index: number) => void;
  showMarkup?: boolean;
  readOnly?: boolean;
}

const ItemTable: React.FC<ItemTableProps> = ({ 
  items, 
  updateItem, 
  removeItem, 
  showMarkup = true,
  readOnly = false 
}) => {
  const handleNumberChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      updateItem(index, field, numValue);
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-2 text-left">Item No.</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-left">Quantity</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Mark Up %</th>
            <th className="p-2 text-left">Discount %</th>
            <th className="p-2 text-left">Total</th>
            {!readOnly && <th className="p-2 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 text-center">{item.itemNo}</td>
              <td className="p-2">
                {readOnly ? (
                  <span>{item.description}</span>
                ) : (
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="Item description"
                  />
                )}
              </td>
              <td className="p-2">
                {readOnly ? (
                  <span>{item.quantity}</span>
                ) : (
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleNumberChange(index, "quantity", e.target.value)}
                    className="w-16"
                  />
                )}
              </td>
              <td className="p-2">
                {readOnly ? (
                  <span>${item.amount.toFixed(2)}</span>
                ) : (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => handleNumberChange(index, "amount", e.target.value)}
                    className="w-24"
                  />
                )}
              </td>
              
              <td className="p-2">
                {readOnly ? (
                  <span>{item.markupPercentage}%</span>
                ) : (
                  <Input
                    type="number"
                    min="0"
                    value={item.markupPercentage || 0}
                    onChange={(e) => handleNumberChange(index, "markupPercentage", e.target.value)}
                    className="w-16"
                  />
                )}
              </td>
              
              <td className="p-2">
                {readOnly ? (
                  <span>{item.discount}%</span>
                ) : (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => handleNumberChange(index, "discount", e.target.value)}
                    className="w-16"
                  />
                )}
              </td>
              
              <td className="p-2 font-medium">
                ${item.total.toFixed(2)}
              </td>
              
              {!readOnly && (
                <td className="p-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemTable;
