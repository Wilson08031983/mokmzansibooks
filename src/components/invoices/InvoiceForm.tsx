
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { Save } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import TemplateSelector from "./TemplateSelector";
import InvoiceDetails from "./InvoiceDetails";
import ClientSelector from "./ClientSelector";
import ClientDisplay from "./ClientDisplay";
import CompanyDisplay from "./CompanyDisplay";
import InvoiceItems from "./InvoiceItems";
import QuoteSelector from "./QuoteSelector";
import InvoiceFooter from "./InvoiceFooter";
import InvoiceTotals from "./InvoiceTotals";

// Mock client data
const mockClients = [
  { id: "client1", name: "ABC Construction Ltd", address: "123 Builder St, Cape Town, 8001", email: "info@abcconstruction.co.za", phone: "021 234 5678" },
  { id: "client2", name: "Cape Town Retailers", address: "54 Shop Ave, Cape Town, 8002", email: "orders@ctretailers.co.za", phone: "021 876 5432" },
  { id: "client3", name: "Durban Services Co", address: "78 Beach Rd, Durban, 4001", email: "contact@durbanservices.co.za", phone: "031 345 6789" },
];

// Mock saved quotes
const mockSavedQuotes = [
  { id: "quote1", quoteNumber: "Q-2025-001", clientName: "ABC Construction Ltd", dateCreated: "2025-01-15", total: 4500 },
  { id: "quote2", quoteNumber: "Q-2025-002", clientName: "Cape Town Retailers", dateCreated: "2025-01-20", total: 2750 },
];

// Company data (would come from user's profile/settings)
const companyData = {
  name: "MOKMzansi Holdings",
  address: "456 Business Ave, Johannesburg, 2000",
  email: "contact@mokmzansi.co.za",
  phone: "011 987 6543"
};

