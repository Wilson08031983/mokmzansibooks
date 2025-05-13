
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, CreditCard, Mail, Phone } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientCardButtonsProps {
  client: Client;
  onEdit?: (client: Client) => void;
  onDelete?: (id: string) => void;
  onSendEmail?: (email: string) => void;
  onCall?: (phone: string) => void;
  onPayment?: (client: Client) => void;
  className?: string;
}

/**
 * Reusable button group component for client cards
 * Used across different client views to provide consistent actions
 */
export const ClientCardButtons: React.FC<ClientCardButtonsProps> = ({
  client,
  onEdit,
  onDelete,
  onSendEmail,
  onCall,
  onPayment,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {onEdit && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(client)}
          className="flex items-center gap-1"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
      )}

      {onDelete && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDelete(client.id)}
          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      )}

      {onPayment && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPayment(client)}
          className="flex items-center gap-1"
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Payment</span>
        </Button>
      )}

      {onSendEmail && client.email && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onSendEmail(client.email)}
          className="flex items-center gap-1"
        >
          <Mail className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Email</span>
        </Button>
      )}

      {onCall && client.phone && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onCall(client.phone)}
          className="flex items-center gap-1"
        >
          <Phone className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Call</span>
        </Button>
      )}
    </div>
  );
};

export default ClientCardButtons;
