
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Payable {
  id: string;
  vendor: string;
  billNumber: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  daysOverdue?: number;
  description?: string;
}

// Sample vendors for dropdown
const VENDORS = [
  "Office Supplies Inc.",
  "Utility Company",
  "Web Hosting Services",
  "Equipment Rental",
  "Marketing Agency",
  "Software Solutions Ltd",
  "Printing Services Co.",
  "Cleaning Services",
  "Property Management",
  "Insurance Provider"
];

// Form schema for new bill
const billSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  billNumber: z.string().min(1, "Bill number is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
});

type BillFormValues = z.infer<typeof billSchema>;

const Payables = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      vendor: "",
      billNumber: "",
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      description: "",
    },
  });

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

  const addBill = (data: BillFormValues) => {
    // Create a bill number if not provided
    const billNumber = data.billNumber || `BILL-${new Date().getFullYear()}-${String(payables.length + 1).padStart(3, '0')}`;
    
    const newBill: Payable = {
      id: (payables.length + 1).toString(),
      vendor: data.vendor,
      billNumber,
      amount: data.amount,
      dueDate: data.dueDate,
      status: "pending",
      description: data.description,
    };

    setPayables(prev => [newBill, ...prev]);
    
    toast({
      title: "Bill Added",
      description: `New bill for ${formatCurrency(data.amount, "ZAR")} has been added to your payables.`,
    });
    
    setIsDialogOpen(false);
    form.reset({
      vendor: "",
      billNumber: "",
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      description: "",
    });
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
          onClick={() => setIsDialogOpen(true)}
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
                    <div>{formatCurrency(payable.amount, "ZAR")}</div>
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
                  {formatCurrency(payables.reduce((sum, p) => sum + p.amount, 0), "ZAR")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(
                    payables
                      .filter(p => p.status === 'overdue')
                      .reduce((sum, p) => sum + p.amount, 0), 
                    "ZAR"
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Due this month</span>
                <span className="font-medium text-yellow-600">
                  {formatCurrency(
                    payables
                      .filter(p => p.status === 'pending')
                      .reduce((sum, p) => sum + p.amount, 0),
                    "ZAR"
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Paid</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(
                    payables
                      .filter(p => p.status === 'paid')
                      .reduce((sum, p) => sum + p.amount, 0),
                    "ZAR"
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Bill</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addBill)} className="space-y-4">
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VENDORS.map(vendor => (
                          <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="billNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter bill number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (ZAR)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0.01" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter bill description" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add Bill</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payables;
