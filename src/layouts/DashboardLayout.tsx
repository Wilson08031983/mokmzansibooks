import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const getTabsForSection = () => {
    if (location.pathname.includes('/invoices')) {
      if (location.pathname === '/invoices/quotes') {
        return (
          <Tabs
            defaultValue="quotes"
            className="mb-4"
            onValueChange={value => {
              if (value === 'quotes') navigate('/invoices/quotes');
              else navigate('/invoices');
            }}
          >
            <TabsList>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
            </TabsList>
          </Tabs>
        );
      }
    }

    if (location.pathname.includes('/accounting')) {
      const currentPath = location.pathname;
      let defaultValue = "overview";
      
      if (currentPath.includes("/accounting/transactions")) {
        defaultValue = "transactions";
      } else if (currentPath.includes("/accounting/reports")) {
        defaultValue = "reports";
      }
      
      return (
        <Tabs
          defaultValue={defaultValue}
          className="mb-4"
          onValueChange={value => {
            navigate(`/accounting${value !== 'overview' ? '/' + value : ''}`);
          }}
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </Tabs>
      );
    }

    if (location.pathname.includes('/hr')) {
      const currentPath = location.pathname;
      let defaultValue = "overview";
      if (currentPath.includes("/hr/employees")) {
        defaultValue = "employees";
      } else if (currentPath.includes("/hr/payroll")) {
        defaultValue = "payroll";
      } else if (currentPath.includes("/hr/attendance")) {
        defaultValue = "attendance";
      } else if (currentPath.includes("/hr/leaves")) {
        defaultValue = "leaves";
      } else if (currentPath.includes("/hr/benefits")) {
        defaultValue = "benefits";
      }
      
      return (
        <Tabs defaultValue={defaultValue} className="mb-4" onValueChange={value => {
          navigate(`/hr${value !== 'overview' ? '/' + value : ''}`);
        }}>
          <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full sm:w-auto">
            <TabsTrigger value="overview" className="px-4">Overview</TabsTrigger>
            <TabsTrigger value="employees" className="px-4">Employees</TabsTrigger>
            <TabsTrigger value="payroll" className="px-4">Payroll</TabsTrigger>
            <TabsTrigger value="attendance" className="px-4">Attendance</TabsTrigger>
            <TabsTrigger value="leaves" className="px-4">Leaves</TabsTrigger>
            <TabsTrigger value="benefits" className="px-4">Benefits</TabsTrigger>
          </TabsList>
        </Tabs>
      );
    }
    return null;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {getTabsForSection()}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
