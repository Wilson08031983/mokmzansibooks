import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import QuoteTemplate1 from "@/components/quotes/templates/QuoteTemplate1";
import QuoteTemplate2 from "@/components/quotes/templates/QuoteTemplate2";
import QuoteTemplate3 from "@/components/quotes/templates/QuoteTemplate3";
import QuoteTemplate4 from "@/components/quotes/templates/QuoteTemplate4";
import QuoteTemplate5 from "@/components/quotes/templates/QuoteTemplate5";
import { QuoteData } from "@/types/quote";

const formSchema = z.object({
  quoteNumber: z.string().min(2, {
    message: "Quote number must be at least 2 characters.",
  }),
  issueDate: z.string(),
  expiryDate: z.string(),
  client: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  vatRate: z.number(),
  notes: z.string(),
  terms: z.string(),
});

interface Item {
  id: string;
  itemNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

const NewQuote = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      itemNo: "ITEM-001",
      description: "Consultation Services",
      quantity: 10,
      unitPrice: 1500,
      discount: 0,
      amount: 15000,
    },
    {
      id: "2",
      itemNo: "ITEM-002",
      description: "Equipment Rental",
      quantity: 5,
      unitPrice: 2000,
      discount: 0,
      amount: 10000,
    },
  ]);
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quoteNumber: "QT-2025-0001",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      expiryDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      client: "Pretoria Engineering",
      vatRate: 0,
      notes: "This quotation is valid for 30 days.",
      terms: "50% deposit required to commence work.",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast("Quote Submitted", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
  }

  const handleAddItem = () => {
    const newItem: Item = {
      id: String(Date.now()),
      itemNo: `ITEM-${items.length + 1}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateAmount = (item: Item) => {
    const amount = item.quantity * item.unitPrice * (1 - item.discount / 100);
    return parseFloat(amount.toFixed(2));
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + calculateAmount(item), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * (form.watch("vatRate") / 100);
    return parseFloat(tax.toFixed(2));
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = subtotal + tax;
    return parseFloat(total.toFixed(2));
  };

  const createPreviewData = (): QuoteData => {
    return {
      quoteNumber: "QT-2025-0001",
      issueDate: form.watch("issueDate"),
      expiryDate: form.watch("expiryDate"),
      client: {
        name: form.watch("client") || "Client Name",
        address: "Client Address",
        email: "client@example.com",
        phone: "012 345 6789"
      },
      company: {
        name: "MOKMzansi Holdings",
        address: "456 Business Ave, Johannesburg, 2000",
        email: "contact@mokmzansi.co.za",
        phone: "011 987 6543",
        logo: "/lovable-uploads/44062e3c-e3b2-47ea-9869-37a2dc71b5d8.png",
        stamp: "/lovable-uploads/21bb22cc-35f7-4bdc-b74c-281c0412605d.png"
      },
      items: items.map((item) => ({
        itemNo: item.itemNo,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        amount: item.amount
      })),
      subtotal: calculateSubtotal(),
      vatRate: form.watch("vatRate") || 15,
      tax: calculateTax(),
      total: calculateTotal(),
      notes: form.watch("notes") || "This quotation is valid for 30 days.",
      terms: form.watch("terms") || "50% deposit required to commence work.",
      signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
    };
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">Create New Quote</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card className="p-6">
                <FormField
                  control={form.control}
                  name="quoteNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote Number</FormLabel>
                      <FormControl>
                        <Input placeholder="QT-2025-0001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Client Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vatRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VAT Rate (%)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select VAT Rate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="15">15%</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes about the quote"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Terms and conditions"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="mt-8 p-6 w-full">
                <h3 className="text-lg font-semibold mb-4">Items</h3>
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-6 gap-4 mb-4 items-center">
                    <div className="col-span-1">
                      <FormItem>
                        <FormLabel>Item No.</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            value={item.itemNo}
                            onChange={(e) => updateItem(item.id, "itemNo", e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <div className="col-span-2">
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <div className="col-span-1">
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              updateItem(item.id, "quantity", isNaN(value) ? 0 : value);
                              updateItem(item.id, "amount", calculateAmount(
                                {
                                  ...item,
                                  quantity: isNaN(value) ? 0 : value
                                }
                              ))
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <div className="col-span-1">
                      <FormItem>
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              updateItem(item.id, "unitPrice", isNaN(value) ? 0 : value);
                              updateItem(item.id, "amount", calculateAmount(
                                {
                                  ...item,
                                  unitPrice: isNaN(value) ? 0 : value
                                }
                              ))
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <div className="col-span-1">
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              updateItem(item.id, "discount", isNaN(value) ? 0 : value);
                              updateItem(item.id, "amount", calculateAmount(
                                {
                                  ...item,
                                  discount: isNaN(value) ? 0 : value
                                }
                              ))
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <div className="col-span-1">
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={calculateAmount(item)}
                            readOnly
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </Card>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Quote Preview</h2>
              <div className="scale-[0.45] origin-top-left bg-gray-100 p-4 rounded-lg border border-gray-200 h-[590px] overflow-hidden">
                <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate} className="w-full">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="template1" className="flex-grow">Template 1</TabsTrigger>
                    <TabsTrigger value="template2" className="flex-grow">Template 2</TabsTrigger>
                    <TabsTrigger value="template3" className="flex-grow">Template 3</TabsTrigger>
                    <TabsTrigger value="template4" className="flex-grow">Template 4</TabsTrigger>
                    <TabsTrigger value="template5" className="flex-grow">Template 5</TabsTrigger>
                  </TabsList>
                  <TabsContent value="template1">
                    <QuoteTemplate1 data={createPreviewData()} preview={true} />
                  </TabsContent>
                  <TabsContent value="template2">
                    <QuoteTemplate2 data={createPreviewData()} preview={true} />
                  </TabsContent>
                  <TabsContent value="template3">
                    <QuoteTemplate3 data={createPreviewData()} preview={true} />
                  </TabsContent>
                  <TabsContent value="template4">
                    <QuoteTemplate4 data={createPreviewData()} preview={true} />
                  </TabsContent>
                  <TabsContent value="template5">
                    <QuoteTemplate5 data={createPreviewData()} preview={true} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit">Create Quote</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewQuote;
