import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Download, Check, X, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import UpcomingLeaves from "@/components/hr/UpcomingLeaves";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { changeStatusAction } from "@/utils/actionUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const pendingLeaveRequests = [
  {
    id: 5,
    employee: {
      id: "7",
      name: "Emily Wilson",
      position: "HR Specialist",
      department: "Human Resources",
      image: "",
    },
    type: "Annual Leave",
    startDate: "2025-04-18",
    endDate: "2025-04-22",
    status: "Pending",
    reason: "Family vacation"
  },
  {
    id: 6,
    employee: {
      id: "9",
      name: "David Miller",
      position: "IT Support",
      department: "IT",
      image: "",
    },
    type: "Sick Leave",
    startDate: "2025-04-12",
    endDate: "2025-04-13",
    status: "Pending",
    reason: "Doctor's appointment"
  },
  {
    id: 7,
    employee: {
      id: "11",
      name: "Sarah Thompson",
      position: "Customer Service Rep",
      department: "Customer Service",
      image: "",
    },
    type: "Personal Leave",
    startDate: "2025-04-28",
    endDate: "2025-04-29",
    status: "Pending",
    reason: "Personal matters"
  }
];

const leaveFormSchema = z.object({
  employeeId: z.string().min(1, { message: "Please select an employee" }),
  leaveType: z.string().min(1, { message: "Please select a leave type" }),
  startDate: z.string().min(1, { message: "Please select a start date" }),
  endDate: z.string().min(1, { message: "Please select an end date" }),
  reason: z.string().min(5, { message: "Please provide a reason for the leave request" }).max(500),
});

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

const employees = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Robert Johnson" },
  { id: "5", name: "Michael Brown" },
  { id: "7", name: "Emily Wilson" },
  { id: "9", name: "David Miller" },
  { id: "11", name: "Sarah Thompson" },
];

const leaveTypes = [
  "Annual Leave",
  "Sick Leave",
  "Personal Leave",
  "Family Responsibility",
  "Study Leave",
  "Maternity Leave",
  "Paternity Leave",
];

