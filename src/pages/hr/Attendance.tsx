
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, Clock, UserCheck, UserMinus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data
const attendanceData = [
  {
    id: 1,
    name: "John Doe",
    position: "Software Developer",
    clockIn: "2025-04-06T09:05:23",
    clockOut: "2025-04-06T17:15:45",
    status: "Present",
  },
  {
    id: 2,
    name: "Jane Smith",
    position: "Marketing Manager",
    clockIn: "2025-04-06T08:55:12",
    clockOut: "2025-04-06T17:02:38",
    status: "Present",
  },
  {
    id: 3,
    name: "Robert Johnson",
    position: "Financial Analyst",
    clockIn: "",
    clockOut: "",
    status: "On Leave",
  },
  {
    id: 4,
    name: "Emily Davis",
    position: "HR Specialist",
    clockIn: "2025-04-06T09:10:02",
    clockOut: "2025-04-06T17:05:18",
    status: "Present",
  },
  {
    id: 5,
    name: "Michael Brown",
    position: "Sales Representative",
    clockIn: "2025-04-06T10:25:33",
    clockOut: "",
    status: "Working",
  },
];

const summaryData = {
  present: 3,
  late: 1,
  absent: 0,
  leave: 1,
  remote: 0,
  total: 5,
  attendanceRate: 80,
};

const Attendance = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAttendance = attendanceData.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Late":
        return "bg-orange-100 text-orange-800";
      case "Working":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "—";
    return format(new Date(timeString), "hh:mm a");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Monitor employee attendance and time tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal w-[240px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button>Generate Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{summaryData.total}</div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Expected today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{summaryData.present}</div>
              <UserCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(summaryData.present / summaryData.total * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{summaryData.leave}</div>
              <UserMinus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(summaryData.leave / summaryData.total * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{summaryData.attendanceRate}%</div>
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              For {format(date, "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Tabs defaultValue="daily">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Attendance Log</CardTitle>
                <CardDescription>Employee attendance for {format(date, "MMMM d, yyyy")}</CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value="daily">Daily View</TabsTrigger>
                <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full sm:w-64">
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => {
                  // Calculate duration if both clock in and clock out exist
                  let duration = "—";
                  if (record.clockIn && record.clockOut) {
                    const clockInTime = new Date(record.clockIn);
                    const clockOutTime = new Date(record.clockOut);
                    const diff = Math.abs(clockOutTime.getTime() - clockInTime.getTime());
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    duration = `${hours}h ${minutes}m`;
                  } else if (record.clockIn && record.status === "Working") {
                    duration = "In progress";
                  }

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{record.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {record.position}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(record.status)}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatTime(record.clockIn)}</TableCell>
                      <TableCell>{formatTime(record.clockOut)}</TableCell>
                      <TableCell>{duration}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredAttendance.length} of {attendanceData.length} records
          </div>
          <Button variant="outline" size="sm">Download Report</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Attendance;
