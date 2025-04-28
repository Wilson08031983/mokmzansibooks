
import React from "react";
import { InvoiceData } from "@/types/invoice";
import { formatDate, formatCurrency, renderCompanyLogo, renderSignature, renderCompanyStamp } from "@/utils/formatters";

interface TemplateProps {
  data: InvoiceData;
  preview?: boolean;
}

const InvoiceModernTemplate = ({ data, preview }: TemplateProps) => {
  return (
    <div className="bg-white text-black font-sans">
      {/* Header with Company Logo Centered */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-32 h-32 mb-4">
          {renderCompanyLogo(data.company.logo)}
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
        <p className="text-gray-500">#{data.invoiceNumber}</p>
        {data.shortDescription && (
          <p className="text-sm mt-2 text-center max-w-md">{data.shortDescription}</p>
        )}
      </div>
      
      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-medium text-blue-600 uppercase text-sm mb-2">Bill To</h3>
          <h4 className="font-bold text-lg">{data.client.name}</h4>
          <p className="whitespace-pre-line text-gray-600">{data.client.address}</p>
          <p className="text-gray-600">{data.client.email}</p>
          <p className="text-gray-600">{data.client.phone}</p>
        </div>
        <div className="text-right">
          <div className="space-y-1">
            <h3 className="font-medium text-blue-600 uppercase text-sm mb-2">Invoice Details</h3>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(data.issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium">{formatDate(data.dueDate)}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium text-blue-600 uppercase text-sm mb-2">From</h3>
            <p className="font-bold text-lg">{data.company.name}</p>
            <p className="text-gray-600">{data.company.email}</p>
            <p className="text-gray-600">{data.company.phone}</p>
          </div>
        </div>
      </div>
      
      {/* Items Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-700">
              <th className="py-3 px-4 rounded-tl-lg">Item</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Qty</th>
              <th className="py-3 px-4 text-right">Rate (R)</th>
              <th className="py-3 px-4 text-right">Discount</th>
              <th className="py-3 px-4 text-right rounded-tr-lg">Amount (R)</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-3 px-4">{item.itemNo}</td>
                <td className="py-3 px-4">{item.description}</td>
                <td className="py-3 px-4 text-right">{item.quantity}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.rate, "ZAR")}</td>
                <td className="py-3 px-4 text-right">{item.discount}%</td>
                <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.amount, "ZAR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(data.subtotal, "ZAR")}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-600">VAT ({data.vatRate}%):</span>
            <span className="font-medium">{formatCurrency(data.tax, "ZAR")}</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(data.total, "ZAR")}</span>
          </div>
        </div>
      </div>
      
      {/* Notes and Terms */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-medium text-blue-600 uppercase text-sm mb-2">Notes</h3>
          <p className="text-gray-600">{data.notes}</p>
        </div>
        <div>
          <h3 className="font-medium text-blue-600 uppercase text-sm mb-2">Terms & Conditions</h3>
          <p className="text-gray-600">{data.terms}</p>
        </div>
      </div>
      
      {/* Signature */}
      <div className="mb-6 flex flex-col items-center">
        <div className="h-16 mb-2">
          {renderSignature(data.signature)}
        </div>
        <p className="text-sm text-gray-500 font-medium">{data.company.name}</p>
      </div>
      
      {/* Banking Details Footer */}
      <div className="bg-gray-100 p-6 mt-6 rounded-md">
        <h3 className="font-medium text-blue-600 uppercase text-sm mb-2">Banking Details</h3>
        <pre className="whitespace-pre-wrap text-gray-600 font-sans">{data.bankingDetails}</pre>
      </div>
      
      {/* Company Stamp */}
      <div className="flex justify-end mt-4">
        <div className="w-24 h-24">
          {renderCompanyStamp(data.company.stamp)}
        </div>
      </div>
    </div>
  );
};

export default InvoiceModernTemplate;
