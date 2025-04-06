
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

interface Receivable {
  id: string;
  customer: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: "paid" | "overdue" | "pending";
  daysOverdue?: number;
  description?: string;
}

// Sample customers for dropdown
const CUSTOMERS = [
  "ABC Corporation",
  "XYZ Inc.",
  "Global Enterprises",
  "Tech Solutions",
  "Acme Ltd",
  "Innovative Systems",
  "Premier Services",
  "Dynamic Solutions",
  "Future Tech Inc.",
  "Strategic Partners"
];

// Form schema for new invoice
const invoiceSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const Receivables = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Sample accounts receivable data
  const [receivables, setReceivables] = useState<Receivable[]>([
    {
      id: "1",
      customer: "ABC Corporation",
      invoiceNumber: "INV-2025-001",
      amount: 5500,
      dueDate: "2025-04-15",
      status: "pending",
    },
    {
      id: "2",
      customer: "XYZ Inc.",
      invoiceNumber: "INV-2025-002",
      amount: 3200,
      dueDate: "2025-03-30",
      status: "overdue",
      daysOverdue: 7,
    },
    {
      id: "3",
      customer: "Global Enterprises",
      invoiceNumber: "INV-2025-003",
      amount: 7800,
      dueDate: "2025-03-15",
      status: "paid",
    },
    {
      id: "4",
      customer: "Tech Solutions",
      invoiceNumber: "INV-2025-004",
      amount: 2950,
      dueDate: "2025-04-25",
      status: "pending",
    },
    {
      id: "5",
      customer: "Acme Ltd",
      invoiceNumber: "INV-2025-005",
      amount: 4300,
      dueDate: "2025-03-20",
      status: "overdue",
      daysOverdue: 17,
    },
  ]);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer: "",
      invoiceNumber: "",
      amount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      description: "",
    },
  });

  const sendReminder = (id: string) => {
    toast({
      title: "Reminder Sent",
      description: "Payment reminder has been sent to the customer",
    });
  };

  const createInvoice = (data: InvoiceFormValues) => {
    // Create an invoice number if not provided
    const invoiceNumber = data.invoiceNumber || `INV-${new Date().getFullYear()}-${String(receivables.length + 1).padStart(3, '0')}`;
    
    const newInvoice: Receivable = {
      id: (receivables.length + 1).toString(),
      customer: data.customer,
      invoiceNumber,
      amount: data.amount,
      dueDate: data.dueDate,
      status: "pending",
      description: data.description,
    };

    setReceivables(prev => [newInvoice, ...prev]);
    
    toast({
      title: "Invoice Created",
      description: `New invoice for ${formatCurrency(data.amount, "ZAR")} has been created.`,
    });
    
    setIsDialogOpen(false);
    form.reset({
      customer: "",
      invoiceNumber: "",
      amount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: "",
    });
  };

  const getStatusBadge = (status: Receivable['status'], daysOverdue?: number) => {
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
          <h1 className="text-2xl font-bold">Accounts Receivable</h1>
          <p className="text-gray-500">Track money owed to your business by customers</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <div className="grid grid-cols-6 bg-gray-100 p-3 font-semibold border-b">
                <div>Invoice #</div>
                <div>Customer</div>
                <div>Due Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>
              <div>
                {receivables.map((receivable) => (
                  <div key={receivable.id} className="grid grid-cols-6 p-3 border-b last:border-b-0 hover:bg-gray-50">
                    <div>{receivable.invoiceNumber}</div>
                    <div>{receivable.customer}</div>
                    <div>{receivable.dueDate}</div>
                    <div>{formatCurrency(receivable.amount, "ZAR")}</div>
                    <div>
                      {getStatusBadge(receivable.status, receivable.daysOverdue)}
                    </div>
                    <div className="text-right">
                      {receivable.status !== 'paid' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendReminder(receivable.id)}
                        >
                          Send Reminder
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
                <span className="text-sm">Total Receivables</span>
                <span className="font-medium">
                  {formatCurrency(receivables.reduce((sum, r) => sum + r.amount, 0), "ZAR")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(
                    receivables
                      .filter(r => r.status === 'overdue')
                      .reduce((sum, r) => sum + r.amount, 0),
                    "ZAR"
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <span className="font-medium text-yellow-600">
                  {formatCurrency(
                    receivables
                      .filter(r => r.status === 'pending')
                      .reduce((sum, r) => sum + r.amount, 0),
                    "ZAR"
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Paid</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(
                    receivables
                      .filter(r => r.status === 'paid')
                      .reduce((sum, r) => sum + r.amount, 0),
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
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(createInvoice)} className="space-y-4">
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CUSTOMERS.map(customer => (
                          <SelectItem key={customer} value={customer}>{customer}</SelectItem>
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
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Auto-generated if empty" />
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
                      <Textarea {...field} placeholder="Enter invoice description" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Create Invoice</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Receivables;
