import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import EmailQuoteDialog from "./EmailQuoteDialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Edit, Eye, Download, Trash, Copy, MoreHorizontal, Plus, File, Mail, RefreshCw } from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { StatusBadge } from "@/utils/statusUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import QuoteTemplate1 from "@/components/invoices/templates/components/QuoteClassicTemplate";
import { QuoteData } from "@/types/quote";
import EditQuoteForm from "./EditQuoteForm";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// Import template components
import TemplateSelectionDialog from "./TemplateSelectionDialog";
import QuoteTemplatePreview from "./QuoteTemplatePreview";

// Function to load quotes from multiple storage locations with redundancy
const loadSavedQuotes = () => {
  try {
    // Try the new permanent storage location first
    const permanentQuotes = localStorage.getItem('QUOTES_DATA_PERMANENT');
    if (permanentQuotes) {
      return JSON.parse(permanentQuotes);
    }
    
    // Try backup locations next
    const backupQuotes = localStorage.getItem('QUOTES_DATA_BACKUP');
    if (backupQuotes) {
      // Also restore to primary location
      localStorage.setItem('QUOTES_DATA_PERMANENT', backupQuotes);
      return JSON.parse(backupQuotes);
    }
    
    // Try session storage
    const sessionQuotes = sessionStorage.getItem('QUOTES_DATA_SESSION');
    if (sessionQuotes) {
      // Also restore to primary location
      localStorage.setItem('QUOTES_DATA_PERMANENT', sessionQuotes);
      return JSON.parse(sessionQuotes);
    }
    
    // Try original location as last resort
    const originalQuotes = localStorage.getItem('savedQuotes');
    if (originalQuotes) {
      // Migrate to the new system
      localStorage.setItem('QUOTES_DATA_PERMANENT', originalQuotes);
      return JSON.parse(originalQuotes);
    }
    
    // If nothing else, try IndexedDB
    tryLoadFromIndexedDB();
  } catch (error) {
    console.error('Error loading saved quotes:', error);
  }
  return [];
};

// Function to try loading from IndexedDB
const tryLoadFromIndexedDB = () => {
  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      const dbPromise = indexedDB.open("MokMzansiDB", 1);
      
      dbPromise.onsuccess = function(event) {
        const db = (event.target as IDBOpenDBRequest).result;
        try {
          // Check if the quotes store exists
          if (db.objectStoreNames.contains("quotes")) {
            const transaction = db.transaction(["quotes"], "readonly");
            const store = transaction.objectStore("quotes");
            const request = store.get('quotes_collection');
            
            request.onsuccess = function() {
              if (request.result && request.result.data) {
                // Restore to localStorage for next time
                localStorage.setItem('QUOTES_DATA_PERMANENT', JSON.stringify(request.result.data));
                window.dispatchEvent(new CustomEvent('quotes-restored-from-indexeddb'));
              }
            };
          }
        } catch (storeError) {
          console.error("Error accessing IndexedDB store:", storeError);
        }
      };
    } catch (dbError) {
      console.error("Error opening IndexedDB:", dbError);
    }
  }
};

// No mock data - we'll only use real quotes from localStorage

interface SavedQuotesProps {
  onCreateNew: () => void;
  showCreateButton?: boolean;
}

