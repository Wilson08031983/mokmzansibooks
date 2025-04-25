
import { formatDate } from "@/utils/formatters";
import { QuoteClient, QuoteCompany } from "@/types/quote";

interface QuoteInfoProps {
  company: QuoteCompany;
  client: QuoteClient;
  issueDate: string;
  quoteNumber: string;
  expiryDate: string;
}

const QuoteInfo = ({ company, client, issueDate, quoteNumber, expiryDate }: QuoteInfoProps) => {
  return (
    <div className="relative z-10 mt-8 grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-indigo-600">FROM</h3>
          <h4 className="font-semibold text-lg">{company.name}</h4>
          <p className="text-gray-600 whitespace-pre-line">{company.address}</p>
          <p className="text-gray-600">{company.email}</p>
          <p className="text-gray-600">{company.phone}</p>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-bold text-indigo-600">TO</h3>
          <h4 className="font-semibold text-lg">{client.name}</h4>
          <p className="text-gray-600 whitespace-pre-line">{client.address}</p>
          <p className="text-gray-600">{client.email}</p>
          <p className="text-gray-600">{client.phone}</p>
        </div>
      </div>
      
      <div className="flex flex-col justify-end">
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="font-medium">Quotation Number:</span>
            <span>{quoteNumber}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="font-medium">Date Issued:</span>
            <span>{formatDate(issueDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Valid Until:</span>
            <span>{formatDate(expiryDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteInfo;
