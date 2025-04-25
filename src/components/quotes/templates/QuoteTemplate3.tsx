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
    <div className="w-full bg-white p-8 shadow-lg mx-auto font-sans relative" style={{ 
      minHeight: '297mm', 
      maxWidth: preview ? 'none' : '210mm',
      margin: preview ? '0' : '0 auto'
    }}>
      {/* Background curve */}
      <div className="absolute right-0 top-0 h-full w-1/4 bg-indigo-600 z-0" 
        style={{ 
          clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)'
        }}>
      </div>
      
      <Header 
        quoteNumber={displayData.quoteNumber}
        company={displayData.company}
      />

      <QuoteInfo 
        company={displayData.company}
        client={displayData.client}
        issueDate={displayData.issueDate}
        quoteNumber={displayData.quoteNumber}
        expiryDate={displayData.expiryDate}
      />

      <ItemsTable 
        items={displayData.items}
        subtotal={displayData.subtotal}
        vatRate={displayData.vatRate || 0}
        tax={displayData.tax}
        total={displayData.total}
      />

      <BankDetails 
        bankAccount={displayData.bankAccount}
      />

      <Footer 
        notes={displayData.notes}
        terms={displayData.terms}
        signature={displayData.signature}
        companyStamp={displayData.company.stamp}
      />
    </div>
  );
};

export default QuoteTemplate3;
