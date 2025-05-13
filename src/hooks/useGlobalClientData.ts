
import { useState, useCallback } from 'react';
import { Client, ClientsState, ClientType } from '@/types/client';
import { 
  getSafeClientData, 
  setSafeClientData, 
  addClient as addClientUtil, 
  updateClient as updateClientUtil, 
  deleteClient as deleteClientUtil, 
  findClientById 
} from '@/utils/clientDataPersistence';
import { useToast } from '@/hooks/use-toast';

export interface UseGlobalClientDataReturn {
  clients: ClientsState;
  isLoading: boolean;
  error: string | null;
  getClient: (id: string) => Client | null;
  addClient: (clientData: Partial<Client>) => Promise<boolean>;
  updateClient: (id: string, clientData: Partial<Client>) => Promise<boolean>;
  deleteClient: (id: string, type?: ClientType) => Promise<boolean>;
  refreshClients: () => void;
}

export const useGlobalClientData = (): UseGlobalClientDataReturn => {
  const [clients, setClients] = useState<ClientsState>(getSafeClientData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshClients = useCallback(() => {
    setIsLoading(true);
    try {
      const data = getSafeClientData();
      setClients(data);
      setError(null);
    } catch (err) {
      setError("Failed to load client data");
      toast({
        title: "Error",
        description: "Failed to load client data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getClient = useCallback((id: string): Client | null => {
    return findClientById(id);
  }, []);

  const addClient = useCallback(async (clientData: Partial<Client>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = addClientUtil(clientData);
      if (result) {
        refreshClients();
        return true;
      }
      setError("Failed to add client");
      return false;
    } catch (err) {
      setError("Failed to add client");
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshClients, toast]);

  const updateClient = useCallback(async (id: string, clientData: Partial<Client>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = updateClientUtil(id, clientData);
      if (result) {
        refreshClients();
        return true;
      }
      setError("Failed to update client");
      return false;
    } catch (err) {
      setError("Failed to update client");
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshClients, toast]);

  const deleteClient = useCallback(async (id: string, type?: ClientType): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = deleteClientUtil(id, type);
      if (result) {
        refreshClients();
        return true;
      }
      setError("Failed to delete client");
      return false;
    } catch (err) {
      setError("Failed to delete client");
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshClients, toast]);

  return {
    clients,
    isLoading,
    error,
    getClient,
    addClient,
    updateClient,
    deleteClient,
    refreshClients
  };
};
