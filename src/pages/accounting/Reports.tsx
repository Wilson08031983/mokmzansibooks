
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, BarChart3, PieChart, ChevronDown, FileText, DollarSign, TrendingUp, ArrowDownUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subMonths } from "date-fns";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AccountingReports = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("income-statement");
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Mock financial data
  const financialData = {
    income: {
      revenue: 250000,
      otherIncome: 15000,
      totalIncome: 265000
    },
    expenses: {
      costOfSales: 100000,
      operatingExpenses: 75000,
      otherExpenses: 10000,
      totalExpenses: 185000
    },
    netProfit: 80000,
    assets: {
      currentAssets: 125000,
      fixedAssets: 200000,
      totalAssets: 325000
    },
    liabilities: {
      currentLiabilities: 50000,
      longTermLiabilities: 75000,
      totalLiabilities: 125000
    },
    equity: 200000
  };

  const handleExportReports = async (reportType?: string) => {
    if (!reportRef.current) return;
    
    const reportTypeDisplay = reportType || "Comprehensive";
    let elementToPrint: HTMLElement;
    let fileName = `${reportTypeDisplay.toLowerCase()}-financial-report.pdf`;
    
    toast({
      title: "Generating PDF",
      description: `Your ${reportTypeDisplay.toLowerCase()} report is being prepared for download...`,
    });
    
    // Handle different report types
    if (reportType) {
      // For individual reports, find the specific card
      const reportCards = reportRef.current.querySelectorAll('.report-card');
      const cardToUse = Array.from(reportCards).find((card) => 
        (card as HTMLElement).querySelector('h3')?.textContent?.includes(reportType)
      ) as HTMLElement | undefined;
      
      if (!cardToUse) {
        toast({
          title: "Error",
          description: `Could not find the ${reportType} report section.`,
          variant: "destructive",
        });
        return;
      }
      
      // Clone the card to avoid modifying the original
      elementToPrint = cardToUse.cloneNode(true) as HTMLElement;
      document.body.appendChild(elementToPrint);
      
      // Apply print styles
      elementToPrint.style.padding = '20px';
      elementToPrint.style.backgroundColor = 'white';
      elementToPrint.style.boxShadow = 'none';
      elementToPrint.style.width = '100%';
      elementToPrint.style.maxWidth = '800px';
      elementToPrint.style.margin = '0 auto';
    } else {
      // For comprehensive report, clone the entire report section
      elementToPrint = reportRef.current.cloneNode(true) as HTMLElement;
      document.body.appendChild(elementToPrint);
      
      // Apply print styles
      elementToPrint.style.padding = '20px';
      elementToPrint.style.backgroundColor = 'white';
      elementToPrint.style.boxShadow = 'none';
      elementToPrint.style.width = '100%';
      elementToPrint.style.maxWidth = '1000px';
      elementToPrint.style.margin = '0 auto';
      fileName = "comprehensive-financial-reports.pdf";
    }
    
    const success = await downloadDocumentAsPdf(
      elementToPrint,
      fileName
    );
    
    // Clean up
    if (elementToPrint.parentNode === document.body) {
      document.body.removeChild(elementToPrint);
    }
    
    if (success) {
      toast({
        title: `${reportTypeDisplay} Report Generated`,
        description: `Your ${reportTypeDisplay.toLowerCase()} financial report has been downloaded successfully.`,
      });
    } else {
      toast({
        title: "Error",
        description: "There was a problem generating your PDF report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/dashboard/accounting')}
            title="Back to Accounting"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => downloadDocumentAsPdf(reportRef, "Financial_Report")}
          >
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-gray-500">Generate and view your financial reports</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, "MMMM yyyy") : <span>Pick a month</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Reports
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportReports()}>
                Export All Reports
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReports("Income Statement")}>
                Export Income Statement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReports("Balance Sheet")}>
                Export Balance Sheet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReports("Cash Flow")}>
                Export Cash Flow Statement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        </TabsList>

        <div ref={reportRef} className="space-y-6 mt-6">
          <TabsContent value="income-statement">
            <Card className="report-card">
              <CardHeader>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  <CardTitle>Income Statement</CardTitle>
                </div>
                <CardDescription>For the period ending {format(date, "MMMM dd, yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Revenue</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Sales Revenue</div>
                      <div className="text-right">R {financialData.income.revenue.toLocaleString()}</div>
                      <div>Other Income</div>
                      <div className="text-right">R {financialData.income.otherIncome.toLocaleString()}</div>
                      <div className="font-semibold">Total Revenue</div>
                      <div className="text-right font-semibold">R {financialData.income.totalIncome.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Expenses</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Cost of Goods Sold</div>
                      <div className="text-right">R {financialData.expenses.costOfSales.toLocaleString()}</div>
                      <div>Operating Expenses</div>
                      <div className="text-right">R {financialData.expenses.operatingExpenses.toLocaleString()}</div>
                      <div>Other Expenses</div>
                      <div className="text-right">R {financialData.expenses.otherExpenses.toLocaleString()}</div>
                      <div className="font-semibold">Total Expenses</div>
                      <div className="text-right font-semibold">R {financialData.expenses.totalExpenses.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-bold">Net Income</div>
                      <div className="text-right font-bold">R {financialData.netProfit.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="balance-sheet">
            <Card className="report-card">
              <CardHeader>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <CardTitle>Balance Sheet</CardTitle>
                </div>
                <CardDescription>As of {format(date, "MMMM dd, yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Assets</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Current Assets</div>
                      <div className="text-right">R {financialData.assets.currentAssets.toLocaleString()}</div>
                      <div className="font-medium">Fixed Assets</div>
                      <div className="text-right">R {financialData.assets.fixedAssets.toLocaleString()}</div>
                      <div className="font-semibold">Total Assets</div>
                      <div className="text-right font-semibold">R {financialData.assets.totalAssets.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Liabilities & Equity</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Current Liabilities</div>
                      <div className="text-right">R {financialData.liabilities.currentLiabilities.toLocaleString()}</div>
                      <div className="font-medium">Long-term Liabilities</div>
                      <div className="text-right">R {financialData.liabilities.longTermLiabilities.toLocaleString()}</div>
                      <div className="font-medium">Total Liabilities</div>
                      <div className="text-right font-medium">R {financialData.liabilities.totalLiabilities.toLocaleString()}</div>
                      
                      <div className="font-medium mt-2">Equity</div>
                      <div className="text-right">R {financialData.equity.toLocaleString()}</div>
                      
                      <div className="font-semibold mt-2">Total Liabilities & Equity</div>
                      <div className="text-right font-semibold">R {(financialData.liabilities.totalLiabilities + financialData.equity).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cash-flow">
            <Card className="report-card">
              <CardHeader>
                <div className="flex items-center">
                  <ArrowDownUp className="h-5 w-5 mr-2 text-primary" />
                  <CardTitle>Cash Flow Statement</CardTitle>
                </div>
                <CardDescription>For the period ending {format(date, "MMMM dd, yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Operating Activities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Net Income</div>
                      <div className="text-right">R {financialData.netProfit.toLocaleString()}</div>
                      <div>Adjustments for non-cash items</div>
                      <div className="text-right">R 15,000.00</div>
                      <div>Changes in working capital</div>
                      <div className="text-right">R 5,000.00</div>
                      <div className="font-semibold">Net Cash from Operating Activities</div>
                      <div className="text-right font-semibold">R {(financialData.netProfit + 20000).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Investing Activities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Purchase of Equipment</div>
                      <div className="text-right">(R 15,000.00)</div>
                      <div className="font-semibold">Net Cash from Investing Activities</div>
                      <div className="text-right font-semibold">(R 15,000.00)</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Financing Activities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Loan Repayment</div>
                      <div className="text-right">(R 10,000.00)</div>
                      <div>Owner's Withdrawals</div>
                      <div className="text-right">(R 20,000.00)</div>
                      <div className="font-semibold">Net Cash from Financing Activities</div>
                      <div className="text-right font-semibold">(R 30,000.00)</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-bold">Net Change in Cash</div>
                      <div className="text-right font-bold">R 55,000.00</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AccountingReports;
