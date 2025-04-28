
import React from "react";
import { QuoteData } from "@/types/quote";
import { formatDate, formatCurrency, renderCompanyLogo, renderSignature, renderCompanyStamp } from "@/utils/formatters";

interface TemplateProps {
  data: QuoteData;
  preview?: boolean;
}

const QuoteClassicTemplate = ({ data, preview }: TemplateProps) => {
  return (
    <div className="bg-white text-black font-serif">
      {/* Header with Company Info */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20">
            {renderCompanyLogo(data.company.logo)}
          </div>
          <div>
            <h2 className="font-bold text-xl mb-1">{data.company.name}</h2>
            <p className="whitespace-pre-line text-sm text-gray-700">{data.company.address}</p>
            <p className="text-sm text-gray-700">{data.company.email}</p>
            <p className="text-sm text-gray-700">{data.company.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-800">QUOTE</h1>
          <p className="text-sm mt-2"><span className="font-semibold">Quote #:</span> {data.quoteNumber}</p>
          <p className="text-sm"><span className="font-semibold">Date:</span> {formatDate(data.issueDate)}</p>
          <p className="text-sm"><span className="font-semibold">Expires:</span> {formatDate(data.expiryDate)}</p>
          {data.shortDescription && (
            <p className="text-sm mt-2 max-w-xs">{data.shortDescription}</p>
          )}
        </div>
      </div>
      
      {/* Horizontal Line */}
      <div className="border-t border-gray-300 mb-6"></div>
      
      {/* Client Information */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-700 mb-2">Quote To:</h3>
        <h4 className="font-bold">{data.client.name}</h4>
        <p className="whitespace-pre-line">{data.client.address}</p>
        <p>{data.client.email}</p>
        <p>{data.client.phone}</p>
      </div>
      
      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="text-left text-gray-800 border-b-2 border-gray-300">
            <th className="py-2">Item No.</th>
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Unit Price (R)</th>
            <th className="py-2 text-right">Mark Up %</th>
            <th className="py-2 text-right">Discount %</th>
            <th className="py-2 text-right">Total (R)</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-3">{item.itemNo}</td>
              <td className="py-3">{item.description}</td>
              <td className="py-3 text-right">{item.quantity}</td>
              <td className="py-3 text-right">{formatCurrency(item.unitPrice, "ZAR")}</td>
              <td className="py-3 text-right">{item.markupPercentage || 0}%</td>
              <td className="py-3 text-right">{item.discount}%</td>
              <td className="py-3 text-right font-semibold">{formatCurrency(item.amount, "ZAR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-1 border-b">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(data.subtotal, "ZAR")}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span>VAT ({data.vatRate}%):</span>
            <span className="font-medium">{formatCurrency(data.tax, "ZAR")}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(data.total, "ZAR")}</span>
          </div>
        </div>
      </div>
      
      {/* Notes and Terms */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-bold text-gray-700 mb-2">Notes</h3>
          <p className="text-sm text-gray-600">{data.notes}</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-700 mb-2">Terms & Conditions</h3>
          <p className="text-sm text-gray-600">{data.terms}</p>
        </div>
      </div>
      
      {/* Banking Details */}
      {data.bankingDetails && (
        <div className="mb-8">
          <h3 className="font-bold text-gray-700 mb-2">Banking Details</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-600 font-serif">{data.bankingDetails}</pre>
        </div>
      )}
      
      {/* Signature and Stamp */}
      <div className="flex justify-between items-end pt-6 border-t border-gray-300">
        <div>
          <h3 className="font-medium text-gray-700 mb-4">Authorized Signature</h3>
          <div className="border-b border-gray-400 w-48 h-10 mb-1">
            {renderSignature(data.signature)}
          </div>
          <p className="text-xs text-gray-500">Signature</p>
        </div>
        <div className="flex items-end">
          <p className="text-sm mr-4">Initials: _________</p>
          <div className="border border-dashed border-gray-400 w-20 h-20 flex items-center justify-center">
            {renderCompanyStamp(data.company.stamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteClassicTemplate;
