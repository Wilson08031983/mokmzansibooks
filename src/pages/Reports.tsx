
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Reports = () => {
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
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-gray-500">Generate and view reports for your business</p>
      </div>

      {currentUser?.subscriptionStatus !== "active" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Premium Feature</AlertTitle>
          <AlertDescription>
            Comprehensive reports are only available on the Premium plan. Basic reports are available in the free trial.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Financial Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-500">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Income Statement
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Balance Sheet
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Cash Flow Statement
              </li>
              {currentUser?.subscriptionStatus !== "active" ? (
                <li className="flex items-center opacity-50">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Profit &amp; Loss (Premium)
                </li>
              ) : (
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Profit &amp; Loss
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Sales Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-500">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Sales by Client
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Sales by Item
              </li>
              {currentUser?.subscriptionStatus !== "active" ? (
                <>
                  <li className="flex items-center opacity-50">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                    Sales Trends (Premium)
                  </li>
                  <li className="flex items-center opacity-50">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                    Regional Analysis (Premium)
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Sales Trends
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Regional Analysis
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader>
            <CardTitle>Tax Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-500">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                VAT Summary
              </li>
              {currentUser?.subscriptionStatus !== "active" ? (
                <>
                  <li className="flex items-center opacity-50">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                    Tax Liability (Premium)
                  </li>
                  <li className="flex items-center opacity-50">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                    PAYE Reports (Premium)
                  </li>
                  <li className="flex items-center opacity-50">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                    Tax Deductions (Premium)
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Tax Liability
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    PAYE Reports
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Tax Deductions
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader>
            <CardTitle>Client Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-500">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Client List
              </li>
              {currentUser?.subscriptionStatus !== "active" ? (
                <>
                  <li className="flex items-center opacity-50">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                    Client Value Analysis (Premium)
                  </li>
                  <li className="flex items-center opacity-50">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                    Payment Behavior (Premium)
                  </li>
                  <li className="flex items-center opacity-50">
                    <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                    Client Growth (Premium)
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Client Value Analysis
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Payment Behavior
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Client Growth
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
