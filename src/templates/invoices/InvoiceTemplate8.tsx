import React from 'react';
import A4Sheet from '@/components/design/A4Sheet';
import { parseNumberWithComma } from '@/utils/numberUtils';

// Define the invoice item interface
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

// Define the invoice data interface
interface InvoiceTemplateProps {
  invoiceNumber: string;
  date: string;
  dueDate: string;
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
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  currency?: string;
  printMode?: boolean;
}

/**
 * Invoice Template 8 - Orange Modern Design
 * Based on Canva template: https://www.canva.com/design/DAGnJ-QyaHc/1-TAB8YQMwEKxZZUOD05Cw/
 */
const InvoiceTemplate8: React.FC<InvoiceTemplateProps> = ({
  invoiceNumber,
  date,
  dueDate,
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
  const backgroundImageUrl = '/assets/templates/template4-background.jpg';
  
  // Format currency function
  const formatCurrency = (amount: number) => {
    return `${currency} ${parseNumberWithComma(amount.toFixed(2))}`;
  };

  return (
    <A4Sheet 
      backgroundImage={backgroundImageUrl} 
      className="font-sans"
      printable={printMode}
      id={`invoice-${invoiceNumber}`}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-10 pt-6">
        <div className="max-w-[40%]">
          {companyDetails.logo && (
            <img 
              src={companyDetails.logo} 
              alt={`${companyDetails.name} logo`} 
              className="max-h-24 max-w-full object-contain mb-4" 
            />
          )}
          <h1 className="text-2xl font-bold text-orange-700">{companyDetails.name}</h1>
        </div>
        
        <div className="text-right">
          <h2 className="text-4xl font-bold mb-4 text-orange-700">INVOICE</h2>
          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-md">
            <p className="text-lg"><strong>Invoice No:</strong> {invoiceNumber}</p>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Due Date:</strong> {dueDate}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white bg-opacity-95 p-6 rounded-lg shadow-md">
        {/* Client and Company Info */}
        <div className="flex justify-between mb-8">
          <div className="w-1/2 pr-4">
            <h3 className="text-lg font-bold text-orange-700 mb-2 pb-1 flex items-center">
              <div className="bg-orange-500 w-6 h-6 rounded-full mr-2"></div>
              Bill To:
            </h3>
            <p className="font-bold">{clientDetails.name}</p>
            <p className="whitespace-pre-line">{clientDetails.address}</p>
            {clientDetails.email && <p>{clientDetails.email}</p>}
            {clientDetails.phone && <p>{clientDetails.phone}</p>}
          </div>
          
          <div className="w-1/2 pl-4">
            <h3 className="text-lg font-bold text-orange-700 mb-2 pb-1 flex items-center">
              <div className="bg-orange-500 w-6 h-6 rounded-full mr-2"></div>
              From:
            </h3>
            <p className="whitespace-pre-line">{companyDetails.address}</p>
            <p>{companyDetails.phone}</p>
            <p>{companyDetails.email}</p>
            {companyDetails.regNumber && <p>Reg No: {companyDetails.regNumber}</p>}
            {companyDetails.vatNumber && <p>VAT No: {companyDetails.vatNumber}</p>}
          </div>
        </div>
        
        {/* Invoice Items Table */}
        <div className="mb-8 overflow-hidden rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="py-3 px-4 text-left font-semibold rounded-tl-lg">Description</th>
                <th className="py-3 px-4 text-right font-semibold">Qty</th>
                <th className="py-3 px-4 text-right font-semibold">Unit Price</th>
                <th className="py-3 px-4 text-right font-semibold rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-orange-50' : 'bg-white'}>
                  <td className="py-3 px-4 border-b border-orange-100">{item.description}</td>
                  <td className="py-3 px-4 text-right border-b border-orange-100">{item.quantity}</td>
                  <td className="py-3 px-4 text-right border-b border-orange-100">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-4 text-right border-b border-orange-100">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-1/3">
            <div className="flex justify-between py-2">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Tax:</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between py-3 bg-orange-500 text-white px-4 rounded-lg mt-2">
              <span className="font-bold">Total:</span>
              <span className="font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        
        {/* Payment Information */}
        {companyDetails.bankDetails && (
          <div className="mb-8 bg-gradient-to-r from-orange-100 to-orange-50 p-5 rounded-lg">
            <h3 className="text-lg font-bold text-orange-700 mb-3 flex items-center">
              <div className="bg-orange-500 w-6 h-6 rounded-full mr-2"></div>
              Payment Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p><strong>Bank:</strong> {companyDetails.bankDetails.bankName}</p>
                <p><strong>Account Name:</strong> {companyDetails.bankDetails.accountName}</p>
              </div>
              <div>
                <p><strong>Account Number:</strong> {companyDetails.bankDetails.accountNumber}</p>
                <p><strong>Branch Code:</strong> {companyDetails.bankDetails.branchCode}</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="inline-block bg-orange-600 text-white px-4 py-1 rounded-full text-sm">
                Please use invoice number {invoiceNumber} as payment reference
              </div>
            </div>
          </div>
        )}
        
        {/* Notes and Terms */}
        {(notes || terms) && (
          <div className="mt-8 grid grid-cols-1 gap-6">
            {notes && (
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <h3 className="text-lg font-bold text-orange-700 mb-2 flex items-center">
                  <div className="bg-orange-500 w-6 h-6 rounded-full mr-2"></div>
                  Notes
                </h3>
                <p className="whitespace-pre-line">{notes}</p>
              </div>
            )}
            {terms && (
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <h3 className="text-lg font-bold text-orange-700 mb-2 flex items-center">
                  <div className="bg-orange-500 w-6 h-6 rounded-full mr-2"></div>
                  Terms & Conditions
                </h3>
                <p className="whitespace-pre-line">{terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="bg-orange-600 py-2 text-white rounded-full max-w-md mx-auto shadow-lg">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </A4Sheet>
  );
};

export default InvoiceTemplate8;
