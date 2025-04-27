
import React from "react";
import { QuoteData } from "@/types/quote";
import { formatDate, formatCurrency, renderCompanyLogo } from "@/utils/formatters";

interface QuoteSidebarProps {
  data: QuoteData;
}

const QuoteSidebar = ({ data }: QuoteSidebarProps) => {
  return (
    <div className="w-1/3 bg-gray-800 text-white p-6 rounded-l-lg h-full">
      <div className="mb-8">
        {renderCompanyLogo(data.company.logo)}
        <h3 className="font-bold text-lg mt-6 mb-1">{data.company.name}</h3>
        <p className="text-sm text-gray-300 whitespace-pre-line">{data.company.address}</p>
        <p className="text-sm text-gray-300">{data.company.email}</p>
        <p className="text-sm text-gray-300">{data.company.phone}</p>
      </div>
      
      <div className="mb-8 pt-6 border-t border-gray-600">
        <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Bill To</h4>
        <h3 className="font-bold text-lg mb-1">{data.client.name}</h3>
        <p className="text-sm text-gray-300 whitespace-pre-line">{data.client.address}</p>
        <p className="text-sm text-gray-300">{data.client.email}</p>
        <p className="text-sm text-gray-300">{data.client.phone}</p>
      </div>
      
      <div className="mb-8 pt-6 border-t border-gray-600">
        <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Quote Details</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Number:</span>
            <span>{data.quoteNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date:</span>
            <span>{formatDate(data.issueDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Expiry Date:</span>
            <span>{formatDate(data.expiryDate)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-6 border-t border-gray-600">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal:</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">VAT ({data.vatRate}%):</span>
            <span>{formatCurrency(data.tax)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold mt-4">
            <span>Total:</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteSidebar;
