
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Save, ChevronDown } from "lucide-react";
import { InvoiceData } from "@/types/invoice";
import { QuoteData } from "@/types/quote";

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
  shortDescription: z.string().optional(),
  status: z.string(),
  items: z.array(
    z.object({
      itemNo: z.number(),
      description: z.string().min(1, { message: "Description is required" }),
      quantity: z.number().min(1, { message: "Quantity is required" }),
      rate: z.number().min(0, { message: "Rate is required" }),
      amount: z.number(),
      discount: z.number().min(0),
      total: z.number(),
    })
  ).default([{ itemNo: 1, description: "", quantity: 1, rate: 0, amount: 0, discount: 0, total: 0 }]),
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

// Mock quotation data
const mockQuotations = [
  {
    id: "quote1",
    quoteNumber: "QUO-2025-001",
    clientId: "client1",
    issueDate: "2025-03-15",
    expiryDate: "2025-04-15",
    description: "Office renovation project",
    items: [
      { 
        itemNo: 1, 
        description: "Design Consultation", 
        quantity: 5, 
        rate: 1200, 
        amount: 6000, 
        discount: 500, 
        total: 5500 
      },
      { 
        itemNo: 2, 
        description: "Material Procurement", 
        quantity: 1, 
        rate: 8500, 
        amount: 8500, 
        discount: 0, 
        total: 8500 
      }
    ],
    notes: "Quote includes all consultation fees and materials.",
    terms: "Valid for 30 days from the issue date."
  },
  {
    id: "quote2",
    quoteNumber: "QUO-2025-002",
    clientId: "client3",
    issueDate: "2025-03-20",
    expiryDate: "2025-04-20",
    description: "IT Infrastructure Setup",
    items: [
      { 
        itemNo: 1, 
        description: "Network Installation", 
        quantity: 1, 
        rate: 15000, 
        amount: 15000, 
        discount: 1500, 
        total: 13500 
      },
      { 
        itemNo: 2, 
        description: "Hardware Supply", 
        quantity: 10, 
        rate: 5000, 
        amount: 50000, 
        discount: 5000, 
        total: 45000 
      }
    ],
    notes: "Quote includes installation and 1-year warranty.",
    terms: "50% payment upfront, balance upon completion."
  },
  {
    id: "quote3",
    quoteNumber: "QUO-2025-003",
    clientId: "client5",
    issueDate: "2025-03-25",
    expiryDate: "2025-04-25",
    description: "Annual Supplies Contract",
    items: [
      { 
        itemNo: 1, 
        description: "Office Supplies", 
        quantity: 12, 
        rate: 2500, 
        amount: 30000, 
        discount: 3000, 
        total: 27000 
      }
    ],
    notes: "Monthly deliveries as per schedule.",
    terms: "Monthly invoicing with 14-day payment terms."
  }
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
      shortDescription: "",
      status: "draft",
      items: [{ itemNo: 1, description: "", quantity: 1, rate: 0, amount: 0, discount: 0, total: 0 }],
      notes: "",
      terms: "Payment due within 14 days of invoice date.",
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  });

  const [items, setItems] = useState([{ itemNo: 1, description: "", quantity: 1, rate: 0, amount: 0, discount: 0, total: 0 }]);
  const [previewData, setPreviewData] = useState<InvoiceData | null>(null);

  useEffect(() => {
    if (!location.state?.templateId) {
      navigate("/invoices/select-template");
    }
  }, [location.state, navigate]);

  const calculateLineAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const calculateLineTotal = (amount: number, discount: number) => {
    return amount - discount;
  };

  const addItem = () => {
    setItems([...items, { itemNo: items.length + 1, description: "", quantity: 1, rate: 0, amount: 0, discount: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      
      // Reorder item numbers
      newItems.forEach((item, idx) => {
        item.itemNo = idx + 1;
      });
      
      setItems(newItems);
    }
  };

  const updatePreview = () => {
    const formValues = form.getValues();
    const clientInfo = mockClients.find(c => c.id === formValues.clientId);
    
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.total;
    });
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    setPreviewData({
      invoiceNumber: formValues.invoiceNumber,
      issueDate: formValues.issueDate,
      dueDate: formValues.dueDate,
      shortDescription: formValues.shortDescription,
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

  const populateFromQuote = (quoteId: string) => {
    const selectedQuote = mockQuotations.find(q => q.id === quoteId);
    
    if (!selectedQuote) return;
    
    // Update client
    form.setValue("clientId", selectedQuote.clientId);
    
    // Update dates
    form.setValue("issueDate", new Date().toISOString().split("T")[0]);
    form.setValue("dueDate", new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0]);
    
    // Update description
    form.setValue("shortDescription", selectedQuote.description);
    
    // Update items
    const formattedItems = selectedQuote.items.map(item => ({
      itemNo: item.itemNo,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      discount: item.discount,
      total: item.total
    }));
    
    setItems(formattedItems);
    
    // Update notes and terms
    form.setValue("notes", selectedQuote.notes);
    form.setValue("terms", selectedQuote.terms);
    
    // Calculate totals
    let subtotal = 0;
    formattedItems.forEach(item => {
      subtotal += item.total;
    });
    const tax = subtotal * 0.15;
    const total = subtotal + tax;
    
    form.setValue("subtotal", subtotal);
    form.setValue("tax", tax);
    form.setValue("total", total);
    
    toast({
      title: "Quote Imported",
      description: `Quote ${selectedQuote.quoteNumber} has been imported to this invoice.`,
    });
    
    updatePreview();
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Import from Quote <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select Quotation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {mockQuotations.map((quote) => (
                <DropdownMenuItem 
                  key={quote.id} 
                  onClick={() => populateFromQuote(quote.id)}
                  className="cursor-pointer"
                >
                  {quote.quoteNumber} - {mockClients.find(c => c.id === quote.clientId)?.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input
                      id="shortDescription"
                      placeholder="Brief description of the invoice"
                      {...form.register("shortDescription")}
                      onChange={(e) => {
                        form.setValue("shortDescription", e.target.value);
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
                <div className="grid grid-cols-16 gap-2 font-medium text-sm">
                  <div className="col-span-1">No</div>
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Rate (R)</div>
                  <div className="col-span-2">Amount (R)</div>
                  <div className="col-span-2">Discount (R)</div>
                  <div className="col-span-1">Total (R)</div>
                  <div className="col-span-1"></div>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-16 gap-2">
                    <div className="col-span-1">
                      <Input
                        value={item.itemNo}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
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
                          const quantity = parseInt(e.target.value);
                          newItems[index].quantity = quantity;
                          newItems[index].amount = calculateLineAmount(quantity, item.rate);
                          newItems[index].total = calculateLineTotal(newItems[index].amount, item.discount);
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
                          const rate = parseFloat(e.target.value);
                          newItems[index].rate = rate;
                          newItems[index].amount = calculateLineAmount(item.quantity, rate);
                          newItems[index].total = calculateLineTotal(newItems[index].amount, item.discount);
                          setItems(newItems);
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        readOnly
                        value={item.amount}
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) => {
                          const newItems = [...items];
                          const discount = parseFloat(e.target.value);
                          newItems[index].discount = discount;
                          newItems[index].total = calculateLineTotal(item.amount, discount);
                          setItems(newItems);
                        }}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        readOnly
                        value={item.total}
                        className="bg-gray-50"
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
              <div className="h-[700px] overflow-auto flex items-center justify-center bg-gray-100">
                <div className="transform scale-[0.35] origin-top-center w-full flex justify-center" style={{ marginTop: '-30px' }}>
                  <div style={{ width: '210mm', height: '297mm' }}>
                    {renderTemplate()}
                  </div>
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
