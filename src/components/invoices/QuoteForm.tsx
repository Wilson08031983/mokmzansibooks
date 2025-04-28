
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
import { QuoteData, QuoteItem } from "@/types/quote";
import { Plus, Trash, Save } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import TemplateSelector from "./TemplateSelector";

// Mock client data
const mockClients = [
  { id: "client1", name: "ABC Construction Ltd", address: "123 Builder St, Cape Town, 8001", email: "info@abcconstruction.co.za", phone: "021 234 5678" },
  { id: "client2", name: "Cape Town Retailers", address: "54 Shop Ave, Cape Town, 8002", email: "orders@ctretailers.co.za", phone: "021 876 5432" },
  { id: "client3", name: "Durban Services Co", address: "78 Beach Rd, Durban, 4001", email: "contact@durbanservices.co.za", phone: "031 345 6789" },
];

// Company data (would come from user's profile/settings)
const companyData = {
  name: "MOKMzansi Holdings",
  address: "456 Business Ave, Johannesburg, 2000",
  email: "contact@mokmzansi.co.za",
  phone: "011 987 6543"
};

const QuoteForm = () => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData>({
    quoteNumber: generateQuoteNumber(),
    issueDate: format(new Date(), "yyyy-MM-dd"),
    expiryDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
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

  // Generate a unique quote number
  function generateQuoteNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `Q-${year}-${random}`;
  }

  // Create a new empty item
  function createNewItem(): QuoteItem {
    return {
      itemNo: quoteData?.items?.length ? quoteData.items.length + 1 : 1,
      description: "",
      quantity: 1,
      unitPrice: 0,
      markupPercentage: 0,
      discount: 0,
      amount: 0
    };
  }

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    const selectedClient = mockClients.find(c => c.id === clientId);
    if (selectedClient) {
      setQuoteData({
        ...quoteData,
        client: {
          name: selectedClient.name,
          address: selectedClient.address,
          email: selectedClient.email,
          phone: selectedClient.phone
        }
      });
    }
  };

  // Handle item updates
  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...quoteData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Calculate item amount
    if (field === 'quantity' || field === 'unitPrice' || field === 'markupPercentage' || field === 'discount') {
      const item = updatedItems[index];
      const markupAmount = item.unitPrice * (item.markupPercentage || 0) / 100;
      const markedUpPrice = item.unitPrice + markupAmount;
      const discountAmount = markedUpPrice * (item.discount / 100);
      const finalPrice = markedUpPrice - discountAmount;
      updatedItems[index].amount = finalPrice * item.quantity;
    }
    
    setQuoteData({
      ...quoteData,
      items: updatedItems
    });
  };

  // Add a new item
  const addItem = () => {
    setQuoteData({
      ...quoteData,
      items: [...quoteData.items, createNewItem()]
    });
  };

  // Remove an item
  const removeItem = (index: number) => {
    if (quoteData.items.length <= 1) return;
    const updatedItems = [...quoteData.items];
    updatedItems.splice(index, 1);
    // Update item numbers
    updatedItems.forEach((item, idx) => {
      item.itemNo = idx + 1;
    });
    setQuoteData({
      ...quoteData,
      items: updatedItems
    });
  };

  // Calculate totals
  useEffect(() => {
    const subtotal = quoteData.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (quoteData.vatRate / 100);
    const total = subtotal + tax;
    
    setQuoteData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  }, [quoteData.items, quoteData.vatRate]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Quote data submitted:", quoteData);
    setShowTemplateSelector(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quote Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="quoteNumber">Quote Number</Label>
              <Input
                id="quoteNumber"
                value={quoteData.quoteNumber}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="issueDate">Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={quoteData.issueDate}
                onChange={(e) => setQuoteData({...quoteData, issueDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={quoteData.expiryDate}
                onChange={(e) => setQuoteData({...quoteData, expiryDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              placeholder="Brief description of the quote"
              value={quoteData.shortDescription || ""}
              onChange={(e) => setQuoteData({...quoteData, shortDescription: e.target.value})}
            />
          </div>

          {/* Client Selection */}
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

            {quoteData.client.name && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p>{quoteData.client.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{quoteData.client.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="whitespace-pre-line">{quoteData.client.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p>{quoteData.client.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Company Information */}
          <div className="space-y-2">
            <Label>My Company Details</Label>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{quoteData.company.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{quoteData.company.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="whitespace-pre-line">{quoteData.company.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{quoteData.company.phone}</p>
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
                    <TableHead className="w-[100px]">Mark Up %</TableHead>
                    <TableHead className="w-[100px]">Discount %</TableHead>
                    <TableHead className="w-[120px]">Total (R)</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteData.items.map((item, index) => (
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
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.markupPercentage || 0}
                          onChange={(e) => updateItem(index, 'markupPercentage', parseFloat(e.target.value) || 0)}
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
                          disabled={quoteData.items.length <= 1}
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
              <p className="font-medium">{formatCurrency(quoteData.subtotal, "ZAR")}</p>
              
              <div className="text-right flex items-center justify-end">
                <Label htmlFor="vatRate" className="mr-2">VAT %:</Label>
                <Input
                  id="vatRate"
                  className="w-16"
                  type="number"
                  min="0"
                  max="100"
                  value={quoteData.vatRate}
                  onChange={(e) => setQuoteData({...quoteData, vatRate: parseFloat(e.target.value) || 0})}
                />
              </div>
              <p className="font-medium">{formatCurrency(quoteData.tax, "ZAR")}</p>
              
              <Label className="text-right font-bold">Total:</Label>
              <p className="font-bold">{formatCurrency(quoteData.total, "ZAR")}</p>
            </div>
          </div>
          
          {/* Footer Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="terms">Terms</Label>
              <Textarea
                id="terms"
                placeholder="Payment terms, deadlines, etc."
                rows={4}
                value={quoteData.terms || ""}
                onChange={(e) => setQuoteData({...quoteData, terms: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="bankingDetails">Banking Details</Label>
              <Textarea
                id="bankingDetails"
                placeholder="Bank name, account number, etc."
                rows={4}
                value={quoteData.bankingDetails || ""}
                onChange={(e) => setQuoteData({...quoteData, bankingDetails: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information or special comments"
                rows={4}
                value={quoteData.notes || ""}
                onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})}
              />
            </div>
          </div>
          
          {/* Save Button */}
          <Button type="submit" className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Quote
          </Button>
        </form>
        
        {/* Template Selector Dialog */}
        {showTemplateSelector && (
          <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Choose Quote Template</DialogTitle>
                <DialogDescription>
                  Select a template for your quote
                </DialogDescription>
              </DialogHeader>
              <TemplateSelector data={quoteData} type="quote" />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteForm;
