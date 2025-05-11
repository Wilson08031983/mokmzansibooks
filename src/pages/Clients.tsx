import { useState, useEffect, useCallback, useRef } from "react";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
// Import our new super persistent storage adapter
import { loadClientsState, saveClientsState, addClient, updateClient, deleteClient } from "@/utils/clientStorageAdapter";
import { Client, CompanyClient, IndividualClient, VendorClient, isCompanyClient, isVendorClient, isIndividualClient, hasContactPerson } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  User, 
  Truck, 
  Search, 
  PlusCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  DollarSign,
  MoreVertical,
  FileText,
  Edit,
  Trash,
  Receipt
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { useNotifications, Notification } from "@/contexts/NotificationsContext";
import { useI18n } from "@/contexts/I18nContext";
import ClientDataProtection from "@/components/clients/ClientDataProtection";

// Type for client state management
interface ClientsState {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}

// Production: Empty initialization for client data structure
const emptyClients = {
  companies: [],
  individuals: [],
  vendors: []
};

// Safe data loading utility function
const getSafeClientData = async (): Promise<ClientsState> => {
  try {
    const clientsState = await loadClientsState();
    return clientsState || emptyClients;
  } catch (error) {
    console.error('Error in getSafeClientData:', error);
    return emptyClients;
  }
};

