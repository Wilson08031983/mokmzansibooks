
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, FileText, Filter, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { formatCurrency } from "@/utils/formatters";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Report category types
type ReportCategory = "clients" | "invoices" | "accounting" | "hr" | "inventory" | "all";

// Sample data for each report type
const clientsReportData = {
  activeClients: 24,
  newClients: 3,
  totalRevenue: 1600000,
  topClients: [
    { name: "ABC Corporation", revenue: 320000, projects: 5 },
    { name: "XYZ Enterprises", revenue: 280000, projects: 3 },
    { name: "Global Systems Inc.", revenue: 210000, projects: 4 },
    { name: "Tech Innovators", revenue: 190000, projects: 2 },
    { name: "Smart Solutions", revenue: 150000, projects: 3 },
  ]
};

const invoicesReportData = {
  totalInvoices: 87,
  paidInvoices: 72,
  pendingInvoices: 12,
  overdueInvoices: 3,
  totalAmount: 1450000,
  paidAmount: 1280000,
  pendingAmount: 145000,
  overdueAmount: 25000,
  quotes: 32,
  acceptedQuotes: 24,
  conversionRate: 75,
  recentTransactions: [
    { id: "INV-2025-042", client: "ABC Corporation", amount: 42500, status: "Paid", date: "2025-04-10" },
    { id: "INV-2025-041", client: "Tech Innovators", amount: 18750, status: "Pending", date: "2025-04-08" },
    { id: "INV-2025-040", client: "Smart Solutions", amount: 33200, status: "Paid", date: "2025-04-05" },
    { id: "INV-2025-039", client: "XYZ Enterprises", amount: 27800, status: "Overdue", date: "2025-03-28" },
    { id: "QT-2025-018", client: "Global Systems Inc.", amount: 54200, status: "Quote", date: "2025-04-12" },
  ]
};

const accountingReportData = {
  revenue: 410000,
  expenses: 265000,
  profit: 145000,
  taxLiability: 36250,
  cashOnHand: 520000,
  accountsReceivable: 85000,
  accountsPayable: 42000,
  recentTransactions: [
    { account: "Sales Revenue", amount: 78500, type: "Credit", date: "2025-04-11" },
    { account: "Office Supplies", amount: 3250, type: "Debit", date: "2025-04-10" },
    { account: "Salaries Expense", amount: 45000, type: "Debit", date: "2025-04-05" },
    { account: "Client Payment", amount: 42500, type: "Credit", date: "2025-04-03" },
    { account: "Utilities", amount: 1850, type: "Debit", date: "2025-04-01" },
  ]
};

const hrReportData = {
  totalEmployees: 24,
  newHires: 2,
  attrition: 1,
  attendanceRate: 96,
  upcomingLeaves: 3,
  payrollExpense: 155000,
  departmentBreakdown: [
    { department: "Engineering", count: 8, cost: 68000 },
    { department: "Sales", count: 6, cost: 42000 },
    { department: "Marketing", count: 4, cost: 24000 },
    { department: "Finance", count: 3, cost: 15000 },
    { department: "HR", count: 2, cost: 9000 },
    { department: "Operations", count: 1, cost: 7000 },
  ]
};

const inventoryReportData = {
  totalItems: 145,
  totalValue: 325000,
  lowStockItems: 8,
  outOfStockItems: 3,
  topSellingItems: [
    { name: "Premium Widget", sku: "PW-001", sold: 124, revenue: 62000 },
    { name: "Deluxe Gadget", sku: "DG-105", sold: 98, revenue: 49000 },
    { name: "Professional Tool", sku: "PT-220", sold: 86, revenue: 43000 },
    { name: "Standard Component", sku: "SC-350", sold: 72, revenue: 36000 },
    { name: "Budget Accessory", sku: "BA-410", sold: 63, revenue: 12600 },
  ]
};