const SavedQuotes: React.FC<SavedQuotesProps> = ({ onCreateNew, showCreateButton = true }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [showQuotePreview, setShowQuotePreview] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showEditQuote, setShowEditQuote] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  
  // Template selection state
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [quoteToDownload, setQuoteToDownload] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(5);
  
  // Quote preview reference for PDF generation
  const quotePreviewRef = useRef<HTMLDivElement>(null);
  
  // Status update dialog state is declared below with the status update functionality
  
  // Load quotes and handle manual refresh
  const refreshQuotes = () => {
    const savedQuotes = loadSavedQuotes();
    setQuotes(savedQuotes || []);
    toast.success("Quotes refreshed");
  };
  
  // Load quotes from all storage locations on component mount
  useEffect(() => {
    // Initial load
    const savedQuotes = loadSavedQuotes();
    setQuotes(savedQuotes || []);
    
    // Set up listener for IndexedDB restoration
    const handleIndexDBRestore = () => {
      console.log("Quotes restored from IndexedDB");
      const restoredQuotes = loadSavedQuotes();
      setQuotes(restoredQuotes || []);
      toast.success("Quotes restored from backup");
    };
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      const refreshedQuotes = loadSavedQuotes();
      setQuotes(prev => {
        // Only update if we have quotes or if it's different from current state
        if (refreshedQuotes.length > 0 || prev.length !== refreshedQuotes.length) {
          return refreshedQuotes;
        }
        return prev;
      });
    }, 3000);
    
    // Listen for the custom event from IndexedDB restoration
    window.addEventListener('quotes-restored-from-indexeddb', handleIndexDBRestore);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('quotes-restored-from-indexeddb', handleIndexDBRestore);
    };
  }, []);

  // Filter quotes based on search term
  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );
  
  // We're using the imported StatusBadge component from "@/utils/statusUtils"

  // Handle View Quote action
  const handleViewQuote = (quote: any) => {
    setSelectedQuote(quote);
    setShowQuotePreview(true);
  };

  // Handle Edit Quote action
  const handleEditQuote = (quote: any) => {
    setSelectedQuote(quote);
    setShowEditQuote(true);
    toast.info("Loading quote for editing");
  };

  // Handle Download PDF action with template selection
  const handleDownloadPDF = async (quote: any) => {
    if (!quote || !quote.quoteNumber) {
      toast.error("Invalid quote data");
      return;
    }
    
    // Set the quote to download and show template selection dialog
    setQuoteToDownload(quote);
    setSelectedTemplate(quote.template || 5); // Default to template 5 if not specified
    setShowTemplateDialog(true);
  };
  
  // Function to download quote with selected template
  const downloadQuoteWithTemplate = async () => {
    if (!quoteToDownload) return;
    
    try {
      toast.loading("Generating quote PDF with template...", { id: "pdf-template-gen" });
      
      // Dynamically import the PDF generator
      const { generateQuotePDFWithTemplate } = await import('@/utils/pdfGenerator');
      
      // Generate PDF with selected template
      await generateQuotePDFWithTemplate(quoteToDownload, selectedTemplate as 5 | 6 | 7 | 8);
      
      // Set template preference for next time
      const updatedQuotes = quotes.map(q => {
        if (q.id === quoteToDownload.id) {
          return { ...q, template: selectedTemplate };
        }
        return q;
      });
      
      // Save updated quote with template preference
      localStorage.setItem('QUOTES_DATA_PERMANENT', JSON.stringify(updatedQuotes));
      setQuotes(updatedQuotes);
      
      toast.success("Quote downloaded successfully", { id: "pdf-template-gen" });
      setShowTemplateDialog(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", { id: "pdf-template-gen" });
    }
  };
  
  // Handle viewing a quote with a specific template
  const handleViewWithTemplate = (quote: any, templateNumber: number) => {
    setSelectedQuote({...quote, template: templateNumber});
    setShowQuotePreview(true);
  };
  
  // Generate PDF from the current preview
  const generatePDF = async () => {
    if (!selectedQuote) return;
    
    try {
      toast.loading("Generating PDF...", { id: "pdf-gen" });
      
      // Wait a bit to ensure DOM is fully rendered
      setTimeout(async () => {
        try {
          // Get the element after it's fully rendered
          const element = document.querySelector(".quote-template") as HTMLElement;
          
          if (!element) {
            toast.error("Could not find quote element", { id: "pdf-gen" });
            return;
          }
          
          // Use html2canvas to capture the quote template
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
          const quoteNum = selectedQuote.quoteNumber.replace(/[^a-zA-Z0-9]/g, '_');
          pdf.save(`Quote_${quoteNum}.pdf`);
          
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

  // Handle Create Invoice action
  const handleCreateInvoice = (quote: any) => {
    setSelectedQuote(quote);
    setShowCreateInvoice(true);
    toast.info("Creating invoice from quote...");
  };

  // Email quote to client
  const handleEmailToClient = (quote: any) => {
    setSelectedQuote(quote);
    setShowEmailDialog(true);
    toast.info(`Preparing to email quote ${quote.quoteNumber} to ${quote.client.name || 'client'}...`);
  };

  // Add status update functionality
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [quoteToUpdateStatus, setQuoteToUpdateStatus] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Available status options for quotes
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
    { value: 'expired', label: 'Expired' },
    { value: 'converted', label: 'Converted to Invoice' }
  ];
  
  // Handle opening the status update dialog
  const handleUpdateStatus = (quote: any) => {
    setQuoteToUpdateStatus(quote);
    setSelectedStatus(quote.status || 'draft');
    setShowStatusDialog(true);
  };
  
  // Handle saving the updated status with multi-layered storage
  const saveUpdatedStatus = () => {
    if (!quoteToUpdateStatus || !selectedStatus) return;
    
    try {
      // Find the quote to update
      const updatedQuotes = quotes.map(quote => {
        if (quote.id === quoteToUpdateStatus.id) {
          return {
            ...quote,
            status: selectedStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return quote;
      });
      
      // Save to all storage locations using our multi-layered approach
      // 1. Primary storage
      localStorage.setItem('QUOTES_DATA_PERMANENT', JSON.stringify(updatedQuotes));
      
      // 2. Backup storage locations
      localStorage.setItem('QUOTES_DATA_BACKUP', JSON.stringify(updatedQuotes));
      sessionStorage.setItem('QUOTES_DATA_SESSION', JSON.stringify(updatedQuotes));
      
      // 3. Legacy location for backward compatibility
      localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
      
      // 4. Also update IndexedDB if available
      try {
        if (typeof window !== 'undefined' && window.indexedDB) {
          const dbPromise = indexedDB.open("MokMzansiDB", 1);
          dbPromise.onsuccess = function(event) {
            const db = (event.target as IDBOpenDBRequest).result;
            if (db.objectStoreNames.contains("quotes")) {
              const transaction = db.transaction(["quotes"], "readwrite");
              const store = transaction.objectStore("quotes");
              
              // Update the collection
              store.put({id: 'quotes_collection', data: updatedQuotes});
              
              // Also update the individual quote
              const updatedQuote = updatedQuotes.find(q => q.id === quoteToUpdateStatus.id);
              if (updatedQuote) {
                store.put({id: updatedQuote.id, data: updatedQuote});
              }
            }
          };
        }
      } catch (dbError) {
        console.error('Error updating IndexedDB with status change:', dbError);
      }
      
      // Update local state
      setQuotes(updatedQuotes);
      
      // Notify components of the update
      window.dispatchEvent(new CustomEvent('quote-updated', { 
        detail: { quoteId: quoteToUpdateStatus.id, status: selectedStatus }
      }));
      
      // Show success message
      toast.success(`Quote ${quoteToUpdateStatus.quoteNumber} status updated to ${selectedStatus}`);
      
      // Close the dialog
      setShowStatusDialog(false);
      setQuoteToUpdateStatus(null);
    } catch (error) {
      console.error('Error updating quote status:', error);
      toast.error('Failed to update quote status');
    }
  };
  
  // Legacy handle status change (kept for backwards compatibility)
  const handleStatusChange = (quote: any, newStatus: string) => {
    // Call the new method instead
    setQuoteToUpdateStatus(quote);
    setSelectedStatus(newStatus);
    saveUpdatedStatus();
  };

  // Show delete confirmation dialog
  const confirmDeleteQuote = (quoteId: string) => {
    setQuoteToDelete(quoteId);
    setIsDeleteDialogOpen(true);
  };

  // Handle Delete Quote action with multi-layered deletion to ensure it's removed from all storage locations
  const handleDeleteQuote = () => {
    if (!quoteToDelete) return;
    
    const quoteToRemove = quotes.find(q => q.id === quoteToDelete);
    if (!quoteToRemove) return;

    try {
      // Remove the quote from the list in memory
      const updatedQuotes = quotes.filter(q => q.id !== quoteToDelete);
      setQuotes(updatedQuotes);
      
      // Update all storage locations to ensure complete removal
      // 1. Primary storage
      localStorage.setItem('QUOTES_DATA_PERMANENT', JSON.stringify(updatedQuotes));
      
      // 2. Backup storage locations
      localStorage.setItem('QUOTES_DATA_BACKUP', JSON.stringify(updatedQuotes));
      sessionStorage.setItem('QUOTES_DATA_SESSION', JSON.stringify(updatedQuotes));
      
      // 3. Legacy location for backward compatibility
      localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
      
      // 4. Remove from IndexedDB if available
      try {
        if (typeof window !== 'undefined' && window.indexedDB) {
          const dbPromise = indexedDB.open("MokMzansiDB", 1);
          dbPromise.onsuccess = function(event) {
            const db = (event.target as IDBOpenDBRequest).result;
            if (db.objectStoreNames.contains("quotes")) {
              const transaction = db.transaction(["quotes"], "readwrite");
              const store = transaction.objectStore("quotes");
              store.put({id: 'quotes_collection', data: updatedQuotes});
            }
          };
        }
      } catch (dbError) {
        console.error('Error updating IndexedDB after quote deletion:', dbError);
        // Continue anyway, we've updated other storage locations
      }
      
      // 5. Trigger event to notify other components about the deletion
      window.dispatchEvent(new CustomEvent('quote-deleted', { detail: { quoteId: quoteToDelete }}));
      
      // Reset state and show success message
      setQuoteToDelete(null);
      setIsDeleteDialogOpen(false);
      
      toast.success(`Quote ${quoteToRemove.quoteNumber} deleted successfully`);
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Failed to delete quote');
    }
    
    // Clean up
    setQuoteToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" onClick={refreshQuotes} title="Refresh quotes">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {showCreateButton && (
            <Button onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" /> Create New Quote
            </Button>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                    <TableCell>{formatDate(quote.issueDate)}</TableCell>
                    <TableCell>{quote.client.name}</TableCell>
                    <TableCell>{formatDate(quote.expiryDate)}</TableCell>
                    <TableCell>{formatCurrency(quote.total)}</TableCell>
                    <TableCell><StatusBadge status={quote.status} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewQuote(quote)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewQuote(quote)}
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
                            onClick={() => handleViewWithTemplate(quote, 5)}
                          >
                            Template 5 - Purple
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewWithTemplate(quote, 6)}
                          >
                            Template 6 - Blue
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewWithTemplate(quote, 7)}
                          >
                            Template 7 - Green
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewWithTemplate(quote, 8)}
                          >
                            Template 8 - Orange
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(quote)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEmailToClient(quote)}>
                            <Mail className="mr-2 h-4 w-4" /> Email to Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(quote)}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Update Status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => confirmDeleteQuote(quote.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No quotes found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Quote Preview Dialog */}
      <Dialog open={showQuotePreview} onOpenChange={setShowQuotePreview}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Preview</DialogTitle>
            <DialogDescription>
              Preview of Quote #{selectedQuote?.quoteNumber}
              {selectedQuote?.template ? ` with Template ${selectedQuote.template}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4" ref={quotePreviewRef}>
            {selectedQuote && (
              <div className="quote-template">
                {selectedQuote.template && selectedQuote.template >= 5 ? (
                  <QuoteTemplatePreview 
                    quote={selectedQuote} 
                    templateNumber={selectedQuote.template} 
                  />
                ) : (
                  <QuoteTemplate1 data={selectedQuote as QuoteData} />
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowQuotePreview(false)}
            >
              Close
            </Button>
            <Button 
              onClick={generatePDF} 
              className="bg-primary"
            >
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
        onDownload={downloadQuoteWithTemplate}
        templateType="quote"
      />

      {/* Edit Quote Dialog with EditQuoteForm component */}
      <Dialog open={showEditQuote} onOpenChange={setShowEditQuote}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <>
              <div className="overflow-y-auto pr-2">
                <EditQuoteForm 
                  quoteData={selectedQuote} 
                  onSave={(updatedQuote) => {
                    try {
                      // Save the updated quote
                      const currentQuotes = loadSavedQuotes() || [];
                      const updatedQuotes = currentQuotes.map(q => 
                        q.id === updatedQuote.id ? updatedQuote : q
                      );
                      
                      // Save to ALL storage locations using our multi-layered approach
                      // 1. Primary storage
                      localStorage.setItem('QUOTES_DATA_PERMANENT', JSON.stringify(updatedQuotes));
                      
                      // 2. Backup storage locations
                      localStorage.setItem('QUOTES_DATA_BACKUP', JSON.stringify(updatedQuotes));
                      sessionStorage.setItem('QUOTES_DATA_SESSION', JSON.stringify(updatedQuotes));
                      
                      // 3. Legacy location for backward compatibility
                      localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
                      
                      // 4. Also update IndexedDB if available
                      if (typeof window !== 'undefined' && window.indexedDB) {
                        const dbPromise = indexedDB.open("MokMzansiDB", 1);
                        dbPromise.onsuccess = function(event) {
                          const db = (event.target as IDBOpenDBRequest).result;
                          if (db.objectStoreNames.contains("quotes")) {
                            const transaction = db.transaction(["quotes"], "readwrite");
                            const store = transaction.objectStore("quotes");
                            
                            // Update the collection
                            store.put({id: 'quotes_collection', data: updatedQuotes});
                            
                            // Also update the individual quote
                            store.put({id: updatedQuote.id, data: updatedQuote});
                          }
                        };
                      }
                      
                      // 5. Trigger event to notify other components
                      window.dispatchEvent(new CustomEvent('quote-updated', { 
                        detail: { quoteId: updatedQuote.id }
                      }));
                      
                      // Update state
                      setQuotes(updatedQuotes);
                      toast.success(`Quote ${updatedQuote.quoteNumber} updated successfully`);
                      setShowEditQuote(false);
                    } catch (error) {
                      console.error('Error updating quote:', error);
                      toast.error('Failed to save quote changes');
                    }
                  }}
                  onCancel={() => setShowEditQuote(false)}
                />
              </div>
              
              {/* Add explicit Save button in dialog footer */}
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setShowEditQuote(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Trigger the save function on the form
                    const saveButton = document.querySelector('.edit-quote-save-btn') as HTMLElement;
                    if (saveButton) {
                      saveButton.click();
                    } else {
                      // If we can't find the button by class, try to save directly
                      if (selectedQuote) {
                        const currentQuotes = loadSavedQuotes() || [];
                        const updatedQuotes = currentQuotes.map(q => 
                          q.id === selectedQuote.id ? selectedQuote : q
                        );
                        
                        // Save to localStorage
                        localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
                        
                        // Update state
                        setQuotes(updatedQuotes);
                        toast.success(`Quote ${selectedQuote.quoteNumber} updated successfully`);
                        setShowEditQuote(false);
                      }
                    }
                  }} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Quote
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice from Quote</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div>
              <p className="font-medium">Quote: {selectedQuote.quoteNumber}</p>
              <p>Client: {selectedQuote.client?.name}</p>
              <p>Amount: {formatCurrency(selectedQuote.total)}</p>
              
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setShowCreateInvoice(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast.success(`Invoice created from quote ${selectedQuote.quoteNumber}`);
                  setShowCreateInvoice(false);
                }}>Create Invoice</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Email Quote Dialog */}
      <EmailQuoteDialog 
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        quote={selectedQuote}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this quote. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteQuote}
              className="bg-red-500 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Quote Status</DialogTitle>
            <DialogDescription>
              {quoteToUpdateStatus && `Quote #${quoteToUpdateStatus.quoteNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status:</label>
              <div className="flex items-center">
                {quoteToUpdateStatus && <StatusBadge status={quoteToUpdateStatus.status || 'draft'} />}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">New Status:</label>
              <select 
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {statusOptions.map(option => (
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
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SavedQuotes;
