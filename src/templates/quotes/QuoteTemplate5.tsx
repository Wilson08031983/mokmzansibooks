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
 * Quote Template 5 - Purple Modern Design
 * Based on Canva template: https://www.canva.com/design/DAGnJkVJXHE/HWkFsAjlnujJh4Db33nwhQ/
 */
const QuoteTemplate5: React.FC<QuoteTemplateProps> = ({
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
  const backgroundImageUrl = '/assets/templates/template1-background.jpg';
  
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
      {/* Top Section - Logo and Company Info */}
      <div className="flex justify-between items-start mb-8 text-white">
        <div className="max-w-[40%]">
          {companyDetails.logo && (
            <img 
              src={companyDetails.logo} 
              alt={`${companyDetails.name} logo`} 
              className="max-h-24 max-w-full object-contain mb-4" 
            />
          )}
          <h1 className="text-2xl font-bold">{companyDetails.name}</h1>
        </div>
        
        <div className="text-right">
          <h2 className="text-4xl font-bold mb-4">QUOTATION</h2>
          <div className="bg-opacity-70 bg-black p-3 rounded">
            <p className="text-lg"><strong>Quote No:</strong> {quoteNumber}</p>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Valid Until:</strong> {expiryDate}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content - With semi-transparent white background for readability */}
      <div className="bg-white bg-opacity-85 p-6 rounded-lg shadow-sm">
        {/* Client and Company Info */}
        <div className="flex justify-between mb-8">
          <div className="w-1/2 pr-4">
            <h3 className="text-lg font-bold text-purple-800 mb-2">Prepared For:</h3>
            <p className="font-bold">{clientDetails.name}</p>
            <p className="whitespace-pre-line">{clientDetails.address}</p>
            {clientDetails.email && <p>{clientDetails.email}</p>}
            {clientDetails.phone && <p>{clientDetails.phone}</p>}
          </div>
          
          <div className="w-1/2 pl-4">
            <h3 className="text-lg font-bold text-purple-800 mb-2">From:</h3>
            <p className="whitespace-pre-line">{companyDetails.address}</p>
            <p>{companyDetails.phone}</p>
            <p>{companyDetails.email}</p>
            {companyDetails.regNumber && <p>Reg No: {companyDetails.regNumber}</p>}
            {companyDetails.vatNumber && <p>VAT No: {companyDetails.vatNumber}</p>}
          </div>
        </div>
        
        {/* Quote Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-800 text-white">
                <th className="py-2 px-4 text-left">Description</th>
                <th className="py-2 px-4 text-right">Qty</th>
                <th className="py-2 px-4 text-right">Unit Price</th>
                <th className="py-2 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                  <td className="py-2 px-4 border-b border-purple-100">{item.description}</td>
                  <td className="py-2 px-4 text-right border-b border-purple-100">{item.quantity}</td>
                  <td className="py-2 px-4 text-right border-b border-purple-100">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 px-4 text-right border-b border-purple-100">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-1/3">
            <div className="flex justify-between py-2">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Tax:</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-purple-800">
              <span className="font-bold">Total:</span>
              <span className="font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        
        {/* Notes and Terms */}
        {(notes || terms) && (
          <div className="mt-6">
            {notes && (
              <div className="mb-4">
                <h3 className="text-lg font-bold text-purple-800 mb-2">Notes</h3>
                <p className="whitespace-pre-line">{notes}</p>
              </div>
            )}
            {terms && (
              <div>
                <h3 className="text-lg font-bold text-purple-800 mb-2">Terms & Conditions</h3>
                <p className="whitespace-pre-line">{terms}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Acceptance Section */}
        <div className="mt-8 border-t-2 border-purple-200 pt-4">
          <h3 className="text-lg font-bold text-purple-800 mb-2">Acceptance</h3>
          <p className="mb-4">To accept this quotation, please sign below or reply via email confirmation.</p>
          
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <div className="border-b border-gray-400 w-full mb-2 h-8"></div>
              <p className="text-center">Client Signature</p>
            </div>
            <div>
              <div className="border-b border-gray-400 w-full mb-2 h-8"></div>
              <p className="text-center">Date</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white text-xs">
        <p>Thank you for considering our services. This quote is valid until {expiryDate}.</p>
      </div>
    </A4Sheet>
  );
};

export default QuoteTemplate5;
