import React from 'react';
import A4Sheet from '@/components/design/A4Sheet';
import { parseNumberWithComma } from '@/utils/numberUtils';

// Define the quote item interface
interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

// Define the quote data interface
interface QuoteTemplateProps {
  quoteNumber: string;
  date: string;
  expiryDate: string;
  companyDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    regNumber?: string;
    vatNumber?: string;
    bankDetails?: {
      accountName?: string;
      accountNumber?: string;
      bankName?: string;
      branchCode?: string;
    };
  };
  clientDetails: {
    name: string;
    address: string;
    email?: string;
    phone?: string;
  };
  items: QuoteItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  currency?: string;
  printMode?: boolean;
}

/**
 * Quote Template 6 - Blue Corporate Design
 * Based on Canva template: https://www.canva.com/design/DAGnJ1NnlkQ/bWTfvU4ajw4UbkegzISPmA/
 */
const QuoteTemplate6: React.FC<QuoteTemplateProps> = ({
  quoteNumber,
  date,
  expiryDate,
  companyDetails,
  clientDetails,
  items,
  subtotal,
  taxAmount,
  total,
  notes,
  terms,
  currency = "R",
  printMode = false,
}) => {
  // Background image URL - replace with actual path to downloaded Canva design
  const backgroundImageUrl = '/assets/templates/template2-background.jpg';
  
  // Format currency function
  const formatCurrency = (amount: number) => {
    return `${currency} ${parseNumberWithComma(amount.toFixed(2))}`;
  };

  return (
    <A4Sheet 
      backgroundImage={backgroundImageUrl} 
      className="font-sans"
      printable={printMode}
      id={`quote-${quoteNumber}`}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-12 pt-4">
        <div className="max-w-[40%]">
          {companyDetails.logo && (
            <img 
              src={companyDetails.logo} 
              alt={`${companyDetails.name} logo`} 
              className="max-h-24 max-w-full object-contain mb-4" 
            />
          )}
          <h1 className="text-2xl font-bold text-blue-800">{companyDetails.name}</h1>
        </div>
        
        <div className="text-right">
          <h2 className="text-4xl font-bold mb-6 text-blue-800">QUOTATION</h2>
          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-600">
            <p className="text-lg"><strong>Quote No:</strong> {quoteNumber}</p>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Valid Until:</strong> {expiryDate}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-sm">
        {/* Client and Company Info */}
        <div className="flex justify-between mb-8">
          <div className="w-1/2 pr-4">
            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b border-blue-400 pb-1">Prepared For:</h3>
            <p className="font-bold">{clientDetails.name}</p>
            <p className="whitespace-pre-line">{clientDetails.address}</p>
            {clientDetails.email && <p>{clientDetails.email}</p>}
            {clientDetails.phone && <p>{clientDetails.phone}</p>}
          </div>
          
          <div className="w-1/2 pl-4">
            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b border-blue-400 pb-1">From:</h3>
            <p className="whitespace-pre-line">{companyDetails.address}</p>
            <p>{companyDetails.phone}</p>
            <p>{companyDetails.email}</p>
            {companyDetails.regNumber && <p>Reg No: {companyDetails.regNumber}</p>}
            {companyDetails.vatNumber && <p>VAT No: {companyDetails.vatNumber}</p>}
          </div>
        </div>
        
        {/* Quote Items Table */}
        <div className="mb-8 overflow-hidden rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
                <th className="py-3 px-4 text-left font-semibold">Description</th>
                <th className="py-3 px-4 text-right font-semibold">Qty</th>
                <th className="py-3 px-4 text-right font-semibold">Unit Price</th>
                <th className="py-3 px-4 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                  <td className="py-3 px-4 border-b border-blue-100">{item.description}</td>
                  <td className="py-3 px-4 text-right border-b border-blue-100">{item.quantity}</td>
                  <td className="py-3 px-4 text-right border-b border-blue-100">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-4 text-right border-b border-blue-100">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-1/3 bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between py-2">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Tax:</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-blue-600 mt-2 pt-2">
              <span className="font-bold text-blue-800">Total:</span>
              <span className="font-bold text-blue-800">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        
        {/* Notes and Terms */}
        {(notes || terms) && (
          <div className="mt-8 grid grid-cols-2 gap-6">
            {notes && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-blue-800 mb-2 border-b border-blue-400 pb-1">Notes</h3>
                <p className="whitespace-pre-line">{notes}</p>
              </div>
            )}
            {terms && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-blue-800 mb-2 border-b border-blue-400 pb-1">Terms & Conditions</h3>
                <p className="whitespace-pre-line">{terms}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Acceptance Section */}
        <div className="mt-8 bg-blue-50 p-5 rounded-lg border-t-4 border-blue-600">
          <h3 className="text-lg font-bold text-blue-800 mb-2 border-b border-blue-400 pb-1">Acceptance</h3>
          <p className="mb-4">To accept this quotation, please sign below or reply via email confirmation.</p>
          
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <div className="border-b-2 border-blue-400 w-full mb-2 h-8"></div>
              <p className="text-center text-blue-800">Client Signature</p>
            </div>
            <div>
              <div className="border-b-2 border-blue-400 w-full mb-2 h-8"></div>
              <p className="text-center text-blue-800">Date</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 py-2 text-white rounded-full max-w-md mx-auto">
          <p>Thank you for your consideration! This quote is valid until {expiryDate}.</p>
        </div>
      </div>
    </A4Sheet>
  );
};

export default QuoteTemplate6;
