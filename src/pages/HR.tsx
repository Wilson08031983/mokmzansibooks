
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Heart
} from "lucide-react";
import EmployeeTable from "@/components/hr/EmployeeTable";
import PayrollSummary from "@/components/hr/PayrollSummary";
import AttendanceOverview from "@/components/hr/AttendanceOverview";
import UpcomingLeaves from "@/components/hr/UpcomingLeaves";
import { useNavigate } from "react-router-dom";

const HR = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value !== "overview") {
      navigate(`/hr/${value}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR & Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage your employees, payroll, attendance, and benefits
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button onClick={() => navigate("/hr/employees/new")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
          <Button variant="outline" onClick={() => navigate("/hr/payroll/run")}>
            <DollarSign className="mr-2 h-4 w-4" />
            Run Payroll
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
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
                  <div className="text-2xl font-bold">$32,540</div>
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
                <div className="text-2xl font-bold">4 Plans</div>
                <p className="text-xs text-muted-foreground mt-2">Health, Dental, Vision, 401k</p>
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
        </TabsContent>
        
        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <CardTitle>Leave Management</CardTitle>
              <CardDescription>View and manage employee leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => navigate("/hr/leaves/new")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  New Leave Request
                </Button>
              </div>
              <UpcomingLeaves />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle>Employee Benefits</CardTitle>
              <CardDescription>Manage healthcare, retirement, and other benefit plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["Healthcare", "Dental", "Vision", "Retirement"].map((benefit) => (
                    <Card key={benefit}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{benefit} Plan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">
                            {benefit === "Retirement" ? "401(k)" : "Standard"}
                          </div>
                          <Heart className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {benefit === "Retirement" ? "6% employer match" : "Coverage for all employees"}
                        </p>
                        <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate(`/hr/benefits/${benefit.toLowerCase()}`)}>
                          Manage Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => navigate("/hr/benefits/settings")}>
                    Benefit Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HR;
