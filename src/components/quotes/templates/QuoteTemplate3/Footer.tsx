
import { renderSignature, renderCompanyStamp } from "@/utils/formatters";

interface FooterProps {
  notes?: string;
  terms?: string;
  signature?: string;
  companyStamp?: string;
}

const Footer = ({ notes, terms, signature, companyStamp }: FooterProps) => {
  return (
    <>
      <div className="relative z-10 mt-6 grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-indigo-600 border-b border-indigo-200 pb-1 mb-2">Notes</h3>
          <p className="text-gray-600 text-sm">{notes}</p>
        </div>
        <div>
          <h3 className="font-bold text-indigo-600 border-b border-indigo-200 pb-1 mb-2">Terms & Conditions</h3>
          <p className="text-gray-600 text-sm">{terms}</p>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-indigo-600 mb-4">Authorized Signature:</h3>
          <div className="border-b-2 border-gray-300 w-48 h-10 mb-1">
            {renderSignature(signature)}
          </div>
          <p className="text-xs text-gray-500">Signature</p>
        </div>
        <div className="flex justify-end items-end">
          <div className="flex flex-col items-end">
            <p className="text-sm mb-2">Initials: _________</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg w-24 h-24 flex items-center justify-center">
              {renderCompanyStamp(companyStamp)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
