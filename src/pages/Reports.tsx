
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Reports = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Modified to always allow access to all features
  const handleFeatureClick = () => {
    toast({
      title: "Feature Access Granted",
      description: "You now have full access to this feature.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-500">Generate and view reports for your business</p>
        </div>
        {/* Removed the buttons that were here */}
      </div>

      {/* Removed the premium alert that was here */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
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
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Profit &amp; Loss
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
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
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Sales Trends
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Regional Analysis
              </li>
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
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
