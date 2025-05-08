import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, Download, Trash, Mail, MoreHorizontal, Plus, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Template1 from "@/components/invoices/templates/Template1";
import { toast } from "sonner";

// Safely format a date with fallbacks
const safeDateFormat = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Error";
  }
};

// Function to load real invoices from localStorage
const loadSavedInvoices = () => {
  try {
    // Attempt to load saved invoices from localStorage
    const savedInvoices = localStorage.getItem('savedInvoices');
    if (savedInvoices) {
      return JSON.parse(savedInvoices);
    }
  } catch (error) {
    console.error('Error loading invoices from localStorage:', error);
  }
  return []; // Return empty array if no data found or error occurs
};

interface SavedInvoicesProps {
  onCreateNew: () => void;
  showCreateButton?: boolean;
}

const SavedInvoices: React.FC<SavedInvoicesProps> = ({ onCreateNew, showCreateButton = true }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Load invoices on component mount
  useEffect(() => {
    // Load saved invoices from localStorage
    const loadedInvoices = loadSavedInvoices();
    setInvoices(loadedInvoices || []);

    // Set up interval to periodically check for new invoices
    const intervalId = setInterval(() => {
      const updatedInvoices = loadSavedInvoices();
      setInvoices(updatedInvoices || []);
    }, 2000);
    
    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  // Filter invoices based on search term - with additional null checks
  const filteredInvoices = invoices.filter(invoice => {
    if (!invoice) return false;
    
    const invoiceNumber = invoice.invoiceNumber || '';
    const clientName = invoice.client?.name || '';
    
    return invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "sent":
        return <Badge variant="secondary">Sent</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "partial":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoicePreview(true);
  };

  const handleDownloadInvoice = (invoice: any) => {
    toast.success(`Preparing download for Invoice #${invoice.invoiceNumber}`);
    // In a real implementation, this would trigger the actual download
    setTimeout(() => {
      toast.success(`Invoice #${invoice.invoiceNumber} downloaded successfully`);
    }, 1500);
  };

  const handleEmailInvoice = (invoice: any) => {
    toast.success(`Preparing to email Invoice #${invoice.invoiceNumber}`);
    // In a real implementation, this would open an email dialog
    setTimeout(() => {
      toast.success(`Invoice #${invoice.invoiceNumber} emailed successfully`);
    }, 1500);
  };

  const handleDeleteInvoice = (invoice: any) => {
    toast.info("Deleting invoice...");
    
    try {
      // Remove from state
      setInvoices(invoices.filter(inv => inv.id !== invoice.id));
      
      // Remove from localStorage
      localStorage.setItem('savedInvoices', JSON.stringify(
        invoices.filter(inv => inv.id !== invoice.id)
      ));
      
      toast.success(`Invoice #${invoice.invoiceNumber} deleted successfully`);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {showCreateButton && (
            <Button onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" /> New Invoice
            </Button>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id || `invoice-${Math.random()}`}>
                    <TableCell className="font-medium">{invoice.invoiceNumber || "N/A"}</TableCell>
                    <TableCell>{safeDateFormat(invoice.creationDate || invoice.date)}</TableCell>
                    <TableCell>{invoice.client?.name || "Unknown Client"}</TableCell>
                    <TableCell>{safeDateFormat(invoice.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(invoice.total || 0)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status || "draft")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEmailInvoice(invoice)}>
                            <Mail className="mr-2 h-4 w-4" /> Email to Client
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No invoices found. Create your first invoice to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {selectedInvoice && (
              <Template1 data={selectedInvoice} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SavedInvoices;
