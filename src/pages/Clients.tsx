import { useState, useEffect, useCallback, useRef } from "react";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import { getSafeClientData, saveClientData, ClientsState } from "@/utils/clientDataPersistence";
import { Client, CompanyClient, IndividualClient, VendorClient, isCompanyClient, isVendorClient, isIndividualClient, ClientFilter } from "@/types/client";
import ClientTable from "@/components/clients/ClientTable";
import ClientForm from "@/components/clients/ClientForm";
import ClientDetails from "@/components/clients/ClientDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { PlusIcon, FilterIcon, RefreshCw, SearchIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClient } from "@/contexts/ClientContext";
import { useGlobalClientData } from "@/hooks/useGlobalClientData";
import { usePersistence } from "@/contexts/PersistenceContext";

const Clients = () => {
  const [clients, setClients] = useState<ClientsState>({
    companies: [],
    individuals: [],
    vendors: [],
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ClientFilter>({ type: 'all', search: '', sortBy: 'name', sortDirection: 'asc' });
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const { toast } = useToast();
  const {
    addClient: addGlobalClient,
    updateClient: updateGlobalClient,
    deleteClient: deleteGlobalClient,
  } = useGlobalClientData();
  const persistence = usePersistence();

  // Update to use our safe client data functions
  useEffect(() => {
    try {
      const loadedData = getSafeClientData();
      setClients(loadedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading clients:", error);
      setError("Failed to load clients.");
      setIsLoading(false);
    }
  }, []);

  // Save clients with redundancy
  const handleSaveClients = useCallback((updatedClients: ClientsState) => {
    try {
      saveClientData(updatedClients);
      setClients(updatedClients);
    } catch (error) {
      console.error("Error saving clients:", error);
      setError("Failed to save client data.");
    }
  }, []);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  const handleClientCreate = () => {
    setSelectedClient(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleClientEdit = (client: Client) => {
    setSelectedClient(client);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedClient(null);
    setIsEditing(false);
  };

  const handleClientAdd = async (clientData: any) => {
    try {
      if (!clientData.type) {
        throw new Error("Client type is required");
      }

      const success = await addGlobalClient(clientData);
      if (success) {
        toast({
          title: "Success",
          description: "Client added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add client",
          variant: "destructive",
        });
      }
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add client",
        variant: "destructive",
      });
    }
  };

  const handleClientUpdate = async (id: string, updatedClientData: any) => {
    try {
      const success = await updateGlobalClient(id, updatedClientData);
      if (success) {
        toast({
          title: "Success",
          description: "Client updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update client",
          variant: "destructive",
        });
      }
      setIsFormOpen(false);
      setSelectedClient(null);
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    }
  };

  const handleClientDelete = async (id: string) => {
    try {
      const success = await deleteGlobalClient(id);
      if (success) {
        toast({
          title: "Success",
          description: "Client deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete client",
          variant: "destructive",
        });
      }
      setSelectedClient(null);
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (newFilter: ClientFilter) => {
    setFilter(newFilter);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...filter, search: e.target.value });
  };

  const handleSortChange = (sortBy: ClientFilter['sortBy']) => {
    if (filter.sortBy === sortBy) {
      setFilter({ ...filter, sortDirection: filter.sortDirection === 'asc' ? 'desc' : 'asc' });
    } else {
      setFilter({ ...filter, sortBy, sortDirection: 'asc' });
    }
  };

  const filteredClients = useCallback(() => {
    let allClients = [
      ...clients.companies,
      ...clients.individuals,
      ...clients.vendors
    ];

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      allClients = allClients.filter(client =>
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        client.phone.toLowerCase().includes(searchTerm)
      );
    }

    if (filter.type && filter.type !== 'all') {
      allClients = allClients.filter(client => client.type === filter.type);
    }

    if (filter.sortBy) {
      allClients = [...allClients].sort((a, b) => {
        const sortDirection = filter.sortDirection === 'asc' ? 1 : -1;
        switch (filter.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name) * sortDirection;
          case 'balance':
            const balanceA = (a.outstanding || 0) - (a.credit || 0);
            const balanceB = (b.outstanding || 0) - (b.credit || 0);
            return (balanceA - balanceB) * sortDirection;
          case 'lastInteraction':
            const dateA = a.lastInteraction ? new Date(a.lastInteraction).getTime() : 0;
            const dateB = b.lastInteraction ? new Date(b.lastInteraction).getTime() : 0;
            return (dateA - dateB) * sortDirection;
          case 'createdAt':
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortDirection;
          default:
            return 0;
        }
      });
    }

    return allClients;
  }, [clients, filter]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedData = getSafeClientData();
      setClients(loadedData);
      setIsLoading(false);
      toast({
        title: "Success",
        description: "Clients refreshed successfully",
      });
    } catch (error: any) {
      console.error("Error refreshing clients:", error);
      setError(error.message || "Failed to refresh clients.");
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh clients",
        variant: "destructive",
      });
    }
  };

  return (
    <ClientErrorBoundary>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Clients</h1>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search clients..."
              className="md:w-64"
              onChange={handleSearchChange}
            />
            <SearchIcon className="h-5 w-5 text-gray-500" />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsFilterDialogOpen(true)}>
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleClientCreate} disabled={isLoading}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {isLoading ? (
          <div className="text-center">Loading clients...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <ClientTable
                clients={filteredClients()}
                onClientSelect={handleClientSelect}
                onClientEdit={handleClientEdit}
                onClientDelete={handleClientDelete}
                onSortChange={handleSortChange}
                sortBy={filter.sortBy}
                sortDirection={filter.sortDirection}
              />
            </div>

            <div className="col-span-1">
              {selectedClient ? (
                <ClientDetails client={selectedClient} />
              ) : (
                <div className="text-gray-500 text-center">Select a client to view details</div>
              )}
            </div>
          </div>
        )}

        {isFormOpen && (
          <ClientForm
            isOpen={isFormOpen}
            isEditing={isEditing}
            client={selectedClient}
            onClose={handleFormClose}
            onClientAdd={handleClientAdd}
            onClientUpdate={handleClientUpdate}
          />
        )}

        <AlertDialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Filter Clients</AlertDialogTitle>
              <AlertDialogDescription>
                Adjust the filters to find the clients you're looking for.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select onValueChange={(value) => setFilter({ ...filter, type: value as ClientFilter['type'] })} defaultValue={filter.type || 'all'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsFilterDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setIsFilterDialogOpen(false)}>Apply filters</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ClientErrorBoundary>
  );
};

export default Clients;
