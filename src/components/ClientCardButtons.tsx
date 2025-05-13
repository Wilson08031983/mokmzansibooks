
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Phone, Edit, Trash2, FileText, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client } from '@/types/client';

interface ClientCardButtonsProps {
  client: Client;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onCreateInvoice?: (client: Client) => void;
  onCreateQuote?: (client: Client) => void;
}

const ClientCardButtons: React.FC<ClientCardButtonsProps> = ({
  client,
  onEdit,
  onDelete,
  onCreateInvoice,
  onCreateQuote,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Quick contact buttons */}
      {client.email && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.href = `mailto:${client.email}`}
          title="Send Email"
        >
          <Mail className="h-4 w-4" />
        </Button>
      )}
      
      {client.phone && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.href = `tel:${client.phone}`}
          title="Call Client"
        >
          <Phone className="h-4 w-4" />
        </Button>
      )}
      
      {/* Edit button */}
      {onEdit && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(client)}
          title="Edit Client"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      {/* More actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {onCreateInvoice && (
            <DropdownMenuItem onClick={() => onCreateInvoice(client)}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create Invoice</span>
            </DropdownMenuItem>
          )}
          
          {onCreateQuote && (
            <DropdownMenuItem onClick={() => onCreateQuote(client)}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create Quote</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {onDelete && (
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => onDelete(client)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Client</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ClientCardButtons;
