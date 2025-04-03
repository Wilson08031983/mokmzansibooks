
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Users,
  FileText,
  FilePlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Mock data for dashboard
const mockData = {
  revenueThisMonth: 12500,
  revenueLastMonth: 10200,
  pendingInvoices: 7,
  pendingAmount: 15750,
  activeClients: 9,
  recentInvoices: [
    {
      id: "INV-2023-001",
      client: "Johnson Construction Ltd",
      amount: 4500,
      date: "2023-03-28",
      status: "paid",
    },
    {
      id: "INV-2023-002",
      client: "Cape Town Retailers",
      amount: 2750,
      date: "2023-03-25",
      status: "pending",
    },
    {
      id: "INV-2023-003",
      client: "Durban Services Co",
      amount: 8500,
      date: "2023-03-20",
      status: "paid",
    },
    {
      id: "INV-2023-004",
      client: "Johannesburg Tech Solutions",
      amount: 3600,
      date: "2023-03-18",
      status: "overdue",
    },
  ],
  recentQuotes: [
    {
      id: "QUO-2023-001",
      client: "Pretoria Engineering",
      amount: 7800,
      date: "2023-03-29",
    },
    {
      id: "QUO-2023-002",
      client: "Eastern Cape Supplies",
      amount: 1950,
      date: "2023-03-26",
    },
  ],
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const revenueChange =
    ((mockData.revenueThisMonth - mockData.revenueLastMonth) /
      mockData.revenueLastMonth) *
    100;

  const formatCurrency = (amount: number) => {
    return "R" + amount.toLocaleString("en-ZA");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {currentUser?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-gray-500">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/invoices">
              <FilePlus className="mr-2 h-4 w-4" /> New Invoice
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/invoices/quotes">
              <FileText className="mr-2 h-4 w-4" /> New Quote
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Revenue This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(mockData.revenueThisMonth)}
              </div>
              <div
                className={`flex items-center text-xs ${
                  revenueChange >= 0
                    ? "text-green-600"
                    : "text-destructive"
                }`}
              >
                {revenueChange >= 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                {Math.abs(revenueChange).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{mockData.pendingInvoices}</div>
              <div className="text-sm text-gray-500">
                {formatCurrency(mockData.pendingAmount)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{mockData.activeClients}</div>
              <Users className="h-4 w-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-lg font-medium">
                {currentUser?.subscriptionStatus === "trial" ? (
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    Free Trial
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Premium
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                <Link to="/settings">Manage</Link>
              </Button>
            </div>
            {currentUser?.subscriptionStatus === "trial" && currentUser?.trialEndsAt && (
              <p className="text-xs text-gray-500 mt-2">
                Trial ends on{" "}
                {new Date(currentUser.trialEndsAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/invoices">View all</Link>
              </Button>
            </div>
            <CardDescription>
              Your latest invoices and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                      <Wallet className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{invoice.client}</div>
                      <div className="text-sm text-gray-500">
                        {invoice.id} • {formatDate(invoice.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">
                      {formatCurrency(invoice.amount)}
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        invoice.status
                      )}`}
                    />
                  </div>
                </div>
              ))}
              {mockData.recentInvoices.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No recent invoices
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Quotes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/invoices/quotes">View all</Link>
              </Button>
            </div>
            <CardDescription>
              Your latest quotations sent to clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{quote.client}</div>
                      <div className="text-sm text-gray-500">
                        {quote.id} • {formatDate(quote.date)}
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(quote.amount)}
                  </div>
                </div>
              ))}
              {mockData.recentQuotes.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No recent quotes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
