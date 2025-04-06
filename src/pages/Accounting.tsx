
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Accounting = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Accounting</h1>
        <p className="text-gray-500">Manage your company's financial transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/accounting/chart-of-accounts" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Organize your accounts in a structured hierarchy
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/accounting/journal-entries" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Journal Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Record and manage your accounting transactions
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/accounting/bank-reconciliation" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Bank Reconciliation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Match your accounting records with bank statements
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/accounting/reports" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Generate income statements, balance sheets, and cash flow reports
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/accounting/receivables" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Accounts Receivable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Track money owed to your business by customers
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/accounting/payables" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Accounts Payable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Manage bills and payments to your suppliers
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/accounting/integrations" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Banking Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Connect to your bank accounts and accounting software
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/accounting/transactions" className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                View and categorize all your financial transactions
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Accounting;
