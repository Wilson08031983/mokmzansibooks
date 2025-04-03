import React from "react";
import { TemplateProps } from "@/types/quote";
import { formatDate, formatCurrency, formatPercentage, renderCompanyLogo, renderCompanyStamp, renderSignature } from "@/utils/formatters";

const QuoteTemplate5 = ({ data, preview = false }: TemplateProps) => {
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
    <div className="w-[210mm] h-[297mm] bg-white p-8 shadow-lg mx-auto font-sans" style={{ minHeight: '297mm' }}>
      {/* Left sidebar */}
      <div className="flex h-full">
        <div className="w-1/3 bg-slate-800 text-white p-6 rounded-l-lg h-full">
          <div className="mb-8">
            {renderCompanyLogo(displayData.company.logo)}
            <h3 className="font-bold text-lg mt-6 mb-1">{displayData.company.name}</h3>
            <p className="text-sm text-gray-300 whitespace-pre-line">{displayData.company.address}</p>
            <p className="text-sm text-gray-300">{displayData.company.email}</p>
            <p className="text-sm text-gray-300">{displayData.company.phone}</p>
          </div>
          
          <div className="mb-8 pt-6 border-t border-slate-600">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Client</h4>
            <h3 className="font-bold text-lg mb-1">{displayData.client.name}</h3>
            <p className="text-sm text-gray-300 whitespace-pre-line">{displayData.client.address}</p>
            <p className="text-sm text-gray-300">{displayData.client.email}</p>
            <p className="text-sm text-gray-300">{displayData.client.phone}</p>
          </div>
          
          <div className="mb-8 pt-6 border-t border-slate-600">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Quotation Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Number:</span>
                <span>{displayData.quoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span>{formatDate(displayData.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valid Until:</span>
                <span>{formatDate(displayData.expiryDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-slate-600">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span>{formatCurrency(displayData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VAT ({displayData.vatRate || 0}%):</span>
                <span>{formatCurrency(displayData.tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4">
                <span>Total:</span>
                <span>{formatCurrency(displayData.total)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="w-2/3 p-6 rounded-r-lg border-r border-t border-b border-gray-200 h-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">QUOTATION</h1>
            <p className="text-sm text-gray-500 border-b pb-4 border-gray-200">{displayData.quoteNumber}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Quotation Items</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b-2 border-gray-200">
                  <th className="pb-2">Item No.</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Discount</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {displayData.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3">{item.itemNo || `ITEM-${i+1}`}</td>
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.unitPrice || item.rate)}</td>
                    <td className="py-3 text-right">{formatPercentage(item.discount || 0)}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{displayData.notes}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-600">{displayData.terms}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-end pt-6 mt-auto">
            <div>
              <h3 className="font-medium text-gray-700 mb-4">Authorized Signature</h3>
              <div className="border-b border-gray-400 w-48 h-10 mb-1">
                {renderSignature(displayData.signature)}
              </div>
              <p className="text-xs text-gray-500">Signature</p>
            </div>
            <div className="flex items-end">
              <p className="text-sm mr-4">Initials: _________</p>
              <div className="border border-dashed border-gray-400 w-20 h-20 flex items-center justify-center">
                {renderCompanyStamp(displayData.company.stamp)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteTemplate5;
