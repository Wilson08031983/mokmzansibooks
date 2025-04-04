import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { InvoiceData } from "@/types/invoice";

// Import templates
import Template1 from "@/components/invoices/templates/Template1";
import Template2 from "@/components/invoices/templates/Template2";
import Template3 from "@/components/invoices/templates/Template3";
import Template4 from "@/components/invoices/templates/Template4";
import Template5 from "@/components/invoices/templates/Template5";

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
  const location = useLocation();
  const { toast } = useToast();
  const templateId = location.state?.templateId || 1;
  
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
  const [previewData, setPreviewData] = useState<InvoiceData | null>(null);

  useEffect(() => {
    if (!location.state?.templateId) {
      navigate("/invoices/select-template");
    }
  }, [location.state, navigate]);

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

  const updatePreview = () => {
    const formValues = form.getValues();
    const clientInfo = mockClients.find(c => c.id === formValues.clientId);
    
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.amount;
    });
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    setPreviewData({
      invoiceNumber: formValues.invoiceNumber,
      issueDate: formValues.issueDate,
      dueDate: formValues.dueDate,
      client: {
        name: clientInfo?.name || "",
        address: "123 Client Street, Pretoria, South Africa",
        email: "client@example.com",
        phone: "012 345 6789"
      },
      company: {
        name: "MOKMzansi Holdings",
        address: "456 Business Ave, Johannesburg, 2000",
        email: "contact@mokmzansi.co.za",
        phone: "011 987 6543"
      },
      items: items,
      subtotal: subtotal,
      tax: tax,
      total: total,
      notes: formValues.notes || "",
      terms: formValues.terms || ""
    });
  };

  useEffect(() => {
    updatePreview();
  }, [items, form.watch()]);

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    console.log("Items:", items);
    
    toast({
      title: "Invoice Created",
      description: `Invoice ${data.invoiceNumber} has been created.`,
    });
    navigate("/invoices");
  };

  const renderTemplate = () => {
    if (!previewData) return null;

    switch (templateId) {
      case 1:
        return <Template1 data={previewData} />;
      case 2:
        return <Template2 data={previewData} />;
      case 3:
        return <Template3 data={previewData} />;
      case 4:
        return <Template4 data={previewData} />;
      case 5:
        return <Template5 data={previewData} />;
      default:
        return <Template1 data={previewData} />;
    }
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
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate("/invoices/select-template")}>
            Change Template
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="mr-2 h-4 w-4" /> Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
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
                      onValueChange={(value) => {
                        form.setValue("clientId", value);
                        updatePreview();
                      }}
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
                      onValueChange={(value) => {
                        form.setValue("status", value);
                        updatePreview();
                      }}
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
                      onChange={(e) => {
                        form.setValue("invoiceNumber", e.target.value);
                        updatePreview();
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      {...form.register("issueDate")}
                      onChange={(e) => {
                        form.setValue("issueDate", e.target.value);
                        updatePreview();
                      }}
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
                      onChange={(e) => {
                        form.setValue("dueDate", e.target.value);
                        updatePreview();
                      }}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

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
                    onChange={(e) => {
                      form.setValue("notes", e.target.value);
                      updatePreview();
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Terms and Conditions</Label>
                  <Input
                    id="terms"
                    {...form.register("terms")}
                    placeholder="Payment terms and conditions"
                    onChange={(e) => {
                      form.setValue("terms", e.target.value);
                      updatePreview();
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="sticky top-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[650px] overflow-auto flex items-center justify-center bg-gray-100">
                <div className="transform scale-[0.4] origin-top mt-8" style={{ width: '210mm', height: '297mm' }}>
                  {renderTemplate()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
