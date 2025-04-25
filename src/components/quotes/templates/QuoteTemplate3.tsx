
import React from "react";
import { TemplateProps } from "@/types/quote";
import Header from "./QuoteTemplate3/Header";
import QuoteInfo from "./QuoteTemplate3/QuoteInfo";
import ItemsTable from "./QuoteTemplate3/ItemsTable";
import BankDetails from "./QuoteTemplate3/BankDetails";
import Footer from "./QuoteTemplate3/Footer";

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
    <div className={`bg-white font-sans shadow-lg relative ${preview ? 'w-full' : 'w-[210mm]'}`} 
      style={{ 
        minHeight: '297mm',
        maxWidth: preview ? 'none' : '210mm',
        margin: preview ? '0' : '0 auto',
      }}>
      {/* Left sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-indigo-700 z-0"></div>
      
      {/* Main content */}
      <div className="relative z-10 grid grid-cols-5">
        {/* Left sidebar content */}
        <div className="col-span-1 p-6 text-white">
          <div className="mb-16 mt-6">
            <h2 className="text-xl font-bold">QUOTATION</h2>
            <p className="text-sm opacity-90 mt-1">#{displayData.quoteNumber}</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider opacity-75 mb-2">From</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{displayData.company.name}</p>
                <p className="opacity-90 text-xs whitespace-pre-line">{displayData.company.address}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs uppercase tracking-wider opacity-75 mb-2">To</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{displayData.client.name}</p>
                <p className="opacity-90 text-xs whitespace-pre-line">{displayData.client.address}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs uppercase tracking-wider opacity-75 mb-2">Issue Date</h3>
              <p className="text-sm">{displayData.issueDate}</p>
            </div>
            
            <div>
              <h3 className="text-xs uppercase tracking-wider opacity-75 mb-2">Valid Until</h3>
              <p className="text-sm">{displayData.expiryDate}</p>
            </div>
            
            <div className="pt-6">
              <div className="border-2 border-white border-opacity-20 p-4 rounded">
                <h3 className="text-xs uppercase tracking-wider opacity-75 mb-2">Bank Details</h3>
                <div className="space-y-2 text-xs">
                  <p><span className="opacity-75">Bank:</span> {displayData.bankAccount?.bankName}</p>
                  <p><span className="opacity-75">Account:</span> {displayData.bankAccount?.accountNumber}</p>
                  <p><span className="opacity-75">Branch:</span> {displayData.bankAccount?.branchCode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="col-span-4 p-6">
          <div className="flex justify-between items-start mb-10">
            <div className="bg-white rounded-lg shadow-sm p-2 -ml-10 -mt-3">
              {displayData.company.logo ? (
                <img src={displayData.company.logo} alt="Company Logo" className="h-16" />
              ) : (
                <div className="h-16 w-24 bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                  Logo
                </div>
              )}
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg text-right">
              <h2 className="text-xl font-bold text-indigo-700">TOTAL</h2>
              <p className="text-2xl font-bold text-indigo-900">{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(displayData.total)}</p>
            </div>
          </div>

          <ItemsTable 
            items={displayData.items}
            subtotal={displayData.subtotal}
            vatRate={displayData.vatRate || 0}
            tax={displayData.tax}
            total={displayData.total}
          />

          <div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-1 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{displayData.notes}</p>
            </div>
            <div>
              <h3 className="font-bold text-indigo-700 border-b border-indigo-100 pb-1 mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-600">{displayData.terms}</p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-indigo-700 mb-4">Authorized Signature:</h3>
              <div className="border-b-2 border-gray-200 w-48 h-14 mb-1">
                {displayData.signature && <img src={displayData.signature} alt="Signature" className="h-full object-contain" />}
              </div>
              <p className="text-xs text-gray-500">Signature</p>
            </div>
            <div className="flex justify-end items-end">
              <div className="flex flex-col items-end">
                <div className="border-2 border-dashed border-gray-300 rounded-lg w-24 h-24 flex items-center justify-center">
                  {displayData.company.stamp && <img src={displayData.company.stamp} alt="Company Stamp" className="max-h-20 max-w-20" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteTemplate3;
