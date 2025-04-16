
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Link } from "react-router-dom";
import { FileText, Upload, Download, ExternalLink, Calculator, Calendar, Settings } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  // Find important notifications related to tax
  const taxNotifications = notifications.filter(
    notification => 
      notification.title.includes('Deadline') || 
      notification.title.includes('VAT') || 
      notification.title.includes('PAYE') ||
      notification.title.includes('Document Expiring')
  ).slice(0, 3);

  const upcomingDeadlines = taxDeadlines
    .filter(deadline => new Date(deadline.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  // Define the main report types for SARS e-Filing
  const reportCategories = [
    {
      title: "VAT Reports",
      description: "Generate VAT returns for SARS e-Filing submission",
      path: "/tax/vat-returns",
      icon: <FileText className="h-10 w-10 text-blue-500" />,
      badge: `${vatReturns.filter(item => item.status === "Due").length} Due`
    },
    {
      title: "PAYE Reports",
      description: "Generate monthly PAYE returns for submission",
      path: "/tax/paye",
      icon: <FileText className="h-10 w-10 text-purple-500" />,
      badge: `${payeReturns.filter(item => item.status === "Due").length} Due`
    },
    {
      title: "Income Tax Reports",
      description: "Prepare annual income tax returns for your business",
      path: "/tax/income-tax",
      icon: <Calculator className="h-10 w-10 text-green-500" />,
      badge: "Annual"
    },
    {
      title: "Document Upload",
      description: "Upload and manage all your SARS documents and certificates",
      path: "/tax/documents",
      icon: <Upload className="h-10 w-10 text-orange-500" />,
      badge: `${taxDocuments.length} Files`
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SARS e-Filing & Document Management</h1>
        <p className="text-gray-500">Generate reports and manage your SARS documentation</p>
      </div>

      {/* SARS Official Link */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-6 w-6 text-blue-600" />
            SARS e-Filing Portal
          </CardTitle>
          <CardDescription>
            Access the official SARS e-Filing website for submissions and downloads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-700">
                All official tax submissions must be done through the SARS e-Filing portal. 
                Our system helps prepare the necessary reports and manage your documents.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-600 hover:bg-blue-100"
              onClick={() => window.open('https://www.sarsefiling.co.za', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Go to SARS e-Filing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Important Notifications */}
      {taxNotifications.length > 0 && (
        <div className="space-y-3">
          {taxNotifications.map(notification => (
            <Alert key={notification.id} variant={notification.type === 'warning' ? 'destructive' : 'default'}>
              <FileText className="h-4 w-4" />
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

      {/* Main Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCategories.map((category, index) => (
          <Link to={category.path} className="block" key={index}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                {category.icon}
                {category.badge && (
                  <Badge variant={
                    category.badge.includes('Due') ? 'destructive' :
                    category.badge === 'Annual' ? 'outline' : 'secondary'
                  }>
                    {category.badge}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2">{category.title}</CardTitle>
                <p className="text-gray-500">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Access Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-500" />
              Tax Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/tax/calendar">
              <Button variant="outline" className="w-full">View Tax Deadlines</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5 text-green-500" />
              Document Download
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/tax/documents">
              <Button variant="outline" className="w-full">Access Documents</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/tax/settings">
              <Button variant="outline" className="w-full">Tax Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
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

      <div className="text-sm text-gray-500 mt-4">
        <p>Note: This system helps prepare and organize your tax documentation but all official submissions must be made through the SARS e-Filing portal.</p>
      </div>
    </div>
  );
};

export default Tax;
