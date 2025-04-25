
import React from "react";
import { TemplateProps } from "@/types/quote";
import Header from "./QuoteTemplate3/Header";
import QuoteInfo from "./QuoteTemplate3/QuoteInfo";
import ItemsTable from "./QuoteTemplate3/ItemsTable";
import BankDetails from "./QuoteTemplate3/BankDetails";
import Footer from "./QuoteTemplate3/Footer";
import { renderCompanyLogo, renderCompanyStamp, renderSignature } from "@/utils/formatters";

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
    signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png",
    bankAccount: {
      bankName: "First National Bank",
      accountName: "MOKMzansi Holdings",
      accountNumber: "62123456789",
      branchCode: "250655",
      swiftCode: "FIRNZAJJ"
    }
  };

  const displayData = preview ? previewData : data;
  
  return (
    <div 
      className={`bg-white font-sans shadow-lg relative ${preview ? 'w-full' : ''}`} 
      style={{ 
        width: preview ? '100%' : '210mm',
        minHeight: '297mm',
        margin: '0 auto',
      }}
    >
      {/* Left sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-indigo-700 z-0"></div>
      
      {/* Main content */}
      <div className="relative z-10 pl-24 pr-6 pt-6 pb-6">
        {/* Header with logo */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-indigo-700">QUOTATION</h1>
            <p className="text-sm text-gray-600">#{displayData.quoteNumber}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-2">
            {renderCompanyLogo(displayData.company.logo)}
          </div>
        </div>

        {/* Company and client info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-indigo-700 font-semibold mb-2">From</h3>
              <div className="space-y-1">
                <p className="font-medium">{displayData.company.name}</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{displayData.company.address}</p>
                <p className="text-sm text-gray-600">{displayData.company.email}</p>
                <p className="text-sm text-gray-600">{displayData.company.phone}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs uppercase tracking-wider text-indigo-700 font-semibold mb-2">To</h3>
              <div className="space-y-1">
                <p className="font-medium">{displayData.client.name}</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{displayData.client.address}</p>
                <p className="text-sm text-gray-600">{displayData.client.email}</p>
                <p className="text-sm text-gray-600">{displayData.client.phone}</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Issue Date:</span>
                <span>{displayData.issueDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium">Valid Until:</span>
                <span>{displayData.expiryDate}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-indigo-700">{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(displayData.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="mb-8">
          <ItemsTable 
            items={displayData.items}
            subtotal={displayData.subtotal}
            vatRate={displayData.vatRate}
            tax={displayData.tax}
            total={displayData.total}
          />
        </div>

        {/* Bank details */}
        {displayData.bankAccount && (
          <div className="mb-8 bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-700">
            <h3 className="font-bold text-indigo-700 mb-2">Banking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm"><span className="font-medium">Bank:</span> {displayData.bankAccount.bankName}</p>
                <p className="text-sm"><span className="font-medium">Account Name:</span> {displayData.bankAccount.accountName}</p>
              </div>
              <div>
                <p className="text-sm"><span className="font-medium">Account Number:</span> {displayData.bankAccount.accountNumber}</p>
                <p className="text-sm"><span className="font-medium">Branch Code:</span> {displayData.bankAccount.branchCode}</p>
                {displayData.bankAccount.swiftCode && (
                  <p className="text-sm"><span className="font-medium">SWIFT Code:</span> {displayData.bankAccount.swiftCode}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes and terms */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-1 mb-2">Notes</h3>
            <p className="text-sm text-gray-600">{displayData.notes}</p>
          </div>
          <div>
            <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-1 mb-2">Terms & Conditions</h3>
            <p className="text-sm text-gray-600">{displayData.terms}</p>
          </div>
        </div>

        {/* Signature and stamp */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-indigo-700 mb-4">Authorized Signature:</h3>
            <div className="border-b-2 border-gray-200 w-48 h-14 mb-1">
              {renderSignature(displayData.signature)}
            </div>
            <p className="text-xs text-gray-500">Signature</p>
          </div>
          <div className="flex justify-end items-end">
            <div className="flex flex-col items-end">
              <div className="border-2 border-dashed border-gray-300 rounded-lg w-24 h-24 flex items-center justify-center">
                {renderCompanyStamp(displayData.company.stamp)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteTemplate3;
