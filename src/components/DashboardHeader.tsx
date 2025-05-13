
import { Menu, X, Users, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { Notifications } from "@/components/Notifications";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationsContext";
import { NetworkStatusIndicator } from "@/components/ui/network-status";

const DashboardHeader = () => {
  const { currentUser, signOut } = useSupabaseAuth();
  const { state, setOpen } = useSidebar();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [overdueClientsCount, setOverdueClientsCount] = useState(0);

  // Use a ref to track previous count to avoid unnecessary re-renders
  const prevCountRef = useRef(overdueClientsCount);
  
  useEffect(() => {
    // Count overdue client notifications
    const count = notifications.filter(n => {
      const messageLC = n.message.toLowerCase();
      return (
        messageLC.includes("overdue") && 
        messageLC.includes("client") && 
        !n.read
      );
    }).length;
    
    // Only update state if the count has actually changed from the previous value
    if (count !== prevCountRef.current) {
      prevCountRef.current = count;
      setOverdueClientsCount(count);
    }
  }, [notifications]); // Remove overdueClientsCount from dependencies

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get display name safely from user object
  const getUserDisplayName = () => {
    if (!currentUser) return "User";
    return currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || "User";
  };

  return (
    <header className="h-16 px-4 border-b flex items-center justify-between bg-background">
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="mr-2"
          onClick={() => setOpen(!state.includes("expanded"))}
        >
          {state === "collapsed" ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {overdueClientsCount > 0 && (
          <Button 
            variant="ghost" 
            className="relative flex items-center gap-1 text-xs text-red-500"
            onClick={() => navigate("/dashboard/clients")}
          >
            <AlertCircle className="h-4 w-4" />
            <span>{overdueClientsCount} overdue {overdueClientsCount === 1 ? 'client' : 'clients'}</span>
          </Button>
        )}
        <NetworkStatusIndicator />
        <ThemeToggle />
        <Notifications />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>
                  {getInitials(getUserDisplayName())}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {getUserDisplayName()}
              <p className="text-xs font-normal text-muted-foreground truncate max-w-[12rem]">
                {currentUser?.email || "user@example.com"}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
