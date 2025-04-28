
import React from "react";
import { QuoteData } from "@/types/quote";
import QuoteSidebar from "./components/QuoteSidebar";
import QuoteTable from "./components/QuoteTable";
import QuoteFooter from "./components/QuoteFooter";

interface TemplateProps {
  data: QuoteData;
  preview?: boolean;
}

const Template5 = ({ data, preview = false }: TemplateProps) => {
  // Sample data for preview mode
  const previewData: QuoteData = {
    quoteNumber: "QT-2025-0001",
    issueDate: "2025-04-03",
    expiryDate: "2025-04-17",
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
        itemNo: 1,
        description: "Consultation Services",
        quantity: 10,
        unitPrice: 1500,
        discount: 0,
        amount: 15000
      },
      {
        itemNo: 2,
        description: "Equipment Rental",
        quantity: 5,
        unitPrice: 2000,
        discount: 0,
        amount: 10000
      }
    ],
    subtotal: 25000,
    vatRate: 15,
    tax: 3750,
    total: 28750,
    notes: "Thank you for your business!",
    terms: "Payment due within 14 days of invoice date.",
    signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png",
    bankAccount: {
      bankName: "First National Bank",
      accountName: "MOKMzansi Holdings",
      accountNumber: "62123456789",
      branchCode: "250655",
      swiftCode: "FIRNZAJJ"
    }
  };

  // Use the provided data or fall back to preview data
  const displayData = preview ? data : previewData;
  
  return (
    <div className="w-[210mm] h-[297mm] bg-white p-8 shadow-lg mx-auto font-sans relative overflow-hidden" style={{ minHeight: '297mm' }}>
      <div className="flex h-full">
        <QuoteSidebar data={displayData} />
        
        <div className="w-2/3 p-6 rounded-r-lg border-r border-t border-b border-gray-200 h-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">QUOTE</h1>
            <p className="text-sm text-gray-500 border-b pb-4 border-gray-200">{displayData.quoteNumber}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Quote Items</h2>
            <QuoteTable items={displayData.items} />
          </div>
          
          <QuoteFooter data={displayData} />
        </div>
      </div>
    </div>
  );
};

export default Template5;
