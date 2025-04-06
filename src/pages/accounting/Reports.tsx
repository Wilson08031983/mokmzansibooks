
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, BarChart3, PieChart, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AccountingReports = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [reportRef, setReportRef] = useState<HTMLDivElement | null>(null);

  const handleExportReports = async (reportType?: string) => {
    if (!reportRef) return;
    
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
      const reportCards = reportRef.querySelectorAll('.report-card');
      const cardToUse = Array.from(reportCards).find((card) => 
        card.querySelector('h3')?.textContent?.includes(reportType)
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
      heading.textContent = `${reportType} Report - ${format(date, "MMMM yyyy")}`;
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
      // Create a temporary container with date heading for all reports
      const tempContainer = document.createElement('div');
      tempContainer.className = 'print-container';
      
      // Add a heading with the selected date
      const heading = document.createElement('h1');
      heading.className = 'text-2xl font-bold mb-4';
      heading.textContent = `Financial Reports - ${format(date, "MMMM yyyy")}`;
      tempContainer.appendChild(heading);
      
      // Clone all cards
      const reportsContainer = reportRef.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(reportsContainer);
      
      // Append to document temporarily
      document.body.appendChild(tempContainer);
      elementToPrint = tempContainer;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-gray-500">View and generate financial reports</p>
        </div>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                {format(date, "MMMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
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
                Export Cash Flow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReports("Tax Summary")}>
                Export Tax Summary
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={(ref) => setReportRef(ref)}>
        <Card className="report-card cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Income Statement</CardTitle>
            <BarChart3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              View your revenue, expenses, and profit for {format(date, "MMMM yyyy")}
            </p>
            <div className="h-44 flex items-center justify-center bg-primary/5 rounded-md">
              <p className="text-gray-500">Income visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="report-card cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Balance Sheet</CardTitle>
            <PieChart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Track your assets, liabilities, and equity as of {format(date, "DD MMMM yyyy")}
            </p>
            <div className="h-44 flex items-center justify-center bg-primary/5 rounded-md">
              <p className="text-gray-500">Balance sheet visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="report-card cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Cash Flow</CardTitle>
            <BarChart3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Monitor your cash inflows and outflows for {format(date, "MMMM yyyy")}
            </p>
            <div className="h-44 flex items-center justify-center bg-primary/5 rounded-md">
              <p className="text-gray-500">Cash flow visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="report-card cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Tax Summary</CardTitle>
            <PieChart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Overview of your tax liabilities and payments for {format(date, "MMMM yyyy")}
            </p>
            <div className="h-44 flex items-center justify-center bg-primary/5 rounded-md">
              <p className="text-gray-500">Tax summary visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingReports;
