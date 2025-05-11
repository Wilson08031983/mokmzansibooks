import React, { useState, useEffect } from "react";
import { getFormSettings, updateSettingsFromQuote, applySettingsToQuote } from "@/utils/formDataPersistence";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QuoteData, QuoteItem } from "@/types/quote";

// Extended interface with additional fields for persistence
interface ExtendedQuoteData extends QuoteData {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}
import { Save, Plus, Trash } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import TemplateSelector from "./TemplateSelector";
import ClientDropdownFix from "./ClientDropdownFix";
import { useCompany } from "@/contexts/CompanyContext";
import CompanyDisplay from "./CompanyDisplaySafe";

// Mock client data
const mockClients = [
  { id: "client1", name: "ABC Construction Ltd", address: "123 Builder St, Cape Town, 8001", email: "info@abcconstruction.co.za", phone: "021 234 5678" },
  { id: "client2", name: "Cape Town Retailers", address: "54 Shop Ave, Cape Town, 8002", email: "orders@ctretailers.co.za", phone: "021 876 5432" },
  { id: "client3", name: "Durban Services Co", address: "78 Beach Rd, Durban, 4001", email: "contact@durbanservices.co.za", phone: "031 345 6789" },
];

// Company data will be retrieved from CompanyContext instead of hardcoded values

interface QuoteFormProps {
  onSaveSuccess?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
  initialData?: QuoteData;
}

