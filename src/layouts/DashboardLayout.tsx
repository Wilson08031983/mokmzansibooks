
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import PublicCompanyInfo from "@/components/PublicCompanyInfo";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [canGoBack, setCanGoBack] = useState(false);
  
  // Check if we can go back in history
  useEffect(() => {
    // We'll set canGoBack to true if we're not at the root dashboard
    const isDashboardRoot = location.pathname === "/dashboard" || 
                           location.pathname === "/dashboard/";
    setCanGoBack(!isDashboardRoot);
  }, [location.pathname]);

  const getTabsForSection = () => {
    if (location.pathname.includes('/dashboard/invoices')) {
      const currentPath = location.pathname;
      let defaultValue = "invoices";
      
      if (currentPath.includes("/dashboard/invoices/quotes")) {
        defaultValue = "quotes";
      } else if (currentPath.includes("/dashboard/invoices/manager")) {
        defaultValue = "manager";
      }
      
      return (
        <Tabs
          defaultValue={defaultValue}
          className="mb-4"
          onValueChange={value => {
            if (value === "invoices") navigate('/dashboard/invoices');
            else if (value === "quotes") navigate('/dashboard/invoices/quotes');
            else navigate(`/dashboard/invoices/${value}`);
          }}
        >
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="manager">Manager</TabsTrigger>
          </TabsList>
        </Tabs>
      );
    }

    if (location.pathname.includes('/dashboard/accounting')) {
      const currentPath = location.pathname;
      let defaultValue = "overview";
      
      if (currentPath.includes("/dashboard/accounting/transactions")) {
        defaultValue = "transactions";
      } else if (currentPath.includes("/dashboard/accounting/reports")) {
        defaultValue = "reports";
      }
      
      return (
        <Tabs
          defaultValue={defaultValue}
          className="mb-4"
          onValueChange={value => {
            navigate(`/dashboard/accounting${value !== 'overview' ? '/' + value : ''}`);
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

    // Choosing the newer version from the merge conflict
    // HR tabs have been moved to the HR.tsx component
    if (location.pathname.includes('/hr')) {
      return null;
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
            {canGoBack && (
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1" 
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            )}
            {getTabsForSection()}
            <Outlet />
          </main>
          {/* We add the PublicCompanyInfo component at the bottom right of the dashboard layout */}
          <div className="fixed bottom-4 right-4 z-50 w-72">
            <PublicCompanyInfo />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
