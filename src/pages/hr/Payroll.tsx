import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  FileText
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">Manage your company's payroll processing</p>
        </div>
        <Button onClick={() => navigate("/hr/payroll/run")}>
          <DollarSign className="mr-2 h-4 w-4" />
          Run Payroll
        </Button>
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
            <Button className="w-full" onClick={() => navigate("/hr/payroll/run")}>
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
                            <Button variant="ghost" size="icon" title="Download Report">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="View Details">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {payroll.status === "Scheduled" && (
                          <Button variant="ghost" size="icon" title="View Details">
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
    </div>
  );
};

export default Payroll;
