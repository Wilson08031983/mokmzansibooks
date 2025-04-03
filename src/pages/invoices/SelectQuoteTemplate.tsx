
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";
import QuoteTemplate1 from "@/components/quotes/templates/QuoteTemplate1";
import QuoteTemplate2 from "@/components/quotes/templates/QuoteTemplate2";
import QuoteTemplate3 from "@/components/quotes/templates/QuoteTemplate3";
import QuoteTemplate4 from "@/components/quotes/templates/QuoteTemplate4";
import QuoteTemplate5 from "@/components/quotes/templates/QuoteTemplate5";
import { QuoteData } from "@/types/quote";
import { format } from "date-fns";

const SelectQuoteTemplate = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);

  const handleSelectTemplate = () => {
    navigate("/invoices/quotes/new", { state: { templateId: selectedTemplate } });
  };

  // Format dates in the specific format requested: 01 January 1900
  const formatCustomDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy");
  };

  // Sample data for template preview
  const previewData: QuoteData = {
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
        itemNo: "ITEM-001",
        description: "Consultation Services",
        quantity: 10,
        unitPrice: 1500,
        discount: 5,
        amount: 14250
      },
      {
        itemNo: "ITEM-002",
        description: "Equipment Rental",
        quantity: 5,
        unitPrice: 2000,
        discount: 0,
        amount: 10000
      }
    ],
    subtotal: 24250,
    vatRate: 0,
    tax: 0,
    total: 24250,
    notes: "This quotation is valid for 30 days.",
    terms: "50% deposit required to commence work.",
    signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
  };

  // Convert dates to the requested format for display
  const displayData = {
    ...previewData,
    issueDate: formatCustomDate(previewData.issueDate),
    expiryDate: formatCustomDate(previewData.expiryDate)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/invoices/quotes">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Select Quote Template</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((templateId) => (
          <Card
            key={templateId}
            className={`relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
              selectedTemplate === templateId ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedTemplate(templateId)}
          >
            {selectedTemplate === templateId && (
              <div className="absolute top-2 right-2 z-10 bg-primary text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            <CardContent className="p-4">
              <div className="text-center font-medium mb-2">
                Template {templateId}
              </div>
              <div className="bg-gray-50 rounded-md overflow-hidden">
                <div
                  className="transform scale-[0.15] origin-top-left"
                  style={{ height: "150px", width: "100%", overflow: "hidden" }}
                >
                  {templateId === 1 && <QuoteTemplate1 data={displayData} preview={true} />}
                  {templateId === 2 && <QuoteTemplate2 data={displayData} preview={true} />}
                  {templateId === 3 && <QuoteTemplate3 data={displayData} preview={true} />}
                  {templateId === 4 && <QuoteTemplate4 data={displayData} preview={true} />}
                  {templateId === 5 && <QuoteTemplate5 data={displayData} preview={true} />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSelectTemplate}>
          Continue with Template {selectedTemplate}
        </Button>
      </div>
    </div>
  );
};

export default SelectQuoteTemplate;
