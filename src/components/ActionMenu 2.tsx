import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreVertical, FileText, Edit, Download, FileSignature, Trash } from 'lucide-react';

interface ActionMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDownloadPDF?: () => void;
  onCreateInvoice?: () => void;
  onDelete?: () => void;
  itemName?: string;
  disabled?: boolean;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  onView,
  onEdit,
  onDownloadPDF,
  onCreateInvoice,
  onDelete,
  itemName = 'item',
  disabled = false
}) => {
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            disabled={disabled}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          {onView && (
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={onView}
            >
              <FileText className="h-4 w-4" />
              <span>View</span>
            </DropdownMenuItem>
          )}
          
          {onEdit && (
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          )}
          
          {onDownloadPDF && (
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={onDownloadPDF}
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </DropdownMenuItem>
          )}
          
          {onCreateInvoice && (
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={onCreateInvoice}
            >
              <FileSignature className="h-4 w-4" />
              <span>Create Invoice</span>
            </DropdownMenuItem>
          )}
          
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600" 
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this {itemName}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={onDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ActionMenu;