const Leaves = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [requests, setRequests] = useState(pendingLeaveRequests);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [showNewLeaveDialog, setShowNewLeaveDialog] = useState(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const csvLinkRef = useRef<HTMLAnchorElement>(null);
  
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      employeeId: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });
  
  const handleNewLeaveRequest = () => {
    setShowNewLeaveDialog(true);
  };
  
  const onSubmitLeaveRequest = async (data: LeaveFormValues) => {
    setIsSubmittingLeave(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const employeeName = employees.find(emp => emp.id === data.employeeId)?.name || "Employee";
      
      const newRequest = {
        id: Math.max(...requests.map(r => r.id), 0) + 1,
        employee: {
          id: data.employeeId,
          name: employeeName,
          position: "Employee", 
          department: "Department", 
          image: "",
        },
        type: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "Pending",
        reason: data.reason
      };
      
      setRequests(prev => [newRequest, ...prev]);
      
      toast({
        title: "Leave Request Submitted",
        description: `Leave request for ${employeeName} has been submitted for approval.`,
        variant: "success",
      });
      
      setShowNewLeaveDialog(false);
      form.reset();
      
      setActiveTab("pending");
      
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting the leave request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLeave(false);
    }
  };
  
  const handleApproveRequest = async (id: number) => {
    setProcessingIds(prev => [...prev, id]);
    
    await changeStatusAction(
      id.toString(),
      "invoice",
      "Approved",
      {
        onSuccess: () => {
          setRequests(prev => 
            prev.map(req => 
              req.id === id ? { ...req, status: "Approved" } : req
            )
          );
          toast({
            title: "Leave Request Approved",
            description: `Request #${id} has been approved successfully`,
            variant: "success",
          });
        },
        onError: () => {
          toast({
            title: "Operation Failed",
            description: "Could not approve the request. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
    
    setProcessingIds(prev => prev.filter(reqId => reqId !== id));
  };
  
  const handleRejectRequest = async (id: number) => {
    setProcessingIds(prev => [...prev, id]);
    
    await changeStatusAction(
      id.toString(),
      "invoice",
      "Rejected",
      {
        onSuccess: () => {
          setRequests(prev => 
            prev.map(req => 
              req.id === id ? { ...req, status: "Rejected" } : req
            )
          );
          toast({
            title: "Leave Request Rejected",
            description: `Request #${id} has been rejected`,
            variant: "info",
          });
        },
        onError: () => {
          toast({
            title: "Operation Failed",
            description: "Could not reject the request. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
    
    setProcessingIds(prev => prev.filter(reqId => reqId !== id));
  };
  
  const handleExportLeaveReport = () => {
    setIsExporting(true);
    
    try {
      const allLeaves = [...requests];
      
      // Create a new PDF document in A4 format
      // A4 size: 210 x 297 mm
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Set font styles
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      
      // Add company logo/header
      doc.text("MokMzansi Books", 105, 15, { align: "center" });
      
      // Add report title
      doc.setFontSize(16);
      doc.text(`Leave Report - ${format(new Date(), "MMMM d, yyyy")}`, 105, 25, { align: "center" });
      
      // Add horizontal line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(20, 30, 190, 30);
      
      // Add summary section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Leave Summary", 20, 40);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      // Count leaves by status
      const pending = allLeaves.filter(leave => leave.status === "Pending").length;
      const approved = allLeaves.filter(leave => leave.status === "Approved").length;
      const rejected = allLeaves.filter(leave => leave.status === "Rejected").length;
      const cancelled = allLeaves.filter(leave => leave.status === "Cancelled").length;
      const total = allLeaves.length;
      
      doc.text(`Total Leave Requests: ${total}`, 25, 50);
      doc.text(`Pending: ${pending}`, 25, 56);
      doc.text(`Approved: ${approved}`, 25, 62);
      doc.text(`Rejected: ${rejected}`, 25, 68);
      doc.text(`Cancelled: ${cancelled}`, 25, 74);
      
      // Add leave details table
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Leave Details", 20, 90);
      
      // Table headers
      const startY = 100;
      doc.setFillColor(240, 240, 240);
      doc.rect(20, startY, 170, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      
      // Define column widths
      const colWidths = [15, 30, 25, 25, 20, 20, 20, 15];
      let xPos = 20;
      
      // Draw headers
      const headers = ["ID", "Employee", "Department", "Leave Type", "Start Date", "End Date", "Status", "Days"];
      headers.forEach((header, i) => {
        doc.text(header, xPos + 2, startY + 5.5);
        xPos += colWidths[i];
      });
      
      // Table rows
      doc.setFont("helvetica", "normal");
      let yPos = startY + 8;
      
      allLeaves.forEach((leave, index) => {
        // Add a new page if we're running out of space
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
          
          // Repeat headers on new page
          doc.setFillColor(240, 240, 240);
          doc.rect(20, yPos, 170, 8, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          
          xPos = 20;
          headers.forEach((header, i) => {
            doc.text(header, xPos + 2, yPos + 5.5);
            xPos += colWidths[i];
          });
          
          doc.setFont("helvetica", "normal");
          yPos += 8;
        }
        
        // Add alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(20, yPos, 170, 7, "F");
        }
        
        // Calculate days between start and end date
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Format dates
        const formattedStartDate = format(startDate, "MMM d, yyyy");
        const formattedEndDate = format(endDate, "MMM d, yyyy");
        
        // Draw row data
        xPos = 20;
        doc.text(leave.id.toString(), xPos + 2, yPos + 5); xPos += colWidths[0];
        doc.text(leave.employee.name.substring(0, 14), xPos + 2, yPos + 5); xPos += colWidths[1];
        doc.text(leave.employee.department.substring(0, 12), xPos + 2, yPos + 5); xPos += colWidths[2];
        doc.text(leave.type.substring(0, 12), xPos + 2, yPos + 5); xPos += colWidths[3];
        doc.text(formattedStartDate, xPos + 2, yPos + 5); xPos += colWidths[4];
        doc.text(formattedEndDate, xPos + 2, yPos + 5); xPos += colWidths[5];
        doc.text(leave.status, xPos + 2, yPos + 5); xPos += colWidths[6];
        doc.text(days.toString(), xPos + 2, yPos + 5);
        
        yPos += 7;
      });
      
      // Add footer with page numbers
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text(`Page ${i} of ${totalPages}`, 105, 287, { align: "center" });
        doc.text(`Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, 105, 292, { align: "center" });
      }
      
      // Save the PDF
      doc.save(`leave_report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      
      toast({
        title: "Report Downloaded",
        description: "Leave report has been exported as PDF",
        variant: "success",
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the leave report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const pendingRequests = requests.filter(req => req.status === "Pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate("/dashboard/hr")} 
              className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          </div>
          <p className="text-muted-foreground">
            View and manage employee leave requests and approvals
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button 
            onClick={handleNewLeaveRequest}
            disabled={isSubmittingLeave}
          >
            {isSubmittingLeave ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                New Leave Request
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportLeaveReport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* New Leave Request Dialog */}
      <Dialog open={showNewLeaveDialog} onOpenChange={setShowNewLeaveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Leave Request</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit a new leave request for approval.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitLeaveRequest)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmittingLeave}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="leaveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmittingLeave}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leaveTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          disabled={isSubmittingLeave}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          disabled={isSubmittingLeave}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Leave</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide details about your leave request" 
                        className="resize-none" 
                        {...field} 
                        disabled={isSubmittingLeave}
                      />
                    </FormControl>
                    <FormDescription>
                      This information will be visible to HR and your manager.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewLeaveDialog(false)}
                  disabled={isSubmittingLeave}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingLeave}>
                  {isSubmittingLeave ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Leaves</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="history">Leave History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Approved Leaves</CardTitle>
              <CardDescription>
                View all approved leave requests that are coming up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingLeaves />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
              <CardDescription>
                Review and respond to leave requests from employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="flex items-start p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <div className="font-medium">{request.employee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {request.employee.position} • {request.employee.department}
                          </div>
                        </div>
                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                          {request.status}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm font-medium">{request.type}</span>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reason: {request.reason}
                        </p>
                        
                        {request.type === "Sick Leave" && (
                          <div className="flex items-center mt-1 text-blue-600">
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Documentation attached</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500" 
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={processingIds.includes(request.id)}
                        >
                          {processingIds.includes(request.id) ? (
                            <span className="animate-pulse">Processing...</span>
                          ) : (
                            <>
                              <X className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={processingIds.includes(request.id)}
                        >
                          {processingIds.includes(request.id) ? (
                            <span className="animate-pulse">Processing...</span>
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {pendingRequests.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No pending leave requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Leave History</CardTitle>
              <CardDescription>
                View past leave records and history for all employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-lg font-medium">Leave History</p>
                <p className="text-muted-foreground max-w-md mt-1">
                  All past leave records will appear here. Use the filter to find specific records by employee, date, or leave type.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaves;
