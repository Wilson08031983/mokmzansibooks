
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Phone, Mail, FileText, Plus } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface ClientCardButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onCall?: () => void;
  onEmail?: () => void;
  onViewDetails?: () => void;
  onCreateInvoice?: () => void;
  disableDelete?: boolean;
  disableEdit?: boolean;
  clientType?: 'company' | 'individual' | 'vendor';
}

const ClientCardButtons: React.FC<ClientCardButtonsProps> = ({
  onEdit,
  onDelete,
  onCall,
  onEmail,
  onViewDetails,
  onCreateInvoice,
  disableDelete = false,
  disableEdit = false,
  clientType = 'company'
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {onViewDetails && (
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={onViewDetails}
        >
          <FileText className="h-4 w-4" />
          <span>Details</span>
        </Button>
      )}
      
      {onEdit && (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={onEdit}
          disabled={disableEdit}
        >
          <Edit className="h-4 w-4" />
          <span>Edit</span>
        </Button>
      )}
      
      {onCall && (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={onCall}
        >
          <Phone className="h-4 w-4" />
          <span>Call</span>
        </Button>
      )}
      
      {onEmail && (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={onEmail}
        >
          <Mail className="h-4 w-4" />
          <span>Email</span>
        </Button>
      )}
      
      {onCreateInvoice && clientType !== 'vendor' && (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={onCreateInvoice}
        >
          <Plus className="h-4 w-4" />
          <span>Invoice</span>
        </Button>
      )}
      
      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-destructive hover:text-destructive" 
              disabled={disableDelete}
            >
              <Trash className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this {clientType}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onDelete} 
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ClientCardButtons;
