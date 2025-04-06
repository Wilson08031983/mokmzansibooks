
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";

// Sample leave data
const leaveData = [
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
  },
];

const UpcomingLeaves = () => {
  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "Annual Leave":
        return "bg-blue-100 text-blue-800";
      case "Sick Leave":
        return "bg-red-100 text-red-800";
      case "Personal Leave":
        return "bg-purple-100 text-purple-800";
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

  // Sort leaves by start date (upcoming first)
  const sortedLeaves = [...leaveData].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedLeaves.map((leave) => {
        const { formatted, days } = formatDateRange(leave.startDate, leave.endDate);
        
        return (
          <div
            key={leave.id}
            className="flex items-start p-3 rounded-lg border hover:bg-accent transition-colors"
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
                <Badge
                  variant="outline"
                  className={getLeaveTypeColor(leave.type)}
                >
                  {leave.type}
                </Badge>
              </div>
              <div className="flex items-center mt-2">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span className="text-sm">{formatted} ({days} {days === 1 ? 'day' : 'days'})</span>
              </div>
            </div>
          </div>
        );
      })}

      {leaveData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No upcoming leaves</p>
        </div>
      )}

      <div className="pt-3 border-t">
        <Button variant="outline" className="w-full" size="sm">
          View All Leave Requests
        </Button>
      </div>
    </div>
  );
};

export default UpcomingLeaves;
