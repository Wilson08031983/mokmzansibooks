import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  PlusCircle,
  Search,
  Download,
  Mail,
  MoreHorizontal,
  FileText,
  Check,
  RefreshCcw,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

import Template1 from "@/components/invoices/templates/Template1";
import Template2 from "@/components/invoices/templates/Template2";
import Template3 from "@/components/invoices/templates/Template3";
import Template4 from "@/components/invoices/templates/Template4";
import Template5 from "@/components/invoices/templates/Template5";
import { downloadInvoiceAsPdf } from "@/utils/pdfUtils";
import { InvoiceData } from "@/types/invoice";
import {
  downloadAction,
  emailAction,
  deleteAction,
  changeStatusAction,
  handleAction
} from "@/utils/actionUtils";
import { formatCurrency } from "@/utils/formatters";
import { useI18n } from "@/contexts/I18nContext";

const mockInvoices = [
  {
    id: "INV-2023-001",
    client: "ABC Construction Ltd",
    date: "2023-03-28",
    dueDate: "2023-04-11",
    amount: 4500,
    status: "paid",
  },
  {
    id: "INV-2023-002",
    client: "Cape Town Retailers",
    date: "2023-03-25",
    dueDate: "2023-04-08",
    amount: 2750,
    status: "pending",
  },
  {
    id: "INV-2023-003",
    client: "Durban Services Co",
    date: "2023-03-20",
    dueDate: "2023-04-03",
    amount: 8500,
    status: "paid",
  },
  {
    id: "INV-2023-004",
    client: "Johannesburg Tech Solutions",
    date: "2023-03-18",
    dueDate: "2023-04-01",
    amount: 3600,
    status: "overdue",
  },
  {
    id: "INV-2023-005",
    client: "Eastern Cape Supplies",
    date: "2023-03-15",
    dueDate: "2023-03-29",
    amount: 5100,
    status: "overdue",
  },
];

