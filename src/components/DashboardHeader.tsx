
import { Menu, X, Users, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { Notifications } from "@/components/Notifications";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationsContext";

const DashboardHeader = () => {
  const { currentUser, signOut } = useAuth();
  const { state, setOpen } = useSidebar();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [overdueClientsCount, setOverdueClientsCount] = useState(0);

  useEffect(() => {
    // Count overdue client notifications
    const count = notifications.filter(n => 
      (n.message.includes("overdue") || n.message.includes("Overdue")) && 
      n.message.includes("client") || n.message.includes("Client") && 
      !n.read
    ).length;
    
    setOverdueClientsCount(count);
  }, [notifications]);

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
            onClick={() => navigate("/clients")}
          >
            <AlertCircle className="h-4 w-4" />
            <span>{overdueClientsCount} overdue {overdueClientsCount === 1 ? 'client' : 'clients'}</span>
          </Button>
        )}
        <ThemeToggle />
        <Notifications />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>
                  {getInitials(currentUser?.name || "User")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {currentUser?.name || "User"}
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
