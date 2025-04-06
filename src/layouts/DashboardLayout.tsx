
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
  
  // Create dashboard-specific sub-navigation based on current section
  const getTabsForSection = () => {
    if (location.pathname.includes('/invoices')) {
      return (
        <Tabs
          defaultValue={location.pathname === '/invoices/quotes' ? 'quotes' : 'invoices'}
          className="mb-4"
          onValueChange={(value) => {
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
    
    if (location.pathname.includes('/accounting')) {
      // Determine the active tab based on the current path
      const currentPath = location.pathname;
      let defaultValue = "overview";
      
      if (currentPath.includes("/accounting/transactions")) {
        defaultValue = "transactions";
      } else if (currentPath.includes("/accounting/reports")) {
        defaultValue = "reports";
      } else if (currentPath.includes("/accounting/integrations")) {
        defaultValue = "integrations";
      }
      
      return (
        <Tabs
          defaultValue={defaultValue}
          className="mb-4"
          onValueChange={(value) => {
            navigate(`/accounting${value !== 'overview' ? '/' + value : ''}`);
          }}
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
        </Tabs>
      );
    }
    
    if (location.pathname.includes('/tax')) {
      return (
        <Tabs
          defaultValue="overview"
          className="mb-4"
          onValueChange={(value) => {
            navigate(`/tax${value !== 'overview' ? '/' + value : ''}`);
          }}
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="filings" disabled={currentUser?.subscriptionStatus !== "active"}>Tax Filings</TabsTrigger>
            <TabsTrigger value="documents" disabled={currentUser?.subscriptionStatus !== "active"}>Documents</TabsTrigger>
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
