
import React from "react";
import { QuoteData } from "@/types/quote";
import { renderSignature, renderCompanyStamp } from "@/utils/formatters";

interface QuoteFooterProps {
  data: QuoteData;
}

const QuoteFooter = ({ data }: QuoteFooterProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-bold text-gray-700 mb-2">Notes</h3>
          <p className="text-sm text-gray-600">{data.notes}</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-700 mb-2">Terms & Conditions</h3>
          <p className="text-sm text-gray-600">{data.terms}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-end pt-6 mt-auto">
        <div>
          <h3 className="font-medium text-gray-700 mb-4">Authorized Signature</h3>
          <div className="border-b border-gray-400 w-48 h-10 mb-1">
            {renderSignature(data.signature)}
          </div>
          <p className="text-xs text-gray-500">Signature</p>
        </div>
        <div className="flex items-end">
          <p className="text-sm mr-4">Initials: _________</p>
          <div className="border border-dashed border-gray-400 w-20 h-20 flex items-center justify-center">
            {renderCompanyStamp(data.company.stamp)}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuoteFooter;
