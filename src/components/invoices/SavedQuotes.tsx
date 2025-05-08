import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Function to load quotes from localStorage
const loadSavedQuotes = () => {
  try {
    const savedQuotes = localStorage.getItem('savedQuotes');
    if (savedQuotes) {
      return JSON.parse(savedQuotes);
    }
  } catch (error) {
    console.error('Error loading saved quotes:', error);
  }
  return [];
};

// No mock data - we'll only use real quotes from localStorage

interface SavedQuotesProps {
  onCreateNew: () => void;
  showCreateButton?: boolean;
}

const SavedQuotes: React.FC<SavedQuotesProps> = ({ onCreateNew, showCreateButton = true }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuotePreview, setShowQuotePreview] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
  const [showEditQuote, setShowEditQuote] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  
  // Load quotes from localStorage on component mount
  useEffect(() => {
    const savedQuotes = loadSavedQuotes();
    setQuotes(savedQuotes || []);
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      const refreshedQuotes = loadSavedQuotes();
      setQuotes(refreshedQuotes || []);
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Filter quotes based on search term
  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

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

  // Handle Download PDF action
  const handleDownloadPDF = (quote: any) => {
    toast.info("Preparing PDF for download...");
    // In a real implementation, this would generate and download a PDF
    setTimeout(() => {
      toast.success(`Quote ${quote.quoteNumber} downloaded as PDF`);
    }, 1500);
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
    toast.info(`Preparing to email quote ${quote.quoteNumber} to ${quote.client.name}...`);
    
    // In a real implementation, this would open an email dialog or form
    // For now, we'll show a success message after a short delay
    setTimeout(() => {
      toast.success(`Email with quote ${quote.quoteNumber} sent to ${quote.client.name}`);
    }, 1500);
  };

  // Update quote status
  const handleUpdateStatus = (quote: any) => {
    setSelectedQuote(quote);
    
    // For demonstration, we'll cycle through statuses: draft -> sent -> accepted -> draft
    let newStatus = "draft";
    if (quote.status === "draft") newStatus = "sent";
    else if (quote.status === "sent") newStatus = "accepted";
    else newStatus = "draft";
    
    // Update status in quotes array
    const updatedQuotes = quotes.map(q => {
      if (q.id === quote.id) {
        return { ...q, status: newStatus };
      }
      return q;
    });
    
    // Update state and localStorage
    setQuotes(updatedQuotes);
    localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
    
    toast.success(`Quote ${quote.quoteNumber} status updated to ${newStatus}`);
  };

  // Show delete confirmation dialog
  const confirmDeleteQuote = (quoteId: string) => {
    setQuoteToDelete(quoteId);
    setIsDeleteDialogOpen(true);
  };

  // Handle Delete Quote action
  const handleDeleteQuote = () => {
    if (!quoteToDelete) return;
    
    const quoteToRemove = quotes.find(q => q.id === quoteToDelete);
    if (!quoteToRemove) return;

    try {
      // Remove the quote from the list
      const updatedQuotes = quotes.filter(q => q.id !== quoteToDelete);
      setQuotes(updatedQuotes);
      
      // Update localStorage
      localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
      
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
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search quotes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {showCreateButton && (
            <Button onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" /> New Quote
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
                          <DropdownMenuItem onClick={() => handleEditQuote(quote)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(quote)}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quote Preview</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="max-h-[70vh] overflow-y-auto">
              <QuoteTemplate1 data={selectedQuote as QuoteData} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Quote Dialog with EditQuoteForm component */}
      <Dialog open={showEditQuote} onOpenChange={setShowEditQuote}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="overflow-y-auto pr-2">
              <EditQuoteForm 
                quoteData={selectedQuote} 
                onSave={(updatedQuote) => {
                  // Save the updated quote
                  const currentQuotes = loadSavedQuotes() || [];
                  const updatedQuotes = currentQuotes.map(q => 
                    q.id === updatedQuote.id ? updatedQuote : q
                  );
                  
                  // Save to localStorage
                  localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
                  
                  // Update state
                  setQuotes(updatedQuotes);
                  toast.success(`Quote ${updatedQuote.quoteNumber} updated successfully`);
                  setShowEditQuote(false);
                }}
                onCancel={() => setShowEditQuote(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice from Quote</DialogTitle>
            <DialogDescription>
              Convert this quote to an invoice? This will create a new invoice with all the details from the quote.
            </DialogDescription>
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
    </>
  );
};

export default SavedQuotes;
