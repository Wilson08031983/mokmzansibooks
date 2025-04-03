
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const DashboardHeader = () => {
  const location = useLocation();
  const { currentUser, signOut } = useAuth();
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    // Set the page title based on the current path
    const path = location.pathname;
    if (path.includes("dashboard")) setPageTitle("Dashboard");
    else if (path.includes("clients")) setPageTitle("Clients");
    else if (path.includes("quotes")) setPageTitle("Quotes");
    else if (path.includes("invoices")) setPageTitle("Invoices");
    else if (path.includes("quickfill")) setPageTitle("QuickFill");
    else if (path.includes("accounting")) setPageTitle("Accounting");
    else if (path.includes("tax")) setPageTitle("Tax");
    else if (path.includes("reports")) setPageTitle("Reports");
    else if (path.includes("settings")) setPageTitle("Settings");
  }, [location]);

  const subscriptionBadge = () => {
    if (!currentUser?.subscriptionStatus) return null;
    
    switch (currentUser.subscriptionStatus) {
      case "trial":
        return (
          <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500">
            Free Trial
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="ml-2 border-green-500 text-green-500">
            Premium
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 px-4 border-b bg-white flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold flex items-center">
          {pageTitle}
          {subscriptionBadge()}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
