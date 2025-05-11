import React, { useState, useEffect, useRef } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, Download, Trash, Mail, MoreHorizontal, Plus, RefreshCw, Edit } from "lucide-react";
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
// Import PDF generation libraries
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// Import template components
import TemplateSelectionDialog from "./TemplateSelectionDialog";
import InvoiceTemplatePreview from "./InvoiceTemplatePreview";

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

// Function to load real invoices from all possible storage locations
const loadSavedInvoices = () => {
  try {
    // 1. Try to load from primary persistent storage first
    const permanentInvoices = localStorage.getItem('INVOICES_DATA_PERMANENT');
    if (permanentInvoices) {
      return JSON.parse(permanentInvoices);
    }
    
    // 2. Fall back to backup storage locations
    const backupInvoices = localStorage.getItem('INVOICES_DATA_BACKUP');
    if (backupInvoices) {
      return JSON.parse(backupInvoices);
    }
    
    // 3. Check session storage
    const sessionInvoices = sessionStorage.getItem('INVOICES_DATA_SESSION');
    if (sessionInvoices) {
      return JSON.parse(sessionInvoices);
    }
    
    // 4. Try legacy location (backward compatibility)
    const savedInvoices = localStorage.getItem('savedInvoices');
    if (savedInvoices) {
      return JSON.parse(savedInvoices);
    }
    
    // 5. Check IndexedDB as last resort
    if (typeof window !== 'undefined' && window.indexedDB) {
      // This will trigger an event that will load data if found in IndexedDB
      const checkEvent = new CustomEvent('check-indexeddb-for-invoices');
      window.dispatchEvent(checkEvent);
    }
  } catch (error) {
    console.error('Error loading invoices from storage:', error);
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
  
  // Template selection state
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [invoiceToDownload, setInvoiceToDownload] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(5);
  
  // Status update dialog state
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [invoiceToUpdate, setInvoiceToUpdate] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string>('');
  
  // Invoice preview reference
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  // Available status options for invoices
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'paid', label: 'Paid' },
    { value: 'partially paid', label: 'Partially Paid' },
    { value: 'voided', label: 'Voided' },
  ];

  // Manual refresh function
  const refreshInvoices = () => {
    const loadedInvoices = loadSavedInvoices();
    setInvoices(loadedInvoices || []);
    toast("Invoices refreshed");
  };

  // Load invoices on component mount
  useEffect(() => {
    // Initial load
    const loadedInvoices = loadSavedInvoices();
    setInvoices(loadedInvoices || []);
    
    // Set up listeners for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'INVOICES_DATA_PERMANENT' || e.key === 'INVOICES_DATA_BACKUP' || e.key === 'savedInvoices') {
        const refreshedInvoices = loadSavedInvoices();
        setInvoices(refreshedInvoices || []);
      }
    };
    
    // Event listeners
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => {
    if (!invoice) return false;
    
    const invoiceNumber = invoice.invoiceNumber || '';
    const clientName = invoice.client?.name || '';
    
    return invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get the appropriate status badge
  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge variant="outline" className="bg-gray-200">Draft</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Sent</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Overdue</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Paid</Badge>;
      case "partially paid":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Partially Paid</Badge>;
      case "voided":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Voided</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle viewing an invoice
  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoicePreview(true);
  };

  // Handle viewing an invoice with a specific template
  const handleViewWithTemplate = (invoice: any, templateNumber: number) => {
    setSelectedInvoice({...invoice, template: templateNumber});
    setShowInvoicePreview(true);
  };

  // Function to open template selection for invoice download
  const handleDownloadInvoice = (invoice: any) => {
    if (!invoice || !invoice.invoiceNumber) {
      toast.error("Invalid invoice data");
      return;
    }
    
    // Set the invoice to download and show template selection dialog
    setInvoiceToDownload(invoice);
    setSelectedTemplate(invoice.template || 5); // Default to template 5 if not specified
    setShowTemplateDialog(true);
  };
  
  // Function to download invoice with selected template
  const downloadInvoiceWithTemplate = async () => {
    if (!invoiceToDownload) return;
    
    try {
      toast.loading("Generating invoice PDF with template...", { id: "pdf-template-gen" });
      
      // Dynamically import the PDF generator
      const { generateInvoicePDFWithTemplate } = await import('@/utils/pdfGenerator');
      
      // Generate PDF with selected template
      await generateInvoicePDFWithTemplate(invoiceToDownload, selectedTemplate as 5 | 6 | 7 | 8);
      
      // Set template preference for next time
      const updatedInvoices = invoices.map(inv => {
        if (inv.id === invoiceToDownload.id) {
          return { ...inv, template: selectedTemplate };
        }
        return inv;
      });
      
      // Save updated invoice with template preference
      localStorage.setItem('INVOICES_DATA_PERMANENT', JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
      
      toast.success("Invoice downloaded successfully", { id: "pdf-template-gen" });
      setShowTemplateDialog(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", { id: "pdf-template-gen" });
    }
  };

  // Handle updating invoice status
  const handleUpdateStatus = (invoice: any) => {
    setInvoiceToUpdate(invoice);
    setSelectedStatus(invoice.status || 'draft');
    setShowStatusDialog(true);
  };
  
  // Save the updated invoice status
  const saveUpdatedStatus = () => {
    if (!invoiceToUpdate || !selectedStatus) return;
    
    try {
      // Find the invoice to update
      const updatedInvoices = invoices.map(invoice => {
        if (invoice.id === invoiceToUpdate.id) {
          return {
            ...invoice,
            status: selectedStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return invoice;
      });
      
      // Save to storage
      localStorage.setItem('INVOICES_DATA_PERMANENT', JSON.stringify(updatedInvoices));
      localStorage.setItem('INVOICES_DATA_BACKUP', JSON.stringify(updatedInvoices));
      
      // Update state
      setInvoices(updatedInvoices);
      
      toast.success(`Invoice #${invoiceToUpdate.invoiceNumber} status updated to ${selectedStatus}`);
      setShowStatusDialog(false);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status');
    }
  };
  
  // Handle emailing invoice to client
  const handleEmailInvoice = (invoice: any) => {
    toast.success(`Preparing to email Invoice #${invoice.invoiceNumber}`);
    // In a real implementation, this would open an email dialog
    setTimeout(() => {
      toast.success(`Invoice #${invoice.invoiceNumber} emailed successfully`);
    }, 1500);
  };
  
  // Handle deleting an invoice
  const handleDeleteInvoice = (invoice: any) => {
    setInvoiceToDelete(invoice.id);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm invoice deletion
  const confirmDeleteInvoice = () => {
    if (!invoiceToDelete) return;
    
    try {
      // Get filtered invoices list without the one to delete
      const invoiceToRemove = invoices.find(inv => inv.id === invoiceToDelete);
      const updatedInvoices = invoices.filter(inv => inv.id !== invoiceToDelete);
      
      // Update state
      setInvoices(updatedInvoices);
      
      // Update all storage locations
      localStorage.setItem('INVOICES_DATA_PERMANENT', JSON.stringify(updatedInvoices));
      localStorage.setItem('INVOICES_DATA_BACKUP', JSON.stringify(updatedInvoices));
      sessionStorage.setItem('INVOICES_DATA_SESSION', JSON.stringify(updatedInvoices));
      localStorage.setItem('savedInvoices', JSON.stringify(updatedInvoices));
      
      toast.success(`Invoice #${invoiceToRemove?.invoiceNumber} deleted successfully`);
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete('');
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };
  
  // Generate PDF from the current preview
  const generatePDF = async () => {
    if (!selectedInvoice) return;
    
    try {
      toast.loading("Generating PDF...", { id: "pdf-gen" });
      
      // Wait a bit to ensure DOM is fully rendered
      setTimeout(async () => {
        try {
          // Get the element after it's fully rendered
          const element = document.querySelector(".invoice-template") as HTMLElement;
          
          if (!element) {
            toast.error("Could not find invoice element", { id: "pdf-gen" });
            return;
          }
          
          // Use html2canvas to capture the invoice template
          const canvas = await html2canvas(element, {
            scale: 1.5,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
          });
          
          // Create PDF with reasonable dimensions
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          });
          
          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
          
          // Save with a simple filename to avoid errors
          const invoiceNum = selectedInvoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_');
          pdf.save(`Invoice_${invoiceNum}.pdf`);
          
          toast.success("PDF downloaded successfully", { id: "pdf-gen" });
        } catch (err) {
          console.error("PDF generation error:", err);
          toast.error("Could not generate PDF. Try again later.", { id: "pdf-gen" });
        }
      }, 1000);
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("Failed to prepare PDF");
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold">Invoices</div>
          <div className="flex space-x-2">
            {showCreateButton && (
              <Button onClick={onCreateNew} className="flex items-center">
                <Plus className="mr-1 h-4 w-4" />
                New Invoice
              </Button>
            )}
            <Button variant="outline" onClick={refreshInvoices} className="flex items-center">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search invoices by number or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Invoice #</TableHead>
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
                filteredInvoices.map(invoice => (
                  <TableRow key={invoice.id || `invoice-${Math.random()}`}>
                    <TableCell className="font-medium">{invoice.invoiceNumber || "N/A"}</TableCell>
                    <TableCell>{safeDateFormat(invoice.creationDate || invoice.date)}</TableCell>
                    <TableCell>{invoice.client?.name || "N/A"}</TableCell>
                    <TableCell>{safeDateFormat(invoice.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(invoice.total || 0)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status || "Unknown")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Classic Template
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-xs text-muted-foreground" 
                            disabled
                          >
                            View with template:
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewWithTemplate(invoice, 5)}
                          >
                            Template 5 - Purple
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewWithTemplate(invoice, 6)}
                          >
                            Template 6 - Blue
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewWithTemplate(invoice, 7)}
                          >
                            Template 7 - Green
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewWithTemplate(invoice, 8)}
                          >
                            Template 8 - Orange
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEmailInvoice(invoice)}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Email Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(invoice)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteInvoice(invoice)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Preview of Invoice #{selectedInvoice?.invoiceNumber}
              {selectedInvoice?.template ? ` with Template ${selectedInvoice.template}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4" ref={invoicePreviewRef}>
            {selectedInvoice && (
              <div className="invoice-template">
                {selectedInvoice?.template && selectedInvoice.template >= 5 ? (
                  <InvoiceTemplatePreview 
                    invoice={selectedInvoice} 
                    templateNumber={selectedInvoice.template} 
                  />
                ) : (
                  <Template1 invoiceData={selectedInvoice} />
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowInvoicePreview(false)}
            >
              Close
            </Button>
            <Button onClick={generatePDF} className="bg-primary">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Template Selection Dialog */}
      <TemplateSelectionDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
        onDownload={downloadInvoiceWithTemplate}
        templateType="invoice"
      />
      
      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Invoice Status</DialogTitle>
            <DialogDescription>
              Update status for Invoice #{invoiceToUpdate?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="col-span-3 p-2 border rounded"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveUpdatedStatus}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteInvoice}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SavedInvoices;
