
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Tax = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleFeatureClick = () => {
    if (currentUser?.subscriptionStatus !== "active") {
      toast({
        title: "Premium Feature",
        description: "This feature is only available on the Premium plan.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tax Management</h1>
        <p className="text-gray-500">Manage your tax compliance and submissions</p>
      </div>

      {currentUser?.subscriptionStatus !== "active" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Premium Feature</AlertTitle>
          <AlertDescription>
            The tax management module is only available on the Premium plan. Please upgrade to access these features.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader>
            <CardTitle>VAT Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Prepare and submit your VAT returns to SARS
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader>
            <CardTitle>Income Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Manage your company income tax calculations and submissions
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader>
            <CardTitle>PAYE</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Calculate and submit employee tax deductions
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader>
            <CardTitle>Tax Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Stay on top of important tax deadlines and submissions
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader>
            <CardTitle>Tax Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Store and manage your tax certificates and documents
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader>
            <CardTitle>Tax Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Configure your tax rates and preferences
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tax;
