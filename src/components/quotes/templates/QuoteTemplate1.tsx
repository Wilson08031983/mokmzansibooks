
import React from "react";
import { TemplateProps } from "@/types/quote";
import { 
  formatDate, 
  formatCurrency, 
  formatPercentage, 
  renderCompanyLogo,
  renderCompanyStamp,
  renderSignature
} from "@/utils/formatters";
import Logo from "@/components/Logo";

const QuoteTemplate1 = ({ data, preview = false }: TemplateProps) => {
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
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-gray-800">QUOTATION</h1>
          <p className="text-sm text-gray-500"># {displayData.quoteNumber}</p>
        </div>
        <div className="flex items-center">
          {renderCompanyLogo(displayData.company.logo)}
        </div>
      </div>

      {/* Client and Company Details */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div className="space-y-1">
          <h3 className="font-bold text-gray-700">Prepared For:</h3>
          <h4 className="font-semibold">{displayData.client.name}</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{displayData.client.address}</p>
          <p className="text-sm text-gray-600">{displayData.client.email}</p>
          <p className="text-sm text-gray-600">{displayData.client.phone}</p>
        </div>
        
        <div className="space-y-1 text-right">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-700">From:</h3>
            <h4 className="font-semibold">{displayData.company.name}</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{displayData.company.address}</p>
            <p className="text-sm text-gray-600">{displayData.company.email}</p>
            <p className="text-sm text-gray-600">{displayData.company.phone}</p>
          </div>
          
          <div className="space-y-1 mt-4">
            <div className="flex justify-end space-x-4">
              <div>
                <h3 className="font-bold text-gray-700">Date:</h3>
                <p className="text-sm">{formatDate(displayData.issueDate)}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700">Valid Until:</h3>
                <p className="text-sm">{formatDate(displayData.expiryDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Items */}
      <div className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Item No.</th>
              <th className="py-2 px-4 text-left">Description</th>
              <th className="py-2 px-4 text-right">Quantity</th>
              <th className="py-2 px-4 text-right">Unit Price</th>
              <th className="py-2 px-4 text-right">Discount</th>
              <th className="py-2 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {displayData.items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 px-4">{item.itemNo || `ITEM-${i+1}`}</td>
                <td className="py-2 px-4">{item.description}</td>
                <td className="py-2 px-4 text-right">{item.quantity}</td>
                <td className="py-2 px-4 text-right">{formatCurrency(item.unitPrice || item.rate || 0)}</td>
                <td className="py-2 px-4 text-right">{formatPercentage(item.discount || 0)}</td>
                <td className="py-2 px-4 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}></td>
              <td className="py-2 px-4 text-right font-semibold">Subtotal:</td>
              <td className="py-2 px-4 text-right">{formatCurrency(displayData.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={4}></td>
              <td className="py-2 px-4 text-right font-semibold">VAT ({displayData.vatRate || 0}%):</td>
              <td className="py-2 px-4 text-right">{formatCurrency(displayData.tax)}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan={4}></td>
              <td className="py-2 px-4 text-right">Total:</td>
              <td className="py-2 px-4 text-right">{formatCurrency(displayData.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      <div className="mt-8">
        <h3 className="font-bold text-gray-700">Notes:</h3>
        <p className="text-sm text-gray-600 mt-1">{displayData.notes}</p>
      </div>

      {/* Terms & Signature */}
      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-gray-700">Terms and Conditions:</h3>
          <p className="text-sm text-gray-600 mt-1">{displayData.terms}</p>
        </div>
        <div className="flex flex-col items-end">
          <h3 className="font-bold text-gray-700">Signature:</h3>
          <div className="border-b border-gray-400 w-64 h-16 mt-2">
            {renderSignature(displayData.signature)}
          </div>
          <p className="text-sm text-gray-600 mt-1">Authorized Signature</p>
        </div>
      </div>

      {/* Company Stamp and Initials */}
      <div className="mt-8 flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-gray-700">Initials: _________</p>
        </div>
        <div className="border border-dashed border-gray-400 w-24 h-24 flex items-center justify-center">
          {renderCompanyStamp(displayData.company.stamp)}
        </div>
      </div>
    </div>
  );
};

export default QuoteTemplate1;