// Client action buttons component for reuse across all client cards
const ClientActions = ({ client, onEdit, onDelete, onCredit, onCreateInvoice }: { 
  client: Client, 
  onEdit?: (client: Client) => void, 
  onDelete?: (client: Client) => void,
  onCredit: (client: Client) => void,
  onCreateInvoice?: (client: Client) => void
}) => {
  return (
    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0" 
        title="Edit Client"
        onClick={() => onEdit?.(client)}
      >
        <Edit className="h-4 w-4 text-blue-500" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0" 
        title="Manage Credit"
        onClick={() => onCredit(client)}
      >
        <CreditCard className="h-4 w-4 text-green-500" />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            title="More Options"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => onCreateInvoice?.(client)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Receipt className="h-4 w-4 text-blue-500" />
            <span>Create Invoice</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete?.(client)}
            className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500"
          >
            <Trash className="h-4 w-4" />
            <span>Delete Client</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const Clients = () => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { currency } = useI18n();
  
  // State for managing clients data - use the ref pattern to ensure we get fresh state in callbacks
  const [clients, setClients] = useState<ClientsState>(emptyClients);
  
  // Use a ref to keep track of the current clients state
  const clientsRef = useRef(clients);
  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("companies");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editClientData, setEditClientData] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  // Function to handle creating a new invoice for a client
  const handleCreateInvoice = (client: Client) => {
    console.log('Creating invoice for client:', client.name);
    
    // Store the selected client in localStorage for use in the invoice creation page
    // Using a specific key for the invoice creation flow
    localStorage.setItem('selectedClientForInvoice', JSON.stringify(client));
    
    // Also store that we want to create a new invoice (vs. editing an existing one)
    localStorage.setItem('invoiceAction', 'create');
    
    // Store a flag to automatically select the createInvoice tab
    localStorage.setItem('activeInvoiceTab', 'createInvoice');
    
    // Make sure Ryzen client is also added to the clients list if it doesn't exist
    try {
      const ryzenClient = {
        id: "ryzen-client", 
        name: "Ryzen (PTY) LTD", 
        address: "12 Mark Str", 
        email: "them@ryzen.com", 
        phone: "0762458759", 
        type: "company" as const,
        city: "Tshwane",
        province: "Gauteng",
        postalCode: "0006",
        credit: 3000,
        outstanding: 0,
        overdue: 0,
        contactPerson: "Tom Mark",
        lastInteraction: new Date().toISOString().split('T')[0] // Add today's date
      };
      
      // Ensure Ryzen client exists in state and localStorage
      if (!clients.companies.some(c => c.id === ryzenClient.id)) {
        console.log('Adding Ryzen client to the database');
        // Add to in-memory state
        setClients(prev => ({
          ...prev,
          companies: [...prev.companies, ryzenClient]
        }));
      }
    } catch (error) {
      console.error('Error ensuring Ryzen client exists:', error);
    }
    
    // Show success notification
    toast({
      title: "Creating New Invoice",
      description: `Preparing invoice for ${client.name}`,
      variant: "default"
    });
    
    // Add system notification
    addNotification({
      title: "New Invoice Started",
      message: `Creating new invoice for ${client.name}`,
      type: "info"
    });
    
    // Redirect to the Invoice/Quote Manager with the invoice tab selected
    window.location.href = '/dashboard/invoices';
  };
  const [clientCount, setClientCount] = useState({
    companies: 0,
    individuals: 0,
    vendors: 0,
    all: 0
  });

  // Type for new client form data including common fields and optional type-specific fields
  type NewClientFormData = {
    name: string;
    email: string;
    phone: string;
    address: string;
    addressLine2?: string;
    city: string;
    province: string;
    postalCode: string;
    type: "company" | "individual" | "vendor";
    credit: number;
    outstanding: number;
    overdue: number;
    lastInteraction?: string;
    contactPerson?: string; // Only required for company and vendor types
  };
  
  const [newClientData, setNewClientData] = useState<NewClientFormData>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    type: "company",
    credit: 0,
    outstanding: 0,
    overdue: 0,
    lastInteraction: "",
  });

  // Load clients data with useEffect to avoid render-phase state updates
  useEffect(() => {
    let mounted = true;
    
    const loadAllClients = async () => {
      try {
        // Load from persistent storage with all fallbacks
        console.log('Loading clients from persistent storage...');
        const clientsState = await loadClientsState();
        
        // Only update state if the component is still mounted
        if (!mounted) return;
        
        if (clientsState && (
          clientsState.companies.length > 0 || 
          clientsState.individuals.length > 0 || 
          clientsState.vendors.length > 0
        )) {
          setClients(clientsState);
          console.log(`Loaded clients successfully: ${clientsState.companies.length} companies, ${clientsState.individuals.length} individuals, ${clientsState.vendors.length} vendors`);
        } else {
          console.log('No clients found in persistent storage');
        }
      } catch (error) {
        console.error('Error loading clients:', error);
        if (mounted) {
          toast({
            title: "Error Loading Clients",
            description: "There was a problem loading your client data.",
            variant: "destructive"
          });
        }
      }
    };
    
    loadAllClients();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      mounted = false;
    };
  }, [toast]);

  // Update client counts whenever clients state changes
  useEffect(() => {
    const counts = {
      companies: clients.companies.length,
      individuals: clients.individuals.length,
      vendors: clients.vendors.length,
      all: clients.companies.length + clients.individuals.length + clients.vendors.length,
    };
    setClientCount(counts);
  }, [clients]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewClientData({
      ...newClientData,
      [name]: value,
    });
  };

  const openCreditDialog = (client: Client) => {
    setSelectedClient(client);
    setCreditAmount("");
    setIsCreditDialogOpen(true);
  };
  
  const openEditDialog = (client: Client) => {
    setEditClientData({...client});
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editClientData) {
      setEditClientData({
        ...editClientData,
        [name]: value,
      });
    }
  };
  
  const handleEditClient = () => {
    if (!editClientData) return;
    
    // Validation
    if (!editClientData.name || !editClientData.email) {
      toast({
        title: "Missing information",
        description: "Name and email are required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Update lastInteraction date
    const updatedClient = {
      ...editClientData,
      lastInteraction: getCurrentFormattedDate()
    };
    
    // Update the client in the appropriate category in the state
    setClients(current => {
      const updatedState = { ...current };
      
      if (updatedClient.type === 'company') {
        updatedState.companies = current.companies.map(c => 
          c.id === updatedClient.id ? updatedClient as CompanyClient : c
        );
      } else if (updatedClient.type === 'individual') {
        updatedState.individuals = current.individuals.map(c => 
          c.id === updatedClient.id ? updatedClient as IndividualClient : c
        );
      } else if (updatedClient.type === 'vendor') {
        updatedState.vendors = current.vendors.map(c => 
          c.id === updatedClient.id ? updatedClient as VendorClient : c
        );
      }
      
      return updatedState;
    });
    
    // Close dialog and show success message
    setIsEditDialogOpen(false);
    
    toast({
      title: "Client updated",
      description: `${editClientData.name} has been updated successfully.`,
    });
    
    // Add notification
    if (addNotification) {
      addNotification({
        title: "Client Updated",
        message: `${editClientData.name} has been updated successfully.`,
        type: "success",
      } as Notification);
    }
  };

  const handleDeleteClient = () => {
    if (!clientToDelete) return;
    
    // Remove the client from the appropriate category in the state
    setClients(current => {
      const updatedState = { ...current };
      
      if (clientToDelete.type === 'company') {
        updatedState.companies = current.companies.filter(c => c.id !== clientToDelete.id);
      } else if (clientToDelete.type === 'individual') {
        updatedState.individuals = current.individuals.filter(c => c.id !== clientToDelete.id);
      } else if (clientToDelete.type === 'vendor') {
        updatedState.vendors = current.vendors.filter(c => c.id !== clientToDelete.id);
      }
      
      return updatedState;
    });
    
    // Close dialog and show success message
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Client deleted",
      description: `${clientToDelete.name} has been deleted successfully.`,
    });
    
    // Add notification
    if (addNotification) {
      addNotification({
        title: "Client Deleted",
        message: `${clientToDelete.name} has been deleted successfully.`,
        type: "info",
      } as Notification);
    }
    
    // Reset client to delete
    setClientToDelete(null);
  };

  const handleCreditSubmit = () => {
    const amount = parseFloat(creditAmount);
    if (!creditAmount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid credit amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedClient) return;
    
    // Get current date for lastInteraction
    const currentDate = getCurrentFormattedDate();
    
    // Update client credit in the state
    setClients(current => {
      const updatedState = { ...current };
      
      if (selectedClient.type === 'company') {
        updatedState.companies = current.companies.map(c => 
          c.id === selectedClient.id 
            ? { ...c, credit: c.credit + amount, lastInteraction: currentDate } as CompanyClient 
            : c
        );
      } else if (selectedClient.type === 'individual') {
        updatedState.individuals = current.individuals.map(c => 
          c.id === selectedClient.id 
            ? { ...c, credit: c.credit + amount, lastInteraction: currentDate } as IndividualClient 
            : c
        );
      } else if (selectedClient.type === 'vendor') {
        updatedState.vendors = current.vendors.map(c => 
          c.id === selectedClient.id 
            ? { ...c, credit: c.credit + amount, lastInteraction: currentDate } as VendorClient 
            : c
        );
      }
      
      return updatedState;
    });

    toast({
      title: "Credit added",
      description: `${currency}${amount} credit has been added to ${selectedClient.name}.`,
    });

    if (addNotification) {
      addNotification({
        title: "Credit Added",
        message: `${currency}${amount} credit has been added to ${selectedClient.name}.`,
        type: "success",
      } as Notification);
    }

    setIsCreditDialogOpen(false);
    setSelectedClient(null);
    setCreditAmount("");
  };

  // Save client state with super persistent storage
  useEffect(() => {
    const persistClients = async () => {
      try {
        // Only save if we have clients to save
        if (clients.companies.length > 0 || clients.individuals.length > 0 || clients.vendors.length > 0) {
          console.log(`Saving clients to super persistent storage: ${clients.companies.length} companies, ${clients.individuals.length} individuals, ${clients.vendors.length} vendors`);
          await saveClientsState(clients);
        }
      } catch (error) {
        console.error('Error saving clients:', error);
        toast({
          title: "Error Saving",
          description: "There was a problem saving your client data.",
          variant: "destructive"
        });
      }
    };
    
    persistClients();
  }, [clients, toast]);

  const filteredClients = useCallback((type: string) => {
    // Always use the current clients ref to ensure we have the latest data
    const currentClients = clientsRef.current;
    let clientsList: Client[] = [];
    console.log('Filtering clients for type:', type);
    console.log('Current clients state from ref:', currentClients);
    
    switch (type) {
      case "companies":
        clientsList = currentClients.companies;
        break;
      case "individuals":
        clientsList = currentClients.individuals;
        break;
      case "vendors":
        clientsList = currentClients.vendors;
        break;
      default:
        clientsList = [
          ...currentClients.companies,
          ...currentClients.individuals,
          ...currentClients.vendors,
        ];
    }
    
    if (!searchTerm) return clientsList;
    
    return clientsList.filter(client => {
      const baseMatch = (
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Only check contactPerson for company and vendor client types
      let contactPersonMatch = false;
      if (isCompanyClient(client) || isVendorClient(client)) {
        contactPersonMatch = client.contactPerson && 
          client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      return baseMatch || contactPersonMatch;
    });
  }, [searchTerm, clients]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getCurrentFormattedDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const getClientIcon = (type: Client["type"]) => {
    switch (type) {
      case "company":
        return <Building2 className="h-10 w-10 text-blue-500" />;
      case "individual":
        return <User className="h-10 w-10 text-green-500" />;
      case "vendor":
        return <Truck className="h-10 w-10 text-amber-500" />;
      default:
        return <Building2 className="h-10 w-10 text-gray-500" />;
    }
  };

  const handleAddClient = () => {
    // Add debug console logs
    console.log('handleAddClient called');
    console.log('newClientData:', newClientData);
    
    // Basic form validation
    if (!newClientData.name) {
      toast({
        title: "Error",
        description: "Please enter a client name",
        variant: "destructive"
      });
      return;
    }
    
    if (!newClientData.email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    // Generate a unique ID and timestamp for the new client
    const id = `client-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const formattedDate = getCurrentFormattedDate();
    
    // Process client data based on type
    if (newClientData.type === 'company') {
      // Create a company client - requires contactPerson
      if (!newClientData.contactPerson) {
        toast({
          title: "Error",
          description: "Company clients require a contact person",
          variant: "destructive"
        });
        return;
      }
      
      const companyClient: CompanyClient = {
        id,
        name: newClientData.name,
        contactPerson: newClientData.contactPerson,
        email: newClientData.email,
        phone: newClientData.phone,
        address: newClientData.address,
        addressLine2: newClientData.addressLine2,
        city: newClientData.city,
        province: newClientData.province,
        postalCode: newClientData.postalCode,
        type: "company",
        credit: newClientData.credit,
        outstanding: newClientData.outstanding,
        overdue: newClientData.overdue,
        lastInteraction: formattedDate
      };
      
      setClients(prev => ({
        ...prev,
        companies: [...prev.companies, companyClient]
      }));
    } else if (newClientData.type === 'individual') {
      // Create an individual client - doesn't need contactPerson
      const individualClient: IndividualClient = {
        id,
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        address: newClientData.address,
        addressLine2: newClientData.addressLine2,
        city: newClientData.city,
        province: newClientData.province,
        postalCode: newClientData.postalCode,
        type: "individual",
        credit: newClientData.credit,
        outstanding: newClientData.outstanding,
        overdue: newClientData.overdue,
        lastInteraction: formattedDate
      };
      
      setClients(prev => ({
        ...prev,
        individuals: [...prev.individuals, individualClient]
      }));
    } else if (newClientData.type === 'vendor') {
      // Create a vendor client - requires contactPerson
      if (!newClientData.contactPerson) {
        toast({
          title: "Error",
          description: "Vendor clients require a contact person",
          variant: "destructive"
        });
        return;
      }
      
      const vendorClient: VendorClient = {
        id,
        name: newClientData.name,
        contactPerson: newClientData.contactPerson,
        email: newClientData.email,
        phone: newClientData.phone,
        address: newClientData.address,
        addressLine2: newClientData.addressLine2,
        city: newClientData.city,
        province: newClientData.province,
        postalCode: newClientData.postalCode,
        type: "vendor",
        credit: newClientData.credit,
        outstanding: newClientData.outstanding,
        overdue: newClientData.overdue,
        lastInteraction: formattedDate
      };
      
      setClients(prev => ({
        ...prev,
        vendors: [...prev.vendors, vendorClient]
      }));
    }
    
    // Update client count after adding a new client
    setClientCount(prev => {
      let updatedCount = {...prev};
      
      if (newClientData.type === 'company') {
        updatedCount.companies += 1;
      } else if (newClientData.type === 'individual') {
        updatedCount.individuals += 1;
      } else if (newClientData.type === 'vendor') {
        updatedCount.vendors += 1;
      }
      
      updatedCount.all = updatedCount.companies + updatedCount.individuals + updatedCount.vendors;
      return updatedCount;
    });
    
    // Show success notification
    toast({
      title: "Client added",
      description: `${newClientData.name} has been added successfully.`,
    });
    
    // Add notification if available
    if (addNotification) {
      addNotification({
        title: "New Client Added",
        message: `${newClientData.name} has been added to your clients.`,
        type: "success",
      } as Notification);
    }
    
    // Reset the form and close the dialog
    setIsDialogOpen(false);
    setNewClientData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      addressLine2: "",
      city: "",
      province: "",
      postalCode: "",
      type: "company",
      credit: 0,
      outstanding: 0,
      overdue: 0,
      lastInteraction: ""
    });
  };

  const resetClients = () => {
    const initialState = {
      companies: [],
      individuals: [],
      vendors: []
    };
    setClients(initialState);
  };

  useEffect(() => {
    const overdueClients = [
      ...clients.companies,
      ...clients.individuals,
      ...clients.vendors,
    ].filter((client) => client.overdue > 0);

    if (overdueClients.length > 0 && addNotification) {
      addNotification({
        title: "Overdue Accounts",
        message: `${overdueClients.length} clients have overdue payments.`,
        type: "warning",
      } as Notification);
    }
  }, [addNotification]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-500">
            Manage your companies, individuals, and vendors
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-brand-purple hover:bg-brand-purple/80 font-semibold shadow-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Enter the details of the new client below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientType" className="text-right">
                  Type
                </Label>
                <select
                  id="type"
                  name="type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newClientData.type}
                  onChange={handleInputChange}
                >
                  <option value="company">Company</option>
                  <option value="individual">Individual</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  className="col-span-3"
                  value={newClientData.name}
                  onChange={handleInputChange}
                />
              </div>
              {newClientData.type !== "individual" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactPerson" className="text-right">
                    Contact Person
                  </Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    className="col-span-3"
                    value={newClientData.contactPerson}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="col-span-3"
                  value={newClientData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  className="col-span-3"
                  value={newClientData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Street address"
                  className="col-span-3"
                  value={newClientData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="addressLine2" className="text-right">
                  Address Line 2
                </Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  placeholder="Apt, Suite, Unit, etc."
                  className="col-span-3"
                  value={newClientData.addressLine2}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  className="col-span-3"
                  value={newClientData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="province" className="text-right">
                  Province
                </Label>
                <Input
                  id="province"
                  name="province"
                  className="col-span-3"
                  value={newClientData.province}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postalCode" className="text-right">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  className="col-span-3"
                  value={newClientData.postalCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="initialCredit" className="text-right">
                  Initial Credit
                </Label>
                <Input
                  id="credit"
                  name="credit"
                  type="number"
                  min="0"
                  className="col-span-3"
                  value={newClientData.credit}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button variant="default" onClick={handleAddClient}>Add Client</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Client Data Protection Component */}
      <div className="mb-4">
        <ClientDataProtection 
          clientCount={clientCount.all}
          onDataRestored={() => {
            // Use a non-async function to match the interface but handle async operations inside
            (async () => {
              try {
                const refreshedData = await getSafeClientData();
                setClients(refreshedData);
                
                // Show success notification
                toast({
                  title: "Client Data Restored",
                  description: "Your client data has been successfully restored.",
                  variant: "success"
                });
              } catch (error) {
                console.error('Error refreshing client data:', error);
                
                toast({
                  title: "Error Restoring Data",
                  description: "There was a problem restoring your client data.",
                  variant: "destructive"
                });
              }
              // Client counts will be updated via the useEffect that watches clients
            })(); // Immediately invoke the async function
          }}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4 flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Card>
            <CardContent className="p-4">
              <Tabs
                defaultValue="companies"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex flex-col gap-2 mb-4 h-auto">
                  <TabsTrigger value="companies" className="flex items-center justify-start h-12 text-xs sm:text-sm w-full">
                    <Building2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Companies ({clientCount.companies})</span>
                  </TabsTrigger>
                  <TabsTrigger value="individuals" className="flex items-center justify-start h-12 text-xs sm:text-sm w-full">
                    <User className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Individuals ({clientCount.individuals})</span>
                  </TabsTrigger>
                  <TabsTrigger value="vendors" className="flex items-center justify-start h-12 text-xs sm:text-sm w-full">
                    <Truck className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Vendors ({clientCount.vendors})</span>
                  </TabsTrigger>
                </TabsList>
              
                <div className="hidden">
                  <TabsContent value="companies">
                    {/* Content hidden but needed for proper structure */}
                  </TabsContent>
                  <TabsContent value="individuals">
                    {/* Content hidden but needed for proper structure */}
                  </TabsContent>
                  <TabsContent value="vendors">
                    {/* Content hidden but needed for proper structure */}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="companies" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Companies ({clientCount.companies})</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    {filteredClients("companies").length > 0 ? (
                      filteredClients("companies").map((client) => (
                        <div
                          key={client.id}
                          className="p-5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors relative group"
                        >
                          <ClientActions 
                            client={client}
                            onCredit={openCreditDialog}
                            onEdit={openEditDialog}
                            onDelete={openDeleteDialog}
                            onCreateInvoice={handleCreateInvoice}
                          />
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 flex-shrink-0">
                              {getClientIcon(client.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-lg font-medium">{client.name}</h3>
                              </div>
                              
                              {hasContactPerson(client) && (
                                <p className="text-sm text-gray-600 mb-3">
                                  Contact: {isCompanyClient(client) || isVendorClient(client) ? client.contactPerson : ''}
                                </p>
                              )}
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{client.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span>{client.phone}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{client.address}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span>Last interaction: {client.lastInteraction ? formatDate(client.lastInteraction) : 'N/A'}</span>
                                </div>
                              </div>
                              
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                {client.credit > 0 && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    Credit: {formatCurrency(client.credit)}
                                  </Badge>
                                )}
                                {client.overdue > 0 && (
                                  <Badge variant="destructive">
                                    Overdue: {formatCurrency(client.overdue)}
                                  </Badge>
                                )}
                                {client.outstanding > 0 && client.overdue === 0 && (
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    Outstanding: {formatCurrency(client.outstanding)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No companies found matching your search
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="individuals" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Individuals ({clientCount.individuals})</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    {filteredClients("individuals").length > 0 ? (
                      filteredClients("individuals").map((client) => (
                        <div
                          key={client.id}
                          className="p-5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors relative group"
                        >
                          <ClientActions 
                            client={client}
                            onCredit={openCreditDialog}
                            onEdit={openEditDialog}
                            onDelete={openDeleteDialog}
                          />
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 flex-shrink-0">
                              {getClientIcon(client.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-medium truncate">{client.name}</h3>
                                  {client.overdue > 0 && (
                                    <Badge variant="overdue">Overdue: {formatCurrency(client.overdue)}</Badge>
                                  )}
                                  {client.outstanding > 0 && client.overdue === 0 && (
                                    <Badge variant="outstanding">Outstanding: {formatCurrency(client.outstanding)}</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="mr-1 h-4 w-4" />
                                    Last interaction: {client.lastInteraction ? formatDate(client.lastInteraction) : 'N/A'}
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => openCreditDialog(client)}
                                    className="ml-2"
                                  >
                                    <CreditCard className="mr-1 h-4 w-4" /> Add Credit
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-2 flex flex-col md:flex-row md:items-center gap-y-1 gap-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Mail className="mr-1 h-4 w-4" />
                                  {client.email}
                                </div>
                                <div className="flex items-center">
                                  <Phone className="mr-1 h-4 w-4" />
                                  {client.phone}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{client.address}</span>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="credit" className="flex items-center">
                                  <DollarSign className="mr-1 h-3 w-3" /> 
                                  Credit: {formatCurrency(client.credit)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No individuals found matching your search
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vendors" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vendors ({clientCount.vendors})</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    {filteredClients("vendors").length > 0 ? (
                      filteredClients("vendors").map((client) => (
                        <div
                          key={client.id}
                          className="p-5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors relative group"
                        >
                          <ClientActions 
                            client={client}
                            onCredit={openCreditDialog}
                            onEdit={openEditDialog}
                            onDelete={openDeleteDialog}
                          />
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 flex-shrink-0">
                              {getClientIcon(client.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-lg font-medium">{client.name}</h3>
                              </div>
                              
                              {hasContactPerson(client) && (
                                <p className="text-sm text-gray-600">
                                  Contact: {isCompanyClient(client) || isVendorClient(client) ? client.contactPerson : ''}
                                </p>
                              )}
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{client.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span>{client.phone}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{client.address}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                                  <span>Last interaction: {client.lastInteraction ? formatDate(client.lastInteraction) : 'N/A'}</span>
                                </div>
                              </div>
                              
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                {client.credit > 0 && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    Credit: {formatCurrency(client.credit)}
                                  </Badge>
                                )}
                                {client.overdue > 0 && (
                                  <Badge variant="destructive">
                                    Overdue: {formatCurrency(client.overdue)}
                                  </Badge>
                                )}
                                {client.outstanding > 0 && client.overdue === 0 && (
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    Outstanding: {formatCurrency(client.outstanding)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No vendors found matching your search
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Credit</DialogTitle>
            <DialogDescription>
              Add credit to {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="creditAmount" className="text-right">
                Amount ({currency})
              </Label>
              <Input
                id="creditAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="col-span-3"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
            {selectedClient && (
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium">Client Information:</p>
                <div className="flex justify-between text-sm">
                  <span>Current Credit:</span>
                  <span className="font-medium">{formatCurrency(selectedClient.credit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Outstanding Balance:</span>
                  <span className="font-medium">{formatCurrency(selectedClient.outstanding)}</span>
                </div>
                {selectedClient.overdue > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Overdue Amount:</span>
                    <span className="font-medium">{formatCurrency(selectedClient.overdue)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreditSubmit}>
              Add Credit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update the details of {editClientData?.name}
            </DialogDescription>
          </DialogHeader>
          {editClientData && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Type
                </Label>
                <select
                  id="edit-type"
                  name="type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editClientData.type}
                  onChange={handleEditClientChange}
                >
                  <option value="company">Company</option>
                  <option value="individual">Individual</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  className="col-span-3"
                  value={editClientData.name}
                  onChange={handleEditClientChange}
                />
              </div>
              {editClientData.type !== "individual" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-contactPerson" className="text-right">
                    Contact Person
                  </Label>
                  <Input
                    id="edit-contactPerson"
                    name="contactPerson"
                    className="col-span-3"
                    value={(editClientData as CompanyClient | VendorClient).contactPerson || ''}
                    onChange={handleEditClientChange}
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  className="col-span-3"
                  value={editClientData.email}
                  onChange={handleEditClientChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  className="col-span-3"
                  value={editClientData.phone}
                  onChange={handleEditClientChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  Address
                </Label>
                <Input
                  id="edit-address"
                  name="address"
                  className="col-span-3"
                  value={editClientData.address}
                  onChange={handleEditClientChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-city" className="text-right">
                  City
                </Label>
                <Input
                  id="edit-city"
                  name="city"
                  className="col-span-3"
                  value={editClientData.city}
                  onChange={handleEditClientChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-province" className="text-right">
                  Province
                </Label>
                <Input
                  id="edit-province"
                  name="province"
                  className="col-span-3"
                  value={editClientData.province}
                  onChange={handleEditClientChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-postalCode" className="text-right">
                  Postal Code
                </Label>
                <Input
                  id="edit-postalCode"
                  name="postalCode"
                  className="col-span-3"
                  value={editClientData.postalCode}
                  onChange={handleEditClientChange}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditClient}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {clientToDelete && (
            <div className="py-4">
              <div className="p-4 border border-red-100 bg-red-50 rounded-md mb-4">
                <h3 className="font-medium text-red-900">{clientToDelete.name}</h3>
                <p className="text-sm text-red-700 mt-1">
                  Type: {clientToDelete.type.charAt(0).toUpperCase() + clientToDelete.type.slice(1)}
                </p>
                <p className="text-sm text-red-700">
                  Email: {clientToDelete.email}
                </p>
                {clientToDelete.credit > 0 && (
                  <p className="text-sm font-medium text-red-700 mt-2">
                    Warning: This client has {formatCurrency(clientToDelete.credit)} in available credit.
                  </p>
                )}
                {clientToDelete.outstanding > 0 && (
                  <p className="text-sm font-medium text-red-700 mt-1">
                    Warning: This client has {formatCurrency(clientToDelete.outstanding)} in outstanding balance.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteClient}
            >
              Delete Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Wrap the component with the error boundary for production safety
const ClientsWithErrorBoundary: React.FC = () => (
  <ClientErrorBoundary>
    <Clients />
  </ClientErrorBoundary>
);

export default ClientsWithErrorBoundary;
