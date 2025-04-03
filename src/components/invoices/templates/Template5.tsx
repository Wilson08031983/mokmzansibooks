
import { TemplateProps } from "@/types/invoice";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { Logo } from "@/components/Logo";

const Template5 = ({ data, preview = false }: TemplateProps) => {
  // Sample data for preview mode
  const previewData = {
    invoiceNumber: "INV-2025-0001",
    issueDate: "2025-04-03",
    dueDate: "2025-04-17",
    client: {
      name: "Pretoria Engineering",
      address: "123 Main St, Pretoria, 0001",
      email: "info@pretoriaeng.co.za",
      phone: "012 345 6789"
    },
    company: {
      name: "MOKMzansi Holdings",
      address: "456 Business Ave, Johannesburg, 2000",
      email: "contact@mokmzansi.co.za",
      phone: "011 987 6543"
    },
    items: [
      {
        description: "Consultation Services",
        quantity: 10,
        rate: 1500,
        amount: 15000
      },
      {
        description: "Equipment Rental",
        quantity: 5,
        rate: 2000,
        amount: 10000
      }
    ],
    subtotal: 25000,
    tax: 3750,
    total: 28750,
    notes: "Thank you for your business!",
    terms: "Payment due within 14 days of invoice date."
  };

  const displayData = preview ? previewData : data;
  
  return (
    <div className="w-[210mm] h-[297mm] bg-white p-8 shadow-lg mx-auto font-sans">
      {/* Left sidebar */}
      <div className="flex h-full">
        <div className="w-1/3 bg-gray-800 text-white p-6 rounded-l-lg">
          <div className="mb-8">
            {displayData.company.logo ? (
              <img src={displayData.company.logo} alt="Company Logo" className="h-16 mb-6" />
            ) : (
              <Logo className="h-16 mb-6 text-white" />
            )}
            <h3 className="font-bold text-lg mb-1">{displayData.company.name}</h3>
            <p className="text-sm text-gray-300 whitespace-pre-line">{displayData.company.address}</p>
            <p className="text-sm text-gray-300">{displayData.company.email}</p>
            <p className="text-sm text-gray-300">{displayData.company.phone}</p>
          </div>
          
          <div className="mb-8 pt-6 border-t border-gray-600">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Bill To</h4>
            <h3 className="font-bold text-lg mb-1">{displayData.client.name}</h3>
            <p className="text-sm text-gray-300 whitespace-pre-line">{displayData.client.address}</p>
            <p className="text-sm text-gray-300">{displayData.client.email}</p>
            <p className="text-sm text-gray-300">{displayData.client.phone}</p>
          </div>
          
          <div className="mb-8 pt-6 border-t border-gray-600">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Invoice Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Number:</span>
                <span>{displayData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span>{formatDate(displayData.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Due Date:</span>
                <span>{formatDate(displayData.dueDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-gray-600">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span>{formatCurrency(displayData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VAT (15%):</span>
                <span>{formatCurrency(displayData.tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4">
                <span>Total:</span>
                <span>{formatCurrency(displayData.total)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="w-2/3 p-6 rounded-r-lg border-r border-t border-b border-gray-200">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">INVOICE</h1>
            <p className="text-sm text-gray-500 border-b pb-4 border-gray-200">{displayData.invoiceNumber}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Invoice Items</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b-2 border-gray-200">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Rate</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {displayData.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.rate)}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{displayData.notes}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-600">{displayData.terms}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-end pt-6 mt-auto">
            <div>
              <h3 className="font-medium text-gray-700 mb-4">Authorized Signature</h3>
              <div className="border-b border-gray-400 w-48 h-10 mb-1">
                {displayData.signature && <img src={displayData.signature} alt="Signature" className="h-full object-contain" />}
              </div>
              <p className="text-xs text-gray-500">Signature</p>
            </div>
            <div className="flex items-end">
              <p className="text-sm mr-4">Initials: _________</p>
              <div className="border border-dashed border-gray-400 w-20 h-20 flex items-center justify-center">
                {displayData.company.stamp ? (
                  <img src={displayData.company.stamp} alt="Company Stamp" className="max-h-16 max-w-16" />
                ) : (
                  <span className="text-gray-400 text-xs text-center">Company Stamp</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template5;
