
import React from "react";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { format } from "date-fns";
import { QuoteData } from "@/types/quote";

interface Props {
  data: QuoteData;
}

const QuoteModernTemplate: React.FC<Props> = ({ data }) => {
  const items = data.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = data.vatRate ? subtotal * (data.vatRate / 100) : 0;
  const total = subtotal + tax;
  
  // Helper functions for rendering conditional elements
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (e) {
      return dateString;
    }
  };
  
  const renderCompanyLogo = (logoUrl?: string) => {
    if (!logoUrl) return null;
    return <img src={logoUrl} alt="Company Logo" className="max-h-16 max-w-full object-contain mb-4" />;
  };
  
  const renderCompanyStamp = (stampUrl?: string) => {
    if (!stampUrl) return null;
    return <img src={stampUrl} alt="Company Stamp" className="max-h-24 max-w-full object-contain" />;
  };
  
  const renderSignature = (signatureUrl?: string) => {
    if (!signatureUrl) return null;
    return <img src={signatureUrl} alt="Signature" className="max-h-16 max-w-full object-contain" />;
  };
  
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white p-8 mx-auto shadow-lg">
      <div className="flex justify-between items-start mb-8">
        <div>
          {renderCompanyLogo(data.company?.logo)}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">QUOTE</h1>
          <p className="text-sm text-gray-500">{data.quoteNumber}</p>
        </div>
        
        <div className="text-right">
          <h2 className="font-bold text-xl text-gray-800">{data.company?.name}</h2>
          <p className="text-gray-600 whitespace-pre-line">{data.company?.address}</p>
          <p className="text-gray-600">{data.company?.email}</p>
          <p className="text-gray-600">{data.company?.phone}</p>
        </div>
      </div>
      
      <hr className="border-gray-300 my-6" />
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-600 mb-2">BILL TO:</h3>
          <h4 className="font-bold text-gray-800">{data.client.name}</h4>
          <p className="text-gray-600 whitespace-pre-line">{data.client.address}</p>
          <p className="text-gray-600">{data.client.email}</p>
          <p className="text-gray-600">{data.client.phone}</p>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-600">Issue Date:</span>
            <span className="text-gray-800">{formatDate(data.issueDate)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-600">Expiry Date:</span>
            <span className="text-gray-800">{formatDate(data.expiryDate)}</span>
          </div>
          {data.shortDescription && (
            <div className="mt-4">
              <span className="font-semibold text-gray-600 block mb-1">Description:</span>
              <p className="text-gray-800">{data.shortDescription}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-8 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700">#</th>
              <th className="px-4 py-2 text-left text-gray-700">Description</th>
              <th className="px-4 py-2 text-right text-gray-700">Qty</th>
              <th className="px-4 py-2 text-right text-gray-700">Unit Price</th>
              <th className="px-4 py-2 text-right text-gray-700">Discount</th>
              <th className="px-4 py-2 text-right text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="px-4 py-3 text-gray-800">{item.itemNo}</td>
                <td className="px-4 py-3 text-gray-800">{item.description}</td>
                <td className="px-4 py-3 text-gray-800 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-gray-800 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="px-4 py-3 text-gray-800 text-right">{formatPercentage(item.discount)}</td>
                <td className="px-4 py-3 text-gray-800 text-right font-semibold">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end mb-8">
        <div className="w-1/3">
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-800">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span className="text-gray-600">Tax ({data.vatRate || 0}%):</span>
            <span className="text-gray-800">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        {data.notes && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
            <p className="text-gray-600 whitespace-pre-line">{data.notes}</p>
          </div>
        )}
        
        {data.terms && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Terms & Conditions</h4>
            <p className="text-gray-600 whitespace-pre-line">{data.terms}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-8 mt-12">
        <div>
          <div className="border-t border-gray-300 pt-2 mt-8">
            {renderSignature(data.signature)}
            <p className="text-gray-600 text-sm mt-2">Authorized Signature</p>
          </div>
        </div>
        <div className="text-right">
          <div className="border-t border-gray-300 pt-2 mt-8 inline-block">
            {renderCompanyStamp(data.company?.stamp)}
            <p className="text-gray-600 text-sm mt-2">Company Stamp</p>
          </div>
        </div>
      </div>
      
      {data.bankAccount && (
        <div className="mt-8 border-t border-gray-300 pt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Banking Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <p className="text-gray-600"><span className="font-medium">Bank:</span> {data.bankAccount.bankName}</p>
            <p className="text-gray-600"><span className="font-medium">Account Name:</span> {data.bankAccount.accountName}</p>
            <p className="text-gray-600"><span className="font-medium">Account Number:</span> {data.bankAccount.accountNumber}</p>
            <p className="text-gray-600"><span className="font-medium">Branch Code:</span> {data.bankAccount.branchCode}</p>
            {data.bankAccount.swiftCode && <p className="text-gray-600"><span className="font-medium">SWIFT Code:</span> {data.bankAccount.swiftCode}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteModernTemplate;
