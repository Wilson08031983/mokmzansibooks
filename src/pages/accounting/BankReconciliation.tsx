
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  reconciled: boolean;
}

const BankReconciliation = () => {
  const { toast } = useToast();
  
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
    toast({
      title: "Reconciliation Saved",
      description: "Your bank reconciliation has been updated",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const unreconciledCount = transactions.filter(t => !t.reconciled).length;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
          <p className="text-gray-500">Match your accounting records with bank statements</p>
        </div>
        <Button 
          onClick={reconcileSelected}
          className="bg-primary hover:bg-primary/90 text-white"
          disabled={unreconciledCount === 0}
        >
          Save Reconciliation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Transactions to Reconcile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <div className="grid grid-cols-5 bg-gray-100 p-3 font-semibold border-b">
                <div>Date</div>
                <div className="col-span-2">Description</div>
                <div className="text-right">Amount</div>
                <div className="text-center">Reconciled</div>
              </div>
              <div>
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="grid grid-cols-5 p-3 border-b last:border-b-0 hover:bg-gray-50">
                    <div>{transaction.date}</div>
                    <div className="col-span-2">{transaction.description}</div>
                    <div className={`text-right ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="flex justify-center">
                      <Checkbox 
                        checked={transaction.reconciled} 
                        onCheckedChange={() => toggleReconciled(transaction.id)}
                      />
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
                <span className="font-medium">{transactions.filter(t => t.reconciled).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Unreconciled</span>
                <span className="font-medium">{unreconciledCount}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Bank Balance</span>
                  <span className="font-medium">
                    {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankReconciliation;
