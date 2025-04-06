
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Payable {
  id: string;
  vendor: string;
  billNumber: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  daysOverdue?: number;
}

const Payables = () => {
  const { toast } = useToast();
  
  // Sample accounts payable data
  const [payables, setPayables] = useState<Payable[]>([
    {
      id: "1",
      vendor: "Office Supplies Inc.",
      billNumber: "BILL-2025-001",
      amount: 850,
      dueDate: "2025-04-15",
      status: "pending",
    },
    {
      id: "2",
      vendor: "Utility Company",
      billNumber: "BILL-2025-002",
      amount: 320,
      dueDate: "2025-03-30",
      status: "overdue",
      daysOverdue: 7,
    },
    {
      id: "3",
      vendor: "Web Hosting Services",
      billNumber: "BILL-2025-003",
      amount: 120,
      dueDate: "2025-03-15",
      status: "paid",
    },
    {
      id: "4",
      vendor: "Equipment Rental",
      billNumber: "BILL-2025-004",
      amount: 1200,
      dueDate: "2025-04-25",
      status: "pending",
    },
    {
      id: "5",
      vendor: "Marketing Agency",
      billNumber: "BILL-2025-005",
      amount: 3500,
      dueDate: "2025-03-20",
      status: "overdue",
      daysOverdue: 17,
    },
  ]);

  const payBill = (id: string) => {
    setPayables(prevPayables => 
      prevPayables.map(payable => 
        payable.id === id 
          ? { ...payable, status: "paid" as const } 
          : payable
      )
    );
    
    toast({
      title: "Payment Processed",
      description: "The bill has been marked as paid",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: Payable['status'], daysOverdue?: number) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "overdue":
        return <Badge className="bg-red-500">Overdue {daysOverdue ? `(${daysOverdue} days)` : ''}</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Accounts Payable</h1>
          <p className="text-gray-500">Manage bills and payments to your suppliers</p>
        </div>
        <Button 
          onClick={() => toast({ title: "New Bill", description: "Add a new bill to your payables" })}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Add Bill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Bills to Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <div className="grid grid-cols-6 bg-gray-100 p-3 font-semibold border-b">
                <div>Bill #</div>
                <div>Vendor</div>
                <div>Due Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>
              <div>
                {payables.map((payable) => (
                  <div key={payable.id} className="grid grid-cols-6 p-3 border-b last:border-b-0 hover:bg-gray-50">
                    <div>{payable.billNumber}</div>
                    <div>{payable.vendor}</div>
                    <div>{payable.dueDate}</div>
                    <div>{formatCurrency(payable.amount)}</div>
                    <div>
                      {getStatusBadge(payable.status, payable.daysOverdue)}
                    </div>
                    <div className="text-right">
                      {payable.status !== 'paid' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => payBill(payable.id)}
                        >
                          Pay Bill
                        </Button>
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
                <span className="text-sm">Total Payables</span>
                <span className="font-medium">
                  {formatCurrency(payables.reduce((sum, p) => sum + p.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(
                    payables
                      .filter(p => p.status === 'overdue')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Due this month</span>
                <span className="font-medium text-yellow-600">
                  {formatCurrency(
                    payables
                      .filter(p => p.status === 'pending')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Paid</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(
                    payables
                      .filter(p => p.status === 'paid')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payables;
