import React from "react";
import { TemplateProps } from "@/types/quote";
import { formatDate, formatCurrency, formatPercentage, renderCompanyLogo, renderCompanyStamp, renderSignature } from "@/utils/formatters";

const QuoteTemplate3 = ({ data, preview = false }: TemplateProps) => {
  // Sample data for preview mode
  const previewData = {
    quoteNumber: "QT-2025-0001",
    issueDate: "2025-04-03",
    expiryDate: "2025-05-03",
    client: {
      name: "Pretoria Engineering",
      address: "123 Main St, Pretoria, 0001",
      email: "info@pretoriaeng.co.za",
      phone: "012 345 6789"
    },
    company: {
      name: "MOKMzansi Holdings",
      address: "456 Business Ave, Johannesburg, 2000",
      email: "contact@mokmzansi.co.za",
      phone: "011 987 6543",
      logo: "/lovable-uploads/44062e3c-e3b2-47ea-9869-37a2dc71b5d8.png",
      stamp: "/lovable-uploads/21bb22cc-35f7-4bdc-b74c-281c0412605d.png"
    },
    items: [
      {
        itemNo: "ITEM-001",
        description: "Consultation Services",
        quantity: 10,
        unitPrice: 1500,
        discount: 0,
        amount: 15000
      },
      {
        itemNo: "ITEM-002",
        description: "Equipment Rental",
        quantity: 5,
        unitPrice: 2000,
        discount: 0,
        amount: 10000
      }
    ],
    subtotal: 25000,
    vatRate: 0,
    tax: 0,
    total: 25000,
    notes: "This quotation is valid for 30 days.",
    terms: "50% deposit required to commence work.",
    signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
  };

  const displayData = preview ? previewData : data;
  
  return (
    <div className="w-[210mm] h-[297mm] bg-white p-8 shadow-lg mx-auto font-sans relative overflow-hidden" style={{ minHeight: '297mm' }}>
      {/* Diagonal Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600 transform rotate-6 origin-top-left translate-x-20 -translate-y-20 z-0"></div>
      
      {/* Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-1">
          <div className="inline-block bg-indigo-600 text-white font-bold text-4xl py-2 px-4">
            QUOTATION
          </div>
          <p className="text-sm ml-1 mt-2">#{displayData.quoteNumber}</p>
        </div>
        <div className="bg-white p-2 rounded shadow-sm">
          {renderCompanyLogo(displayData.company.logo)}
        </div>
      </div>

      {/* Quote Info */}
      <div className="relative z-10 mt-12 grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-indigo-600">FROM</h3>
            <h4 className="font-semibold text-lg">{displayData.company.name}</h4>
            <p className="text-gray-600 whitespace-pre-line">{displayData.company.address}</p>
            <p className="text-gray-600">{displayData.company.email}</p>
            <p className="text-gray-600">{displayData.company.phone}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-bold text-indigo-600">TO</h3>
            <h4 className="font-semibold text-lg">{displayData.client.name}</h4>
            <p className="text-gray-600 whitespace-pre-line">{displayData.client.address}</p>
            <p className="text-gray-600">{displayData.client.email}</p>
            <p className="text-gray-600">{displayData.client.phone}</p>
          </div>
        </div>
        
        <div className="flex flex-col justify-end">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-medium">Quotation Number:</span>
              <span>{displayData.quoteNumber}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-medium">Date Issued:</span>
              <span>{formatDate(displayData.issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valid Until:</span>
              <span>{formatDate(displayData.expiryDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="relative z-10 mt-12">
        <div className="bg-indigo-600 text-white py-3 px-4 font-bold">
          Quotation Details
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left">Item No.</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-right">Discount</th>
              <th className="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {displayData.items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-3 px-4">{item.itemNo || `ITEM-${i+1}`}</td>
                <td className="py-3 px-4">{item.description}</td>
                <td className="py-3 px-4 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice || item.rate)}</td>
                <td className="py-3 px-4 text-right">{formatPercentage(item.discount || 0)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 flex justify-end">
          <div className="w-1/3 space-y-2">
            <div className="flex justify-between py-1">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(displayData.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">VAT ({displayData.vatRate || 0}%):</span>
              <span>{formatCurrency(displayData.tax)}</span>
            </div>
            <div className="flex justify-between py-2 bg-indigo-600 text-white px-4">
              <span className="font-bold">Total:</span>
              <span className="font-bold">{formatCurrency(displayData.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="relative z-10 mt-8 grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-indigo-600 border-b border-indigo-200 pb-1 mb-3">Notes</h3>
          <p className="text-gray-600">{displayData.notes}</p>
        </div>
        <div>
          <h3 className="font-bold text-indigo-600 border-b border-indigo-200 pb-1 mb-3">Terms & Conditions</h3>
          <p className="text-gray-600">{displayData.terms}</p>
        </div>
      </div>

      {/* Signature & Stamp */}
      <div className="relative z-10 mt-12 grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-indigo-600 mb-6">Authorized Signature:</h3>
          <div className="border-b-2 border-gray-300 w-48 h-10 mb-1">
            {renderSignature(displayData.signature)}
          </div>
          <p className="text-xs text-gray-500">Signature</p>
        </div>
        <div className="flex justify-end items-end">
          <div className="flex flex-col items-end">
            <p className="text-sm mb-2">Initials: _________</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg w-24 h-24 flex items-center justify-center">
              {renderCompanyStamp(displayData.company.stamp)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteTemplate3;
