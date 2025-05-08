
import React from "react";
import { QuoteData } from "@/types/quote";
import { formatDate, formatCurrency, renderCompanyLogo, renderSignature, renderCompanyStamp } from "@/utils/formatters";

interface TemplateProps {
  data: QuoteData;
  preview?: boolean;
}

const QuoteModernTemplate = ({ data, preview }: TemplateProps) => {
  return (
    <div className="bg-white text-black font-sans">
      {/* Header with Company Logo and Quote Text */}
      <div className="flex justify-between items-center mb-8">
        <div className="w-24 h-24">
          {renderCompanyLogo(data.company.logo)}
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-light text-gray-700">QUOTE</h1>
          <p className="text-gray-500">{data.quoteNumber}</p>
        </div>
      </div>
      
      {/* Quote & Company Info Grid */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-700">Our Info</h2>
          <p className="font-medium">{data.company.name}</p>
          <p className="whitespace-pre-line">{data.company.address}</p>
          <p>{data.company.email}</p>
          <p>{data.company.phone}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-700">Quote For</h2>
          <p className="font-medium">{data.client.name}</p>
          <p className="whitespace-pre-line">{data.client.address}</p>
          <p>{data.client.email}</p>
          <p>{data.client.phone}</p>
        </div>
      </div>
      
      {/* Quote Details */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div>
          <h3 className="text-sm text-gray-500 mb-1">ISSUE DATE</h3>
          <p className="font-medium">{formatDate(data.issueDate)}</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-500 mb-1">EXPIRY DATE</h3>
          <p className="font-medium">{formatDate(data.expiryDate)}</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-500 mb-1">QUOTE REFERENCE</h3>
          <p className="font-medium">{data.quoteNumber}</p>
        </div>
      </div>
      
      {/* Description if available */}
      {data.shortDescription && (
        <div className="mb-8 bg-gray-50 p-4 border-l-4 border-blue-500">
          <p className="italic text-gray-700">{data.shortDescription}</p>
        </div>
      )}
      
      {/* Items Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 border-b pb-1 text-gray-700">Quote Items</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 text-sm text-gray-600">
              <th className="py-2 text-left">Item</th>
              <th className="py-2 text-left">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Discount</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3">{item.itemNo}</td>
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">{formatCurrency(item.unitPrice, "ZAR")}</td>
                <td className="py-3 text-right">{item.discount}%</td>
                <td className="py-3 text-right font-medium">{formatCurrency(item.amount, "ZAR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 bg-gray-50 p-4 rounded">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(data.subtotal, "ZAR")}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">VAT ({data.vatRate}%):</span>
            <span>{formatCurrency(data.tax, "ZAR")}</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(data.total, "ZAR")}</span>
          </div>
        </div>
      </div>
      
      {/* Notes, Terms and Banking Details */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-700">Notes</h3>
          <p className="text-gray-600 whitespace-pre-line">{data.notes || "No additional notes."}</p>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 border-b pb-1 text-gray-700">Terms & Conditions</h3>
          <p className="text-gray-600 whitespace-pre-line">{data.terms || "Standard terms and conditions apply."}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-700">Banking Details</h3>
          {data.bankingDetails ? (
            <pre className="text-gray-600 font-sans whitespace-pre-line">{data.bankingDetails}</pre>
          ) : (
            <p className="text-gray-600">Banking details will be provided upon acceptance of quote.</p>
          )}
        </div>
      </div>
      
      {/* Signature and Acceptance */}
      <div className="flex justify-between items-end mt-12 pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-500 mb-2">Authorized by:</p>
          <div className="h-16 w-48 mb-2">
            {renderSignature(data.signature)}
          </div>
          <p className="text-sm text-gray-600">{data.company.name}</p>
        </div>
        
        {data.company.stamp && (
          <div className="w-24 h-24 flex items-center justify-center">
            {renderCompanyStamp(data.company.stamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteModernTemplate;
