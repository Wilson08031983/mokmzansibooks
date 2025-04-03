
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { InvoiceData } from "@/types/invoice";

// Import template previews
import Template1 from "@/components/invoices/templates/Template1";
import Template2 from "@/components/invoices/templates/Template2";
import Template3 from "@/components/invoices/templates/Template3";
import Template4 from "@/components/invoices/templates/Template4";
import Template5 from "@/components/invoices/templates/Template5";

const SelectTemplate = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);

  // Sample data for template previews
  const previewData: InvoiceData = {
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

  const handleContinue = () => {
    navigate("/invoices/new", { state: { templateId: selectedTemplate } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" asChild>
            <Link to="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
            </Link>
          </Button>
          <h1 className="text-2xl font-bold ml-4">Select Invoice Template</h1>
        </div>
      </div>

      <p className="text-muted-foreground">
        Choose from one of our professional invoice templates below
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((id) => (
          <Card 
            key={id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedTemplate(id)}
          >
            <CardContent className="p-4">
              <div className="aspect-[1/1.414] bg-white border rounded-md overflow-hidden flex items-center justify-center">
                <div className="transform scale-[0.3] origin-center w-full h-full">
                  {id === 1 && <Template1 data={previewData} preview />}
                  {id === 2 && <Template2 data={previewData} preview />}
                  {id === 3 && <Template3 data={previewData} preview />}
                  {id === 4 && <Template4 data={previewData} preview />}
                  {id === 5 && <Template5 data={previewData} preview />}
                </div>
              </div>
              <p className="mt-2 text-center font-medium">Template {id}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link to="/invoices">Cancel</Link>
        </Button>
        <Button onClick={handleContinue}>Continue with Template {selectedTemplate}</Button>
      </div>
    </div>
  );
};

export default SelectTemplate;
