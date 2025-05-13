
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Client, isCompanyClient, isIndividualClient, isVendorClient, ClientFilter } from '@/types/client';
import ActionMenu from '@/components/ActionMenu';
import { Badge } from '@/components/ui/badge';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';

interface ClientTableProps {
  clients: Client[];
  onClientSelect: (client: Client) => void;
  onClientEdit: (client: Client) => void;
  onClientDelete: (id: string) => void;
  onSortChange: (sortBy: ClientFilter['sortBy']) => void;
  sortBy: ClientFilter['sortBy'];
  sortDirection: ClientFilter['sortDirection'];
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onClientSelect,
  onClientEdit,
  onClientDelete,
  onSortChange,
  sortBy,
  sortDirection,
}) => {
  // Format balance for display
  const formatBalance = (client: Client) => {
    const balance = client.outstanding - client.credit;
    if (balance > 0) {
      return <span className="text-red-600">{formatCurrency(balance)}</span>;
    } else if (balance < 0) {
      return <span className="text-green-600">{formatCurrency(Math.abs(balance))}</span>;
    } else {
      return <span>{formatCurrency(0)}</span>;
    }
  };

  // Get client type badge
  const getClientTypeBadge = (client: Client) => {
    if (isCompanyClient(client)) {
      return <Badge variant="outline">Company</Badge>;
    } else if (isIndividualClient(client)) {
      return <Badge variant="outline">Individual</Badge>;
    } else if (isVendorClient(client)) {
      return <Badge variant="outline">Vendor</Badge>;
    }
    return null;
  };

  // Get sort icon for column
  const getSortIcon = (columnName: ClientFilter['sortBy']) => {
    if (sortBy !== columnName) return null;
    return sortDirection === 'asc' ? <ArrowUpAZ className="ml-1 h-4 w-4" /> : <ArrowDownAZ className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <Button 
                variant="ghost" 
                className="p-0 font-medium flex items-center" 
                onClick={() => onSortChange('name')}
              >
                Name {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">
              <Button 
                variant="ghost" 
                className="p-0 font-medium flex items-center justify-end ml-auto" 
                onClick={() => onSortChange('balance')}
              >
                Balance {getSortIcon('balance')}
              </Button>
            </TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No clients found. Add a client to get started.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow
                key={client.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onClientSelect(client)}
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{getClientTypeBadge(client)}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell className="text-right">{formatBalance(client)}</TableCell>
                <TableCell>
                  <ActionMenu
                    onView={() => onClientSelect(client)}
                    onEdit={() => onClientEdit(client)}
                    onDelete={() => onClientDelete(client.id)}
                    itemName="client"
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientTable;
