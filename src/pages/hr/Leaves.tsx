
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Download, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import UpcomingLeaves from "@/components/hr/UpcomingLeaves";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Sample data for pending leave requests
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

const Leaves = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const handleNewLeaveRequest = () => {
    navigate("/hr/leaves/new");
  };
  
  const handleApproveRequest = (id: number) => {
    toast({
      title: "Leave Request Approved",
      description: `Request #${id} has been approved`,
    });
  };
  
  const handleRejectRequest = (id: number) => {
    toast({
      title: "Leave Request Rejected",
      description: `Request #${id} has been rejected`,
    });
  };
  
  const handleExportLeaveReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Leave report has been exported as CSV",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">
            View and manage employee leave requests and approvals
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button onClick={handleNewLeaveRequest}>
            <Calendar className="mr-2 h-4 w-4" />
            New Leave Request
          </Button>
          <Button variant="outline" onClick={handleExportLeaveReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

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
                {pendingLeaveRequests.map((request) => (
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
                      </div>
                      <div className="flex justify-end space-x-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500" 
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {pendingLeaveRequests.length === 0 && (
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
