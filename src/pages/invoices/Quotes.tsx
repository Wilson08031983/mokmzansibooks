import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowLeft,
  Check,
  X,
  RefreshCcw,
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
import { 
  downloadAction, 
  deleteAction, 
  convertAction,
  changeStatusAction
} from "@/utils/actionUtils";

// Load quotes from localStorage
const loadQuotesFromStorage = () => {
  try {
    const savedQuotes = localStorage.getItem('savedQuotes');
    if (savedQuotes) {
      return JSON.parse(savedQuotes);
    }
  } catch (error) {
    console.error('Error loading quotes from localStorage:', error);
  }
  return [];
};

// Format the quotes to match the expected structure for this page
const formatLoadedQuotes = (loadedQuotes) => {
  return loadedQuotes.map(quote => ({
    id: quote.quoteNumber || quote.id,
    client: quote.client?.name || 'Unknown Client',
    date: quote.issueDate || new Date().toISOString().split('T')[0],
    expiryDate: quote.expiryDate || new Date().toISOString().split('T')[0],
    amount: quote.total || 0,
    status: quote.status || 'draft'
  }));
};

const Quotes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [quotes, setQuotes] = useState(() => formatLoadedQuotes(loadQuotesFromStorage()));
  
  // Refresh quotes periodically from localStorage
  useEffect(() => {
    const refreshQuotes = () => {
      const freshQuotes = loadQuotesFromStorage();
      setQuotes(formatLoadedQuotes(freshQuotes));
    };
    
    // Initial load
    refreshQuotes();
    
    // Set up interval for periodic refresh
    const intervalId = setInterval(refreshQuotes, 2000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);
  const { toast } = useToast();

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA");
  };

  const formatCurrency = (amount: number) => {
    return "R" + amount.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case "expired":
        return <Badge className="bg-gray-500">Expired</Badge>;
      case "declined":
        return <Badge className="bg-red-500">Declined</Badge>;
      case "draft":
        return <Badge variant="outline" className="text-gray-500 border-gray-500">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const statusCounts = quotes.reduce(
    (acc, quote) => {
      acc.all++;
      acc[quote.status]++;
      return acc;
    },
    { all: 0, pending: 0, accepted: 0, expired: 0, declined: 0, draft: 0 }
  );

  const handleDownload = async (id: string) => {
    await downloadAction(id, "quote");
  };

  const handleDelete = async (id: string) => {
    const success = await deleteAction(id, "quote");
    if (success) {
      setQuotes(prevQuotes => prevQuotes.filter(quote => quote.id !== id));
    }
  };

  const handleConvertToInvoice = async (id: string) => {
    await convertAction(id, "quote", "invoice", {
      onSuccess: () => {
        toast({
          title: "Quote converted to invoice",
          description: "You can now view it in the invoices section."
        });
      }
    });
  };

  const handleChangeStatus = async (id: string, newStatus: string) => {
    await changeStatusAction(id, "quote", newStatus);
    
    setQuotes(prevQuotes => prevQuotes.map(quote => 
      quote.id === id ? { ...quote, status: newStatus } : quote
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-2">
            <Link to="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Quotes</h1>
        </div>
        <div>
          <Button asChild>
            <Link to="/invoices/quotes/select-template">
              <PlusCircle className="mr-2 h-4 w-4" /> New Quote
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
                <TabsTrigger value="accepted">Accepted ({statusCounts.accepted})</TabsTrigger>
                <TabsTrigger value="expired">
                  Expired ({statusCounts.expired})
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search quotes..."
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
                      <TableHead>Quote ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.length > 0 ? (
                      filteredQuotes.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">
                            {quote.id}
                          </TableCell>
                          <TableCell>{quote.client}</TableCell>
                          <TableCell>{formatDate(quote.date)}</TableCell>
                          <TableCell>{formatDate(quote.expiryDate)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(quote.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(quote.status)}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(quote.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" /> PDF
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(quote.id)}
                                className="h-8"
                              >
                                <Download className="h-4 w-4 mr-1" /> PDF
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
                                  <DropdownMenuItem onClick={() => handleDownload(quote.id)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download PDF</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleConvertToInvoice(quote.id)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Convert to Invoice</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      <span>Change Status</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "pending")}>
                                          <span className="text-amber-500 mr-2">●</span> Pending
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "accepted")}>
                                          <Check className="mr-2 h-4 w-4 text-green-500" /> Accepted
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "declined")}>
                                          <X className="mr-2 h-4 w-4 text-red-500" /> Declined
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "expired")}>
                                          <span className="text-gray-500 mr-2">●</span> Expired
                                        </DropdownMenuItem>
                                        {quote.status === "expired" && (
                                          <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "pending")}>
                                            <RefreshCcw className="mr-2 h-4 w-4" /> Renew Quote
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Quote</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDelete(quote.id)}
                                  >
                                    Delete Quote
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
                          No quotes found
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
                      <TableHead>Quote ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.length > 0 ? (
                      filteredQuotes.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">
                            {quote.id}
                          </TableCell>
                          <TableCell>{quote.client}</TableCell>
                          <TableCell>{formatDate(quote.date)}</TableCell>
                          <TableCell>{formatDate(quote.expiryDate)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(quote.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(quote.status)}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(quote.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" /> PDF
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(quote.id)}
                                className="h-8"
                              >
                                <Download className="h-4 w-4 mr-1" /> PDF
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
                                  <DropdownMenuItem onClick={() => handleDownload(quote.id)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download PDF</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleConvertToInvoice(quote.id)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Convert to Invoice</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      <span>Change Status</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "accepted")}>
                                          <Check className="mr-2 h-4 w-4 text-green-500" /> Accepted
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "declined")}>
                                          <X className="mr-2 h-4 w-4 text-red-500" /> Declined
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "expired")}>
                                          <span className="text-gray-500 mr-2">●</span> Expired
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Quote</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDelete(quote.id)}
                                  >
                                    Delete Quote
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
                          No pending quotes found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="accepted" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.length > 0 ? (
                      filteredQuotes.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">
                            {quote.id}
                          </TableCell>
                          <TableCell>{quote.client}</TableCell>
                          <TableCell>{formatDate(quote.date)}</TableCell>
                          <TableCell>{formatDate(quote.expiryDate)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(quote.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(quote.status)}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(quote.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" /> PDF
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(quote.id)}
                                className="h-8"
                              >
                                <Download className="h-4 w-4 mr-1" /> PDF
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
                                  <DropdownMenuItem onClick={() => handleDownload(quote.id)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download PDF</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleConvertToInvoice(quote.id)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Convert to Invoice</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      <span>Change Status</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "pending")}>
                                          <span className="text-amber-500 mr-2">●</span> Pending
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "declined")}>
                                          <X className="mr-2 h-4 w-4 text-red-500" /> Declined
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "expired")}>
                                          <span className="text-gray-500 mr-2">●</span> Expired
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Quote</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDelete(quote.id)}
                                  >
                                    Delete Quote
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
                          No accepted quotes found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="expired" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.length > 0 ? (
                      filteredQuotes.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">
                            {quote.id}
                          </TableCell>
                          <TableCell>{quote.client}</TableCell>
                          <TableCell>{formatDate(quote.date)}</TableCell>
                          <TableCell>{formatDate(quote.expiryDate)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(quote.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(quote.status)}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(quote.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" /> PDF
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(quote.id)}
                                className="h-8"
                              >
                                <Download className="h-4 w-4 mr-1" /> PDF
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
                                  <DropdownMenuItem onClick={() => handleDownload(quote.id)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download PDF</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleChangeStatus(quote.id, "pending")}>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    <span>Renew Quote</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Quote</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDelete(quote.id)}
                                  >
                                    Delete Quote
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
                          No expired quotes found
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

export default Quotes;
