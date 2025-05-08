
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  reconciled: boolean;
  reconciledDate?: string;
}

const BankReconciliation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  
  // Sample bank transactions data
  const [transactions, setTransactions] = useState<BankTransaction[]>([
    {
      id: "1",
      date: "2025-04-01",
      description: "Client Payment - ABC Corp",
      amount: 3500,
      reconciled: true,
    },
    {
      id: "2",
      date: "2025-04-02",
      description: "Office Supplies",
      amount: -250,
      reconciled: false,
    },
    {
      id: "3",
      date: "2025-04-03",
      description: "Client Payment - XYZ Ltd",
      amount: 4200,
      reconciled: false,
    },
    {
      id: "4",
      date: "2025-04-04",
      description: "Monthly Rent",
      amount: -2500,
      reconciled: true,
    },
    {
      id: "5",
      date: "2025-04-05",
      description: "Internet Bill",
      amount: -150,
      reconciled: false,
    },
  ]);

  const toggleReconciled = (id: string) => {
    setTransactions(prevTransactions => 
      prevTransactions.map(transaction => 
        transaction.id === id 
          ? { ...transaction, reconciled: !transaction.reconciled } 
          : transaction
      )
    );
  };

  const reconcileSelected = () => {
    setIsAlertDialogOpen(true);
  };

  const confirmReconciliation = () => {
    setIsReconciling(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const currentDate = new Date().toISOString().split('T')[0];
      
      setTransactions(prevTransactions => 
        prevTransactions.map(transaction => 
          transaction.reconciled
            ? { ...transaction, reconciledDate: currentDate }
            : transaction
        )
      );
      
      setIsReconciling(false);
      setIsAlertDialogOpen(false);
      
      toast({
        title: "Reconciliation Saved",
        description: "Your bank reconciliation has been updated successfully.",
      });
    }, 1000);
  };

  const unreconciledCount = transactions.filter(t => !t.reconciled).length;
  const reconciledCount = transactions.filter(t => t.reconciled).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/dashboard/accounting')}
              title="Back to Accounting"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Bank Reconciliation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500">Match your accounting records with bank statements</p>
            <Button 
              onClick={reconcileSelected}
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={unreconciledCount === transactions.length || reconciledCount === 0}
            >
              Save Reconciliation
            </Button>
          </div>
          
          <div className="border rounded-md">
            <div className="grid grid-cols-6 bg-gray-100 p-3 font-semibold border-b">
              <div>Date</div>
              <div className="col-span-2">Description</div>
              <div className="text-right">Amount</div>
              <div className="text-center">Reconciled</div>
              <div className="text-center">Status</div>
            </div>
            <div>
              {transactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-6 p-3 border-b last:border-b-0 hover:bg-gray-50">
                  <div>{transaction.date}</div>
                  <div className="col-span-2">{transaction.description}</div>
                  <div className={`text-right ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(transaction.amount, "ZAR")}
                  </div>
                  <div className="flex justify-center">
                    <Checkbox 
                      checked={transaction.reconciled} 
                      onCheckedChange={() => toggleReconciled(transaction.id)}
                    />
                  </div>
                  <div className="text-center">
                    {transaction.reconciledDate ? (
                      <Badge className="bg-green-500">
                        Reconciled on {transaction.reconciledDate}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Transactions</span>
              <span className="font-medium">{transactions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Reconciled</span>
              <div className="flex items-center">
                <span className="font-medium">{reconciledCount}</span>
                {reconciledCount > 0 && (
                  <Badge className="ml-2 bg-green-500 text-xs">
                    {Math.round((reconciledCount / transactions.length) * 100)}%
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Unreconciled</span>
              <div className="flex items-center">
                <span className="font-medium">{unreconciledCount}</span>
                {unreconciledCount > 0 && (
                  <Badge className="ml-2 bg-yellow-500 text-xs">
                    {Math.round((unreconciledCount / transactions.length) * 100)}%
                  </Badge>
                )}
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Bank Balance</span>
                <span className="font-medium">
                  {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0), "ZAR")}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">Reconciled Balance</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(
                    transactions
                      .filter(t => t.reconciledDate)
                      .reduce((sum, t) => sum + t.amount, 0),
                    "ZAR"
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reconciliation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to mark {reconciledCount} transaction{reconciledCount !== 1 ? 's' : ''} as reconciled. 
              This action will update your accounting records to match your bank statement. 
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReconciliation}
              disabled={isReconciling}
            >
              {isReconciling ? "Processing..." : "Confirm Reconciliation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BankReconciliation;
