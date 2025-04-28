
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { Plus, Trash, Save } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import TemplateSelector from "./TemplateSelector";

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
      rate: 0,
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
        { itemNo: 1, description: "Web Development", quantity: 40, rate: 75, discount: 10, amount: 2700 },
        { itemNo: 2, description: "UI/UX Design", quantity: 20, rate: 90, discount: 0, amount: 1800 }
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
    if (field === 'quantity' || field === 'rate' || field === 'discount') {
      const item = updatedItems[index];
      const baseAmount = item.quantity * item.rate;
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
            <div className="p-4 bg-gray-50 rounded-md mb-6">
              <Label className="mb-2 block">Select a saved quote</Label>
              <Select value={selectedQuote || ""} onValueChange={handleQuoteSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a quote" />
                </SelectTrigger>
                <SelectContent>
                  {mockSavedQuotes.map(quote => (
                    <SelectItem key={quote.id} value={quote.id}>
                      {quote.quoteNumber} - {quote.clientName} ({formatCurrency(quote.total, "ZAR")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="issueDate">Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={invoiceData.issueDate}
                onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              placeholder="Brief description of the invoice"
              value={invoiceData.shortDescription || ""}
              onChange={(e) => setInvoiceData({...invoiceData, shortDescription: e.target.value})}
            />
          </div>

          {/* Client Selection (only if not coming from a quote) */}
          {sourceType === 'new' && (
            <div className="space-y-4">
              <Label>Client Information</Label>
              <Select onValueChange={handleClientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Display Client Info */}
          {invoiceData.client.name && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{invoiceData.client.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{invoiceData.client.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="whitespace-pre-line">{invoiceData.client.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{invoiceData.client.phone}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Company Information */}
          <div className="space-y-2">
            <Label>My Company Details</Label>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{invoiceData.company.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{invoiceData.company.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="whitespace-pre-line">{invoiceData.company.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{invoiceData.company.phone}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Items</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addItem}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Item No.</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Amount (R)</TableHead>
                    <TableHead className="w-[100px]">Discount %</TableHead>
                    <TableHead className="w-[120px]">Total (R)</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.itemNo}</TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(item.amount, "ZAR")}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={invoiceData.items.length <= 1}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Totals */}
          <div className="flex flex-col items-end space-y-2">
            <div className="grid grid-cols-2 gap-4 w-full sm:w-2/3 md:w-1/3">
              <Label className="text-right">Subtotal:</Label>
              <p className="font-medium">{formatCurrency(invoiceData.subtotal, "ZAR")}</p>
              
              <div className="text-right flex items-center justify-end">
                <Label htmlFor="vatRate" className="mr-2">VAT %:</Label>
                <Input
                  id="vatRate"
                  className="w-16"
                  type="number"
                  min="0"
                  max="100"
                  value={invoiceData.vatRate}
                  onChange={(e) => setInvoiceData({...invoiceData, vatRate: parseFloat(e.target.value) || 0})}
                />
              </div>
              <p className="font-medium">{formatCurrency(invoiceData.tax, "ZAR")}</p>
              
              <Label className="text-right font-bold">Total:</Label>
              <p className="font-bold">{formatCurrency(invoiceData.total, "ZAR")}</p>
            </div>
          </div>
          
          {/* Footer Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information or special comments"
                rows={4}
                value={invoiceData.notes || ""}
                onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms</Label>
              <Textarea
                id="terms"
                placeholder="Payment terms, deadlines, etc."
                rows={4}
                value={invoiceData.terms || ""}
                onChange={(e) => setInvoiceData({...invoiceData, terms: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="bankingDetails">Banking Details</Label>
              <Textarea
                id="bankingDetails"
                placeholder="Bank name, account number, etc."
                rows={4}
                value={invoiceData.bankingDetails || ""}
                onChange={(e) => setInvoiceData({...invoiceData, bankingDetails: e.target.value})}
              />
            </div>
          </div>
          
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
