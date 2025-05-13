
import React, { useState, useEffect, useCallback } from 'react';
import { Client, ClientType } from '@/types/client';
import { useGlobalClientData } from '@/hooks/useGlobalClientData';
import { useToast } from '@/hooks/use-toast';
import ClientErrorBoundary from '@/components/clients/ClientErrorBoundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  FilterIcon, 
  PlusIcon, 
  RefreshCw, 
  Search as SearchIcon 
} from 'lucide-react';

export interface ClientFilter {
  type?: ClientType | 'all';
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

const Clients = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState<ClientFilter>({ 
    type: 'all', 
    search: '', 
    sortBy: 'name', 
    sortDirection: 'asc' 
  });
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { 
    clients, 
    isLoading, 
    error,
    addClient: addGlobalClient,
    updateClient: updateGlobalClient,
    deleteClient: deleteGlobalClient,
    refreshClients
  } = useGlobalClientData();

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

  const handleClientAdd = async (clientData: Partial<Client>) => {
    try {
      if (!clientData.type) {
        throw new Error("Client type is required");
      }

      const success = await addGlobalClient(clientData);
      if (success) {
        toast({
          title: "Success",
          description: "Client added successfully",
          variant: "success",
        });
        setIsFormOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to add client",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add client",
        variant: "destructive",
      });
    }
  };

  const handleClientUpdate = async (id: string, updatedClientData: Partial<Client>) => {
    try {
      const success = await updateGlobalClient(id, updatedClientData);
      if (success) {
        toast({
          title: "Success",
          description: "Client updated successfully",
          variant: "success",
        });
        setIsFormOpen(false);
        setSelectedClient(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to update client",
          variant: "destructive",
        });
      }
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
          variant: "success",
        });
        setSelectedClient(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete client",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...filter, search: e.target.value });
  };

  const handleSortChange = (sortBy: 'name' | 'createdAt' | 'updatedAt') => {
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
          case 'createdAt':
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortDirection;
          case 'updatedAt':
            return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * sortDirection;
          default:
            return 0;
        }
      });
    }

    return allClients;
  }, [clients, filter]);

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
            <Button variant="outline" size="sm" onClick={refreshClients} disabled={isLoading}>
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
          <div className="text-center py-8">Loading clients...</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('name')}
                    >
                      Name
                      {filter.sortBy === 'name' && (
                        <span>{filter.sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('updatedAt')}
                    >
                      Last Updated
                      {filter.sortBy === 'updatedAt' && (
                        <span>{filter.sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No clients found
                      </td>
                    </tr>
                  ) : (
                    filteredClients().map((client) => (
                      <tr 
                        key={client.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleClientSelect(client)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${client.type === 'company' ? 'bg-blue-100 text-blue-800' : 
                            client.type === 'individual' ? 'bg-green-100 text-green-800' : 
                            'bg-purple-100 text-purple-800'}`}>
                            {client.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(client.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClientEdit(client);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClientDelete(client.id);
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
                <Select 
                  onValueChange={(value) => setFilter({ ...filter, type: value as ClientFilter['type'] })} 
                  defaultValue={filter.type || 'all'}
                >
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
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Apply Filters</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Placeholder for ClientForm component */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Client' : 'Add New Client'}</h2>
              <p className="mb-4">Form placeholder - you need to create a ClientForm component</p>
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2" onClick={handleFormClose}>
                  Cancel
                </Button>
                <Button onClick={handleFormClose}>
                  {isEditing ? 'Save Changes' : 'Add Client'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientErrorBoundary>
  );
};

export default Clients;
