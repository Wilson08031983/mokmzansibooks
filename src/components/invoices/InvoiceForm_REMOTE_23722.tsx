import React, { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/contexts/CompanyContext";
import { Client } from "@/types/client";

// Types
interface InvoiceItem {
  id: string;
  itemNo: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  creationDate: string;
  dueDate: string;
  shortDescription: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
    vatNumber?: string;
    regNumber?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes: string;
  terms: string;
  bankingDetails: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
}

interface Quote {
  id: string;
  quoteNumber: string;
  issueDate: string;
  client: {
    id: string;
    name: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  shortDescription: string;
  items: any[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  status: string;
}

interface InvoiceFormProps {
  onSaveSuccess?: () => void;
  onCancel?: () => void;
}

// Helper functions
const generateInvoiceNumber = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `INV-${year}-${month}-${random}`;
};

const formatDateToFriendly = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    return format(date, "dd MMMM yyyy");
  } catch (error) {
    return dateString;
  }
};

const createNewItem = (): InvoiceItem => {
  return {
    id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    itemNo: 1,
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    amount: 0
  };
};

const calculateItemAmount = (item: InvoiceItem): number => {
  const subTotal = item.quantity * item.unitPrice;
  const discountAmount = (subTotal * item.discount) / 100;
  return subTotal - discountAmount;
};

const calculateInvoiceTotals = (items: InvoiceItem[], vatRate: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = (subtotal * vatRate) / 100;
  const total = subtotal + vatAmount;
  
  return { subtotal, vatAmount, total };
};

// Load clients from localStorage
const loadClientsFromStorage = (): Client[] => {
  try {
    const clientData = localStorage.getItem('mokClients');
    if (clientData) {
      const parsed = JSON.parse(clientData);
      return [
        ...(parsed.companies || []),
        ...(parsed.individuals || []),
        ...(parsed.vendors || [])
      ];
    }
  } catch (error) {
    console.error("Error loading clients from localStorage:", error);
  }
  return [];
};

// Load quotes from localStorage
const loadQuotesFromStorage = (): Quote[] => {
  try {
    const quotesData = localStorage.getItem('savedQuotes');
    if (quotesData) {
      return JSON.parse(quotesData);
    }
  } catch (error) {
    console.error("Error loading quotes from localStorage:", error);
  }
  return [];
};

// Save invoice to localStorage
const saveInvoiceToStorage = (invoice: InvoiceData): { success: boolean, message?: string } => {
  try {
    // Get existing invoices
    const existingInvoicesStr = localStorage.getItem('savedInvoices');
    const existingInvoices = existingInvoicesStr ? JSON.parse(existingInvoicesStr) : [];
    
    // Check if we're updating an existing invoice
    let updatedInvoices;
    if (invoice.id) {
      updatedInvoices = existingInvoices.map((inv: InvoiceData) => 
        inv.id === invoice.id ? invoice : inv
      );
    } else {
      // Add ID if it's a new invoice
      invoice.id = `invoice-${Date.now()}`;
      updatedInvoices = [...existingInvoices, invoice];
    }
    
    localStorage.setItem('savedInvoices', JSON.stringify(updatedInvoices));
    return { success: true };
  } catch (error) {
    console.error("Error saving invoice:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error occurred while saving"
    };
  }
};

