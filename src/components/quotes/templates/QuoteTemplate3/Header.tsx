
import { renderCompanyLogo } from "@/utils/formatters";
import { QuoteCompany } from "@/types/quote";

interface HeaderProps {
  quoteNumber: string;
  company: QuoteCompany;
}

const Header = ({ quoteNumber, company }: HeaderProps) => {
  return (
    <div className="relative z-10 flex justify-between items-start">
      <div className="space-y-1">
        <div className="inline-block bg-indigo-600 text-white font-bold text-2xl py-2 px-4">
          QUOTATION
        </div>
        <p className="text-sm ml-1 mt-2">#{quoteNumber}</p>
      </div>
      <div className="bg-white p-2 rounded shadow-sm">
        {renderCompanyLogo(company.logo)}
      </div>
    </div>
  );
};

export default Header;
