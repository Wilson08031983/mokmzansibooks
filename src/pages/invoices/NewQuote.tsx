import React, { useState, useRef } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Download, Plus, Trash2 } from "lucide-react";
import QuoteTemplate1 from "@/components/quotes/templates/QuoteTemplate1";
import QuoteTemplate2 from "@/components/quotes/templates/QuoteTemplate2";
import QuoteTemplate3 from "@/components/quotes/templates/QuoteTemplate4";
import QuoteTemplate4 from "@/components/invoices/templates/Template5";
import { QuoteData } from "@/types/quote";
import { downloadQuoteAsPdf } from "@/utils/pdfUtils";

interface BaseClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  lastInteraction: string;
  type: string;
}

interface CompanyClient extends BaseClient {
  contactPerson: string;
  type: 'company' | 'vendor';
}

interface IndividualClient extends BaseClient {
  type: 'individual';
}

type Client = CompanyClient | IndividualClient;

const mockClients = {
  companies: [
    {
      id: "c1",
      name: "ABC Construction Ltd",
      contactPerson: "John Smith",
      email: "john@abcconstruction.co.za",
      phone: "+27 82 123 4567",
      address: "45 Main Road, Cape Town, 8001",
      lastInteraction: "2023-03-25",
      type: "company",
    },
    {
      id: "c2",
      name: "Durban Electronics",
      contactPerson: "Sarah Johnson",
      email: "sarah@durbanelectronics.co.za",
      phone: "+27 83 987 6543",
      address: "12 Beach Avenue, Durban, 4001",
      lastInteraction: "2023-03-20",
      type: "company",
    },
  ],
  individuals: [
    {
      id: "i1",
      name: "Michael Ndlovu",
      email: "michael@example.com",
      phone: "+27 71 555 7890",
      address: "78 Oak Street, Johannesburg, 2000",
      lastInteraction: "2023-03-28",
      type: "individual",
    },
  ],
  vendors: [
    {
      id: "v1",
      name: "SA Office Supplies",
      contactPerson: "David Wilson",
      email: "david@saoffice.co.za",
      phone: "+27 11 222 3344",
      address: "56 Commerce Park, Pretoria, 0002",
      lastInteraction: "2023-03-15",
      type: "vendor",
    },
  ],
};

const getAllClients = () => {
  return [
    ...mockClients.companies,
    ...mockClients.individuals,
    ...mockClients.vendors,
  ] as Client[];
};

const formSchema = z.object({
  quoteNumber: z.string().min(2, {
    message: "Quote number must be at least 2 characters.",
  }),
  issueDate: z.string(),
  expiryDate: z.string(),
  shortDescription: z.string().optional(),
  client: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  vatRate: z.number(),
  notes: z.string(),
  terms: z.string(),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  branchCode: z.string().optional(),
  swiftCode: z.string().optional(),
});

interface Item {
  id: string;
  itemNo: string;
  markupPercentage: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
  websiteUrl?: string;
}

