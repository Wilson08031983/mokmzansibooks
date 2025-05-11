
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
              <th className="pb-2 text-right">Unit Price (R)</th>
              <th className="pb-2 text-right">Discount</th>
              <th className="pb-2 text-right">Amount (R)</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2">{item.itemNo || index + 1}</td>
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2 text-right">{item.discount ? formatCurrency(item.discount) : '-'}</td>
                <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="mb-6 flex justify-end">
        <div className="w-1/3">
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal:</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>VAT ({data.vatRate}%):</span>
            <span>{formatCurrency(data.tax || data.taxAmount || 0)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      {data.notes && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-1">Notes</h4>
          <p className="text-sm whitespace-pre-line">{data.notes}</p>
        </div>
      )}
      
      {/* Terms */}
      {data.terms && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-1">Terms & Conditions</h4>
          <p className="text-sm whitespace-pre-line">{data.terms}</p>
        </div>
      )}
      
      {/* Signature */}
      {(data.company.signature || data.signature) && (
        <div className="mt-8 text-center">
          <div className="inline-block border-b border-gray-300 pb-1">
            {renderSignature(data.company.signature || data.signature)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Authorized Signature</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceMinimalTemplate;
