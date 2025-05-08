import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { saveQuoteForInvoiceConversion } from "@/utils/quoteToInvoiceConverter";
import { useCompany } from "@/contexts/CompanyContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Building2, User, Truck } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuoteData, QuoteItem } from "@/types/quote";
import { Client } from "@/types/client";
import { Plus, Trash, Save, Calculator } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { generateQuoteNumber, formatQuoteDate, createNewQuoteItem, calculateLineItemTotal, getCompanyData, saveQuoteTerms, getSavedQuoteTerms, saveBankingDetails, getSavedBankingDetails, saveQuoteNotes, getSavedQuoteNotes, getSharedCompanyData, syncCompanyData } from "@/utils/quoteUtils";
import TemplateSelector from "./TemplateSelector";

// Import directly from clientDataPersistence to ensure consistency
import { getSafeClientData } from "@/utils/clientDataPersistence";

// We'll only use real clients from the Clients page via localStorage
// No hardcoded clients

// We don't need this static assignment anymore as we'll use the CompanyContext

interface QuoteFormProps {
  initialData?: QuoteData; // For editing existing quotes
  isEditing?: boolean;
  onSaveSuccess?: () => void;
  onCancel?: () => void;
  companyLogo?: File | null;
  companyStamp?: File | null;
  signature?: File | null;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
  initialData,
  isEditing = false,
  onSaveSuccess,
  onCancel,
  companyLogo = null,
  companyStamp = null,
  signature = null
}) => {
  // Get company details from CompanyContext
  const { companyDetails: companyContextDetails } = useCompany();
  
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  // Load saved terms and banking details on component initialization
  const [savedTerms, setSavedTerms] = useState<string>("");
  const [savedBankingDetails, setSavedBankingDetails] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<string>("");
  
  // State for the delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Initialize with saved terms and banking details
  useEffect(() => {
    const loadedTerms = getSavedQuoteTerms();
    const loadedBankingDetails = getSavedBankingDetails();
    const loadedNotes = getSavedQuoteNotes();
    setSavedTerms(loadedTerms);
    setSavedBankingDetails(loadedBankingDetails);
    setSavedNotes(loadedNotes);
  }, []);

  // Get company data directly from CompanyContext
  const { companyDetails } = useCompany();
  
  // Update quote data with company details whenever they change
  useEffect(() => {
    if (companyDetails) {
      console.log("Company details updated from context in QuoteForm:", companyDetails);
      setQuoteData(prev => ({
        ...prev,
        company: {
          name: companyDetails.name || "",
          address: companyDetails.address ? `${companyDetails.address}, ${companyDetails.city}, ${companyDetails.postalCode}` : "",
          email: companyDetails.contactEmail || "",
          phone: companyDetails.contactPhone || ""
        }
      }));
    }
  }, [companyDetails]);
  
  // State for the quote data - initialize with provided data or defaults
  const [quoteData, setQuoteData] = useState<QuoteData>(() => {
    if (initialData && isEditing) {
      // If we're editing, use the provided data
      return {
        ...initialData,
        // Ensure all required fields exist
        terms: initialData.terms || savedTerms,
        notes: initialData.notes || savedNotes,
        bankingDetails: initialData.bankingDetails || savedBankingDetails,
        items: Array.isArray(initialData.items) && initialData.items.length > 0 
          ? initialData.items 
          : [createNewQuoteItem()]
      };
    }
    
    // Otherwise create a new quote
    return {
      quoteNumber: generateQuoteNumber(),
      issueDate: format(new Date(), "yyyy-MM-dd"),
      expiryDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
      shortDescription: "",
      client: {
        name: "",
        address: "",
        email: "",
        phone: "",
        id: ""
      },
      company: getSharedCompanyData() || {
        name: companyDetails?.name || "",
        address: companyDetails?.address || "",
        email: companyDetails?.contactEmail || "",
        phone: companyDetails?.contactPhone || ""
      },
      items: [
        createNewQuoteItem()
      ],
      currency: "ZAR",
      terms: savedTerms,
      notes: savedNotes,
      bankingDetails: savedBankingDetails,
      subtotal: 0,
      tax: 0,
      total: 0,
      templateId: "classic",
      status: "draft",
      vatRate: 15 // Default South African VAT rate
    };
  });

  // Update quoteData with saved terms and banking details when they're loaded
  useEffect(() => {
    if (savedTerms || savedBankingDetails || savedNotes) {
      setQuoteData(prev => ({
        ...prev,
        terms: prev.terms || savedTerms,
        bankingDetails: prev.bankingDetails || savedBankingDetails,
        notes: prev.notes || savedNotes
      }));
    }
  }, [savedTerms, savedBankingDetails, savedNotes]);

  // State for clients loaded from the Clients page
  const [clients, setClients] = useState<Client[]>(() => {
    // Initialize empty array for clients
    let allClients: Client[] = [];
    console.log('Initial load: Loading clients from localStorage');
    
    // First try direct approach with getSafeClientData
    try {
      const safeData = getSafeClientData();
      if (safeData) {
        const fromSafeData = [
          ...(safeData.companies || []),
          ...(safeData.individuals || []),
          ...(safeData.vendors || [])
        ];
        console.log('Initial load: Found clients via getSafeClientData:', fromSafeData.length);
        
        // Add any clients that aren't already in our list
        fromSafeData.forEach(client => {
          if (!allClients.some(c => c.id === client.id)) {
            allClients.push(client);
          }
        });
      }
    } catch (e) {
      console.error('Error using getSafeClientData:', e);
    }
    
    // Then try mokClients directly
    try {
      const savedClients = localStorage.getItem('mokClients');
      if (savedClients) {
        const parsedClients = JSON.parse(savedClients);
        const fromStorage = [
          ...(parsedClients.companies || []),
          ...(parsedClients.individuals || []),
          ...(parsedClients.vendors || [])
        ];
        console.log('Initial load: Found clients in mokClients:', fromStorage.length);
        
        // Add any clients that aren't already in our list
        fromStorage.forEach(client => {
          if (!allClients.some(c => c.id === client.id)) {
            allClients.push(client);
          }
        });
      }
    } catch (e) {
      console.error('Error parsing mokClients:', e);
    }
    
    // Check if there's a selected client for invoice from the Clients page
    try {
      const selectedClientForInvoice = localStorage.getItem('selectedClientForInvoice');
      if (selectedClientForInvoice) {
        const client = JSON.parse(selectedClientForInvoice);
        console.log('Initial load: Found selected client for invoice');
        
        // If this client isn't already in our list, add it
        if (!allClients.some(c => c.id === client.id)) {
          allClients.push(client);
        }
      }
    } catch (e) {
      console.error('Error parsing selectedClientForInvoice:', e);
    }
    
    console.log('Initial load: Final client count:', allClients.length);
    return allClients;
  });
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  
  // Function to reload clients from localStorage
  const loadClientsFromStorage = useCallback(() => {
    // Start with an empty array - NO SAMPLE CLIENTS
    let allClients: Client[] = [];
    console.log('Loading clients: Starting with empty array');
    
    // Load REAL clients from localStorage using the same key as the Clients page
    try {
      // This is the storage key used in Clients.tsx
      const savedClients = localStorage.getItem('mokClients');
      if (savedClients) {
        const parsedClients = JSON.parse(savedClients);
        // Get all client types from storage
        const fromStorage = [
          ...(parsedClients.companies || []),
          ...(parsedClients.individuals || []),
          ...(parsedClients.vendors || [])
        ];
        console.log('Loading clients: Found real clients in mokClients:', fromStorage.length);
        
        // Use ONLY the clients from localStorage
        allClients = fromStorage;
      }
    } catch (e) {
      console.error('Error loading real clients:', e);
    }
    
    // Check if there's a selected client for invoice
    const selectedClientForInvoice = localStorage.getItem('selectedClientForInvoice');
    if (selectedClientForInvoice && !selectedClientId) {
      try {
        const client = JSON.parse(selectedClientForInvoice);
        setSelectedClientId(client.id);
        // Update the quote with this client
        setQuoteData(prev => ({
          ...prev,
          client: client
        }));
        // Clear the selected client from localStorage
        localStorage.removeItem('selectedClientForInvoice');
      } catch (e) {
        console.error('Error parsing selected client for invoice:', e);
      }
    }
    
    console.log('Loading clients: Final client count:', allClients.length);
    setClients(allClients);
  }, [selectedClientId, setQuoteData]);
  
  // Listen for changes to localStorage (clients added in the Clients page)
  useEffect(() => {
    // Initial load
    loadClientsFromStorage();
    
    // Add storage event listener to detect changes to client data
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mokClients' || e.key === 'clientData' || e.key === 'selectedClientForInvoice') {
        console.log('Client data changed in localStorage, reloading...');
        loadClientsFromStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes every 2 seconds (in case localStorage is modified in the same window)
    const intervalId = setInterval(loadClientsFromStorage, 2000);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [loadClientsFromStorage]);

  // Generate a unique quote number
  function generateQuoteNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `Q-${year}-${random}`;
  }

  // Helper to create a new item with the next sequential number
  // Reference to the table container for scrolling
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  const addNewItem = () => {
    try {
      // Create a new item with the next sequential item number
      const newItems = [
        ...quoteData.items,
        createNewQuoteItem(quoteData.items.length + 1)
      ];
      
      // Update the state with the new item
      setQuoteData({
        ...quoteData,
        items: newItems
      });
      
      // Notify user that the item was added successfully
      toast.success("New item added");
      
      // Scroll to the new item after the state update
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error adding new item:", error);
      toast.error("Failed to add new item");
    }
  };

  // Update client details when a client is selected
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    
    const selected = clients.find(client => client.id === clientId);
    if (selected) {
      setQuoteData({
        ...quoteData,
        client: {
          name: selected.name,
          address: selected.address,
          email: selected.email,
          phone: selected.phone
        }
      });
    }
  };

  // Update company data if changed from context or props
  useEffect(() => {
    // Only update if companyDetails is defined
    if (companyDetails) {
      // Store company data in shared storage for InvoiceForm to access
      syncCompanyData(companyDetails);
      
      // Then update our local state
      const companyData = getCompanyData(companyDetails);
      setQuoteData(prev => ({
        ...prev,
        company: companyData
      }));
    } else {
      // Provide default company data if companyDetails is undefined
      setQuoteData(prev => ({
        ...prev,
        company: {
          name: prev.company?.name || '',
          address: prev.company?.address || '',
          email: prev.company?.email || '',
          phone: prev.company?.phone || ''
        }
      }));
    }
  }, [companyDetails]);
  
  // No longer need event listeners since we're using CompanyContext directly

  // Update logo, stamp and signature if provided as props
  useEffect(() => {
    if (companyLogo || companyStamp || signature) {
      setQuoteData(prev => {
        // Create a deep copy to avoid mutating the previous state
        const newCompany = { ...prev.company } as any; // Use 'as any' to bypass type checking temporarily
        
        // Only update the fields that are provided and handle type compatibility
        if (companyLogo) {
          // Convert File to string URL if needed
          newCompany.logo = companyLogo instanceof File ? 
            URL.createObjectURL(companyLogo) : companyLogo;
        }
        
        if (companyStamp) {
          newCompany.stamp = companyStamp instanceof File ? 
            URL.createObjectURL(companyStamp) : companyStamp;
        }
        
        if (signature) {
          newCompany.signature = signature instanceof File ? 
            URL.createObjectURL(signature) : signature;
        }
        
        return {
          ...prev,
          company: newCompany
        };
      });
    }
  }, [companyLogo, companyStamp, signature]);

  // Update line item values and recalculate totals
  const updateItemValue = (index: number, field: string, value: any) => {
    const updatedItems = [...quoteData.items];
    
    // Update the specified field with the raw input value
    // This allows users to type decimal points (e.g., "23.")
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Get the current item values for calculation
    // When calculating, we need to handle incomplete decimal inputs (like "23.")
    const item = updatedItems[index];
    
    // Only parse for calculation, keeping original string values in the state
    const quantityStr = String(item.quantity || '');
    const quantity = quantityStr.endsWith('.') 
      ? parseFloat(quantityStr + '0') || 0 
      : parseFloat(quantityStr) || 0;
      
    const unitPriceStr = String(item.unitPrice || '');
    const unitPrice = unitPriceStr.endsWith('.') 
      ? parseFloat(unitPriceStr + '0') || 0 
      : parseFloat(unitPriceStr) || 0;
      
    const markupStr = String(item.markupPercentage || '');
    const markupPercentage = markupStr.endsWith('.') 
      ? parseFloat(markupStr + '0') || 0 
      : parseFloat(markupStr) || 0;
      
    const discountStr = String(item.discount || '');
    const discount = discountStr.endsWith('.') 
      ? parseFloat(discountStr + '0') || 0 
      : parseFloat(discountStr) || 0;
    
    // Calculate the line total with markup and discount
    const total = calculateLineItemTotal(quantity, unitPrice, markupPercentage, discount);
    updatedItems[index].total = total;
    
    // Update the quote data with the updated items
    setQuoteData({
      ...quoteData,
      items: updatedItems
    });
  };

  // Remove an item
  // Show delete confirmation dialog
  const confirmDeleteItem = (index: number) => {
    if (quoteData.items.length <= 1) {
      // Don't allow removing the last item
      toast.error("Cannot remove the last item");
      return;
    }
    
    // Set the item index to delete and open the confirmation dialog
    setItemToDelete(index);
    setIsDeleteDialogOpen(true);
  };
  
  // Remove item after confirmation
  const removeItem = () => {
    // Safety check
    if (itemToDelete === null || quoteData.items.length <= 1) {
      return;
    }
    
    const index = itemToDelete;
    const itemDescription = quoteData.items[index].description || `Item #${quoteData.items[index].itemNo}`;
    
    const updatedItems = quoteData.items.filter((_, i) => i !== index);
    
    // Re-number the items
    updatedItems.forEach((item, i) => {
      item.itemNo = i + 1;
    });
    
    // Update the state
    setQuoteData({
      ...quoteData,
      items: updatedItems
    });
    
    // Reset the item to delete
    setItemToDelete(null);
    
    // Show success notification
    toast.success(`Removed: ${itemDescription}`);
  };

  // Auto-calculate totals when items or VAT rate change
  useEffect(() => {
    // Calculate subtotal based on item totals, not the amount field
    const subtotal = quoteData.items.reduce((sum, item) => {
      // Ensure we're dealing with numbers for calculation
      const itemTotal = parseFloat(item.total as any) || 0;
      return sum + itemTotal;
    }, 0);
    
    // Calculate tax based on VAT rate (ensure vatRate is a number)
    const vatRate = parseFloat(quoteData.vatRate as any) || 0;
    const tax = subtotal * (vatRate / 100);
    
    // Calculate total
    const total = subtotal + tax;
    
    // Update the state without causing infinite loop
    setQuoteData(prev => {
      // Only update if values have changed to prevent infinite loop
      if (prev.subtotal !== subtotal || prev.tax !== tax || prev.total !== total) {
        return {
          ...prev,
          subtotal,
          tax,
          total
        };
      }
      return prev;
    });
  }, [quoteData.items, quoteData.vatRate]);

  // Calculate financial totals
  const calculateSubtotal = () => {
    return quoteData.items.reduce((sum, item) => {
      // Use the total field instead of amount
      return sum + (parseFloat(item.total as any) || 0);
    }, 0);
  };

  const calculateTax = () => {
    const vatRate = parseFloat(quoteData.vatRate as any) || 0;
    return calculateSubtotal() * (vatRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };
  
  // Format date for display (01 January 2000 format)
  const formatDisplayDate = (dateString: string) => {
    try {
      return formatQuoteDate(dateString);
    } catch (error) {
      return dateString;
    }
  };

  // State for tracking save button loading state
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const saveQuote = () => {
    if (!quoteData.client.name) {
      toast.error("Please select a client");
      return;
    }

    if (!quoteData.items.length || quoteData.items.every(item => !item.description)) {
      toast.error("Please add at least one item to your quote");
      return;
    }

    try {
      // Get existing saved quotes or initialize an empty array
      const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
      
      // Add a unique ID to the quote if it doesn't have one
      const quoteToSave = {
        ...quoteData,
        id: quoteData.id || `quote-${Date.now()}`,
        date: quoteData.issueDate,
        lastUpdated: new Date().toISOString()
      };
      
      if (isEditing && initialData?.id) {
        // If editing, find and update the existing quote
        const quoteIndex = savedQuotes.findIndex((q: any) => q.id === initialData.id);
        if (quoteIndex !== -1) {
          savedQuotes[quoteIndex] = quoteToSave;
          toast.success("Quote updated successfully!");
        } else {
          // If somehow the quote wasn't found, add as new
          savedQuotes.push(quoteToSave);
          toast.success("Quote saved as new copy!");
        }
      } else {
        // Add the new quote to the array
        savedQuotes.push(quoteToSave);
        toast.success("Quote saved successfully!");
      }
      
      // Save back to localStorage
      localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error("Failed to save quote. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
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
            <Select 
              defaultValue={selectedClientId} 
              value={selectedClientId} 
              onValueChange={handleSelectClient}
              onOpenChange={(open) => {
                if (open) {
                  // Force reload clients when dropdown is opened
                  console.log('Dropdown opened, forcing client reload');
                  const savedClients = localStorage.getItem('mokClients');
                  if (savedClients) {
                    try {
                      const parsedClients = JSON.parse(savedClients);
                      const allClients = [
                        ...(parsedClients.companies || []),
                        ...(parsedClients.individuals || []),
                        ...(parsedClients.vendors || [])
                      ];
                      console.log('Reloaded clients on dropdown open:', allClients.length);
                      setClients(allClients);
                    } catch (e) {
                      console.error('Error parsing clients on dropdown open:', e);
                    }
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {clients.length > 0 ? (
                  <>
                    {clients.filter(client => client.type === 'company').length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Companies</SelectLabel>
                        {clients.filter(client => client.type === 'company').map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-500" />
                              <span>{client.name}</span>
                              {client.contactPerson && (
                                <span className="text-xs text-gray-500 ml-1">({client.contactPerson})</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    
                    {clients.filter(client => client.type === 'individual').length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Individuals</SelectLabel>
                        {clients.filter(client => client.type === 'individual').map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-green-500" />
                              <span>{client.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    
                    {clients.filter(client => client.type === 'vendor').length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Vendors</SelectLabel>
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
                size="sm" 
                onClick={addNewItem} 
                className="mt-2" 
                type="button"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            
            <div 
              ref={tableContainerRef}
              className="border rounded-md overflow-x-auto" 
              style={{ maxHeight: '400px', position: 'relative' }}
            >
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] bg-gray-50 sticky left-0 z-20">Item No.</TableHead>
                    <TableHead className="w-[300px]">Description</TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Amount (R)</TableHead>
                    <TableHead className="w-[120px]">Mark Up %</TableHead>
                    <TableHead className="w-[120px]">Discount %</TableHead>
                    <TableHead className="w-[150px]">Total (R)</TableHead>
                    <TableHead className="w-[80px] bg-gray-50 sticky right-0 z-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="bg-gray-50 sticky left-0 z-10">{item.itemNo}</TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItemValue(index, 'description', e.target.value)}
                          className="min-w-[280px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => {
                            // Allow empty input or valid numbers with decimal points
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              updateItemValue(index, 'quantity', value);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.unitPrice}
                          onChange={(e) => {
                            // Allow empty input or valid numbers including decimals
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              updateItemValue(index, 'unitPrice', value);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.markupPercentage !== undefined ? item.markupPercentage : ''}
                          onChange={(e) => {
                            // Allow empty input or valid percentage numbers
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              updateItemValue(index, 'markupPercentage', value);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.discount !== undefined ? item.discount : ''}
                          onChange={(e) => {
                            // Allow empty input or valid percentage numbers
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              updateItemValue(index, 'discount', value);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(Number.isNaN(item.total) ? 0 : item.total, "ZAR")}
                      </TableCell>
                      <TableCell className="bg-gray-50 sticky right-0 z-10">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDeleteItem(index)}
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
            {/* Buttons moved to the bottom of the form */}
          </div>
          
          {/* Totals */}
          <div className="flex flex-col items-end space-y-2 mt-6">
            <div className="grid grid-cols-2 gap-4 w-full sm:w-2/3 md:w-1/3">
              <Label className="text-right">Subtotal:</Label>
              <p className="font-medium">{formatCurrency(Number.isNaN(quoteData.subtotal) ? 0 : quoteData.subtotal, "ZAR")}</p>
              
              <div className="text-right flex items-center justify-end">
                <Label htmlFor="vatRate" className="mr-2">VAT %:</Label>
                <Input
                  id="vatRate"
                  className="w-16"
                  type="text"
                  value={quoteData.vatRate !== undefined ? quoteData.vatRate : ''}
                  onChange={(e) => {
                    // Allow empty input or valid percentage numbers
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setQuoteData({...quoteData, vatRate: value === '' ? 0 : parseFloat(value) || 0});
                    }
                  }}
                />
              </div>
              <p className="font-medium">{formatCurrency(Number.isNaN(quoteData.tax) ? 0 : quoteData.tax, "ZAR")}</p>
              
              <Label className="text-right font-bold">Total:</Label>
              <p className="font-bold">{formatCurrency(Number.isNaN(quoteData.total) ? 0 : quoteData.total, "ZAR")}</p>
            </div>
          </div>
          
          {/* Footer Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="mb-1">
                <Label htmlFor="terms">Terms</Label>
              </div>
              <Textarea
                id="terms"
                placeholder="Payment terms, deadlines, etc."
                rows={4}
                value={quoteData.terms || ""}
                onChange={(e) => {
                  const newTerms = e.target.value;
                  // Update state
                  setQuoteData({...quoteData, terms: newTerms});
                  // Save to localStorage for future quotes and invoices
                  saveQuoteTerms(newTerms);
                }}
              />
            </div>
            <div>
              <div className="mb-1">
                <Label htmlFor="bankingDetails">Banking Details</Label>
              </div>
              <Textarea
                id="bankingDetails"
                placeholder="Bank name, account number, etc."
                rows={4}
                value={quoteData.bankingDetails || ""}
                onChange={(e) => {
                  const newBankingDetails = e.target.value;
                  // Update state
                  setQuoteData({...quoteData, bankingDetails: newBankingDetails});
                  // Save to localStorage for future quotes and invoices
                  saveBankingDetails(newBankingDetails);
                }}
              />
            </div>
            <div>
              <div className="mb-1">
                <Label htmlFor="notes">Notes</Label>
              </div>
              <Textarea
                id="notes"
                placeholder="Additional information or special comments"
                rows={4}
                value={quoteData.notes || ""}
                onChange={(e) => {
                  const newNotes = e.target.value;
                  // Update state
                  setQuoteData({...quoteData, notes: newNotes});
                  // Save to localStorage for future quotes and invoices
                  saveQuoteNotes(newNotes);
                }}
              />
            </div>
          </div>
          
          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the item from your quote. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={removeItem}
                  className="bg-red-500 hover:bg-red-700 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Save Button */}
          <div className="flex justify-end space-x-2 mt-6">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
            )}
            {isEditing && !isSaving && (
              <Button
                onClick={() => {
                  // Save the quote for invoice conversion
                  const success = saveQuoteForInvoiceConversion(quoteData);
                  if (success) {
                    toast.success(
                      "Quote ready for invoice conversion. Go to Invoices tab and select 'Create from Quote'."
                    );
                    // Set localStorage flag to indicate a quote is ready for conversion
                    localStorage.setItem('quote_ready_for_invoice', 'true');
                  } else {
                    toast.error("Failed to prepare quote for invoice conversion");
                  }
                }}
                variant="secondary"
              >
                Convert to Invoice
              </Button>
            )}
            <Button 
              onClick={saveQuote}
              disabled={isSaving}
              className="relative"
            >
              {isEditing ? 'Update Quote' : 'Save Quote'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuoteForm;
