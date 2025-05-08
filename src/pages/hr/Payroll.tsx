import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  DollarSign, 
  Download, 
  ExternalLink,
  FileText,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const payrollHistory = [
  {
    id: "P-2025-04",
    period: "April 2025",
    date: "2025-04-30",
    totalAmount: 32540.25,
    employeeCount: 24,
    status: "Scheduled",
  },
  {
    id: "P-2025-03",
    period: "March 2025",
    date: "2025-03-31",
    totalAmount: 31982.50,
    employeeCount: 23,
    status: "Completed",
  },
  {
    id: "P-2025-02",
    period: "February 2025",
    date: "2025-02-28",
    totalAmount: 31650.75,
    employeeCount: 23,
    status: "Completed",
  },
  {
    id: "P-2025-01",
    period: "January 2025",
    date: "2025-01-31",
    totalAmount: 31450.00,
    employeeCount: 22,
    status: "Completed",
  },
  {
    id: "P-2024-12",
    period: "December 2024",
    date: "2024-12-31",
    totalAmount: 36890.50,
    employeeCount: 22,
    status: "Completed",
  },
  {
    id: "P-2024-11",
    period: "November 2024",
    date: "2024-11-30",
    totalAmount: 30120.25,
    employeeCount: 21,
    status: "Completed",
  }
];

const payrollChartData = [
  { month: "Nov", salary: 23500, benefits: 4500, taxes: 2120.25 },
  { month: "Dec", salary: 27200, benefits: 5900, taxes: 3790.50 },
  { month: "Jan", salary: 24100, benefits: 4200, taxes: 3150.00 },
  { month: "Feb", salary: 24400, benefits: 4150, taxes: 3100.75 },
  { month: "Mar", salary: 24650, benefits: 4200, taxes: 3132.50 },
  { month: "Apr", salary: 25000, benefits: 4300, taxes: 3240.25 }
];

const headcountData = [
  { month: "Nov", count: 21 },
  { month: "Dec", count: 22 },
  { month: "Jan", count: 22 },
  { month: "Feb", count: 23 },
  { month: "Mar", count: 23 },
  { month: "Apr", count: 24 }
];

const Payroll = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState("2025");
  const { toast } = useToast();
  const [selectedPayroll, setSelectedPayroll] = useState<typeof payrollHistory[0] | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  // Function to handle viewing details of a scheduled payroll
  const handleViewScheduledPayroll = (payrollId: string) => {
    // Navigate to the run-payroll page with the payroll ID
    navigate(`/dashboard/hr/run-payroll?id=${payrollId}`);
  };
  
  // Function to handle downloading a payroll report
  const handleDownloadReport = (payroll: typeof payrollHistory[0]) => {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add content to the PDF
    doc.setFontSize(22);
    doc.text(`Payroll Report: ${payroll.period}`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Payroll ID: ${payroll.id}`, 20, 40);
    doc.text(`Date: ${new Date(payroll.date).toLocaleDateString()}`, 20, 50);
    doc.text(`Total Amount: ${formatCurrency(payroll.totalAmount)}`, 20, 60);
    doc.text(`Number of Employees: ${payroll.employeeCount}`, 20, 70);
    doc.text(`Status: ${payroll.status}`, 20, 80);
    
    // Save the PDF
    doc.save(`payroll-report-${payroll.id}.pdf`);
    
    // Show success toast
    toast({
      title: "Report Downloaded",
      description: `Payroll report for ${payroll.period} has been downloaded.`,
    });
  };
  
  // Function to handle viewing details of a completed payroll
  const handleViewCompletedPayroll = (payroll: typeof payrollHistory[0]) => {
    // Set the selected payroll and open the dialog
    setSelectedPayroll(payroll);
    setIsDetailsDialogOpen(true);
    // No longer navigating to a non-existent route
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate("/dashboard/hr")} 
              className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          </div>
          <p className="text-muted-foreground">Manage your company's payroll processing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payroll Overview</CardTitle>
            <CardDescription>Breakdown of payroll expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="expenses">
              <TabsList className="mb-4">
                <TabsTrigger value="expenses">Payroll Expenses</TabsTrigger>
                <TabsTrigger value="headcount">Headcount</TabsTrigger>
              </TabsList>
              <TabsContent value="expenses">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={payrollChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="salary" 
                        stackId="1" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        name="Salaries"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="benefits" 
                        stackId="1" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        name="Benefits"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="taxes" 
                        stackId="1" 
                        stroke="#ffc658" 
                        fill="#ffc658" 
                        name="Taxes"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="headcount">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={headcountData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="count" 
                        fill="#8884d8" 
                        name="Employee Count"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Next Payroll</CardTitle>
            <CardDescription>Upcoming payroll processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Period</div>
              <div className="text-lg font-semibold">April 2025</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Processing Date</div>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">April 30, 2025</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{formatCurrency(32540.25)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Employees</div>
              <div className="text-lg font-semibold">24 employees</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/dashboard/hr/run-payroll")}>
              <DollarSign className="mr-2 h-4 w-4" />
              Process Now
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>Payroll History</CardTitle>
            <CardDescription>View past and scheduled payroll runs</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payroll ID</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollHistory.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">{payroll.id}</TableCell>
                    <TableCell>{payroll.period}</TableCell>
                    <TableCell>{format(new Date(payroll.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{payroll.employeeCount}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(payroll.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          payroll.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {payroll.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {payroll.status === "Completed" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Download Report"
                              onClick={() => handleDownloadReport(payroll)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="View Details"
                              onClick={() => handleViewCompletedPayroll(payroll)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {payroll.status === "Scheduled" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="View Details"
                            onClick={() => handleViewScheduledPayroll(payroll.id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Payroll Details: {selectedPayroll?.period}
            </DialogTitle>
            <DialogDescription>
              Complete information about this payroll run
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayroll && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payroll ID</h3>
                  <p className="text-base font-medium">{selectedPayroll.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge
                    variant="outline"
                    className={selectedPayroll.status === "Completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                  >
                    {selectedPayroll.status}
                  </Badge>
                </div>
              </div>
              
              {/* Date and Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Period</h3>
                  <p className="text-base font-medium">{selectedPayroll.period}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Processing Date</h3>
                  <p className="text-base font-medium">{format(new Date(selectedPayroll.date), "MMMM d, yyyy")}</p>
                </div>
              </div>
              
              {/* Financial Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Financial Summary</h3>
                <div className="rounded-md border p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedPayroll.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employees Paid</p>
                      <p className="text-lg font-bold">{selectedPayroll.employeeCount}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Details - Mock data for demonstration */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Breakdown</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Base Salary</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedPayroll.totalAmount * 0.75)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Bonuses</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedPayroll.totalAmount * 0.15)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Overtime</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedPayroll.totalAmount * 0.05)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Other</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedPayroll.totalAmount * 0.05)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                if (selectedPayroll) {
                  handleDownloadReport(selectedPayroll);
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payroll;
