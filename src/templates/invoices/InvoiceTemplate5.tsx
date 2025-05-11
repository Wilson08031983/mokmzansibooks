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
  markupPercentage?: number;
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
    stamp?: string;
    signature?: string;
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
  hideMarkup?: boolean;
}

/**
 * Invoice Template 5 - Purple Modern Design
 * Based on Canva template: https://www.canva.com/design/DAGnJkVJXHE/HWkFsAjlnujJh4Db33nwhQ/
 */
const InvoiceTemplate5: React.FC<InvoiceTemplateProps> = ({
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
  hideMarkup = true,
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
      id={`invoice-${invoiceNumber}`}
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
          <h2 className="text-4xl font-bold mb-4">INVOICE</h2>
          <div className="bg-opacity-70 bg-black p-3 rounded">
            <p className="text-lg"><strong>Invoice No:</strong> {invoiceNumber}</p>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Due Date:</strong> {dueDate}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content - With semi-transparent white background for readability */}
      <div className="bg-white bg-opacity-85 p-6 rounded-lg shadow-sm">
        {/* Client and Company Info */}
        <div className="flex justify-between mb-8">
          <div className="w-1/2 pr-4">
            <h3 className="text-lg font-bold text-purple-800 mb-2">Bill To:</h3>
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
        
        {/* Invoice Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-800 text-white">
                <th className="py-2 px-4 text-left">Description</th>
                <th className="py-2 px-4 text-right">Qty</th>
                <th className="py-2 px-4 text-right">Unit Price</th>
                {!hideMarkup && <th className="py-2 px-4 text-right">Markup %</th>}
                <th className="py-2 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                  <td className="py-2 px-4 border-b border-purple-100">{item.description}</td>
                  <td className="py-2 px-4 text-right border-b border-purple-100">{item.quantity}</td>
                  <td className="py-2 px-4 text-right border-b border-purple-100">{formatCurrency(item.unitPrice)}</td>
                  {!hideMarkup && item.markupPercentage && (
                    <td className="py-2 px-4 text-right border-b border-purple-100">{item.markupPercentage}%</td>
                  )}
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
        
        {/* Payment Information - Always display section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-purple-800 mb-2">Payment Information</h3>
          <div className="bg-purple-50 p-4 rounded">
            <p><strong>Bank:</strong> {companyDetails.bankDetails?.bankName || 'Your Bank Name'}</p>
            <p><strong>Account Name:</strong> {companyDetails.bankDetails?.accountName || companyDetails.name}</p>
            <p><strong>Account Number:</strong> {companyDetails.bankDetails?.accountNumber || 'Your Account Number'}</p>
            <p><strong>Branch Code:</strong> {companyDetails.bankDetails?.branchCode || 'Your Branch Code'}</p>
          </div>
        </div>
        
        {/* Signature and Stamp Section */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          {/* Signature Section */}
          <div>
            <h3 className="text-lg font-bold text-purple-800 mb-2">Authorized Signature</h3>
            <div className="h-20 relative">
              {companyDetails.signature ? (
                <img 
                  src={companyDetails.signature} 
                  alt="Signature" 
                  className="max-h-16 object-contain absolute bottom-0"
                />
              ) : (
                <div className="border-b-2 border-purple-300 absolute bottom-0 w-full"></div>
              )}
            </div>
            <p className="text-sm mt-1">{companyDetails.name}</p>
          </div>
          
          {/* Company Stamp */}
          <div className="flex justify-end">
            {companyDetails.stamp && (
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold text-purple-800 mb-2">Company Stamp</h3>
                <div className="h-36 w-36 flex items-center justify-center"> {/* Increased from 24 to 36 (50% larger) */}
                  <img 
                    src={companyDetails.stamp} 
                    alt="Company Stamp" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}
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
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-purple-800 text-xs font-bold">
        <p>Thank you for your business!</p>
      </div>
    </A4Sheet>
  );
};

export default InvoiceTemplate5;
