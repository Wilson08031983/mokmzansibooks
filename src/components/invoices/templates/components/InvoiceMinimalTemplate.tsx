
import React from "react";
import { InvoiceData } from "@/types/invoice";
import { formatDate, formatCurrency, renderCompanyLogo, renderSignature, renderCompanyStamp } from "@/utils/formatters";

interface TemplateProps {
  data: InvoiceData;
  preview?: boolean;
}

const InvoiceMinimalTemplate = ({ data, preview }: TemplateProps) => {
  return (
    <div className="bg-white text-black font-sans">
      {/* Small Logo and Company Name */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 mr-3">
          {renderCompanyLogo(data.company.logo)}
        </div>
        <h2 className="text-lg font-medium">{data.company.name}</h2>
      </div>
      
      {/* Invoice Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Invoice</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Bill To:</p>
            <h4 className="font-medium">{data.client.name}</h4>
            <p className="whitespace-pre-line text-sm">{data.client.address}</p>
            <p className="text-sm">{data.client.email}</p>
            <p className="text-sm">{data.client.phone}</p>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Invoice Number:</span>
              <span className="font-medium">{data.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Issue Date:</span>
              <span>{formatDate(data.issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date:</span>
              <span>{formatDate(data.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Short Description */}
      {data.shortDescription && (
        <div className="mb-6">
          <p className="text-sm">{data.shortDescription}</p>
        </div>
      )}
      
      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-2">Item</th>
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Rate (R)</th>
              <th className="pb-2 text-right">Discount</th>
              <th className="pb-2 text-right">Amount (R)</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2">{item.itemNo}</td>
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(item.rate, "ZAR")}</td>
                <td className="py-2 text-right">{item.discount}%</td>
                <td className="py-2 text-right font-medium">{formatCurrency(item.amount, "ZAR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-60 text-sm">
          <div className="flex justify-between pb-1">
            <span className="text-gray-500">Subtotal:</span>
            <span>{formatCurrency(data.subtotal, "ZAR")}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-gray-500">VAT ({data.vatRate}%):</span>
            <span>{formatCurrency(data.tax, "ZAR")}</span>
          </div>
          <div className="border-t border-gray-200 mt-1 pt-1 flex justify-between font-medium">
            <span>Total:</span>
            <span>{formatCurrency(data.total, "ZAR")}</span>
          </div>
        </div>
      </div>
      
      {/* Notes, Terms, and Banking Details in a clean grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="text-sm">
          <h3 className="font-medium mb-2">Notes</h3>
          <p className="text-gray-600 whitespace-pre-line">{data.notes}</p>
        </div>
        <div className="text-sm">
          <h3 className="font-medium mb-2">Terms & Conditions</h3>
          <p className="text-gray-600 whitespace-pre-line">{data.terms}</p>
        </div>
      </div>
      
      {data.bankingDetails && (
        <div className="text-sm mb-8">
          <h3 className="font-medium mb-2">Banking Details</h3>
          <pre className="whitespace-pre-wrap text-gray-600 font-sans">{data.bankingDetails}</pre>
        </div>
      )}
      
      {/* Footer with Signature and Stamp */}
      <div className="flex justify-between items-end pt-4 border-t border-gray-100">
        <div className="text-sm">
          <p className="text-gray-500 mb-1">Authorized By:</p>
          <div className="h-10 w-40 mb-1">
            {renderSignature(data.signature)}
          </div>
          <p className="text-xs text-gray-400">{data.company.name}</p>
        </div>
        {data.company.stamp && (
          <div className="w-16 h-16">
            {renderCompanyStamp(data.company.stamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceMinimalTemplate;
