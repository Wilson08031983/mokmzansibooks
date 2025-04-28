
import React, { useState } from "react";
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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Edit, Eye, Download, Trash, Copy, MoreHorizontal } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QuoteTemplate1 from "@/components/invoices/templates/components/QuoteClassicTemplate";
import { QuoteData } from "@/types/quote";

// Mock data for saved quotes
const mockSavedQuotes = [
  { 
    id: "quote1", 
    quoteNumber: "Q-2025-001", 
    client: "ABC Construction Ltd", 
    date: "2025-01-15", 
    expiryDate: "2025-02-15", 
    amount: 4500, 
    status: "pending" 
  },
  { 
    id: "quote2", 
    quoteNumber: "Q-2025-002", 
    client: "Cape Town Retailers", 
    date: "2025-01-20", 
    expiryDate: "2025-02-20", 
    amount: 2750, 
    status: "accepted" 
  },
  { 
    id: "quote3", 
    quoteNumber: "Q-2025-003", 
    client: "Durban Services Co", 
    date: "2025-01-22", 
    expiryDate: "2025-02-22", 
    amount: 8500, 
    status: "expired" 
  },
  { 
    id: "quote4", 
    quoteNumber: "Q-2025-004", 
    client: "Johannesburg Tech Solutions", 
    date: "2025-01-25", 
    expiryDate: "2025-02-25", 
    amount: 3600, 
    status: "rejected" 
  },
  { 
    id: "quote5", 
    quoteNumber: "Q-2025-005", 
    client: "Eastern Cape Supplies", 
    date: "2025-01-28", 
    expiryDate: "2025-02-28", 
    amount: 5100, 
    status: "draft" 
  },
];

// Mock data for a quote preview
const mockQuoteData: QuoteData = {
  quoteNumber: "Q-2025-001",
  issueDate: "2025-01-15",
  expiryDate: "2025-02-15",
  shortDescription: "Construction services",
  client: {
    name: "ABC Construction Ltd",
    address: "123 Builder St, Cape Town, 8001",
    email: "info@abcconstruction.co.za",
    phone: "021 234 5678"
  },
  company: {
    name: "MOKMzansi Holdings",
    address: "456 Business Ave, Johannesburg, 2000",
    email: "contact@mokmzansi.co.za",
    phone: "011 987 6543"
  },
  items: [
    {
      itemNo: 1,
      description: "Project Management",
      quantity: 1,
      unitPrice: 3000,
      markupPercentage: 0,
      discount: 0,
      amount: 3000
    },
    {
      itemNo: 2,
      description: "Labor Services",
      quantity: 15,
      unitPrice: 100,
      markupPercentage: 0,
      discount: 0,
      amount: 1500
    }
  ],
  subtotal: 4500,
  vatRate: 15,
  tax: 675,
  total: 5175,
  notes: "Payment due within 14 days",
  terms: "Thank you for your business",
  currency: "ZAR"
};

const SavedQuotes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  const handlePreviewQuote = (quoteId: string) => {
    setSelectedQuote(quoteId);
    setShowPreview(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-red-500 border-red-500">Expired</Badge>;
      case "draft":
        return <Badge variant="outline" className="text-gray-500 border-gray-500">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter quotes based on search term
  const filteredQuotes = mockSavedQuotes.filter(quote =>
    quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search quotes..."
            className="pl-8 w-full md:w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Quote ID</TableHead>
              <TableHead className="w-[200px]">Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    {quote.quoteNumber}
                  </TableCell>
                  <TableCell>{quote.client}</TableCell>
                  <TableCell>{formatDate(quote.date)}</TableCell>
                  <TableCell>{formatDate(quote.expiryDate)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(quote.amount, "ZAR")}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(quote.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreviewQuote(quote.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View Quote</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Quote</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Create Invoice</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete Quote</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  No quotes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Quote Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <QuoteTemplate1 data={mockQuoteData} preview={true} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedQuotes;