const InvoiceForm = () => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [sourceType, setSourceType] = useState<'new' | 'quote'>('new');
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
    issueDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
    shortDescription: "",
    client: {
      name: "",
      address: "",
      email: "",
      phone: ""
    },
    company: companyData,
    items: [createNewItem()],
    subtotal: 0,
    vatRate: 0,
    tax: 0,
    total: 0,
    notes: "",
    terms: "",
    bankingDetails: "",
    currency: "ZAR"
  });

  // Generate a unique invoice number
  function generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${random}`;
  }

  // Create a new empty item
  function createNewItem(): InvoiceItem {
    return {
      itemNo: invoiceData?.items?.length ? invoiceData.items.length + 1 : 1,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      amount: 0
    };
  }

  // Handle source type change
  useEffect(() => {
    if (sourceType === 'new') {
      // Reset form to defaults for new invoice
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.length > 0 ? invoiceData.items : [createNewItem()],
        client: {
          name: "",
          address: "",
          email: "",
          phone: ""
        },
        shortDescription: "",
        notes: "",
        terms: "",
        bankingDetails: ""
      });
      setSelectedQuote(null);
    }
  }, [sourceType]);

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    const selectedClient = mockClients.find(c => c.id === clientId);
    if (selectedClient) {
      setInvoiceData({
        ...invoiceData,
        client: {
          name: selectedClient.name,
          address: selectedClient.address,
          email: selectedClient.email,
          phone: selectedClient.phone
        }
      });
    }
  };

  // Handle quote selection
  const handleQuoteSelect = (quoteId: string) => {
    setSelectedQuote(quoteId);
    // In a real app, you would fetch the quote data and populate the invoice form
    console.log(`Selected quote: ${quoteId}`);
    // This is just a mock implementation
    const mockQuoteData = {
      client: mockClients[0],
      shortDescription: "Services for January 2025",
      items: [
        { itemNo: 1, description: "Web Development", quantity: 40, unitPrice: 75, discount: 10, amount: 2700 },
        { itemNo: 2, description: "UI/UX Design", quantity: 20, unitPrice: 90, discount: 0, amount: 1800 }
      ],
      subtotal: 4500,
      vatRate: 15,
      tax: 675,
      total: 5175,
      notes: "Please pay within 14 days.",
      terms: "Payment due within 14 days of invoice receipt.",
      bankingDetails: "Bank: First National Bank\nAccount: 1234 5678 9012\nBranch: 123456"
    };
    
    setInvoiceData({
      ...invoiceData,
      client: {
        name: mockQuoteData.client.name,
        address: mockQuoteData.client.address,
        email: mockQuoteData.client.email,
        phone: mockQuoteData.client.phone
      },
      shortDescription: mockQuoteData.shortDescription,
      items: mockQuoteData.items,
      subtotal: mockQuoteData.subtotal,
      vatRate: mockQuoteData.vatRate,
      tax: mockQuoteData.tax,
      total: mockQuoteData.total,
      notes: mockQuoteData.notes,
      terms: mockQuoteData.terms,
      bankingDetails: mockQuoteData.bankingDetails
    });
  };

  // Handle item updates
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Calculate item amount
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const item = updatedItems[index];
      const baseAmount = item.quantity * item.unitPrice;
      const discountAmount = baseAmount * (item.discount / 100);
      updatedItems[index].amount = baseAmount - discountAmount;
    }
    
    setInvoiceData({
      ...invoiceData,
      items: updatedItems
    });
  };

  // Add a new item
  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, createNewItem()]
    });
  };

  // Remove an item
  const removeItem = (index: number) => {
    if (invoiceData.items.length <= 1) return;
    const updatedItems = [...invoiceData.items];
    updatedItems.splice(index, 1);
    // Update item numbers
    updatedItems.forEach((item, idx) => {
      item.itemNo = idx + 1;
    });
    setInvoiceData({
      ...invoiceData,
      items: updatedItems
    });
  };

  // Calculate totals
  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (invoiceData.vatRate / 100);
    const total = subtotal + tax;
    
    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  }, [invoiceData.items, invoiceData.vatRate]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Invoice data submitted:", invoiceData);
    setShowTemplateSelector(true);
  };

  const handleVatRateChange = (rate: string) => {
    setInvoiceData({...invoiceData, vatRate: parseFloat(rate) || 0});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as 'new' | 'quote')} className="mb-6">
          <TabsList>
            <TabsTrigger value="new">Start New Invoice</TabsTrigger>
            <TabsTrigger value="quote">Create from Quote</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quote">
            <QuoteSelector 
              quotes={mockSavedQuotes} 
              selectedQuote={selectedQuote} 
              onQuoteSelect={handleQuoteSelect} 
            />
          </TabsContent>
        </Tabs>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <InvoiceDetails
            invoiceNumber={invoiceData.invoiceNumber}
            issueDate={invoiceData.issueDate}
            dueDate={invoiceData.dueDate}
            shortDescription={invoiceData.shortDescription}
            onIssueDateChange={(date) => setInvoiceData({...invoiceData, issueDate: date})}
            onDueDateChange={(date) => setInvoiceData({...invoiceData, dueDate: date})}
            onShortDescriptionChange={(desc) => setInvoiceData({...invoiceData, shortDescription: desc})}
          />

          {/* Client Selection (only if not coming from a quote) */}
          {sourceType === 'new' && (
            <ClientSelector 
              clients={mockClients}
              onClientSelect={handleClientSelect}
            />
          )}

          {/* Display Client Info */}
          <ClientDisplay client={invoiceData.client} />
          
          {/* Company Information */}
          <CompanyDisplay company={invoiceData.company} />
          
          {/* Items Table */}
          <InvoiceItems
            items={invoiceData.items}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
          />
          
          {/* Totals */}
          <div className="flex flex-col items-end">
            <div className="w-full sm:w-2/3 md:w-1/3">
              <InvoiceTotals
                subtotal={invoiceData.subtotal}
                tax={invoiceData.tax}
                total={invoiceData.total}
                vatRate={invoiceData.vatRate.toString()}
                onVatRateChange={handleVatRateChange}
              />
            </div>
          </div>
          
          {/* Footer Fields */}
          <InvoiceFooter
            notes={invoiceData.notes}
            terms={invoiceData.terms}
            bankingDetails={invoiceData.bankingDetails}
            onNotesChange={(notes) => setInvoiceData({...invoiceData, notes})}
            onTermsChange={(terms) => setInvoiceData({...invoiceData, terms})}
            onBankingDetailsChange={(bankingDetails) => setInvoiceData({...invoiceData, bankingDetails})}
          />
          
          {/* Save Button */}
          <Button type="submit" className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Invoice
          </Button>
        </form>
        
        {/* Template Selector Dialog */}
        {showTemplateSelector && (
          <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Choose Invoice Template</DialogTitle>
                <DialogDescription>
                  Select a template for your invoice
                </DialogDescription>
              </DialogHeader>
              <TemplateSelector data={invoiceData} type="invoice" />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceForm;
