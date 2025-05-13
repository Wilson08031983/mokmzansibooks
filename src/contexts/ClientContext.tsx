
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { Client, CompanyClient, IndividualClient, VendorClient, ClientsState } from "@/types/client";
import { getSafeClientData, setSafeClientData } from "@/utils/clientDataPersistence";

// Define the interface for the client context
interface ClientContextProps {
  clients: ClientsState;
  isLoading: boolean;
  addClient: (client: Partial<Client>) => Promise<boolean>;
  updateClient: (id: string, updatedClient: Partial<Client>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  // Specific client type functions
  addCompanyClient: (client: Partial<CompanyClient>) => Promise<boolean>;
  addIndividualClient: (client: Partial<IndividualClient>) => Promise<boolean>;
  addVendorClient: (client: Partial<VendorClient>) => Promise<boolean>;
  // Helper getters
  getClientById: (id: string) => Client | undefined;
  getAllClients: () => Client[];
  getCompanyClients: () => CompanyClient[];
  getIndividualClients: () => IndividualClient[];
  getVendorClients: () => VendorClient[];
}

const ClientContext = createContext<ClientContextProps | undefined>(undefined);

// Default empty state
const defaultState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<ClientsState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load clients from storage on mount
  useEffect(() => {
    try {
      const savedClients = getSafeClientData();
      setClients(savedClients);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast({
        title: "Error",
        description: "Failed to load client data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Save clients whenever they change
  useEffect(() => {
    if (!isLoading && clients !== defaultState) {
      try {
        setSafeClientData(clients);
      } catch (error) {
        console.error("Error saving clients:", error);
      }
    }
  }, [clients, isLoading]);

  // Handle storage events (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clients' || e.key === 'mokClients' || e.key === 'mok-mzansi-books-clients') {
        try {
          if (e.newValue) {
            const updatedClients = JSON.parse(e.newValue) as ClientsState;
            setClients(updatedClients);
          }
        } catch (error) {
          console.error("Error processing storage event:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Base client creation function with proper typing
  const createBaseClient = (partialClient: Partial<Client>): Client => {
    const now = new Date().toISOString();
    
    // Create a basic client object with required properties
    const baseClient = {
      id: uuidv4(),
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      credit: 0,
      outstanding: 0,
      overdue: 0,
      lastInteraction: null,
      createdAt: now,
      updatedAt: now,
      ...partialClient,
    };

    // Return the client as the correct type based on the provided type property
    if (partialClient.type === 'company') {
      return {
        ...baseClient,
        type: 'company',
        vatNumber: (partialClient as Partial<CompanyClient>).vatNumber || "",
        registrationNumber: (partialClient as Partial<CompanyClient>).registrationNumber || "",
        contactPerson: (partialClient as Partial<CompanyClient>).contactPerson || "",
      } as CompanyClient;
    } 
    else if (partialClient.type === 'individual') {
      return {
        ...baseClient,
        type: 'individual',
        firstName: (partialClient as Partial<IndividualClient>).firstName || "",
        lastName: (partialClient as Partial<IndividualClient>).lastName || "",
      } as IndividualClient;
    }
    else if (partialClient.type === 'vendor') {
      return {
        ...baseClient,
        type: 'vendor',
        contactPerson: (partialClient as Partial<VendorClient>).contactPerson || "",
        vendorCategory: (partialClient as Partial<VendorClient>).vendorCategory || "",
        vendorCode: (partialClient as Partial<VendorClient>).vendorCode || undefined,
      } as VendorClient;
    }
    
    // Default fallback (should not happen)
    return baseClient as Client;
  };

  // Add a new client
  const addClient = useCallback(async (clientData: Partial<Client>): Promise<boolean> => {
    try {
      if (!clientData.type) {
        throw new Error("Client type is required");
      }

      const newClient = createBaseClient(clientData);
      const updatedClients = { ...clients };

      if (clientData.type === 'company') {
        updatedClients.companies = [...updatedClients.companies, newClient as CompanyClient];
      } 
      else if (clientData.type === 'individual') {
        updatedClients.individuals = [...updatedClients.individuals, newClient as IndividualClient];
      }
      else if (clientData.type === 'vendor') {
        updatedClients.vendors = [...updatedClients.vendors, newClient as VendorClient];
      }

      setClients(updatedClients);
      setSafeClientData(updatedClients);
      
      toast({
        title: "Success",
        description: "Client added successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding client:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add client",
        variant: "destructive",
      });
      
      return false;
    }
  }, [clients, toast]);

  // Type-specific client addition functions
  const addCompanyClient = useCallback((client: Partial<CompanyClient>): Promise<boolean> => {
    return addClient({ ...client, type: 'company' });
  }, [addClient]);

  const addIndividualClient = useCallback((client: Partial<IndividualClient>): Promise<boolean> => {
    return addClient({ ...client, type: 'individual' });
  }, [addClient]);

  const addVendorClient = useCallback((client: Partial<VendorClient>): Promise<boolean> => {
    return addClient({ ...client, type: 'vendor' });
  }, [addClient]);

  // Update an existing client
  const updateClient = useCallback(async (
    id: string,
    updatedClientData: Partial<Client>
  ): Promise<boolean> => {
    try {
      const updatedClients = { ...clients };
      let clientFound = false;

      // Update in companies array
      updatedClients.companies = updatedClients.companies.map(client => {
        if (client.id === id) {
          clientFound = true;
          return { ...client, ...updatedClientData, updatedAt: new Date().toISOString() } as CompanyClient;
        }
        return client;
      });

      // Update in individuals array
      updatedClients.individuals = updatedClients.individuals.map(client => {
        if (client.id === id) {
          clientFound = true;
          return { ...client, ...updatedClientData, updatedAt: new Date().toISOString() } as IndividualClient;
        }
        return client;
      });

      // Update in vendors array
      updatedClients.vendors = updatedClients.vendors.map(client => {
        if (client.id === id) {
          clientFound = true;
          return { ...client, ...updatedClientData, updatedAt: new Date().toISOString() } as VendorClient;
        }
        return client;
      });

      if (!clientFound) {
        throw new Error("Client not found");
      }

      setClients(updatedClients);
      setSafeClientData(updatedClients);

      toast({
        title: "Success",
        description: "Client updated successfully",
      });

      return true;
    } catch (error) {
      console.error("Error updating client:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update client",
        variant: "destructive",
      });
      
      return false;
    }
  }, [clients, toast]);

  // Delete a client
  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updatedClients = {
        companies: clients.companies.filter(client => client.id !== id),
        individuals: clients.individuals.filter(client => client.id !== id),
        vendors: clients.vendors.filter(client => client.id !== id),
      };

      setClients(updatedClients);
      setSafeClientData(updatedClients);

      toast({
        title: "Success",
        description: "Client deleted successfully",
      });

      return true;
    } catch (error) {
      console.error("Error deleting client:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete client",
        variant: "destructive",
      });
      
      return false;
    }
  }, [clients, toast]);

  // Get a client by ID
  const getClientById = useCallback((id: string): Client | undefined => {
    return [
      ...clients.companies,
      ...clients.individuals,
      ...clients.vendors
    ].find(client => client.id === id);
  }, [clients]);

  // Get all clients
  const getAllClients = useCallback((): Client[] => {
    return [
      ...clients.companies,
      ...clients.individuals,
      ...clients.vendors
    ];
  }, [clients]);

  // Get company clients
  const getCompanyClients = useCallback((): CompanyClient[] => {
    return [...clients.companies];
  }, [clients]);

  // Get individual clients
  const getIndividualClients = useCallback((): IndividualClient[] => {
    return [...clients.individuals];
  }, [clients]);

  // Get vendor clients
  const getVendorClients = useCallback((): VendorClient[] => {
    return [...clients.vendors];
  }, [clients]);

  // Context value
  const value: ClientContextProps = {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    addCompanyClient,
    addIndividualClient,
    addVendorClient,
    getClientById,
    getAllClients,
    getCompanyClients,
    getIndividualClients,
    getVendorClients,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

// Hook for using the client context
export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
};
