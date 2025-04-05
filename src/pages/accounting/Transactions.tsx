
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";

const AccountingTransactions = () => {
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
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-gray-500">Manage your financial transactions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleFeatureClick}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
          <Button variant="outline" onClick={handleFeatureClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleFeatureClick}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-md mr-4">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Transaction #{1000 + index}</p>
                    <p className="text-sm text-gray-500">April {index + 1}, 2025</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency((Math.random() * 1000), "ZAR")}</p>
                  <p className="text-sm text-gray-500">
                    {index % 2 === 0 ? "Income" : "Expense"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountingTransactions;
