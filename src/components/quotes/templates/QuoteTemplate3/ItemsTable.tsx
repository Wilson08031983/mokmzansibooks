
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { QuoteItem } from "@/types/quote";

interface ItemsTableProps {
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  tax: number;
  total: number;
}

const ItemsTable = ({ items, subtotal, vatRate, tax, total }: ItemsTableProps) => {
  return (
    <div className="relative z-10 mt-8">
      <div className="bg-indigo-600 text-white py-2 px-4 font-bold">
        Quotation Details
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-2 px-3 text-left">Item No.</th>
            <th className="py-2 px-3 text-left">Description</th>
            <th className="py-2 px-3 text-center">Qty</th>
            <th className="py-2 px-3 text-right">Unit Price</th>
            <th className="py-2 px-3 text-right">Discount</th>
            <th className="py-2 px-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 px-3">{item.itemNo || `ITEM-${i+1}`}</td>
              <td className="py-2 px-3">{item.description}</td>
              <td className="py-2 px-3 text-center">{item.quantity}</td>
              <td className="py-2 px-3 text-right">{formatCurrency(item.unitPrice || item.rate)}</td>
              <td className="py-2 px-3 text-right">{formatPercentage(item.discount || 0)}</td>
              <td className="py-2 px-3 text-right">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-4 flex justify-end">
        <div className="w-1/3 space-y-1">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="font-medium">Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="font-medium">VAT ({vatRate || 0}%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-600 text-white px-3">
            <span className="font-bold">Total:</span>
            <span className="font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsTable;
