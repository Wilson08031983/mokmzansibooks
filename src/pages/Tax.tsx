
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Link } from "react-router-dom";
import { CalendarIcon, FileText, Settings, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Tax = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { 
    vatReturns, 
    payeReturns, 
    taxDocuments, 
    taxDeadlines, 
    getTotalTaxLiability 
  } = useFinancialData();
  const { notifications } = useNotifications();

  // Calculate tax status for each card
  const dueVatReturns = vatReturns.filter(item => item.status === "Due").length;
  const duePayeReturns = payeReturns.filter(item => item.status === "Due").length;
  const upcomingDeadlines = taxDeadlines
    .filter(deadline => new Date(deadline.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  // Find important notifications related to tax
  const taxNotifications = notifications.filter(
    notification => 
      notification.title.includes('Deadline') || 
      notification.title.includes('VAT') || 
      notification.title.includes('PAYE') ||
      notification.title.includes('Document Expiring')
  ).slice(0, 3);

  const taxCards = [
    {
      title: "VAT Returns",
      description: "Prepare and submit your VAT returns to SARS",
      path: "/tax/vat-returns",
      icon: <FileText className="h-10 w-10 text-blue-500" />,
      status: {
        text: dueVatReturns ? `${dueVatReturns} Due` : "Up to date",
        color: dueVatReturns ? "text-yellow-600 bg-yellow-100" : "text-green-600 bg-green-100"
      }
    },
    {
      title: "Income Tax",
      description: "Manage your company income tax calculations and submissions",
      path: "/tax/income-tax",
      icon: <FileText className="h-10 w-10 text-green-500" />,
      status: {
        text: "Up to date",
        color: "text-green-600 bg-green-100"
      }
    },
    {
      title: "PAYE",
      description: "Calculate and submit employee tax deductions",
      path: "/tax/paye",
      icon: <FileText className="h-10 w-10 text-purple-500" />,
      status: {
        text: duePayeReturns ? `${duePayeReturns} Due` : "Up to date",
        color: duePayeReturns ? "text-yellow-600 bg-yellow-100" : "text-green-600 bg-green-100"
      }
    },
    {
      title: "Tax Calendar",
      description: "Stay on top of important tax deadlines and submissions",
      path: "/tax/calendar",
      icon: <CalendarIcon className="h-10 w-10 text-red-500" />,
      status: {
        text: `${upcomingDeadlines.length} Upcoming`,
        color: "text-blue-600 bg-blue-100"
      }
    },
    {
      title: "Tax Documents",
      description: "Store and manage your tax certificates and documents",
      path: "/tax/documents",
      icon: <FileText className="h-10 w-10 text-orange-500" />,
      status: {
        text: `${taxDocuments.length} Documents`,
        color: "text-gray-600 bg-gray-100"
      }
    },
    {
      title: "Tax Settings",
      description: "Configure your tax rates and preferences",
      path: "/tax/settings",
      icon: <Settings className="h-10 w-10 text-gray-500" />,
      status: null
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tax Management</h1>
        <p className="text-gray-500">Manage your tax compliance and submissions</p>
      </div>

      {taxNotifications.length > 0 && (
        <div className="space-y-3">
          {taxNotifications.map(notification => (
            <Alert key={notification.id} variant={notification.type === 'warning' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <div className="ml-3">
                <AlertTitle>{notification.title}</AlertTitle>
                <AlertDescription>{notification.message}</AlertDescription>
                {notification.link && (
                  <Link to={notification.link} className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                    View details
                  </Link>
                )}
              </div>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {taxCards.map((card, index) => (
          <Link to={card.path} className="block" key={index}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                {card.icon}
                {card.status && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${card.status.color}`}>
                    {card.status.text}
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2">{card.title}</CardTitle>
                <p className="text-gray-500">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Tax Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcomingDeadlines.map(deadline => {
                const daysLeft = Math.ceil(
                  (new Date(deadline.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <li key={deadline.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{deadline.title}</p>
                      <p className="text-sm text-gray-500">{format(new Date(deadline.date), 'MMMM d, yyyy')}</p>
                    </div>
                    <Badge variant={daysLeft <= 7 ? "destructive" : "outline"}>
                      {daysLeft} days left
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tax;
