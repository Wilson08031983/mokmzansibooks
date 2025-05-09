
import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { InvoiceItem } from "@/types/invoice";
import { formatCurrency } from "@/utils/formatters";

interface InvoiceItemsProps {
  items: InvoiceItem[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: any) => void;
}

const InvoiceItems: React.FC<InvoiceItemsProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Items</span>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onAddItem}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>
      
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Item No.</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Quantity</TableHead>
              <TableHead className="w-[120px]">Amount (R)</TableHead>
              <TableHead className="w-[120px]">Mark Up %</TableHead>
              <TableHead className="w-[100px]">Discount %</TableHead>
              <TableHead className="w-[120px]">Total (R)</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.itemNo}</TableCell>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => onUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.markupPercentage || 0}
                    onChange={(e) => onUpdateItem(index, 'markupPercentage' as keyof InvoiceItem, parseFloat(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => onUpdateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(item.amount, "ZAR")}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    disabled={items.length <= 1}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoiceItems;
