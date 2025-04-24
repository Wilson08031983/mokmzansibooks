
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Users, FileText, Calculator, UserRound, Package, PieChart, TrendingUp, Activity, Bell } from "lucide-react";
import PayrollSummary from "@/components/hr/PayrollSummary";
import EmployeeTable from "@/components/hr/EmployeeTable";
import UpcomingLeaves from "@/components/hr/UpcomingLeaves";

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  const statsCards = [
    {
      title: "Total Employees",
      value: "24",
      trend: "+2 this month",
      icon: Users,
      trendUp: true,
    },
    {
      title: "Pending Invoices",
      value: "12",
      trend: "4 overdue",
      icon: FileText,
      trendUp: false,
    },
    {
      title: "Monthly Revenue",
      value: "$45,231",
      trend: "+12.5% from last month",
      icon: TrendingUp,
      trendUp: true,
    },
    {
      title: "Active Projects",
      value: "8",
      trend: "2 closing soon",
      icon: Activity,
      trendUp: true,
    },
  ];

  const dashboardCards = [
    {
      title: "Clients",
      description: "Manage your clients and their details",
      icon: Users,
      path: "/clients",
    },
    {
      title: "Invoices & Quotes",
      description: "Create and manage invoices and quotes",
      icon: FileText,
      path: "/invoices",
    },
    {
      title: "Accounting",
      description: "Track finances and generate reports",
      icon: Calculator,
      path: "/accounting",
    },
    {
      title: "HR & Payroll",
      description: "Manage employees and payroll",
      icon: UserRound,
      path: "/hr",
    },
    {
      title: "Inventory",
      description: "Track stock and manage products",
      icon: Package,
      path: "/inventory",
    },
    {
      title: "Reports",
      description: "View financial and business reports",
      icon: PieChart,
      path: "/reports",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {currentUser?.name || "User"}!</h1>
        <p className="text-muted-foreground">Here's an overview of your business management options.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trendUp ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Payroll Summary */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
            <CardDescription>Monthly payroll distribution and breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <PayrollSummary />
          </CardContent>
        </Card>

        {/* Upcoming Leaves */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Leaves</CardTitle>
            <CardDescription>Employee leave schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingLeaves />
          </CardContent>
        </Card>

        {/* Employee Table */}
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>Recent Employees</CardTitle>
            <CardDescription>Overview of employee status and departments</CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeTable />
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardCards.map((card) => (
            <Card key={card.title} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <card.icon className="h-5 w-5" />
                  <span>{card.title}</span>
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button asChild variant="secondary" className="w-full">
                  <Link to={card.path}>Go to {card.title}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
