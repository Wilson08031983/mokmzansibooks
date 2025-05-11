import React, { useState, useEffect } from "react";
import { getFormSettings, updateSettingsFromInvoice, applySettingsToInvoice } from "@/utils/formDataPersistence";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { CalendarDays, Save, Settings, X } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import TemplateSelector from "./TemplateSelector";
import InvoiceDetails from "./InvoiceDetails";
import ClientSelector from "./ClientDropdownFix";
import ClientDisplay from "./ClientDisplay";
import CompanyDisplay from "./CompanyDisplaySafe";
import InvoiceItems from "./InvoiceItems";
import QuoteSelector from "./QuoteSelector";
import InvoiceFooter from "./InvoiceFooter";
import InvoiceTotals from "./InvoiceTotals";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/client";
import useGlobalClientData from "@/hooks/useGlobalClientData";

// Import company data from the synchronization system - imports must be at the top
import { useCompany } from "@/contexts/CompanyContext";
import { getSharedCompanyData, getDirectSyncData } from "@/utils/companyDataSync";

// Function to load real quotes from storage with redundancy
const loadSavedQuotes = () => {
  try {
    // Try primary storage first
    const permanentQuotes = localStorage.getItem('QUOTES_DATA_PERMANENT');
    if (permanentQuotes) {
      return JSON.parse(permanentQuotes);
    }
    
    // Try backup locations
    const backupQuotes = localStorage.getItem('QUOTES_DATA_BACKUP');
    if (backupQuotes) {
      return JSON.parse(backupQuotes);
    }
    
    // Try session storage
    const sessionQuotes = sessionStorage.getItem('QUOTES_DATA_SESSION');
    if (sessionQuotes) {
      return JSON.parse(sessionQuotes);
    }
    
    // Legacy location as last resort
    const savedQuotes = localStorage.getItem('savedQuotes');
    if (savedQuotes) {
      return JSON.parse(savedQuotes);
    }
  } catch (error) {
    console.error('Error loading saved quotes:', error);
  }
  
  return []; // Return empty array if no quotes found
};

