
import { TemplateProps } from "@/types/quote";
import { formatDate, formatCurrency } from "@/utils/formatters";
import Logo from "@/components/Logo";

const QuoteTemplate4 = ({ data, preview = false }: TemplateProps) => {
  // Sample data for preview mode
  const previewData = {
    quoteNumber: "QT-2025-0001",
    issueDate: "2025-04-03",
    expiryDate: "2025-05-03",
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
    notes: "This quotation is valid for 30 days.",
    terms: "50% deposit required to commence work.",
    signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
  };

  const displayData = preview ? previewData : data;
  
  return (
    <div className="w-[210mm] h-[297mm] bg-white shadow-lg mx-auto font-sans" style={{ minHeight: '297mm' }}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-500 text-white p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">QUOTATION</h1>
            <p className="mt-1 opacity-90">#{displayData.quoteNumber}</p>
          </div>
          <div className="bg-white p-2 rounded">
            {displayData.company.logo ? (
              <img src={displayData.company.logo} alt="Company Logo" className="h-16" />
            ) : (
              <Logo className="h-16" />
            )}
          </div>
        </div>
      </div>

      {/* Quote Details */}
      <div className="p-8 bg-cyan-50">
        <div className="flex justify-between">
          <div>
            <h3 className="text-cyan-700 font-semibold text-sm uppercase">Date</h3>
            <p className="font-medium">{formatDate(displayData.issueDate)}</p>
          </div>
          <div>
            <h3 className="text-cyan-700 font-semibold text-sm uppercase">Valid Until</h3>
            <p className="font-medium">{formatDate(displayData.expiryDate)}</p>
          </div>
          <div>
            <h3 className="text-cyan-700 font-semibold text-sm uppercase">Total</h3>
            <p className="font-bold text-xl">{formatCurrency(displayData.total)}</p>
          </div>
        </div>
      </div>

      {/* Client and Company Info */}
      <div className="grid grid-cols-2 gap-8 p-8">
        <div className="space-y-3">
          <h3 className="text-cyan-700 font-semibold text-sm uppercase">From</h3>
          <h4 className="font-bold text-lg">{displayData.company.name}</h4>
          <p className="text-gray-600 whitespace-pre-line">{displayData.company.address}</p>
          <p className="text-gray-600">{displayData.company.email}</p>
          <p className="text-gray-600">{displayData.company.phone}</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-cyan-700 font-semibold text-sm uppercase">For</h3>
          <h4 className="font-bold text-lg">{displayData.client.name}</h4>
          <p className="text-gray-600 whitespace-pre-line">{displayData.client.address}</p>
          <p className="text-gray-600">{displayData.client.email}</p>
          <p className="text-gray-600">{displayData.client.phone}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-8 pb-8">
        <table className="w-full rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-cyan-600 text-white">
              <th className="py-3 px-4 text-left">Item Description</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">Rate</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {displayData.items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-cyan-50"}>
                <td className="py-3 px-4 border-b border-cyan-100">{item.description}</td>
                <td className="py-3 px-4 text-center border-b border-cyan-100">{item.quantity}</td>
                <td className="py-3 px-4 text-right border-b border-cyan-100">{formatCurrency(item.rate)}</td>
                <td className="py-3 px-4 text-right border-b border-cyan-100">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 border border-cyan-200 rounded-lg overflow-hidden">
            <div className="bg-cyan-50 px-4 py-2 flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(displayData.subtotal)}</span>
            </div>
            <div className="bg-white px-4 py-2 flex justify-between">
              <span>VAT (15%)</span>
              <span>{formatCurrency(displayData.tax)}</span>
            </div>
            <div className="bg-cyan-600 text-white px-4 py-2 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(displayData.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="px-8 grid grid-cols-2 gap-8">
        <div className="border-t border-cyan-200 pt-4">
          <h3 className="text-cyan-700 font-semibold text-sm uppercase mb-2">Notes</h3>
          <p className="text-gray-600">{displayData.notes}</p>
        </div>
        <div className="border-t border-cyan-200 pt-4">
          <h3 className="text-cyan-700 font-semibold text-sm uppercase mb-2">Terms & Conditions</h3>
          <p className="text-gray-600">{displayData.terms}</p>
        </div>
      </div>

      {/* Signature & Stamp */}
      <div className="px-8 pt-8 pb-12 flex justify-between items-end">
        <div>
          <h3 className="text-cyan-700 font-semibold text-sm uppercase mb-4">Authorized Signature</h3>
          <div className="border-b-2 border-cyan-600 w-48 h-12 mb-1">
            {displayData.signature && <img src={displayData.signature} alt="Signature" className="h-full object-contain" />}
          </div>
          <p className="text-sm text-gray-600">For {displayData.company.name}</p>
        </div>
        <div className="flex items-end">
          <div className="mr-6 text-right">
            <p className="text-sm mb-1">Initials: _________</p>
          </div>
          <div className="border-2 border-dashed border-cyan-300 rounded-lg p-2 w-24 h-24 flex items-center justify-center">
            {displayData.company.stamp ? (
              <img src={displayData.company.stamp} alt="Company Stamp" className="max-h-20 max-w-20" />
            ) : (
              <span className="text-gray-400 text-xs text-center">Company Stamp</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteTemplate4;
