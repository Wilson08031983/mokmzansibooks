
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Check, X, Eye, Filter, ChevronDown, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { format, differenceInDays, isAfter, isBefore, isToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define leave types and statuses for type safety
type LeaveType = "Annual Leave" | "Sick Leave" | "Personal Leave" | "Family Responsibility" | "Study Leave";
type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

// Define the leave data structure
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  image: string;
}

interface Leave {
  id: number;
  employee: Employee;
  type: LeaveType;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  reason?: string;
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
}

// Sample leave data
const leaveData: Leave[] = [
  {
    id: 1,
    employee: {
      id: "3",
      name: "Robert Johnson",
      position: "Financial Analyst",
      department: "Finance",
      image: "",
    },
    type: "Annual Leave",
    startDate: "2025-04-10",
    endDate: "2025-04-15",
    status: "Approved",
    reason: "Annual vacation",
    approvedBy: "Sarah Johnson",
    approvedDate: "2025-03-15",
  },
  {
    id: 2,
    employee: {
      id: "5",
      name: "Michael Brown",
      position: "Sales Representative",
      department: "Sales",
      image: "",
    },
    type: "Sick Leave",
    startDate: "2025-04-08",
    endDate: "2025-04-09",
    status: "Approved",
    reason: "Doctor's appointment",
    approvedBy: "Sarah Johnson",
    approvedDate: "2025-04-07",
  },
  {
    id: 3,
    employee: {
      id: "2",
      name: "Jane Smith",
      position: "Marketing Manager",
      department: "Marketing",
      image: "",
    },
    type: "Personal Leave",
    startDate: "2025-04-20",
    endDate: "2025-04-22",
    status: "Approved",
    reason: "Family event",
    approvedBy: "Sarah Johnson",
    approvedDate: "2025-04-10",
  },
  {
    id: 4,
    employee: {
      id: "1",
      name: "John Doe",
      position: "Software Developer",
      department: "Engineering",
      image: "",
    },
    type: "Annual Leave",
    startDate: "2025-04-25",
    endDate: "2025-05-02",
    status: "Approved",
    reason: "Family vacation",
    approvedBy: "Sarah Johnson",
    approvedDate: "2025-04-01",
  },
  {
    id: 5,
    employee: {
      id: "7",
      name: "Emily Wilson",
      position: "HR Specialist",
      department: "Human Resources",
      image: "",
    },
    type: "Family Responsibility",
    startDate: "2025-04-15",
    endDate: "2025-04-16",
    status: "Pending",
    reason: "Child's school event",
  },
  {
    id: 6,
    employee: {
      id: "9",
      name: "David Clark",
      position: "Accountant",
      department: "Finance",
      image: "",
    },
    type: "Study Leave",
    startDate: "2025-05-10",
    endDate: "2025-05-12",
    status: "Pending",
    reason: "Professional certification exam",
  },
];