const NewQuote = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      itemNo: "ITEM-001",
      markupPercentage: 0,
      description: "Consultation Services",
      quantity: 10,
      unitPrice: 1500,
      discount: 0,
      amount: 15000,
    },
    {
      id: "2",
      itemNo: "ITEM-002",
      markupPercentage: 0,
      description: "Equipment Rental",
      quantity: 5,
      unitPrice: 2000,
      discount: 0,
      amount: 10000,
    },
  ]);
  const navigate = useNavigate();
  const location = useLocation();
  const allClients = getAllClients();
  const quoteTemplateRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quoteNumber: "QT-2025-0001",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      expiryDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      shortDescription: "",
      client: "c1",
      vatRate: 0,
      notes: "This quotation is valid for 30 days.",
      terms: "50% deposit required to commence work.",
      bankName: "First National Bank",
      accountName: "MOKMzansi Holdings",
      accountNumber: "62123456789",
      branchCode: "250655",
      swiftCode: "FIRNZAJJ",
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
      markupPercentage: 0,
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

  const getSelectedClient = (clientId: string) => {
    return allClients.find(client => client.id === clientId);
  };

  const createPreviewData = (): QuoteData => {
    const selectedClientId = form.watch("client");
    const selectedClient = getSelectedClient(selectedClientId);
    
    const bankAccount = {
      bankName: form.watch("bankName") || "",
      accountName: form.watch("accountName") || "",
      accountNumber: form.watch("accountNumber") || "",
      branchCode: form.watch("branchCode") || "",
      swiftCode: form.watch("swiftCode") || "",
    };
    
    const hasBankDetails = !!form.watch("bankName");
    
    return {
      quoteNumber: form.watch("quoteNumber"),
      issueDate: form.watch("issueDate"),
      expiryDate: form.watch("expiryDate"),
      shortDescription: form.watch("shortDescription"),
      client: {
        name: selectedClient?.name || "Client Name",
        address: selectedClient?.address || "Client Address",
        email: selectedClient?.email || "client@example.com",
        phone: selectedClient?.phone || "012 345 6789"
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
        amount: item.amount,
        websiteUrl: item.websiteUrl
      })),
      subtotal: calculateSubtotal(),
      vatRate: form.watch("vatRate") || 15,
      tax: calculateTax(),
      total: calculateTotal(),
      notes: form.watch("notes") || "This quotation is valid for 30 days.",
      terms: form.watch("terms") || "50% deposit required to commence work.",
      signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png",
      bankAccount: hasBankDetails ? bankAccount : undefined
    };
  };

  const handleDownloadQuote = async () => {
    if (!quoteTemplateRef.current) return;
    
    try {
      const templateElement = quoteTemplateRef.current.querySelector('.tabscontent-active > div') || quoteTemplateRef.current;
      
      const success = await downloadQuoteAsPdf(
        templateElement as HTMLElement, 
        `Quote-${form.watch("quoteNumber")}.pdf`
      );
      
      if (success) {
        toast.success("Quote downloaded successfully");
      } else {
        toast.error("Failed to download quote");
      }
    } catch (error) {
      console.error("Error downloading quote:", error);
      toast.error("Failed to download quote");
    }
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
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brief description of this quote" 
                          {...field} 
                        />
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAllClients().map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} {(client.type === 'company' || client.type === 'vendor') && 'contactPerson' in client ? `(${client.contactPerson})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
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

                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Bank Account Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bank Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Account Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Account Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="branchCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Branch Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="swiftCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SWIFT Code (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="SWIFT Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Items</h3>
                </div>
                
                <ScrollArea className="h-[500px] w-full overflow-hidden border rounded-md">
                  <table className="w-full min-w-[900px] table-fixed">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="grid grid-cols-12 gap-4 mb-2 px-4 py-2 border-b">
                        <th className="col-span-1 text-left text-sm font-medium text-gray-500">Item No.</th>
                        <th className="col-span-1 text-left text-sm font-medium text-gray-500">Mark Up %</th>
                        <th className="col-span-2 text-left text-sm font-medium text-gray-500">Description</th>
                        <th className="col-span-1 text-center text-sm font-medium text-gray-500">Qty</th>
                        <th className="col-span-2 text-center text-sm font-medium text-gray-500">Unit Price</th>
                        <th className="col-span-2 text-center text-sm font-medium text-gray-500">Discount (%)</th>
                        <th className="col-span-2 text-center text-sm font-medium text-gray-500">Amount</th>
                        <th className="col-span-1 text-center text-sm font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="px-4">
                      {items.map((item, index) => (
                        <tr key={item.id} className="grid grid-cols-12 gap-4 mb-6 items-center px-4 py-2">
                          <td className="col-span-1">
                            <Input
                              type="text"
                              value={item.itemNo}
                              onChange={(e) => updateItem(item.id, "itemNo", e.target.value)}
                              className="w-full"
                            />
                          </td>
                          <td className="col-span-1">
                            <Input
                              type="number"
                              value={item.markupPercentage}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                updateItem(item.id, "markupPercentage", isNaN(value) ? 0 : value);
                              }}
                              className="w-full text-center"
                            />
                          </td>
                          <td className="col-span-2">
                            <Input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              className="w-full"
                            />
                          </td>
                          <td className="col-span-1">
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
                              className="w-full text-center"
                            />
                          </td>
                          <td className="col-span-2">
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
                              className="w-full text-center"
                            />
                          </td>
                          <td className="col-span-2">
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
                              className="w-full text-center"
                            />
                          </td>
                          <td className="col-span-2">
                            <Input
                              type="number"
                              value={calculateAmount(item)}
                              readOnly
                              className="w-full text-center bg-gray-50"
                            />
                          </td>
                          <td className="col-span-1 flex justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
                
                <Button type="button" size="sm" onClick={handleAddItem} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </Card>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Quote Preview</h2>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDownloadQuote}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Download PDF
                </Button>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 overflow-hidden" style={{ height: '842px' }}>
                <div className="w-full h-full flex justify-center items-start overflow-auto" ref={quoteTemplateRef}>
                  <div className="scale-[0.55] origin-top transform-gpu" style={{ width: '210mm', transformOrigin: 'top center' }}>
                    <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate} className="w-full">
                      <TabsList className="w-full mb-4">
                        <TabsTrigger value="template1" className="flex-grow">Template 1</TabsTrigger>
                        <TabsTrigger value="template2" className="flex-grow">Template 2</TabsTrigger>
                        <TabsTrigger value="template3" className="flex-grow">Template 3</TabsTrigger>
                        <TabsTrigger value="template4" className="flex-grow">Template 4</TabsTrigger>
                      </TabsList>
                      <div className="flex justify-center">
                        <TabsContent value="template1" className="w-[210mm] tabscontent-active">
                          <QuoteTemplate1 data={createPreviewData()} preview={true} />
                        </TabsContent>
                        <TabsContent value="template2" className="w-[210mm] tabscontent-active">
                          <QuoteTemplate2 data={createPreviewData()} preview={true} />
                        </TabsContent>
                        <TabsContent value="template3" className="w-[210mm] tabscontent-active">
                          <QuoteTemplate3 data={createPreviewData()} preview={true} />
                        </TabsContent>
                        <TabsContent value="template4" className="w-[210mm] tabscontent-active">
                          <QuoteTemplate4 data={createPreviewData()} preview={true} />
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
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
