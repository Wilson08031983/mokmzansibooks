
import { TemplateProps } from "@/types/invoice";
import { formatDate, formatCurrency } from "@/utils/formatters";
import Logo from "@/components/Logo";

const Template2 = ({ data, preview = false }: TemplateProps) => {
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
      phone: "011 987 6543",
      logo: "/lovable-uploads/44062e3c-e3b2-47ea-9869-37a2dc71b5d8.png",
      stamp: "/lovable-uploads/21bb22cc-35f7-4bdc-b74c-281c0412605d.png"
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
    terms: "Payment due within 14 days of invoice date.",
    signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
  };

  const displayData = preview ? previewData : data;
  
  return (
    <div className="w-[210mm] h-[297mm] bg-white p-8 shadow-lg mx-auto font-sans" style={{ minHeight: '297mm' }}>
      {/* Header with color bar */}
      <div className="border-t-8 border-purple-600 pt-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-purple-700">INVOICE</h1>
            <p className="text-gray-600">#{displayData.invoiceNumber}</p>
          </div>
          <div>
            {displayData.company.logo ? (
              <img src={displayData.company.logo} alt="Company Logo" className="h-16" />
            ) : (
              <Logo className="h-16" />
            )}
          </div>
        </div>
      </div>

      {/* Bill To / Company Info */}
      <div className="grid grid-cols-2 gap-6 mt-10">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-bold text-purple-700 text-lg border-b border-purple-200 pb-2 mb-2">Bill To</h3>
          <h4 className="font-semibold">{displayData.client.name}</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{displayData.client.address}</p>
          <p className="text-sm text-gray-600">{displayData.client.email}</p>
          <p className="text-sm text-gray-600">{displayData.client.phone}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-700 text-lg border-b border-gray-200 pb-2 mb-2">From</h3>
          <h4 className="font-semibold">{displayData.company.name}</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{displayData.company.address}</p>
          <p className="text-sm text-gray-600">{displayData.company.email}</p>
          <p className="text-sm text-gray-600">{displayData.company.phone}</p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-gray-100 p-4 rounded-lg mt-6 flex justify-between items-center">
        <div>
          <span className="font-semibold">Invoice Date:</span> {formatDate(displayData.issueDate)}
        </div>
        <div>
          <span className="font-semibold">Payment Due:</span> {formatDate(displayData.dueDate)}
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mt-8">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="py-3 px-4 text-left rounded-tl-lg">Description</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">Rate</th>
              <th className="py-3 px-4 text-right rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {displayData.items.map((item, i) => (
              <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200`}>
                <td className="py-3 px-4">{item.description}</td>
                <td className="py-3 px-4 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.rate)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mt-4">
        <div className="w-64 space-y-1">
          <div className="flex justify-between py-1">
            <span className="font-medium">Subtotal:</span>
            <span>{formatCurrency(displayData.subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-medium">VAT (15%):</span>
            <span>{formatCurrency(displayData.tax)}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-purple-700">
            <span>Total:</span>
            <span>{formatCurrency(displayData.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-purple-700 mb-2">Notes</h3>
          <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded">{displayData.notes}</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-700 mb-2">Terms & Conditions</h3>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{displayData.terms}</p>
        </div>
      </div>

      {/* Signature & Stamp */}
      <div className="mt-12 flex justify-between items-end">
        <div className="w-1/3">
          <div className="border-t-2 border-gray-400 pt-1">
            <p className="text-sm font-medium">Authorized Signature</p>
            {displayData.signature && <img src={displayData.signature} alt="Signature" className="h-10 object-contain" />}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Initials: _________</p>
          <div className="border-2 border-dashed border-gray-400 rounded p-2 w-24 h-24 flex items-center justify-center">
            {displayData.company.stamp ? (
              <img src={displayData.company.stamp} alt="Company Stamp" className="max-h-20 max-w-20" />
            ) : (
              <span className="text-gray-400 text-xs text-center">Company Stamp</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-purple-600 flex justify-center">
        <p className="text-xs text-gray-500">Thank you for your business!</p>
      </div>
    </div>
  );
};

export default Template2;