const UpcomingLeaves = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for filtering and viewing leave details
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [leaves, setLeaves] = useState<Leave[]>(leaveData);
  const [isLoading, setIsLoading] = useState(false);
  const [processingLeaveIds, setProcessingLeaveIds] = useState<number[]>([]);
  
  // Fetch leave data from Supabase
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        // In a real implementation, this would fetch from Supabase
        // For now, we'll use the mock data
        // const { data, error } = await supabase
        //   .from('leaves')
        //   .select('*')
        //   .order('startDate', { ascending: true });
        // 
        // if (error) throw error;
        // setLeaves(data || []);
      } catch (error) {
        console.error('Error fetching leaves:', error);
        toast({
          title: "Failed to load leave data",
          description: "There was an error loading the leave requests.",
          variant: "destructive",
        });
      }
    };
    
    fetchLeaves();
  }, [toast]);

  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case "Annual Leave":
        return "bg-blue-100 text-blue-800";
      case "Sick Leave":
        return "bg-red-100 text-red-800";
      case "Personal Leave":
        return "bg-purple-100 text-purple-800";
      case "Family Responsibility":
        return "bg-amber-100 text-amber-800";
      case "Study Leave":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = differenceInDays(end, start) + 1;

    return {
      formatted: `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
      days,
    };
  };

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // State for tracking which leave is being viewed in detail
  const [viewingLeaveId, setViewingLeaveId] = useState<number | null>(null);

  const handleViewDetails = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsDetailsOpen(true);
  };

  // Enhanced function to view leave details with navigation option
  const handleViewLeaveDetails = (leave: Leave) => {
    // Set the viewing state to show loading indicator
    setViewingLeaveId(leave.id);
    
    // Show toast notification
    toast({
      title: "Loading Leave Details",
      description: `Retrieving details for ${leave.employee.name}'s leave request`,
      variant: "default",
    });
    
    // Simulate API call to fetch detailed leave information
    setTimeout(() => {
      // In a real app, you would fetch the leave details from an API
      // For demo purposes, we'll use the existing leave data
      
      // Store the leave details in sessionStorage for the details page
      sessionStorage.setItem('currentLeaveDetails', JSON.stringify(leave));
      
      // Navigate to a dedicated leave details page (would be implemented in a real app)
      // navigate(`/dashboard/hr/leave-details/${leave.id}`);
      
      // For now, just open the details dialog
      setSelectedLeave(leave);
      setIsDetailsOpen(true);
      
      // Reset the viewing state
      setViewingLeaveId(null);
    }, 800);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedLeave(null);
  };

  const handleApproveLeave = async (leaveId: number) => {
    // Add the leave ID to the processing state to show loading indicator
    setProcessingLeaveIds(prev => [...prev, leaveId]);
    
    try {
      // In a real app, this would update the database
      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // This would be the actual Supabase call in a real implementation
      // const { error } = await supabase
      //   .from('leaves')
      //   .update({ 
      //     status: 'Approved',
      //     approvedBy: 'Current User', // Would be the logged-in user
      //     approvedDate: new Date().toISOString()
      //   })
      //   .eq('id', leaveId);
      // 
      // if (error) throw error;
      
      // Update the local state
      setLeaves(prevLeaves => 
        prevLeaves.map(leave => {
          if (leave.id === leaveId) {
            return {
              ...leave,
              status: "Approved" as LeaveStatus,
              approvedBy: "Current User", // In a real app, this would be the logged-in user
              approvedDate: new Date().toISOString().split('T')[0] // Today's date
            };
          }
          return leave;
        })
      );
      
      // If the selected leave is the one being approved, update it
      if (selectedLeave && selectedLeave.id === leaveId) {
        setSelectedLeave({
          ...selectedLeave,
          status: "Approved",
          approvedBy: "Current User",
          approvedDate: new Date().toISOString().split('T')[0]
        });
      }
      
      toast({
        title: "Leave Approved",
        description: `Leave request #${leaveId} has been approved.`,
        variant: "success",
      });
      
      // Close the details dialog if it's open
      if (isDetailsOpen) {
        setIsDetailsOpen(false);
        setSelectedLeave(null);
      }
    } catch (error) {
      console.error('Error approving leave:', error);
      toast({
        title: "Approval Failed",
        description: "There was an error approving the leave request.",
        variant: "destructive",
      });
    } finally {
      // Remove the leave ID from the processing state
      setProcessingLeaveIds(prev => prev.filter(id => id !== leaveId));
    }
  };

  const handleRejectLeave = async (leaveId: number) => {
    // Add the leave ID to the processing state to show loading indicator
    setProcessingLeaveIds(prev => [...prev, leaveId]);
    
    try {
      // In a real app, this would update the database
      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // This would be the actual Supabase call in a real implementation
      // const { error } = await supabase
      //   .from('leaves')
      //   .update({ 
      //     status: 'Rejected',
      //     approvedBy: 'Current User', // Would be the logged-in user
      //     approvedDate: new Date().toISOString()
      //   })
      //   .eq('id', leaveId);
      // 
      // if (error) throw error;
      
      // Update the local state
      setLeaves(prevLeaves => 
        prevLeaves.map(leave => {
          if (leave.id === leaveId) {
            return {
              ...leave,
              status: "Rejected" as LeaveStatus,
              approvedBy: "Current User", // In a real app, this would be the logged-in user
              approvedDate: new Date().toISOString().split('T')[0] // Today's date
            };
          }
          return leave;
        })
      );
      
      // If the selected leave is the one being rejected, update it
      if (selectedLeave && selectedLeave.id === leaveId) {
        setSelectedLeave({
          ...selectedLeave,
          status: "Rejected",
          approvedBy: "Current User",
          approvedDate: new Date().toISOString().split('T')[0]
        });
      }
      
      toast({
        title: "Leave Rejected",
        description: `Leave request #${leaveId} has been rejected.`,
        variant: "destructive",
      });
      
      // Close the details dialog if it's open
      if (isDetailsOpen) {
        setIsDetailsOpen(false);
        setSelectedLeave(null);
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast({
        title: "Rejection Failed",
        description: "There was an error rejecting the leave request.",
        variant: "destructive",
      });
    } finally {
      // Remove the leave ID from the processing state
      setProcessingLeaveIds(prev => prev.filter(id => id !== leaveId));
    }
  };

  const handleViewAllRequests = () => {
    toast({
      title: "Navigating to Leave Requests",
      description: "Viewing all leave requests",
    });
    // Since we don't have a /hr/leaves page yet, this will throw a 404 error,
    // but it demonstrates that the button is working
    navigate("/dashboard/hr/leaves");
  };

  // Filter leaves based on selected filters
  const filteredLeaves = leaves.filter(leave => {
    // Filter by leave type
    if (filter !== "all" && leave.type !== filter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== "all" && leave.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  // Sort leaves by start date (upcoming first) and status (pending first)
  const sortedLeaves = [...filteredLeaves].sort((a, b) => {
    // First sort by status (Pending first)
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (a.status !== "Pending" && b.status === "Pending") return 1;
    
    // Then sort by start date
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">Upcoming Leave Requests</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-3.5 w-3.5 mr-2" />
                {filter === "all" ? "All Types" : filter}
                <ChevronDown className="h-3.5 w-3.5 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>All Types</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Annual Leave")}>Annual Leave</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Sick Leave")}>Sick Leave</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Personal Leave")}>Personal Leave</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Family Responsibility")}>Family Responsibility</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("Study Leave")}>Study Leave</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {sortedLeaves.map((leave) => {
        const { formatted, days } = formatDateRange(leave.startDate, leave.endDate);
        
        return (
          <div
            key={leave.id}
            className="flex items-start p-3 rounded-lg border hover:bg-accent transition-colors"
            onClick={() => handleViewLeaveDetails(leave)}
            style={{ cursor: 'pointer' }}
          >
            <Avatar className="mr-3 mt-1">
              {leave.employee.image ? (
                <AvatarImage src={leave.employee.image} alt={leave.employee.name} />
              ) : (
                <AvatarFallback>
                  {leave.employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <div className="font-medium">{leave.employee.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {leave.employee.position}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-1.5">
                  <Badge
                    variant="outline"
                    className={getLeaveTypeColor(leave.type)}
                  >
                    {leave.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getStatusColor(leave.status)}
                  >
                    {leave.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span className="text-sm">{formatted} ({days} {days === 1 ? 'day' : 'days'})</span>
              </div>
              {leave.reason && (
                <div className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]">
                  Reason: {leave.reason}
                </div>
              )}
              {leave.status === "Pending" && (
                <div className="flex gap-1 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2 py-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveLeave(leave.id);
                    }}
                    disabled={processingLeaveIds.includes(leave.id)}
                  >
                    {processingLeaveIds.includes(leave.id) ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2 py-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectLeave(leave.id);
                    }}
                    disabled={processingLeaveIds.includes(leave.id)}
                  >
                    {processingLeaveIds.includes(leave.id) ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5 mr-1" />
                    )}
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {sortedLeaves.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No leave requests match your filters</p>
        </div>
      )}

      <div className="pt-3 border-t">
        <Button 
          variant="outline" 
          className="w-full" 
          size="sm"
          onClick={handleViewAllRequests}
        >
          View All Leave Requests
        </Button>
      </div>

      {/* Leave Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        {selectedLeave && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
              <DialogDescription>
                Request #{selectedLeave.id} - {selectedLeave.type}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  {selectedLeave.employee.image ? (
                    <AvatarImage src={selectedLeave.employee.image} alt={selectedLeave.employee.name} />
                  ) : (
                    <AvatarFallback>
                      {selectedLeave.employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{selectedLeave.employee.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedLeave.employee.position} - {selectedLeave.employee.department}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <Badge variant="outline" className={getStatusColor(selectedLeave.status)}>
                    {selectedLeave.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium">Type</div>
                  <Badge variant="outline" className={getLeaveTypeColor(selectedLeave.type)}>
                    {selectedLeave.type}
                  </Badge>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium">Date Range</div>
                <div className="text-sm">
                  {formatDateRange(selectedLeave.startDate, selectedLeave.endDate).formatted} 
                  ({formatDateRange(selectedLeave.startDate, selectedLeave.endDate).days} days)
                </div>
              </div>
              
              {selectedLeave.reason && (
                <div>
                  <div className="text-sm font-medium">Reason</div>
                  <div className="text-sm">{selectedLeave.reason}</div>
                </div>
              )}
              
              {selectedLeave.approvedBy && (
                <div>
                  <div className="text-sm font-medium">Approved By</div>
                  <div className="text-sm">{selectedLeave.approvedBy} on {format(new Date(selectedLeave.approvedDate || ''), 'MMM d, yyyy')}</div>
                </div>
              )}
              
              {selectedLeave.notes && (
                <div>
                  <div className="text-sm font-medium">Notes</div>
                  <div className="text-sm">{selectedLeave.notes}</div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              {selectedLeave.status === "Pending" && (
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleRejectLeave(selectedLeave.id)}
                    disabled={processingLeaveIds.includes(selectedLeave.id)}
                  >
                    {processingLeaveIds.includes(selectedLeave.id) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleApproveLeave(selectedLeave.id)}
                    disabled={processingLeaveIds.includes(selectedLeave.id)}
                  >
                    {processingLeaveIds.includes(selectedLeave.id) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </div>
              )}
              {selectedLeave.status !== "Pending" && (
                <Button onClick={handleCloseDetails}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default UpcomingLeaves;
