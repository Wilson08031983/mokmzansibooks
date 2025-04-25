
import { BankAccount } from "@/types/quote";

interface BankDetailsProps {
  bankAccount?: BankAccount;
}

const BankDetails = ({ bankAccount }: BankDetailsProps) => {
  if (!bankAccount) return null;
  
  return (
    <div className="relative z-10 mt-6 bg-white border-l-4 border-indigo-600 p-3 shadow-sm">
      <div className="flex items-center mb-2">
        <h3 className="font-bold text-indigo-600">Banking Details</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p><span className="font-medium">Bank Name:</span> {bankAccount.bankName}</p>
          <p><span className="font-medium">Account Name:</span> {bankAccount.accountName}</p>
        </div>
        <div>
          <p><span className="font-medium">Account Number:</span> {bankAccount.accountNumber}</p>
          <p><span className="font-medium">Branch Code:</span> {bankAccount.branchCode}</p>
          {bankAccount.swiftCode && (
            <p><span className="font-medium">SWIFT Code:</span> {bankAccount.swiftCode}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankDetails;
