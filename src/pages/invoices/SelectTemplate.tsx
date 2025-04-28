
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, File, PlusCircle } from "lucide-react";
import { InvoiceData } from "@/types/invoice";
import { QuoteData } from "@/types/quote";

const SelectTemplate = () => {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const sampleInvoiceData: InvoiceData = {
    invoiceNumber: "INV-2025-001",
    issueDate: "2025-04-01",
    dueDate: "2025-04-30",
    shortDescription: "Consulting Services",
    client: {
      name: "Acme Corp",
      address: "123 Main St, Anytown, 12345",
      email: "info@acmecorp.com",
      phone: "555-123-4567"
    },
    company: {
      name: "Your Business Name",
      address: "456 Elm St, Anytown, 67890",
      email: "contact@yourbusiness.com",
      phone: "555-987-6543",
      logo: "/path/to/logo.png",
      stamp: "/path/to/stamp.png",
    },
    items: [
      {
        itemNo: "001",
        description: "Website Design & Development",
        quantity: 1,
        unitPrice: 15000,
        discount: 0,
        amount: 15000
      },
      {
        itemNo: "002",
        description: "Logo Design Services",
        quantity: 1,
        unitPrice: 5000,
        discount: 0,
        amount: 5000
      }
    ],
    subtotal: 20000,
    vatRate: 15,
    tax: 3000,
    total: 23000,
    notes: "Thank you for your business!",
    terms: "Payment due within 30 days.",
    bankingDetails: "Bank: Example Bank\nAccount Number: 123456789\nBranch Code: 000000",
    signature: "/path/to/signature.png",
  };

  const sampleQuoteData: QuoteData = {
    quoteNumber: "Q-2025-001",
    issueDate: "2025-04-01",
    expiryDate: "2025-05-01",
    client: {
      name: "TechCorp Solutions",
      address: "123 Tech Ave, Cape Town, 8001",
      email: "info@techcorp.co.za",
      phone: "+27 21 555 1234"
    },
    company: {
      name: "Your Business Name",
      address: "456 Business Park, Johannesburg, 2000",
      email: "contact@yourbusiness.co.za",
      phone: "+27 11 123 4567",
      logo: "/path/to/logo.png",
      stamp: "/path/to/stamp.png",
    },
    items: [
      {
        itemNo: "Q001",
        description: "Web Application Development",
        quantity: 1,
        unitPrice: 25000,
        markupPercentage: 20,
        discount: 5,
        amount: 28500
      },
      {
        itemNo: "Q002",
        description: "Hosting & Maintenance (Annual)",
        quantity: 1,
        unitPrice: 12000,
        markupPercentage: 10, 
        discount: 0,
        amount: 13200
      }
    ],
    subtotal: 41700,
    vatRate: 15,
    tax: 6255,
    total: 47955,
    notes: "Thank you for your business. This quote is valid for 30 days.",
    terms: "50% deposit required before work commences.",
    bankingDetails: "Bank: First National Bank\nAccount Number: 62123456789\nBranch Code: 250655",
    bankAccount: {
      bankName: "First National Bank",
      accountName: "Your Business Name",
      accountNumber: "62123456789",
      branchCode: "250655"
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Select Invoice Template</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard/invoices/new-invoice")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Invoice
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Simple Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">A clean and professional template.</p>
            <Button onClick={() => navigate('/dashboard/invoices/manager', { state: { template: 'simple', invoiceData: sampleInvoiceData } })}>
              <FileText className="mr-2 h-4 w-4" />
              Use Template
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Modern Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">A modern and visually appealing template.</p>
            <Button onClick={() => navigate('/dashboard/invoices/manager', { state: { template: 'modern', invoiceData: sampleInvoiceData } })}>
              <File className="mr-2 h-4 w-4" />
              Use Template
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Classic Quote</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">A classic and professional quote template.</p>
            <Button onClick={() => navigate('/dashboard/invoices/manager', { state: { template: 'classic-quote', quoteData: sampleQuoteData } })}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Use Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelectTemplate;