const mockInvoiceData: Record<string, InvoiceData> = {
  "INV-2023-001": {
    invoiceNumber: "INV-2023-001",
    issueDate: "2023-03-28",
    dueDate: "2023-04-11",
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
        total: 3000
      },
      {
        itemNo: 2,
        description: "Labor Services",
        quantity: 15,
        rate: 100,
        amount: 1500,
        discount: 0,
        total: 1500
      }
    ],
    subtotal: 4500,
    tax: 675,
    total: 5175,
    notes: "Payment due within 14 days",
    terms: "Thank you for your business"
  },
  "INV-2023-002": {
    invoiceNumber: "INV-2023-002",
    issueDate: "2023-03-25",
    dueDate: "2023-04-08",
    shortDescription: "Retail products delivery",
    client: {
      name: "Cape Town Retailers",
      address: "54 Shop Ave, Cape Town, 8002",
      email: "orders@ctretailers.co.za",
      phone: "021 876 5432"
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
        description: "Product Delivery",
        quantity: 5,
        rate: 550,
        amount: 2750,
        discount: 0,
        total: 2750
      }
    ],
    subtotal: 2750,
    tax: 412.5,
    total: 3162.5,
    notes: "Thank you for your order",
    terms: "Payment due within 14 days"
  }
};

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [invoices, setInvoices] = useState(mockInvoices);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currency } = useI18n();

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA");
  };

  const formatInvoiceCurrency = (amount: number) => {
    return formatCurrency(amount, currency);
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

  const statusCounts = invoices.reduce(
    (acc, invoice) => {
      acc.all++;
      acc[invoice.status]++;
      return acc;
    },
    { all: 0, paid: 0, pending: 0, overdue: 0, draft: 0 }
  );

  const handleDownloadPdf = async (invoiceId: string) => {
    await downloadAction(invoiceId, "invoice");
  };
  
  const handleEmail = async (invoiceId: string) => {
    await emailAction(invoiceId, "invoice");
  };
  
  const handleDelete = async (invoiceId: string) => {
    const success = await deleteAction(invoiceId, "invoice");
    if (success) {
      setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== invoiceId));
    }
  };
  
  const handleChangeStatus = async (invoiceId: string, newStatus: string) => {
    await changeStatusAction(invoiceId, "invoice", newStatus);
    
    setInvoices(prevInvoices => prevInvoices.map(invoice => 
      invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
    ));
  };
  
  const handleRecordPayment = async (invoiceId: string) => {
    await handleAction(
      "Record payment",
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setInvoices(prevInvoices => prevInvoices.map(invoice => 
          invoice.id === invoiceId ? { ...invoice, status: "paid" } : invoice
        ));
        toast({
          title: "Payment recorded",
          description: `Payment for invoice ${invoiceId} has been recorded.`
        });
      }
    );
  };

  return (
    <div className="space-y-6">
      <div ref={pdfContainerRef} className="hidden"></div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-gray-500">Manage and track your invoices</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/invoices/select-template">
              <PlusCircle className="mr-2 h-4 w-4" /> New Invoice
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/invoices/quotes">
              <FileText className="mr-2 h-4 w-4" /> Quotes
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="w-full" onValueChange={setStatusFilter}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({statusCounts.pending})
                </TabsTrigger>
                <TabsTrigger value="paid">Paid ({statusCounts.paid})</TabsTrigger>
                <TabsTrigger value="overdue">
                  Overdue ({statusCounts.overdue})
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search invoices..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <TabsContent value="all" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                            {formatInvoiceCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPdf(invoice.id)}
                                className="h-8"
                              >
                                <Download className="h-4 w-4 mr-1" /> PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEmail(invoice.id)}
                                className="h-8"
                              >
                                <Mail className="h-4 w-4 mr-1" /> Email
                              </Button>
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
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEmail(invoice.id)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    <span>Email Invoice</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download PDF</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {invoice.status !== "paid" && (
                                    <DropdownMenuItem onClick={() => handleRecordPayment(invoice.id)}>
                                      <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                                      <span>Record Payment</span>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
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
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDelete(invoice.id)}
                                  >
                                    Delete Invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
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
            </TabsContent>
            
            <TabsContent value="pending" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                            {formatInvoiceCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPdf(invoice.id)}
                                className="h-8"
                              >
                                <Download className="h-4 w-4 mr-1" /> PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEmail(invoice.id)}
                                className="h-8"
                              >
                                <Mail className="h-4 w-4 mr-1" /> Email
                              </Button>
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
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEmail(invoice.id)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    <span>Email Invoice</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download PDF</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {invoice.status !== "paid" && (
                                    <DropdownMenuItem onClick={() => handleRecordPayment(invoice.id)}>
                                      <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                                      <span>Record Payment</span>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
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
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDelete(invoice.id)}
                                  >
                                    Delete Invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-gray-500"
                        >
                          No pending invoices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="paid" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                            {formatInvoiceCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPdf(invoice.id)}
                                className="h-8"
                              >
                                <Download className="h-4 w-4 mr-1" /> PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEmail(invoice.id)}
                                className="h-8"
                              >
                                <Mail className="h-4 w-4 mr-1" /> Email
                              </Button>
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
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEmail(invoice.id)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    <span>Email Invoice</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download PDF</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {invoice.status !== "paid" && (
                                    <DropdownMenuItem onClick={() => handleRecordPayment(invoice.id)}>
                                      <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                                      <span>Record Payment</span>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
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
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDelete(invoice.id)}
                                  >
                                    Delete Invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-gray-500"
                        >
                          No paid invoices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="overdue" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                            {formatInvoiceCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPdf(invoice.id)}
                                className="h-8"
                              >
                                <Download className="h-4 w-4 mr-1" /> PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEmail(invoice.id)}
                                className="h-8"
                              >
                                <Mail className="h-4 w-4 mr-1" /> Email
                              </Button>
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
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEmail(invoice.id)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    <span>Email Invoice</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download PDF</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {invoice.status !== "paid" && (
                                    <DropdownMenuItem onClick={() => handleRecordPayment(invoice.id)}>
                                      <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                                      <span>Record Payment</span>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
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
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDelete(invoice.id)}
                                  >
                                    Delete Invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-gray-500"
                        >
                          No overdue invoices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
