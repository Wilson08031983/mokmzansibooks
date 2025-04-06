
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { Button } from "@/components/ui/button";
import { Printer, ChevronDown, PieChart, BarChart, LineChart, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Reports = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { financialReports, taxDocuments, vatReturns, payeReturns, incomeTaxForms, getTotalTaxLiability } = useFinancialData();
  const reportsRef = useRef<HTMLDivElement>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Modified to always allow access to all features
  const handleFeatureClick = () => {
    toast({
      title: "Feature Access Granted",
      description: "You now have full access to this feature.",
    });
  };

  const handlePrintReports = async (reportType?: string) => {
    const printRef = reportsRef.current;
    if (!printRef) return;
    
    const reportTypeDisplay = reportType || "Comprehensive";
    let elementToPrint: HTMLElement;
    let fileName = `${reportTypeDisplay.toLowerCase()}-business-report.pdf`;
    
    toast({
      title: "Generating PDF",
      description: `Your ${reportTypeDisplay.toLowerCase()} report is being prepared for download...`,
    });
    
    // Handle different report types
    if (reportType) {
      // For individual reports, find the specific card
      const reportCards = printRef.querySelectorAll('.card-report');
      const cardToUse = Array.from(reportCards).find((card) => 
        card.textContent?.includes(reportType)
      ) as HTMLElement | undefined;
      
      if (!cardToUse) {
        toast({
          title: "Error",
          description: `Could not find the ${reportType} report section.`,
          variant: "destructive",
        });
        return;
      }
      
      // Create a temporary container for the individual report
      const tempContainer = document.createElement('div');
      tempContainer.className = 'print-container';
      
      // Add a heading for the report
      const heading = document.createElement('h1');
      heading.className = 'text-2xl font-bold mb-4';
      heading.textContent = `${reportType} Report`;
      tempContainer.appendChild(heading);
      
      // Clone the card to print
      const cardClone = cardToUse.cloneNode(true) as HTMLElement;
      cardClone.style.width = '100%';
      cardClone.style.margin = '0';
      tempContainer.appendChild(cardClone);
      
      // Append to document temporarily
      document.body.appendChild(tempContainer);
      elementToPrint = tempContainer;
    } else {
      // For comprehensive reports, print the entire reports section
      printRef.classList.add('printing-reports');
      elementToPrint = printRef;
      fileName = "comprehensive-business-reports.pdf";
    }
    
    const success = await downloadDocumentAsPdf(
      elementToPrint,
      fileName
    );
    
    // Clean up
    if (reportType && elementToPrint.parentNode === document.body) {
      document.body.removeChild(elementToPrint);
    } else {
      printRef.classList.remove('printing-reports');
    }
    
    if (success) {
      toast({
        title: `${reportTypeDisplay} Report Generated`,
        description: `Your ${reportTypeDisplay.toLowerCase()} business report has been downloaded successfully.`,
      });
    } else {
      toast({
        title: "Error",
        description: "There was a problem generating your PDF report.",
        variant: "destructive",
      });
    }
  };

  // Format currency for reports
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-500">Generate and view reports for your business</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary">
              <Printer className="mr-2 h-4 w-4" />
              Print Reports
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlePrintReports()}>
              Print All Reports
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePrintReports("Financial")}>
              Print Financial Reports
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePrintReports("Sales")}>
              Print Sales Reports
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePrintReports("Tax")}>
              Print Tax Reports
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePrintReports("Client")}>
              Print Client Reports
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={reportsRef}>
        <Card className="card-report cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Financial Reports</CardTitle>
            <PieChart className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-500">
              {financialReports
                .filter(report => report.type === "Revenue" || report.type === "Expense")
                .map((report, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {report.title}
                    </span>
                    <span className="text-gray-700 font-medium">
                      {formatCurrency(report.items.reduce((sum, item) => sum + item.value, 0))}
                    </span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="card-report cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Sales Reports</CardTitle>
            <BarChart className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-500">
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Total Sales (2024)
                </span>
                <span className="text-gray-700 font-medium">{formatCurrency(1600000)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Average Monthly Sales
                </span>
                <span className="text-gray-700 font-medium">{formatCurrency(133333.33)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Highest Sales Month
                </span>
                <span className="text-gray-700 font-medium">December</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Year-over-Year Growth
                </span>
                <span className="text-gray-700 font-medium">+15.2%</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="card-report cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Tax Reports</CardTitle>
            <FileText className="h-6 w-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <span className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Total Tax Liability
                </span>
                <span className="text-gray-700 font-medium">{formatCurrency(getTotalTaxLiability())}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  VAT Due
                </span>
                <span className="text-gray-700 font-medium">
                  {formatCurrency(vatReturns.filter(item => item.status === "Due").reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  PAYE Due
                </span>
                <span className="text-gray-700 font-medium">
                  {formatCurrency(payeReturns.filter(item => item.status === "Due").reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center text-gray-500">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Tax Documents
                </span>
                <span className="text-gray-700 font-medium">{taxDocuments.length} Files</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="card-report cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Client Reports</CardTitle>
            <LineChart className="h-6 w-6 text-purple-500" />
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-500">
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Active Clients
                </span>
                <span className="text-gray-700 font-medium">24</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Average Client Value
                </span>
                <span className="text-gray-700 font-medium">{formatCurrency(66666.67)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Client Retention Rate
                </span>
                <span className="text-gray-700 font-medium">92%</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  New Clients (2024)
                </span>
                <span className="text-gray-700 font-medium">8</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