const QuoteForm = ({ onSaveSuccess, onCancel, isEditing = false, initialData }: QuoteFormProps) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const { companyDetails } = useCompany(); // Get company details from context
  const { toast, dismiss } = useToast(); // Get toast and dismiss from useToast hook
  
  // Define createNewItem function before using it
  function createNewItem(): QuoteItem {
    return {
      itemNo: 1,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
      amount: 0
    };
  }
  
  const [quoteData, setQuoteData] = useState<QuoteData>(() => {
    // If editing an existing quote, use that data
    if (initialData) return initialData;
    
    // Get saved form settings (notes, terms, banking details)
    const formSettings = getFormSettings();
    
    // Format company address from details in context
    const formattedAddress = [
      companyDetails?.address,
      companyDetails?.addressLine2,
      companyDetails?.city,
      companyDetails?.province,
      companyDetails?.postalCode
    ].filter(Boolean).join('\n');
    
    // Create company data from context
    const companyDataFromContext = {
      name: companyDetails?.name || 'Your Company Name',
      address: formattedAddress || 'Your Address',
      email: companyDetails?.contactEmail || 'your.email@example.com',
      phone: companyDetails?.contactPhone || 'Your Phone Number',
      logo: companyDetails?.logo as string,
      stamp: companyDetails?.stamp as string
    };
    
    // Create a new quote with default values + saved settings
    const newQuoteData = {
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
      company: companyDataFromContext,
      items: [createNewItem()],
      subtotal: 0,
      vatRate: 0,
      tax: 0,
      total: 0,
      notes: formSettings.notes,
      terms: formSettings.terms,
      bankingDetails: formSettings.bankingDetails,
      currency: "ZAR"
    };
    
    return newQuoteData;
  });

  // Generate a unique quote number
  function generateQuoteNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `QT-${year}-${random}`;
  }

  // Handle client selection from real client data in localStorage with comprehensive fallback
  const handleClientSelect = (clientId: string) => {
    console.log('Selecting client with ID:', clientId);
    if (!clientId) {
      console.error('Empty client ID provided');
      return;
    }
    
    try {
      // Try multiple possible storage keys to find client data
      const possibleKeys = [
        'clients',                  // Main key used by clientStorageAdapter
        'CLIENTS',                  // Alternative key
        'clients_backup',           // Backup key used by clientStorageAdapter
        'mok-mzansi-books-clients', // Original key used by this component
        'savedClients',             // Another possible legacy key
        'clientsData'               // Another possible legacy key
      ];
      
      // Try to find the client in any of the storage locations
      let selectedClient = null;
      
      // First try to find in structured client state (with companies, individuals, vendors)
      for (const key of possibleKeys) {
        const savedData = localStorage.getItem(key);
        if (!savedData) {
          console.log(`No data found in localStorage key: ${key}`);
          continue;
        }
        
        try {
          console.log(`Parsing data from key: ${key}`);
          const parsedData = JSON.parse(savedData);
          console.log(`Data structure from key ${key}:`, typeof parsedData, Array.isArray(parsedData) ? 'array' : 'object');
          
          // Check if data has the expected structure with companies, individuals, vendors
          if (parsedData && 
              (Array.isArray(parsedData.companies) || 
               Array.isArray(parsedData.individuals) || 
               Array.isArray(parsedData.vendors))) {
            
            console.log(`Found structured client data in key ${key}:`, {
              companies: Array.isArray(parsedData.companies) ? parsedData.companies.length : 0,
              individuals: Array.isArray(parsedData.individuals) ? parsedData.individuals.length : 0,
              vendors: Array.isArray(parsedData.vendors) ? parsedData.vendors.length : 0
            });
            
            // Combine all client types into a single array
            const allClients = [
              ...(Array.isArray(parsedData.companies) ? parsedData.companies : []),
              ...(Array.isArray(parsedData.individuals) ? parsedData.individuals : []),
              ...(Array.isArray(parsedData.vendors) ? parsedData.vendors : [])
            ];
            
            console.log(`Total clients found: ${allClients.length}`);
            console.log('Client IDs:', allClients.map(c => c.id));
            
            // Find the client by ID
            selectedClient = allClients.find(c => c.id === clientId);
            
            if (selectedClient) {
              console.log(`Found client in structured data from key '${key}':`, selectedClient.name);
              break;
            }
          }
          
          // Check if data is an array of clients (old format)
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(`Found flat array of clients in key ${key}, length: ${parsedData.length}`);
            
            selectedClient = parsedData.find((c: any) => c.id === clientId);
            
            if (selectedClient) {
              console.log(`Found client in flat array from key '${key}':`, selectedClient.name);
              break;
            }
          }
        } catch (parseError) {
          console.error(`Error parsing client data from key '${key}':`, parseError);
          // Continue to next key
        }
      }
      
      // If we found a client, update the quote data
      if (selectedClient) {
        console.log('Selected client data:', selectedClient);
        
        // Format the address if needed
        let formattedAddress = '';
        
        if (selectedClient.address) {
          formattedAddress = selectedClient.address;
        } else if (selectedClient.streetAddress) {
          formattedAddress = `${selectedClient.streetAddress}\n`;
          if (selectedClient.city) formattedAddress += `${selectedClient.city}`;
          if (selectedClient.province) formattedAddress += `, ${selectedClient.province}`;
          if (selectedClient.postalCode) formattedAddress += ` ${selectedClient.postalCode}`;
        } else {
          // Try to build from city, province, postal code if available
          const addressParts = [];
          if (selectedClient.city) addressParts.push(selectedClient.city);
          if (selectedClient.province) addressParts.push(selectedClient.province);
          if (selectedClient.postalCode) addressParts.push(selectedClient.postalCode);
          formattedAddress = addressParts.join(', ');
        }
        
        // Create updated quote data with the selected client
        const updatedQuoteData = {
          ...quoteData,
          client: {
            id: selectedClient.id,
            name: selectedClient.name,
            address: formattedAddress,
            email: selectedClient.email || selectedClient.contactEmail || '',
            phone: selectedClient.phone || selectedClient.contactPhone || ''
          }
        };
        
        console.log('Updated quote data with selected client:', updatedQuoteData);
        
        // Update the state
        setQuoteData(updatedQuoteData);
        
        // Show toast notification for successful client selection
        toast({
          title: "Client Selected",
          description: `${selectedClient.name} has been selected for this quote.`,
          variant: "default"
        });
      } else {
        console.error('Client not found with ID:', clientId);
        toast({
          title: "Client Not Found",
          description: "The selected client could not be found. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error selecting client:', error);
      toast({
        title: "Error",
        description: "There was an error selecting the client. Please try again.",
        variant: "destructive"
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
      // Apply markup to unit price first
      const markupMultiplier = 1 + (item.markupPercentage || 0) / 100;
      const priceWithMarkup = item.unitPrice * markupMultiplier;
      
      // Then calculate with quantity
      const baseAmount = item.quantity * priceWithMarkup;
      
      // Finally apply discount
      const discountAmount = baseAmount * ((item.discount || 0) / 100);
      updatedItems[index].amount = baseAmount - discountAmount;
      
      console.log(`Item ${index+1} updated: Markup ${item.markupPercentage}%, Price with markup: ${priceWithMarkup}, Final amount: ${updatedItems[index].amount}`);
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
    
    // Validate form data
    if (!quoteData.client?.name) {
      toast({
        variant: "destructive",
        title: "Missing client information",
        description: "Please select a client before saving"
      });
      return;
    }
    
    if (quoteData.items.length === 0 || !quoteData.items.some(item => item.description && item.quantity > 0)) {
      toast({
        variant: "destructive",
        title: "Missing item information",
        description: "Please add at least one item with description and quantity"
      });
      return;
    }
    
    try {
      // Prepare quote for saving with correct type casting
      const existingData = quoteData as ExtendedQuoteData;
      
      const quoteToSave: ExtendedQuoteData = {
        ...quoteData,
        id: isEditing && existingData.id ? existingData.id : `quote-${Date.now()}`,
        createdAt: isEditing && existingData.createdAt ? existingData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: isEditing && existingData.status ? existingData.status : 'pending'
      };
      
      // Persist form settings for future use
      updateSettingsFromQuote(quoteData);
      
      // Save the quote using multiple storage mechanisms for redundancy
      if (typeof window !== 'undefined') {
        // Get existing quotes from primary storage
        const savedQuotesJson = localStorage.getItem('QUOTES_DATA_PERMANENT');
        let savedQuotes: ExtendedQuoteData[] = savedQuotesJson ? JSON.parse(savedQuotesJson) : [];
        
        if (isEditing && quoteToSave.id) {
          // Update existing quote
          savedQuotes = savedQuotes.map((q) => 
            q.id === quoteToSave.id ? quoteToSave : q
          );
        } else {
          // Add new quote
          savedQuotes.push(quoteToSave);
        }
        
        // Save to multiple storage locations for redundancy
        const quotesJson = JSON.stringify(savedQuotes);
        localStorage.setItem('QUOTES_DATA_PERMANENT', quotesJson);
        localStorage.setItem('QUOTES_DATA_BACKUP', quotesJson);
        localStorage.setItem('quotes', quotesJson); // Standard key used by adapter
        sessionStorage.setItem('QUOTES_DATA_SESSION', quotesJson);
        
        // Also save to IndexedDB if available
        if (window.indexedDB) {
          try {
            const dbRequest = indexedDB.open("MokMzansiDB", 1);
            
            dbRequest.onupgradeneeded = function(e) {
              const db = (e.target as IDBOpenDBRequest).result;
              if (!db.objectStoreNames.contains("quotes")) {
                db.createObjectStore("quotes", { keyPath: "id" });
              }
            };
            
            dbRequest.onsuccess = function(event) {
              try {
                const db = (event.target as IDBOpenDBRequest).result;
                
                if (db.objectStoreNames.contains("quotes")) {
                  const transaction = db.transaction(["quotes"], "readwrite");
                  const store = transaction.objectStore("quotes");
                  
                  // Store the complete collection for easy retrieval
                  store.put({id: 'quotes_collection', data: savedQuotes});
                  
                  // Also store the individual quote for direct access
                  store.put({id: quoteToSave.id, data: quoteToSave});
                }
              } catch (dbError) {
                console.error("Error accessing IndexedDB:", dbError);
              }
            };
          } catch (dbError) {
            console.error("IndexedDB backup failed:", dbError);
          }
        }
        
        // Dispatch events to notify other components
        window.dispatchEvent(new CustomEvent('quotes-updated'));
        
        // Show success message
        toast({
          variant: "default",
          title: "Success",
          description: `Quote ${isEditing ? 'updated' : 'saved'} successfully!`
        });
        
        // Show template selector for preview/printing
        setShowTemplateSelector(true);
        
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error saving your quote. Please try again."
      });
    }
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
              <Label htmlFor="issueDate">Issue Date</Label>
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
            <ClientDropdownFix 
              onSelectClient={handleClientSelect} 
              selectedClientId={quoteData.client?.id || ""}
              excludeCompanies={false} // Show all clients including companies
            />
          </div>

          {/* Display Client Info */}
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
          
          {/* Company Information */}
          {/* Company Information - pass in quoteData.company as fallback */}
          <CompanyDisplay company={quoteData.company} />
          
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
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Item No.</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2 text-center">Amount (R)</th>
                    <th className="p-2 text-center">Mark Up %</th>
                    <th className="p-2 text-center">Discount %</th>
                    <th className="p-2 text-center">Total (R)</th>
                    <th className="p-2 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.items.map((item, index) => (
                    <tr key={index} className={index % 2 ? "bg-gray-50" : ""}>
                      <td className="p-2">
                        <Input
                          className="text-center"
                          value={item.itemNo}
                          readOnly
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.markupPercentage || 0}
                          onChange={(e) => updateItem(index, 'markupPercentage', parseFloat(e.target.value) || 0)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                          className="text-center"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={formatCurrency(item.amount, "ZAR")}
                          readOnly
                          className="text-center bg-gray-50"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={quoteData.items.length <= 1}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Totals */}
          <div className="flex flex-col items-end space-y-2">
            <div className="grid grid-cols-2 gap-4 w-full sm:w-2/3 md:w-1/3">
              <Label className="text-right">Subtotal:</Label>
              <p className="font-medium">{formatCurrency(quoteData.subtotal, "ZAR")}</p>
              
              <div className="text-right flex items-center justify-end">
                <Label htmlFor="vatRate" className="mr-2">VAT %:</Label>
                <Select 
                  value={quoteData.vatRate.toString()} 
                  onValueChange={(value) => setQuoteData({...quoteData, vatRate: parseFloat(value)})}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="font-medium">{formatCurrency(quoteData.tax, "ZAR")}</p>
              
              <Label className="text-right font-bold">Total:</Label>
              <p className="font-bold">{formatCurrency(quoteData.total, "ZAR")}</p>
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
                value={quoteData.notes || ""}
                onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})}
              />
            </div>
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
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className={onCancel ? "" : "w-full"}>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Update Quote" : "Save Quote"}
            </Button>
          </div>
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
