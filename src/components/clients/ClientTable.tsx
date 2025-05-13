
import React from 'react';
import { Client } from '@/types/client';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, ArrowUpDown } from "lucide-react";
import { ClientFilter } from '@/types/client';

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
  sortDirection
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] cursor-pointer" onClick={() => onSortChange('name')}>
              <div className="flex items-center">
                Name
                {sortBy === 'name' && (
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSortChange('balance')}>
              <div className="flex items-center">
                Balance
                {sortBy === 'balance' && (
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSortChange('lastInteraction')}>
              <div className="flex items-center">
                Last Interaction
                {sortBy === 'lastInteraction' && (
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                )}
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No clients found
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
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.type === 'company' ? 'bg-blue-100 text-blue-800' :
                    client.type === 'individual' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {client.type}
                  </span>
                </TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  {(client.outstanding - client.credit).toFixed(2)}
                </TableCell>
                <TableCell>
                  {client.lastInteraction 
                    ? new Date(client.lastInteraction).toLocaleDateString() 
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onClientEdit(client);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onClientDelete(client.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
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
