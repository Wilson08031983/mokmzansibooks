
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Users, FileText, Calculator, UserRound, Package, PieChart } from "lucide-react";

const Dashboard = () => {
  const { currentUser } = useAuth();
  
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {currentUser?.name || "User"}!</h1>
        <p className="text-muted-foreground">Here's an overview of your business management options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardCards.map((card) => (
          <Card key={card.title} className="overflow-hidden">
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
  );
};

export default Dashboard;
