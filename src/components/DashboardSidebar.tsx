
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import Logo from "./Logo";
import { 
  BarChart3, Home, Users, FileText, FileSearch, Calculator, Receipt, PieChart, Settings, LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const DashboardSidebar = () => {
  const { currentUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Clients", path: "/clients" },
    { icon: FileText, label: "Invoices & Quotes", path: "/invoices" },
    { icon: FileSearch, label: "QuickFill", path: "/quickfill" },
    { icon: Calculator, label: "Accounting", path: "/accounting" },
    { icon: Receipt, label: "Tax", path: "/tax" },
    { icon: PieChart, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center">
          <Logo variant="full" />
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                className={cn(
                  "flex items-center gap-3 text-sidebar-foreground",
                  isActive(item.path) && "bg-sidebar-accent text-primary font-medium"
                )}
              >
                <Link to={item.path}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col space-y-3">
          {currentUser && (
            <div className="flex items-center space-x-3 p-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                {currentUser.name?.[0] || "U"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium text-sm">{currentUser.name}</p>
                <p className="truncate text-xs text-gray-500">{currentUser.email}</p>
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
