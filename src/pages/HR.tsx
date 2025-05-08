import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Heart,
  Clock,
  CalendarDays
} from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import EmployeeTable from "@/components/hr/EmployeeTable";
import PayrollSummary from "@/components/hr/PayrollSummary";
import AttendanceOverview from "@/components/hr/AttendanceOverview";
import UpcomingLeaves from "@/components/hr/UpcomingLeaves";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";

const HR = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Define HR module tabs
  const hrModules = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Briefcase className="h-4 w-4" />,
      path: '/dashboard/hr'
    },
    {
      id: 'employees',
      title: 'Employees',
      icon: <Users className="h-4 w-4" />,
      path: '/dashboard/hr/employees'
    },
    {
      id: 'payroll',
      title: 'Payroll',
      icon: <DollarSign className="h-4 w-4" />,
      path: '/dashboard/hr/payroll'
    },
    {
      id: 'attendance',
      title: 'Attendance',
      icon: <Clock className="h-4 w-4" />,
      path: '/dashboard/hr/attendance'
    },
    {
      id: 'leaves',
      title: 'Leaves',
      icon: <CalendarDays className="h-4 w-4" />,
      path: '/dashboard/hr/leaves'
    },
    {
      id: 'benefits',
      title: 'Benefits',
      icon: <Heart className="h-4 w-4" />,
      path: '/dashboard/hr/benefits'
    }
  ];

  const handleAddEmployee = () => {
    navigate("/dashboard/hr/new-employee");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR & Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage your employees, payroll, attendance, and benefits
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button onClick={handleAddEmployee}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard/hr/run-payroll")}>
            <DollarSign className="mr-2 h-4 w-4" />
            Run Payroll
          </Button>
        </div>
      </div>
      
      {/* HR Module Navigation */}
      <div className="flex overflow-x-auto pb-1">
        <div className="flex space-x-2">
          {hrModules.map((module) => (
            <NavLink 
              key={module.id}
              to={module.path}
              end={module.id === 'overview'}
              className={({ isActive }) => cn(
                "flex items-center space-x-1 px-3 py-2 text-sm rounded-md transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              {module.icon}
              <span className="ml-2">{module.title}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">24</div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">+2 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">96%</div>
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">+1.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(32540)}</div>
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Due on April 30, 2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">5</div>
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">3 pending approvals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Employee Overview</CardTitle>
            <CardDescription>Current employee distribution and details</CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeTable />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
            <CardDescription>Monthly breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <PayrollSummary />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>Daily attendance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceOverview />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Leaves</CardTitle>
            <CardDescription>Approved leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingLeaves />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefits</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Plans</div>
            <p className="text-xs text-muted-foreground mt-2">Health Insurance, 401k</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground mt-2">5 require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-2">Active training programs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HR;