const InvoiceForm = ({ onSaveSuccess, onCancel, isEditing = false }) => {
  const { toast } = useToast();
  const { allClients } = useGlobalClientData(); // Get clients from the global store
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [sourceType, setSourceType] = useState<'new' | 'quote'>('new');
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [savedQuotes, setSavedQuotes] = useState([]);
  
  // Load real quotes from storage
  useEffect(() => {
    const quotes = loadSavedQuotes();
    setSavedQuotes(quotes);
    
    // Set up a listener for quote updates
    const handleQuoteUpdate = () => {
      const refreshedQuotes = loadSavedQuotes();
      setSavedQuotes(refreshedQuotes);
    };
    
    window.addEventListener('quotes-restored-from-indexeddb', handleQuoteUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'QUOTES_DATA_PERMANENT' || e.key === 'QUOTES_DATA_BACKUP') {
        handleQuoteUpdate();
      }
    });
    
    // Also check periodically for updates
    const intervalId = setInterval(handleQuoteUpdate, 3000);
    
    return () => {
      window.removeEventListener('quotes-restored-from-indexeddb', handleQuoteUpdate);
      clearInterval(intervalId);
    };
  }, []);
  
  // Create a default company data
  const defaultCompanyData = {
    name: "Your Company",
    address: "Company Address",
    email: "company@example.com",
    phone: "Phone Number"
  };
  
  // Initialize with default data first, will be updated in useEffect
  const [syncedCompanyData, setSyncedCompanyData] = useState<any>(defaultCompanyData);
  
  // Load company data safely after component mounts
  useEffect(() => {
    // Try to get company data from Context
    let contextCompanyDetails: any = null;
    try {
      const { companyDetails } = useCompany();
      if (companyDetails) {
        setSyncedCompanyData(companyDetails);
        return;
      }
    } catch (err) {
      console.log('CompanyContext not available in InvoiceForm, using sync data only');
    }
    
    // Try all available sources for company data in order of freshness
    const directData = getDirectSyncData();
    if (directData && directData.name) {
      setSyncedCompanyData(directData);
      return;
    }
    
    const sharedData = getSharedCompanyData();
    if (sharedData && sharedData.name) {
      setSyncedCompanyData(sharedData);
      return;
    }
  }, []);
  
  // Listen for company data changes in real-time
  useEffect(() => {
    // Custom event handler for direct updates
    const handleCompanyDataChange = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      if (customEvent.detail) {
        console.log('InvoiceForm received company data update:', customEvent.detail.name);
        setSyncedCompanyData(customEvent.detail);
        // Also update the current invoice with new company data
        setInvoiceData(current => ({
          ...current,
          company: customEvent.detail
        }));
      }
    };
    
    // Check for localStorage changes (cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'COMPANY_DATA_FORCE_UPDATE_NOW' && e.newValue) {
        try {
          const updateData = JSON.parse(e.newValue);
          if (updateData.data) {
            console.log('InvoiceForm detected company data update:', updateData.data.name);
            setSyncedCompanyData(updateData.data);
            // Also update the current invoice
            setInvoiceData(current => ({
              ...current,
              company: updateData.data
            }));
          }
        } catch (err) {
          console.error('Error parsing company data update:', err);
        }
      }
    };
    
    // Set up the event listeners
    window.addEventListener('company-data-changed', handleCompanyDataChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup function
    return () => {
      window.removeEventListener('company-data-changed', handleCompanyDataChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Check for client passed via localStorage (from Clients page "Create Invoice" action)
  useEffect(() => {
    const clientData = localStorage.getItem('selectedClientForInvoice');
    if (clientData) {
      try {
        const client = JSON.parse(clientData);
        console.log('Client data loaded from localStorage:', client);
        
        // Set the selected client ID if the client exists in our global client data
        if (client && client.id) {
          const clientExists = allClients.some(c => c.id === client.id);
          if (clientExists) {
            setSelectedClientId(client.id);
            console.log(`Selected client set to ${client.name} (${client.id})`);
            
            // Pre-fill some invoice details based on the client
            setInvoiceData(prev => ({
              ...prev,
              clientName: client.name,
              clientEmail: client.email,
              clientAddress: client.address || '',
              clientCity: client.city || '',
              clientProvince: client.province || '',
              clientPostalCode: client.postalCode || ''
            }));
            
            // Show a success toast
            toast({
              title: "Client Loaded",
              description: `${client.name} selected for this invoice`
            });
          } else {
            console.warn(`Client with ID ${client.id} not found in the client database`);
          }
        }
        
        // Clear the localStorage to prevent it from affecting future invoices
        localStorage.removeItem('selectedClientForInvoice');
      } catch (error) {
        console.error('Error parsing client data from localStorage:', error);
      }
    }
  }, [allClients]);
  
  // Define createNewItem function before using it
  function createNewItem(): InvoiceItem {
    return {
      itemNo: "1", // We start with default value
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      amount: 0
    };
  }
  
  // Get form settings for persistent fields
  const formSettings = getFormSettings();

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
    company: syncedCompanyData,
    items: [createNewItem()],
    subtotal: 0,
    vatRate: 0,
    tax: 0,
    total: 0,
    notes: formSettings.notes,
    terms: formSettings.terms,
    bankingDetails: formSettings.bankingDetails,
    currency: "ZAR"
  });

  // Generate a unique invoice number
  function generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${random}`;
  }

  // Handle source type change
  useEffect(() => {
    if (sourceType === 'new') {
      // Reset form to defaults for new invoice, preserving settings
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
        // Preserve notes, terms and banking details from saved settings
        notes: formSettings.notes,
        terms: formSettings.terms,
        bankingDetails: formSettings.bankingDetails
      });
      setSelectedQuote(null);
      setSelectedClientId("");
    }
  }, [sourceType]);

  // Function to search for a client across all possible storage locations
  const findClientById = (clientId: string) => {
    console.log("Searching for client with ID:", clientId);
    
    // First check the global client data from useGlobalClientData
    let client = allClients.find(c => c.id === clientId);
    if (client) {
      console.log("Client found in global client data:", client.name);
      return client;
    }
    
    // If not found, check multiple possible storage locations
    const possibleKeys = [
      'clients',                  // Main key
      'CLIENTS',                  // Alternative key
      'mok-mzansi-books-clients', // Original app key
      'savedClients',             // Legacy key
      'clientsData',              // Another possible key
      'mokClients'                // Another app key
    ];
    
    // Try each storage key
    for (const key of possibleKeys) {
      try {
        const storedData = localStorage.getItem(key);
        if (!storedData) continue;
        
        const parsedData = JSON.parse(storedData);
        
        // Check if data is structured with companies, individuals, vendors
        if (parsedData && typeof parsedData === 'object') {
          // Try to find in structured format
          if (Array.isArray(parsedData.companies) || 
              Array.isArray(parsedData.individuals) || 
              Array.isArray(parsedData.vendors)) {
            
            // Look in each category
            const allStoredClients = [
              ...(Array.isArray(parsedData.companies) ? parsedData.companies : []),
              ...(Array.isArray(parsedData.individuals) ? parsedData.individuals : []),
              ...(Array.isArray(parsedData.vendors) ? parsedData.vendors : [])
            ];
            
            client = allStoredClients.find(c => c.id === clientId);
            if (client) {
              console.log(`Client found in ${key} (structured format):`, client.name);
              return client;
            }
          }
          
          // Check if it's a direct array of clients
          if (Array.isArray(parsedData)) {
            client = parsedData.find((c: any) => c.id === clientId);
            if (client) {
              console.log(`Client found in ${key} (array format):`, client.name);
              return client;
            }
          }
        }
      } catch (error) {
        console.warn(`Error searching for client in ${key}:`, error);
      }
    }
    
    // Check the localStorage item that might have been set by the ClientDropdownFix component
    try {
      const selectedClientCache = localStorage.getItem('selected-client-cache');
      if (selectedClientCache) {
        const cachedClient = JSON.parse(selectedClientCache);
        if (cachedClient && cachedClient.id === clientId) {
          console.log("Client found in selected-client-cache:", cachedClient.name);
          return cachedClient;
        }
      }
    } catch (error) {
      console.warn("Error checking selected-client-cache:", error);
    }
    
    console.error("Client not found in any storage location - ID:", clientId);
    return null;
  };
  
  // Handle client selection
  useEffect(() => {
    if (selectedClientId) {
      console.log("Client selection in InvoiceForm - selected ID:", selectedClientId);
      
      // Find the client using our comprehensive search function
      const selectedClient = findClientById(selectedClientId);
      
      if (selectedClient) {
        console.log("Client found:", selectedClient);
        
        // Format address from available fields if the main address is missing
        let formattedAddress = selectedClient.address || "";
        if (!formattedAddress && (selectedClient.city || selectedClient.province || selectedClient.postalCode)) {
          const addressParts = [];
          if (selectedClient.addressLine2) addressParts.push(selectedClient.addressLine2);
          if (selectedClient.city) addressParts.push(selectedClient.city);
          if (selectedClient.province) addressParts.push(selectedClient.province);
          if (selectedClient.postalCode) addressParts.push(selectedClient.postalCode);
          formattedAddress = addressParts.join(", ");
        }
        
        // Create updated invoice data with client information
        const updatedInvoiceData = {
          ...invoiceData,
          client: {
            id: selectedClient.id,
            name: selectedClient.name || "",
            address: formattedAddress,
            email: selectedClient.email || "",
            phone: selectedClient.phone || ""
          }
        };
        
        console.log("Updated invoice data with client:", updatedInvoiceData.client);
        setInvoiceData(updatedInvoiceData);
        
        // Store this client in cache for future reference
        try {
          localStorage.setItem('selected-client-cache', JSON.stringify(selectedClient));
        } catch (error) {
          console.warn("Could not cache selected client:", error);
        }
        
        toast({
          title: "Client Selected",
          description: `${selectedClient.name} has been selected for this invoice.`
        });
      } else {
        console.error("Selected client not found in any storage location - ID:", selectedClientId);
        toast({
          title: "Client Not Found",
          description: "The selected client could not be found in any storage location.",
          variant: "destructive"
        });
      }
    }
  }, [selectedClientId, allClients, toast, invoiceData]);

  // Handle quote selection - now with actual quote data transfer
  const handleQuoteSelect = (quoteId: string) => {
    // Only update the selected quote ID in this handler
    // All other state updates will happen in the useEffect below
    setSelectedQuote(quoteId);
    console.log(`Selected quote ID: ${quoteId}`);
  };
  
  // Use an effect to handle quote data processing when selectedQuote changes
  // This prevents multiple state updates during rendering
  useEffect(() => {
    if (!selectedQuote) return;
    
    // Find the selected quote from our saved quotes
    const selectedQuoteData = savedQuotes.find(quote => quote.id === selectedQuote);
    
    if (!selectedQuoteData) {
      toast({
        title: "Error",
        description: "Could not find the selected quote data",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Found quote data:', selectedQuoteData);
    
    // Try to find matching client in our client database
    let matchingClient = null;
    
    if (selectedQuoteData.client && selectedQuoteData.client.name) {
      // First try to find by exact client name match
      matchingClient = allClients.find(c => c.name === selectedQuoteData.client.name);
      
      // If no exact match, try a fuzzy match
      if (!matchingClient && selectedQuoteData.client.email) {
        matchingClient = allClients.find(c => c.email === selectedQuoteData.client.email);
      }
      
      // If we found a matching client, set the client ID
      if (matchingClient) {
        setSelectedClientId(matchingClient.id);
        console.log(`Found matching client: ${matchingClient.name} (ID: ${matchingClient.id})`);
      }
    }
    
    // Transfer all quote data to the invoice with proper data mapping
    setInvoiceData({
      ...invoiceData,
      // Transfer client information
      client: {
        name: selectedQuoteData.client?.name || "",
        address: selectedQuoteData.client?.address || "",
        email: selectedQuoteData.client?.email || "",
        phone: selectedQuoteData.client?.phone || ""
      },
      // Transfer quote metadata
      shortDescription: selectedQuoteData.shortDescription || `Invoice based on Quote ${selectedQuoteData.quoteNumber}`,
      
      // Important: Transfer actual line items from the quote
      items: Array.isArray(selectedQuoteData.items) ? selectedQuoteData.items.map((item, index) => ({
        itemNo: (index + 1).toString(),
        description: item.description || "",
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        discount: item.discount || 0,
        amount: item.amount || 0
      })) : [],
      
      // Transfer financial data
      subtotal: selectedQuoteData.subtotal || 0,
      vatRate: selectedQuoteData.vatRate || 15, // Default VAT rate if not specified
      tax: selectedQuoteData.tax || 0,
      total: selectedQuoteData.total || 0,
      
      // Transfer terms and notes
      notes: selectedQuoteData.notes || invoiceData.notes,
      terms: selectedQuoteData.terms || invoiceData.terms,
      bankingDetails: selectedQuoteData.bankingDetails || invoiceData.bankingDetails
    });
    
    // Show success message
    toast({
      title: "Quote Converted",
      description: `Invoice created from quote ${selectedQuoteData.quoteNumber}`
    });
  }, [selectedQuote, savedQuotes, allClients, invoiceData]);

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
    
    // Validate that a client is selected
    if (!selectedClientId && sourceType === 'new') {
      toast({
        title: "Client Required",
        description: "Please select a client for this invoice.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate items
    if (!invoiceData.items || invoiceData.items.length === 0) {
      toast({
        title: "No Items",
        description: "You need to add at least one item to your invoice.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Invoice data ready to save:", invoiceData);
    
    // The real saving happens in handleSaveInvoice which has all our
    // multi-layered storage logic, so call that directly
    handleSaveInvoice();
  };

  const handleVatRateChange = (rate: string) => {
    setInvoiceData({...invoiceData, vatRate: parseFloat(rate) || 0});
  };

  // Handle saving the invoice with multi-layered storage approach
  const handleSaveInvoice = () => {
    try {
      // Create a defensive deep copy of the invoice data with safe defaults
      const currentInvoiceData = {
        ...invoiceData,
        // Ensure client object is valid with proper types
        client: {
          id: invoiceData.client?.id || "",
          name: invoiceData.client?.name || "",
          address: invoiceData.client?.address || "",
          email: invoiceData.client?.email || "",
          phone: invoiceData.client?.phone || ""
        } as any, // Type assertion to prevent 'id' property type issues
        // Ensure items array is valid
        items: Array.isArray(invoiceData.items) ? [...invoiceData.items] : [],
        // Ensure other required fields
        invoiceNumber: invoiceData.invoiceNumber || generateInvoiceNumber(),
        issueDate: invoiceData.issueDate || format(new Date(), "yyyy-MM-dd"),
        dueDate: invoiceData.dueDate || format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
        subtotal: invoiceData.subtotal || 0,
        vatRate: invoiceData.vatRate || 0,
        tax: invoiceData.tax || 0,
        total: invoiceData.total || 0
      };
      
      // Log the client information for debugging
      console.log("Saving invoice with data:", {
        invoiceNumber: currentInvoiceData.invoiceNumber,
        clientName: currentInvoiceData.client.name,
        itemCount: currentInvoiceData.items.length
      });
      
      // Validation - client data
      if (!currentInvoiceData.client.name || currentInvoiceData.client.name.trim() === "") {
        toast({
          title: "Missing client information",
          description: "Please select a client before saving this invoice",
          variant: "destructive"
        });
        return;
      }

      // Validation - items
      if (!currentInvoiceData.items.length) {
        toast({
          title: "No invoice items",
          description: "Please add at least one item to this invoice",
          variant: "destructive"
        });
        return;
      }

      // Generate a new ID if needed
      const isNewInvoice = !currentInvoiceData.id;
      if (isNewInvoice) {
        currentInvoiceData.id = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
      
      // Add timestamps
      currentInvoiceData.createdAt = currentInvoiceData.createdAt || new Date().toISOString();
      currentInvoiceData.updatedAt = new Date().toISOString();
      currentInvoiceData.status = currentInvoiceData.status || "draft";
      
      // Get existing invoices with robust error handling
      let existingInvoices: any[] = [];
      try {
        const storedInvoices = localStorage.getItem('INVOICES_DATA_PERMANENT');
        if (storedInvoices) {
          const parsed = JSON.parse(storedInvoices);
          existingInvoices = Array.isArray(parsed) ? parsed : [];
        }
      } catch (error) {
        console.error('Failed to parse existing invoices:', error);
        // Continue with empty array
      }
      
      // Add or update the invoice
      const existingIndex = existingInvoices.findIndex(inv => inv.id === currentInvoiceData.id);
      if (existingIndex >= 0) {
        existingInvoices[existingIndex] = currentInvoiceData;
      } else {
        existingInvoices.push(currentInvoiceData);
      }
      
      // Save to primary storage
      try {
        const jsonData = JSON.stringify(existingInvoices);
        localStorage.setItem('INVOICES_DATA_PERMANENT', jsonData);
        
        // Save to backup locations in a non-blocking way
        setTimeout(() => {
          try {
            localStorage.setItem('INVOICES_DATA_BACKUP', jsonData);
            sessionStorage.setItem('INVOICES_DATA_SESSION', jsonData);
            localStorage.setItem('savedInvoices', jsonData);
          } catch (error) {
            console.error('Error saving to backup storage:', error);
          }
        }, 0);
        
        // Also try to save to IndexedDB for deep persistence
        setTimeout(() => {
          try {
            if (window.indexedDB) {
              const dbRequest = indexedDB.open("MokMzansiDB", 1);
              
              dbRequest.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('invoices')) {
                  db.createObjectStore('invoices', { keyPath: 'id' });
                }
              };
              
              dbRequest.onsuccess = (event: any) => {
                const db = event.target.result;
                const transaction = db.transaction(['invoices'], 'readwrite');
                const store = transaction.objectStore('invoices');
                
                // Store both the collection and individual invoice
                store.put({ id: 'invoice_collection', data: existingInvoices });
                store.put({ id: currentInvoiceData.id, data: currentInvoiceData });
                
                transaction.oncomplete = () => {
                  console.log('Successfully saved invoice to IndexedDB');
                };
              };
            }
          } catch (error) {
            console.error('Error with IndexedDB operations:', error);
            // This is just for deep persistence, so continue
          }
        }, 10);
        
        // Update invoice state
        setInvoiceData(currentInvoiceData);
        
        // Show success notification
        toast({
          title: isNewInvoice ? "Invoice Created" : "Invoice Updated",
          description: `Invoice #${currentInvoiceData.invoiceNumber} has been saved successfully.`,
          variant: "default"
        });
        
        // Notify parent component of success
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } catch (error) {
        console.error('Error saving invoice:', error);
        toast({
          title: "Save Error",
          description: "There was a problem saving your invoice. Please try again.",
          variant: "destructive"
        });
      }
    } catch (criticalError) {
      // Top-level error handler to prevent UI crashes
      console.error('Critical error in invoice save process:', criticalError);
      toast({
        title: "System Error",
        description: "An unexpected error occurred. Please refresh the page and try again.",
        variant: "destructive"
      });
    }
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
            {savedQuotes && savedQuotes.length > 0 ? (
              <QuoteSelector 
                quotes={savedQuotes} 
                selectedQuote={selectedQuote} 
                onQuoteSelect={handleQuoteSelect} 
              />
            ) : (
              <div className="p-4 text-center bg-gray-50 rounded-md">
                <p className="text-muted-foreground mb-2">No saved quotes found</p>
                <p className="text-sm">Create and save a quote first to convert it to an invoice</p>
              </div>
            )}
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
            <div className="space-y-4">
              <ClientSelector 
                onSelectClient={setSelectedClientId}
                selectedClientId={selectedClientId}
              />
            </div>
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
          
          {/* Form Actions - Save and Cancel Buttons */}
          <div className="flex justify-between sm:justify-start gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => window.history.back()}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Invoice
            </Button>
          </div>
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
              <TemplateSelector 
                data={invoiceData} 
                type="invoice" 
                onSave={handleSaveInvoice}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceForm;
