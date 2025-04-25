
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
    <div className="w-full">
      <table className="w-full">
        <thead>
          <tr className="bg-indigo-50 text-indigo-700">
            <th className="py-2 px-3 text-left rounded-tl-lg">Description</th>
            <th className="py-2 px-3 text-center">Qty</th>
            <th className="py-2 px-3 text-right">Unit Price</th>
            <th className="py-2 px-3 text-right">Discount</th>
            <th className="py-2 px-3 text-right rounded-tr-lg">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-indigo-50">
              <td className="py-3 px-3">
                <div>
                  <p className="font-medium">{item.description}</p>
                  {item.itemNo && <p className="text-xs text-gray-500">Item: {item.itemNo}</p>}
                </div>
              </td>
              <td className="py-3 px-3 text-center">{item.quantity}</td>
              <td className="py-3 px-3 text-right">{formatCurrency(item.unitPrice || item.rate)}</td>
              <td className="py-3 px-3 text-right">{formatPercentage(item.discount || 0)}</td>
              <td className="py-3 px-3 text-right font-medium">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
          {/* Empty row for spacing */}
          <tr className="h-4"></tr>
        </tbody>
        <tfoot>
          <tr className="bg-gray-50">
            <td colSpan={3}></td>
            <td className="py-2 px-3 text-right font-medium">Subtotal:</td>
            <td className="py-2 px-3 text-right">{formatCurrency(subtotal)}</td>
          </tr>
          <tr className="bg-gray-50">
            <td colSpan={3}></td>
            <td className="py-2 px-3 text-right font-medium">VAT ({vatRate}%):</td>
            <td className="py-2 px-3 text-right">{formatCurrency(tax)}</td>
          </tr>
          <tr className="bg-indigo-700 text-white">
            <td colSpan={3}></td>
            <td className="py-3 px-3 text-right font-bold rounded-bl-lg">TOTAL:</td>
            <td className="py-3 px-3 text-right font-bold rounded-br-lg">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ItemsTable;