// Main component
const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSaveSuccess, onCancel }) => {
  const { toast } = useToast();
  const { companyDetails } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  
  // Initialize invoice data with defaults
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
    creationDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
    shortDescription: "",
    clientId: "",
    client: {
      id: "",
      name: "",
      address: "",
      email: "",
      phone: ""
    },
    company: {
      name: companyDetails?.name || "",
      address: companyDetails?.address || "",
      email: companyDetails?.contactEmail || "",
      phone: companyDetails?.contactPhone || "",
      vatNumber: companyDetails?.vatNumber || "",
      regNumber: companyDetails?.regNumber || ""
    },
    items: [createNewItem()],
    subtotal: 0,
    vatRate: 0, // Default VAT rate is 0%
    vatAmount: 0,
    total: 0,
    notes: "",
    terms: "",
    bankingDetails: "",
    status: "draft"
  });

  // Load company details into invoice when they change
  useEffect(() => {
    if (companyDetails) {
      setInvoiceData(prev => ({
        ...prev,
        company: {
          name: companyDetails.name || "",
          address: companyDetails.address || "",
          email: companyDetails.contactEmail || "",
          phone: companyDetails.contactPhone || "",
          vatNumber: companyDetails.vatNumber || "",
          regNumber: companyDetails.regNumber || ""
        }
      }));
    }
  }, [companyDetails]);

  // Load clients and quotes on mount
  useEffect(() => {
    // Load clients
    const loadedClients = loadClientsFromStorage();
    setClients(loadedClients);
    
    // Load quotes
    const loadedQuotes = loadQuotesFromStorage();
    setQuotes(loadedQuotes);
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      setClients(loadClientsFromStorage());
      setQuotes(loadQuotesFromStorage());
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      setInvoiceData(prev => ({
        ...prev,
        clientId,
        client: {
          id: selectedClient.id,
          name: selectedClient.name,
          address: selectedClient.address || "",
          email: selectedClient.email || "",
          phone: selectedClient.phone || ""
        }
      }));
    }
  };

  // Handle quote selection
  const handleQuoteSelect = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    
    const selectedQuote = quotes.find(q => q.id === quoteId);
    if (selectedQuote) {
      // Convert quote items to invoice items
      const items = selectedQuote.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        itemNo: index + 1,
        description: item.description || "",
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        discount: item.discount || 0,
        amount: item.amount || 0
      }));
      
      // Update invoice data with quote details
      setInvoiceData(prev => ({
        ...prev,
        shortDescription: selectedQuote.shortDescription || "",
        client: {
          id: selectedQuote.client.id || "",
          name: selectedQuote.client.name || "",
          address: selectedQuote.client.address || "",
          email: selectedQuote.client.email || "",
          phone: selectedQuote.client.phone || ""
        },
        clientId: selectedQuote.client.id || "",
        items,
        subtotal: selectedQuote.subtotal || 0,
        vatRate: selectedQuote.vatRate || 0,
        vatAmount: selectedQuote.vatAmount || 0,
        total: selectedQuote.total || 0,
        notes: selectedQuote.notes || prev.notes,
        terms: selectedQuote.terms || prev.terms
      }));
      
      toast({
        title: "Quote Loaded",
        description: `Quote ${selectedQuote.quoteNumber} has been loaded`
      });
    }
  };

  // Add a new item
  const addItem = () => {
    const newItem = createNewItem();
    // Set the new item's number to the next sequential number
    newItem.itemNo = invoiceData.items.length + 1;
    
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Remove an item
  const removeItem = (index: number) => {
    if (invoiceData.items.length <= 1) {
      toast({
        title: "Cannot remove all items",
        description: "An invoice must have at least one item",
        variant: "destructive"
      });
      return;
    }
    
    const updatedItems = invoiceData.items.filter((_, i) => i !== index);
    
    // Renumber the remaining items
    const renumberedItems = updatedItems.map((item, i) => ({
      ...item,
      itemNo: i + 1
    }));
    
    // Recalculate totals
    const { subtotal, vatAmount, total } = calculateInvoiceTotals(renumberedItems, invoiceData.vatRate);
    
    setInvoiceData(prev => ({
      ...prev,
      items: renumberedItems,
      subtotal,
      vatAmount,
      total
    }));
  };

  // Update item field
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Recalculate amount if quantity, price or discount changed
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      updatedItems[index].amount = calculateItemAmount(updatedItems[index]);
    }
    
    // Recalculate totals
    const { subtotal, vatAmount, total } = calculateInvoiceTotals(updatedItems, invoiceData.vatRate);
    
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      vatAmount,
      total
    }));
  };

  // Update VAT rate
  const updateVatRate = (rate: number) => {
    // Recalculate VAT amount and total
    const vatAmount = (invoiceData.subtotal * rate) / 100;
    const total = invoiceData.subtotal + vatAmount;
    
    setInvoiceData(prev => ({
      ...prev,
      vatRate: rate,
      vatAmount,
      total
    }));
  };

  // Save invoice
  const handleSave = async () => {
    // Validate required fields
    if (!invoiceData.client.name) {
      toast({
        title: "Missing client information",
        description: "Please select a client before saving",
        variant: "destructive"
      });
      return;
    }
    
    if (invoiceData.items.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the invoice",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Save to localStorage
      const result = saveInvoiceToStorage(invoiceData);
      
      if (result.success) {
        toast({
          title: "Invoice saved",
          description: `Invoice #${invoiceData.invoiceNumber} has been saved successfully`
        });
        
        // Show template selector or call onSaveSuccess
        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          setShowTemplateSelector(true);
        }
      } else {
        toast({
          title: "Error saving invoice",
          description: result.message || "An unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error saving invoice",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Basic Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="creationDate">Date</Label>
              <Input
                id="creationDate"
                type="date"
                value={invoiceData.creationDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, creationDate: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formatDateToFriendly(invoiceData.creationDate)}
              </p>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={invoiceData.shortDescription}
                onChange={(e) => setInvoiceData({ ...invoiceData, shortDescription: e.target.value })}
                placeholder="Brief description of services/products"
              />
            </div>
          </div>

          {/* Create from Quote Section */}
          <div>
            <Label htmlFor="quoteSelect">Create from Quote (Optional)</Label>
            <Select value={selectedQuoteId} onValueChange={handleQuoteSelect}>
              <SelectTrigger id="quoteSelect">
                <SelectValue placeholder="Select a quote" />
              </SelectTrigger>
              <SelectContent>
                {quotes.length > 0 ? (
                  quotes.map((quote) => (
                    <SelectItem key={quote.id} value={quote.id}>
                      {quote.quoteNumber} - {quote.client.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-quotes" disabled>
                    No quotes available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Client Information */}
          <div>
            <Label htmlFor="clientSelect">Client</Label>
            <Select value={invoiceData.clientId} onValueChange={handleClientSelect}>
              <SelectTrigger id="clientSelect">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.length > 0 ? (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-clients" disabled>
                    No clients available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Display Selected Client Info */}
            {invoiceData.client.name && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <h4 className="font-medium">Selected Client:</h4>
                <p>{invoiceData.client.name}</p>
                {invoiceData.client.address && <p>{invoiceData.client.address}</p>}
                {invoiceData.client.email && <p>{invoiceData.client.email}</p>}
                {invoiceData.client.phone && <p>{invoiceData.client.phone}</p>}
              </div>
            )}
          </div>

          {/* Company Information */}
          <div>
            <h4 className="font-medium mb-2">My Company Details:</h4>
            <div className="p-3 bg-muted rounded-md">
              <p>{invoiceData.company.name}</p>
              {invoiceData.company.address && <p>{invoiceData.company.address}</p>}
              {invoiceData.company.email && <p>{invoiceData.company.email}</p>}
              {invoiceData.company.phone && <p>{invoiceData.company.phone}</p>}
              {invoiceData.company.vatNumber && <p>VAT: {invoiceData.company.vatNumber}</p>}
              {invoiceData.company.regNumber && <p>Reg: {invoiceData.company.regNumber}</p>}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">Item No.</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px] text-right">Quantity</TableHead>
                    <TableHead className="w-[120px] text-right">Unit Price</TableHead>
                    <TableHead className="w-[100px] text-right">Discount %</TableHead>
                    <TableHead className="w-[120px] text-right">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceData.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.itemNo}
                          onChange={(e) => updateItem(index, 'itemNo', parseInt(e.target.value) || 0)}
                          type="number"
                          min="1"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          type="number"
                          min="0"
                          step="1"
                          className="w-full text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.discount}
                          onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                          type="number"
                          min="0"
                          max="100"
                          className="w-full text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(item.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
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
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(invoiceData.subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>VAT:</span>
                  <Select value={invoiceData.vatRate.toString()} onValueChange={(value) => updateVatRate(parseInt(value))}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="VAT %" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(invoiceData.vatAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Total:</span>
                <span className="font-bold">
                  {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(invoiceData.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes, Terms, and Banking Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                placeholder="Additional notes to the client"
                className="min-h-[120px]"
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms</Label>
              <Textarea
                id="terms"
                value={invoiceData.terms}
                onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.value })}
                placeholder="Payment terms and conditions"
                className="min-h-[120px]"
              />
            </div>
            <div>
              <Label htmlFor="bankingDetails">Banking Details</Label>
              <Textarea
                id="bankingDetails"
                value={invoiceData.bankingDetails}
                onChange={(e) => setInvoiceData({ ...invoiceData, bankingDetails: e.target.value })}
                placeholder="Your banking information"
                className="min-h-[120px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Invoice"}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Invoice Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {/* Template options would go here */}
            <Card className="cursor-pointer hover:border-primary" onClick={() => setShowTemplateSelector(false)}>
              <CardContent className="p-4">
                <div className="aspect-[8.5/11] border rounded flex items-center justify-center">
                  <p className="text-center">Classic Template</p>
                </div>
                <p className="text-center mt-2">Classic</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary" onClick={() => setShowTemplateSelector(false)}>
              <CardContent className="p-4">
                <div className="aspect-[8.5/11] border rounded flex items-center justify-center">
                  <p className="text-center">Modern Template</p>
                </div>
                <p className="text-center mt-2">Modern</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary" onClick={() => setShowTemplateSelector(false)}>
              <CardContent className="p-4">
                <div className="aspect-[8.5/11] border rounded flex items-center justify-center">
                  <p className="text-center">Professional Template</p>
                </div>
                <p className="text-center mt-2">Professional</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary" onClick={() => setShowTemplateSelector(false)}>
              <CardContent className="p-4">
                <div className="aspect-[8.5/11] border rounded flex items-center justify-center">
                  <p className="text-center">Minimal Template</p>
                </div>
                <p className="text-center mt-2">Minimal</p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InvoiceForm;
