
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Tax = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tax Management</h1>
        <p className="text-gray-500">Manage your tax compliance and submissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/tax/vat-returns" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>VAT Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Prepare and submit your VAT returns to SARS
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/tax/income-tax" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Income Tax</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Manage your company income tax calculations and submissions
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/tax/paye" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>PAYE</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Calculate and submit employee tax deductions
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/tax/calendar" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Tax Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Stay on top of important tax deadlines and submissions
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/tax/documents" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Tax Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Store and manage your tax certificates and documents
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/tax/settings" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Configure your tax rates and preferences
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Tax;
