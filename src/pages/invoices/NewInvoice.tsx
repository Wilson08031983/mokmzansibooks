
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";

const formSchema = z.object({
  clientId: z.string().min(1, { message: "Client is required" }),
  invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
  issueDate: z.string().min(1, { message: "Issue date is required" }),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  status: z.string(),
  items: z.array(
    z.object({
      description: z.string().min(1, { message: "Description is required" }),
      quantity: z.number().min(1, { message: "Quantity is required" }),
      rate: z.number().min(0, { message: "Rate is required" }),
      amount: z.number(),
    })
  ).default([{ description: "", quantity: 1, rate: 0, amount: 0 }]),
  notes: z.string().optional(),
  terms: z.string().optional(),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

// Mock client data
const mockClients = [
  { id: "client1", name: "ABC Construction Ltd" },
  { id: "client2", name: "Cape Town Retailers" },
  { id: "client3", name: "Durban Services Co" },
  { id: "client4", name: "Johannesburg Tech Solutions" },
  { id: "client5", name: "Eastern Cape Supplies" },
];

const NewInvoice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0],
      status: "draft",
      items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      notes: "",
      terms: "Payment due within 14 days of invoice date.",
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  });

  const [items, setItems] = useState([{ description: "", quantity: 1, rate: 0, amount: 0 }]);

  const calculateLineTotal = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const onSubmit = (data: FormValues) => {
    // Here we would typically save the invoice to a database
    console.log("Form submitted:", data);
    toast({
      title: "Invoice Created",
      description: `Invoice ${data.invoiceNumber} has been created.`,
    });
    navigate("/invoices");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate("/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
          </Button>
          <h1 className="text-2xl font-bold ml-4">New Invoice</h1>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)}>
          <Save className="mr-2 h-4 w-4" /> Save Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientId">Client</Label>
                  <Select
                    onValueChange={(value) => form.setValue("clientId", value)}
                    defaultValue={form.getValues("clientId")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) => form.setValue("status", value)}
                    defaultValue={form.getValues("status")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    {...form.register("invoiceNumber")}
                  />
                </div>
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    {...form.register("issueDate")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...form.register("dueDate")}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (15%)</span>
                <span>R0.00</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>R0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 font-medium text-sm">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Rate (R)</div>
              <div className="col-span-2">Amount (R)</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].description = e.target.value;
                      setItems(newItems);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].quantity = parseInt(e.target.value);
                      newItems[index].amount = calculateLineTotal(parseInt(e.target.value), item.rate);
                      setItems(newItems);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].rate = parseFloat(e.target.value);
                      newItems[index].amount = calculateLineTotal(item.quantity, parseFloat(e.target.value));
                      setItems(newItems);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    readOnly
                    value={item.amount}
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="h-full"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addItem}>
              Add Item
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes & Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                {...form.register("notes")}
                placeholder="Additional notes for the client"
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms and Conditions</Label>
              <Input
                id="terms"
                {...form.register("terms")}
                placeholder="Payment terms and conditions"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewInvoice;