const ConsolidatedReportGenerator = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ReportCategory>("all");
  const { getTotalTaxLiability } = useFinancialData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportDate] = useState(new Date());

  const handlePrintReport = async (reportType: ReportCategory = activeTab) => {
    setIsGenerating(true);
    
    // Create a temporary container for the report
    const reportContainer = document.createElement('div');
    reportContainer.className = 'report-container p-8 bg-white';
    
    // Add report title based on type
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold text-center mb-6';
    title.textContent = getReportTitle(reportType);
    reportContainer.appendChild(title);
    
    // Add date
    const dateElement = document.createElement('p');
    dateElement.className = 'text-center text-gray-500 mb-8';
    dateElement.textContent = `Generated on ${format(reportDate, "MMMM d, yyyy")}`;
    reportContainer.appendChild(dateElement);
    
    // Add report content based on type
    const content = document.createElement('div');
    content.className = 'space-y-8';
    content.innerHTML = generateReportContent(reportType);
    reportContainer.appendChild(content);
    
    // Append to document body temporarily
    document.body.appendChild(reportContainer);
    
    // Generate filename
    const fileName = `${reportType === "all" ? "consolidated" : reportType}-report-${format(reportDate, "yyyy-MM-dd")}.pdf`;
    
    try {
      toast({
        title: "Generating Report",
        description: "Your report is being prepared for download..."
      });
      
      const success = await downloadDocumentAsPdf(reportContainer, fileName);
      
      if (success) {
        toast({
          title: "Report Generated",
          description: `Your ${reportType === "all" ? "consolidated" : reportType} report has been downloaded successfully.`
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem generating your report.",
        variant: "destructive"
      });
      console.error("Report generation error:", error);
    } finally {
      // Clean up
      document.body.removeChild(reportContainer);
      setIsGenerating(false);
    }
  };

  const getReportTitle = (reportType: ReportCategory): string => {
    switch (reportType) {
      case "clients": return "Clients Report";
      case "invoices": return "Invoices & Quotes Report";
      case "accounting": return "Accounting Report";
      case "hr": return "HR & Payroll Report";
      case "inventory": return "Inventory Report";
      case "all": return "Consolidated Business Report";
      default: return "Business Report";
    }
  };

  const generateReportContent = (reportType: ReportCategory): string => {
    let content = '';
    
    if (reportType === "all" || reportType === "clients") {
      content += `
        <div class="mb-10">
          <h2 class="text-2xl font-bold mb-4">Clients Overview</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Active Clients</div>
              <div class="text-2xl font-bold">${clientsReportData.activeClients}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">New Clients (Last 30 Days)</div>
              <div class="text-2xl font-bold">${clientsReportData.newClients}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Total Revenue</div>
              <div class="text-2xl font-bold">${formatCurrency(clientsReportData.totalRevenue)}</div>
            </div>
          </div>
          <h3 class="text-xl font-semibold mb-2">Top Clients by Revenue</h3>
          <table class="w-full border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 text-left">Client Name</th>
                <th class="p-2 text-right">Revenue</th>
                <th class="p-2 text-right">Projects</th>
              </tr>
            </thead>
            <tbody>
              ${clientsReportData.topClients.map(client => `
                <tr class="border-b">
                  <td class="p-2">${client.name}</td>
                  <td class="p-2 text-right">${formatCurrency(client.revenue)}</td>
                  <td class="p-2 text-right">${client.projects}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    if (reportType === "all" || reportType === "invoices") {
      content += `
        <div class="mb-10">
          <h2 class="text-2xl font-bold mb-4">Invoices & Quotes</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Total Invoices</div>
              <div class="text-2xl font-bold">${invoicesReportData.totalInvoices}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Paid</div>
              <div class="text-2xl font-bold">${invoicesReportData.paidInvoices}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Pending</div>
              <div class="text-2xl font-bold">${invoicesReportData.pendingInvoices}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Overdue</div>
              <div class="text-2xl font-bold">${invoicesReportData.overdueInvoices}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Total Amount</div>
              <div class="text-2xl font-bold">${formatCurrency(invoicesReportData.totalAmount)}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Quotes Generated</div>
              <div class="text-2xl font-bold">${invoicesReportData.quotes}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Quote Conversion Rate</div>
              <div class="text-2xl font-bold">${invoicesReportData.conversionRate}%</div>
            </div>
          </div>
          <h3 class="text-xl font-semibold mb-2">Recent Transactions</h3>
          <table class="w-full border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 text-left">ID</th>
                <th class="p-2 text-left">Client</th>
                <th class="p-2 text-right">Amount</th>
                <th class="p-2 text-left">Status</th>
                <th class="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              ${invoicesReportData.recentTransactions.map(transaction => `
                <tr class="border-b">
                  <td class="p-2">${transaction.id}</td>
                  <td class="p-2">${transaction.client}</td>
                  <td class="p-2 text-right">${formatCurrency(transaction.amount)}</td>
                  <td class="p-2">
                    <span class="px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      transaction.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }">
                      ${transaction.status}
                    </span>
                  </td>
                  <td class="p-2">${format(new Date(transaction.date), "MMM d, yyyy")}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    if (reportType === "all" || reportType === "accounting") {
      content += `
        <div class="mb-10">
          <h2 class="text-2xl font-bold mb-4">Accounting Overview</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Revenue (Monthly)</div>
              <div class="text-2xl font-bold">${formatCurrency(accountingReportData.revenue)}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Expenses (Monthly)</div>
              <div class="text-2xl font-bold">${formatCurrency(accountingReportData.expenses)}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Net Profit (Monthly)</div>
              <div class="text-2xl font-bold">${formatCurrency(accountingReportData.profit)}</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Cash on Hand</div>
              <div class="text-2xl font-bold">${formatCurrency(accountingReportData.cashOnHand)}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Accounts Receivable</div>
              <div class="text-2xl font-bold">${formatCurrency(accountingReportData.accountsReceivable)}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Accounts Payable</div>
              <div class="text-2xl font-bold">${formatCurrency(accountingReportData.accountsPayable)}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Tax Liability</div>
              <div class="text-2xl font-bold">${formatCurrency(getTotalTaxLiability())}</div>
            </div>
          </div>
          <h3 class="text-xl font-semibold mb-2">Recent Financial Transactions</h3>
          <table class="w-full border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 text-left">Account</th>
                <th class="p-2 text-right">Amount</th>
                <th class="p-2 text-left">Type</th>
                <th class="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              ${accountingReportData.recentTransactions.map(transaction => `
                <tr class="border-b">
                  <td class="p-2">${transaction.account}</td>
                  <td class="p-2 text-right">${formatCurrency(transaction.amount)}</td>
                  <td class="p-2">
                    <span class="px-2 py-1 rounded-full text-xs ${
                      transaction.type === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }">
                      ${transaction.type}
                    </span>
                  </td>
                  <td class="p-2">${format(new Date(transaction.date), "MMM d, yyyy")}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    if (reportType === "all" || reportType === "hr") {
      content += `
        <div class="mb-10">
          <h2 class="text-2xl font-bold mb-4">HR & Payroll Report</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Total Employees</div>
              <div class="text-2xl font-bold">${hrReportData.totalEmployees}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">New Hires (Last 30 Days)</div>
              <div class="text-2xl font-bold">${hrReportData.newHires}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Attendance Rate</div>
              <div class="text-2xl font-bold">${hrReportData.attendanceRate}%</div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Monthly Payroll Expense</div>
              <div class="text-2xl font-bold">${formatCurrency(hrReportData.payrollExpense)}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Upcoming Leave Requests</div>
              <div class="text-2xl font-bold">${hrReportData.upcomingLeaves}</div>
            </div>
          </div>
          <h3 class="text-xl font-semibold mb-2">Department Breakdown</h3>
          <table class="w-full border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 text-left">Department</th>
                <th class="p-2 text-right">Employees</th>
                <th class="p-2 text-right">Monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              ${hrReportData.departmentBreakdown.map(dept => `
                <tr class="border-b">
                  <td class="p-2">${dept.department}</td>
                  <td class="p-2 text-right">${dept.count}</td>
                  <td class="p-2 text-right">${formatCurrency(dept.cost)}</td>
                </tr>
              `).join('')}
              <tr class="bg-gray-50 font-semibold">
                <td class="p-2">Total</td>
                <td class="p-2 text-right">${hrReportData.departmentBreakdown.reduce((sum, dept) => sum + dept.count, 0)}</td>
                <td class="p-2 text-right">${formatCurrency(hrReportData.departmentBreakdown.reduce((sum, dept) => sum + dept.cost, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }
    
    if (reportType === "all" || reportType === "inventory") {
      content += `
        <div class="mb-10">
          <h2 class="text-2xl font-bold mb-4">Inventory Report</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Total Items</div>
              <div class="text-2xl font-bold">${inventoryReportData.totalItems}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Total Value</div>
              <div class="text-2xl font-bold">${formatCurrency(inventoryReportData.totalValue)}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Low Stock Items</div>
              <div class="text-2xl font-bold">${inventoryReportData.lowStockItems}</div>
            </div>
            <div class="border rounded-md p-4">
              <div class="text-sm text-gray-500">Out of Stock</div>
              <div class="text-2xl font-bold">${inventoryReportData.outOfStockItems}</div>
            </div>
          </div>
          <h3 class="text-xl font-semibold mb-2">Top Selling Items</h3>
          <table class="w-full border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 text-left">Item Name</th>
                <th class="p-2 text-left">SKU</th>
                <th class="p-2 text-right">Units Sold</th>
                <th class="p-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${inventoryReportData.topSellingItems.map(item => `
                <tr class="border-b">
                  <td class="p-2">${item.name}</td>
                  <td class="p-2">${item.sku}</td>
                  <td class="p-2 text-right">${item.sold}</td>
                  <td class="p-2 text-right">${formatCurrency(item.revenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    return content;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>Consolidated Business Reports</CardTitle>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Reports
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveTab("all")}>
                  All Reports
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("clients")}>
                  Clients Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("invoices")}>
                  Invoices & Quotes Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("accounting")}>
                  Accounting Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("hr")}>
                  HR & Payroll Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("inventory")}>
                  Inventory Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              size="sm" 
              disabled={isGenerating}
              onClick={() => handlePrintReport()}
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReportCategory)} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="invoices">Invoices & Quotes</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="hr">HR & Payroll</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="p-4 border rounded-md">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Consolidated Business Report</h3>
              <p className="text-gray-500">Generate a comprehensive report covering all areas of your business.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Active Clients</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Clients</span>
                  </div>
                  <div className="text-2xl font-bold">{clientsReportData.activeClients}</div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Total Invoices</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Invoices</span>
                  </div>
                  <div className="text-2xl font-bold">{invoicesReportData.totalInvoices}</div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Monthly Profit</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Accounting</span>
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(accountingReportData.profit)}</div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Employees</span>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">HR</span>
                  </div>
                  <div className="text-2xl font-bold">{hrReportData.totalEmployees}</div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Inventory Value</span>
                    <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">Inventory</span>
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(inventoryReportData.totalValue)}</div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Tax Liability</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Tax</span>
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(getTotalTaxLiability())}</div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => handlePrintReport('all')}
                disabled={isGenerating}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Full Business Report
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="clients" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Projects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientsReportData.topClients.map((client, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(client.revenue)}</TableCell>
                    <TableCell className="text-right">{client.projects}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" className="w-full" onClick={() => handlePrintReport('clients')}>
              <Printer className="h-4 w-4 mr-2" />
              Print Clients Report
            </Button>
          </TabsContent>
          
          <TabsContent value="invoices" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesReportData.recentTransactions.map((invoice, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(invoice.date), "MMM d, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" className="w-full" onClick={() => handlePrintReport('invoices')}>
              <Printer className="h-4 w-4 mr-2" />
              Print Invoices Report
            </Button>
          </TabsContent>
          
          <TabsContent value="accounting" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Revenue (Monthly)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(accountingReportData.revenue)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Expenses (Monthly)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(accountingReportData.expenses)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Profit (Monthly)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(accountingReportData.profit)}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Button variant="outline" className="w-full" onClick={() => handlePrintReport('accounting')}>
              <Printer className="h-4 w-4 mr-2" />
              Print Accounting Report
            </Button>
          </TabsContent>
          
          <TabsContent value="hr" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Employees</TableHead>
                  <TableHead className="text-right">Monthly Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hrReportData.departmentBreakdown.map((dept, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{dept.department}</TableCell>
                    <TableCell className="text-right">{dept.count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(dept.cost)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="text-right">{hrReportData.totalEmployees}</TableCell>
                  <TableCell className="text-right">{formatCurrency(hrReportData.payrollExpense)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Button variant="outline" className="w-full" onClick={() => handlePrintReport('hr')}>
              <Printer className="h-4 w-4 mr-2" />
              Print HR & Payroll Report
            </Button>
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryReportData.topSellingItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="text-right">{item.sold}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" className="w-full" onClick={() => handlePrintReport('inventory')}>
              <Printer className="h-4 w-4 mr-2" />
              Print Inventory Report
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedReportGenerator;
