
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
import { Search, Edit, Eye, Download, Trash, Mail, MoreHorizontal, Check, RefreshCcw } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import Template1 from "@/components/invoices/templates/Template1";
import { InvoiceData } from "@/types/invoice";

// Mock data for saved invoices
const mockSavedInvoices = [
  {
    id: "INV-2025-001",
    client: "ABC Construction Ltd",
    date: "2025-03-28",
    dueDate: "2025-04-11",
    amount: 4500,
    status: "paid",
  },
  {
    id: "INV-2025-002",
    client: "Cape Town Retailers",
    date: "2025-03-25",
    dueDate: "2025-04-08",
    amount: 2750,
    status: "pending",
  },
  {
    id: "INV-2025-003",
    client: "Durban Services Co",
    date: "2025-03-20",
    dueDate: "2025-04-03",
    amount: 8500,
    status: "paid",
  },
  {
    id: "INV-2025-004",
    client: "Johannesburg Tech Solutions",
    date: "2025-03-18",
    dueDate: "2025-04-01",
    amount: 3600,
    status: "overdue",
  },
  {
    id: "INV-2025-005",
    client: "Eastern Cape Supplies",
    date: "2025-03-15",
    dueDate: "2025-03-29",
    amount: 5100,
    status: "overdue",
  },
];

// Mock data for an invoice preview
const mockInvoiceData: InvoiceData = {
  invoiceNumber: "INV-2025-001",
  issueDate: "2025-03-28",
  dueDate: "2025-04-11",
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
      rate: 3000,
      amount: 3000,
      discount: 0,
    },
    {
      itemNo: 2,
      description: "Labor Services",
      quantity: 15,
      rate: 100,
      amount: 1500,
      discount: 0,
    }
  ],
  subtotal: 4500,
  vatRate: 15,
  tax: 675,
  total: 5175,
  notes: "Payment due within 14 days",
  terms: "Thank you for your business",
  bankingDetails: "Bank: First National Bank\nAccount: 1234 5678 9012\nBranch: 123456",
  currency: "ZAR"
};

const SavedInvoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [invoices, setInvoices] = useState(mockSavedInvoices);

  const handlePreviewInvoice = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    setShowPreview(true);
  };

  const handleChangeStatus = (invoiceId: string, newStatus: string) => {
    setInvoices(prevInvoices => prevInvoices.map(invoice => 
      invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-500">Overdue</Badge>;
      case "draft":
        return <Badge variant="outline" className="text-gray-500 border-gray-500">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search invoices..."
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
              <TableHead className="w-[150px]">Invoice ID</TableHead>
              <TableHead className="w-[200px]">Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.id}
                  </TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.amount, "ZAR")}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
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
                        <DropdownMenuItem onClick={() => handlePreviewInvoice(invoice.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View Invoice</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Invoice</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Email Invoice</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            <span>Change Status</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => handleChangeStatus(invoice.id, "pending")}>
                                <span className="text-amber-500 mr-2">●</span> Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(invoice.id, "paid")}>
                                <Check className="mr-2 h-4 w-4 text-green-500" /> Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(invoice.id, "overdue")}>
                                <span className="text-red-500 mr-2">●</span> Overdue
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(invoice.id, "draft")}>
                                <span className="text-gray-500 mr-2">●</span> Draft
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete Invoice</span>
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
                  No invoices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Template1 data={mockInvoiceData} preview={true} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedInvoices;
