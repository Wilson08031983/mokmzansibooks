
import React from "react";
import { QuoteItem } from "@/types/quote";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

interface QuoteTableProps {
  items: QuoteItem[];
}

const QuoteTable = ({ items }: QuoteTableProps) => {
  const safeItems = items.map(item => ({
    ...item,
    itemNo: item.itemNo || '',
    markupPercentage: item.markupPercentage || 0,
    unitPrice: item.unitPrice || item.rate || 0,
    discount: item.discount || 0,
  }));

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-gray-500 border-b-2 border-gray-200">
          <th className="pb-2">Item No.</th>
          <th className="pb-2">Description</th>
          <th className="pb-2 text-right">Qty</th>
          <th className="pb-2 text-right">Mark Up %</th>
          <th className="pb-2 text-right">Unit Price</th>
          <th className="pb-2 text-right">Discount</th>
          <th className="pb-2 text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {safeItems.map((item, i) => (
          <tr key={i} className="border-b border-gray-100">
            <td className="py-3">{item.itemNo || `ITEM-${i+1}`}</td>
            <td className="py-3">{item.description}</td>
            <td className="py-3 text-right">{item.quantity}</td>
            <td className="py-3 text-right">{item.markupPercentage}%</td>
            <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
            <td className="py-3 text-right">{formatPercentage(item.discount)}</td>
            <td className="py-3 text-right font-medium">{formatCurrency(item.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default QuoteTable;
