
import { useState } from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const mockQuotes = [
  {
    id: "QT-2023-001",
    client: "ABC Construction Ltd",
    date: "2023-03-28",
    expiryDate: "2023-04-27",
    amount: 4500,
    status: "pending",
  },
  {
    id: "QT-2023-002",
    client: "Cape Town Retailers",
    date: "2023-03-25",
    expiryDate: "2023-04-24",
    amount: 2750,
    status: "accepted",
  },
  {
    id: "QT-2023-003",
    client: "Durban Services Co",
    date: "2023-03-20",
    expiryDate: "2023-04-19",
    amount: 8500,
    status: "accepted",
  },
  {
    id: "QT-2023-004",
    client: "Johannesburg Tech Solutions",
    date: "2023-03-18",
    expiryDate: "2023-04-17",
    amount: 3600,
    status: "expired",
  },
  {
    id: "QT-2023-005",
    client: "Eastern Cape Supplies",
    date: "2023-03-15",
    expiryDate: "2023-04-14",
    amount: 5100,
    status: "expired",
  },
  {
    id: "QT-2023-006",
    client: "Free State Construction",
    date: "2023-03-10",
    expiryDate: "2023-04-09",
    amount: 4250,
    status: "declined",
  },
];

const Quotes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredQuotes = mockQuotes.filter((quote) => {
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

  const statusCounts = mockQuotes.reduce(
    (acc, quote) => {
      acc.all++;
      acc[quote.status]++;
      return acc;
    },
    { all: 0, pending: 0, accepted: 0, expired: 0, declined: 0, draft: 0 }
  );

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
                          <TableCell>{getStatusBadge(quote.status)}</TableCell>
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
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Email Quote</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Download PDF</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Convert to Invoice</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Quote</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Delete Quote
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
            </TabsContent>
            
            {/* Add similar tab content for other tabs (pending, accepted, expired) */}
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
                          <TableCell>{getStatusBadge(quote.status)}</TableCell>
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
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Email Quote</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Download PDF</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Convert to Invoice</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Quote</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Delete Quote
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
                          <TableCell>{getStatusBadge(quote.status)}</TableCell>
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
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Email Quote</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Download PDF</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Convert to Invoice</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Quote</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Delete Quote
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
                          <TableCell>{getStatusBadge(quote.status)}</TableCell>
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
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Email Quote</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Download PDF</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Renew Quote</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Delete Quote
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
