
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, BarChart3, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AccountingReports = () => {
  const { toast } = useToast();

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
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-gray-500">View and generate financial reports</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleFeatureClick}>
            <Calendar className="mr-2 h-4 w-4" />
            Select Period
          </Button>
          <Button variant="outline" onClick={handleFeatureClick}>
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Income Statement</CardTitle>
            <BarChart3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              View your revenue, expenses, and profit over time
            </p>
            <div className="h-44 flex items-center justify-center bg-primary/5 rounded-md">
              <p className="text-gray-500">Income visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Balance Sheet</CardTitle>
            <PieChart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Track your assets, liabilities, and equity
            </p>
            <div className="h-44 flex items-center justify-center bg-primary/5 rounded-md">
              <p className="text-gray-500">Balance sheet visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Cash Flow</CardTitle>
            <BarChart3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Monitor your cash inflows and outflows
            </p>
            <div className="h-44 flex items-center justify-center bg-primary/5 rounded-md">
              <p className="text-gray-500">Cash flow visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleFeatureClick}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Tax Summary</CardTitle>
            <PieChart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Overview of your tax liabilities and payments
            </p>
            <div className="h-44 flex items-center justify-center bg-primary/5 rounded-md">
              <p className="text-gray-500">Tax summary visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingReports;
