
import React from "react";
import { InvoiceData } from "@/types/invoice";
import { formatDate, formatCurrency, renderCompanyLogo, renderSignature, renderCompanyStamp } from "@/utils/formatters";

interface TemplateProps {
  data: InvoiceData;
  preview?: boolean;
}

const InvoiceElegantTemplate = ({ data, preview }: TemplateProps) => {
  return (
    <div className="bg-white text-black font-serif">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div className="w-28 h-28">
          {renderCompanyLogo(data.company.logo)}
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-light text-gray-800">INVOICE</h1>
          <div className="w-16 h-1 bg-gray-300 ml-auto mt-1 mb-2"></div>
          <p className="text-gray-500">REF: {data.invoiceNumber}</p>
        </div>
      </div>
      
      {/* Company and Client Info */}
      <div className="grid grid-cols-2 gap-16 mb-10">
        <div>
          <h3 className="text-lg font-light border-b border-gray-200 pb-1 mb-3">FROM</h3>
          <h4 className="font-medium text-lg">{data.company.name}</h4>
          <p className="whitespace-pre-line text-gray-600">{data.company.address}</p>
          <p className="text-gray-600">{data.company.email}</p>
          <p className="text-gray-600">{data.company.phone}</p>
        </div>
        <div>
          <h3 className="text-lg font-light border-b border-gray-200 pb-1 mb-3">BILL TO</h3>
          <h4 className="font-medium text-lg">{data.client.name}</h4>
          <p className="whitespace-pre-line text-gray-600">{data.client.address}</p>
          <p className="text-gray-600">{data.client.email}</p>
          <p className="text-gray-600">{data.client.phone}</p>
        </div>
      </div>
      
      {/* Invoice Details */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div>
          <h3 className="text-sm font-light text-gray-500">INVOICE DATE</h3>
          <p className="font-medium">{formatDate(data.issueDate)}</p>
        </div>
        <div>
          <h3 className="text-sm font-light text-gray-500">DUE DATE</h3>
          <p className="font-medium">{formatDate(data.dueDate)}</p>
        </div>
        <div>
          <h3 className="text-sm font-light text-gray-500">REFERENCE</h3>
          <p className="font-medium">{data.invoiceNumber}</p>
        </div>
      </div>
      
      {/* Description */}
      {data.shortDescription && (
        <div className="mb-8">
          <h3 className="text-lg font-light border-b border-gray-200 pb-1 mb-3">DESCRIPTION</h3>
          <p className="text-gray-700">{data.shortDescription}</p>
        </div>
      )}
      
      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-light border-b border-gray-200 pb-1 mb-3">DETAILS</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-3">Item</th>
              <th className="py-3">Description</th>
              <th className="py-3 text-right">Qty</th>
              <th className="py-3 text-right">Rate (R)</th>
              <th className="py-3 text-right">Discount</th>
              <th className="py-3 text-right">Amount (R)</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4">{item.itemNo}</td>
                <td className="py-4">{item.description}</td>
                <td className="py-4 text-right">{item.quantity}</td>
                <td className="py-4 text-right">{formatCurrency(item.rate, "ZAR")}</td>
                <td className="py-4 text-right">{item.discount}%</td>
                <td className="py-4 text-right font-medium">{formatCurrency(item.amount, "ZAR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(data.subtotal, "ZAR")}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">VAT ({data.vatRate}%):</span>
            <span className="font-medium">{formatCurrency(data.tax, "ZAR")}</span>
          </div>
          <div className="h-px bg-gray-200 my-2"></div>
          <div className="flex justify-between py-2 text-xl font-light">
            <span>Total:</span>
            <span className="font-medium">{formatCurrency(data.total, "ZAR")}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-10 mb-10">
        {/* Terms and Notes */}
        <div>
          <h3 className="text-lg font-light border-b border-gray-200 pb-1 mb-3">TERMS & CONDITIONS</h3>
          <p className="text-gray-600 whitespace-pre-line">{data.terms}</p>
          
          {data.notes && (
            <>
              <h3 className="text-lg font-light border-b border-gray-200 pb-1 mb-3 mt-6">NOTES</h3>
              <p className="text-gray-600 whitespace-pre-line">{data.notes}</p>
            </>
          )}
        </div>
        
        {/* Banking Details and Signature */}
        <div>
          <h3 className="text-lg font-light border-b border-gray-200 pb-1 mb-3">BANKING DETAILS</h3>
          <pre className="whitespace-pre-wrap text-gray-600 font-serif">{data.bankingDetails}</pre>
          
          <div className="mt-8 flex items-end justify-between">
            <div>
              <h3 className="text-sm font-light text-gray-500 mb-2">AUTHORIZED SIGNATURE</h3>
              <div className="border-b border-gray-300 w-48 h-12">
                {renderSignature(data.signature)}
              </div>
            </div>
            <div className="border border-gray-200 w-24 h-24 flex items-center justify-center">
              {renderCompanyStamp(data.company.stamp)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-gray-500 text-sm pt-6 border-t border-gray-200">
        <p>Thank you for your business</p>
      </div>
    </div>
  );
};

export default InvoiceElegantTemplate;
