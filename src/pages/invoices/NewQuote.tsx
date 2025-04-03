
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

// Import Quote templates
import QuoteTemplate1 from "@/components/quotes/templates/QuoteTemplate1";
import QuoteTemplate2 from "@/components/quotes/templates/QuoteTemplate2";
import QuoteTemplate3 from "@/components/quotes/templates/QuoteTemplate3";
import QuoteTemplate4 from "@/components/quotes/templates/QuoteTemplate4";
import QuoteTemplate5 from "@/components/quotes/templates/QuoteTemplate5";
import { QuoteData } from "@/types/quote";

const formSchema = z.object({
  client: z.string().min(1, "Client name is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  items: z.string().optional(),
  notes: z.string().optional(),
});

const NewQuote = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const templateId = location.state?.templateId || 1;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: "",
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      items: "",
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would save the quote to a database
      console.log("Creating quote with values:", values);
      console.log("Using template:", templateId);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Quote created successfully",
        description: `Quote for ${values.client} has been created.`,
      });
      
      // Navigate back to quotes list
      navigate("/invoices/quotes");
    } catch (error) {
      console.error("Error creating quote:", error);
      toast({
        title: "Failed to create quote",
        description: "There was an error creating your quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/invoices/quotes">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Quote</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pretoria Engineering">
                              Pretoria Engineering
                            </SelectItem>
                            <SelectItem value="Eastern Cape Supplies">
                              Eastern Cape Supplies
                            </SelectItem>
                            <SelectItem value="Western Cape Retailers">
                              Western Cape Retailers
                            </SelectItem>
                            <SelectItem value="Free State Construction">
                              Free State Construction
                            </SelectItem>
                            <SelectItem value="KwaZulu-Natal Services">
                              KwaZulu-Natal Services
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              type="date"
                              className="pl-8"
                              {...field}
                            />
                          </div>
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
                          <div className="relative">
                            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              type="date"
                              className="pl-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="items"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Items</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter items (one per line with price)"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
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
                          placeholder="Add any additional notes here"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/invoices/quotes")}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Quote"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-4">Template Preview</h2>
        <div className="border rounded-md overflow-hidden bg-gray-100">
          <div className="scale-[0.5] origin-top transform-gpu -mt-40">
            {templateId === 1 && (
              <QuoteTemplate1
                data={{
                  quoteNumber: "QT-2025-0001",
                  issueDate: form.watch("issueDate"),
                  expiryDate: form.watch("expiryDate"),
                  client: {
                    name: form.watch("client") || "Client Name",
                    address: "Client Address",
                    email: "client@example.com",
                    phone: "123-456-7890"
                  },
                  company: {
                    name: "Your Company",
                    address: "Your Company Address",
                    email: "info@yourcompany.com",
                    phone: "098-765-4321",
                    logo: "/lovable-uploads/44062e3c-e3b2-47ea-9869-37a2dc71b5d8.png",
                    stamp: "/lovable-uploads/21bb22cc-35f7-4bdc-b74c-281c0412605d.png"
                  },
                  items: [
                    {
                      description: "Sample Item",
                      quantity: 1,
                      rate: 1000,
                      amount: 1000
                    }
                  ],
                  subtotal: 1000,
                  tax: 150,
                  total: 1150,
                  notes: form.watch("notes") || "Quote notes will appear here",
                  terms: "Standard terms and conditions apply",
                  signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
                }}
                preview
              />
            )}
            {templateId === 2 && (
              <QuoteTemplate2
                data={{
                  quoteNumber: "QT-2025-0001",
                  issueDate: form.watch("issueDate"),
                  expiryDate: form.watch("expiryDate"),
                  client: {
                    name: form.watch("client") || "Client Name",
                    address: "Client Address",
                    email: "client@example.com",
                    phone: "123-456-7890"
                  },
                  company: {
                    name: "Your Company",
                    address: "Your Company Address",
                    email: "info@yourcompany.com",
                    phone: "098-765-4321",
                    logo: "/lovable-uploads/44062e3c-e3b2-47ea-9869-37a2dc71b5d8.png",
                    stamp: "/lovable-uploads/21bb22cc-35f7-4bdc-b74c-281c0412605d.png"
                  },
                  items: [
                    {
                      description: "Sample Item",
                      quantity: 1,
                      rate: 1000,
                      amount: 1000
                    }
                  ],
                  subtotal: 1000,
                  tax: 150,
                  total: 1150,
                  notes: form.watch("notes") || "Quote notes will appear here",
                  terms: "Standard terms and conditions apply",
                  signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
                }}
                preview
              />
            )}
            {templateId === 3 && (
              <QuoteTemplate3
                data={{
                  quoteNumber: "QT-2025-0001",
                  issueDate: form.watch("issueDate"),
                  expiryDate: form.watch("expiryDate"),
                  client: {
                    name: form.watch("client") || "Client Name",
                    address: "Client Address",
                    email: "client@example.com",
                    phone: "123-456-7890"
                  },
                  company: {
                    name: "Your Company",
                    address: "Your Company Address",
                    email: "info@yourcompany.com",
                    phone: "098-765-4321",
                    logo: "/lovable-uploads/44062e3c-e3b2-47ea-9869-37a2dc71b5d8.png",
                    stamp: "/lovable-uploads/21bb22cc-35f7-4bdc-b74c-281c0412605d.png"
                  },
                  items: [
                    {
                      description: "Sample Item",
                      quantity: 1,
                      rate: 1000,
                      amount: 1000
                    }
                  ],
                  subtotal: 1000,
                  tax: 150,
                  total: 1150,
                  notes: form.watch("notes") || "Quote notes will appear here",
                  terms: "Standard terms and conditions apply",
                  signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
                }}
                preview
              />
            )}
            {templateId === 4 && (
              <QuoteTemplate4
                data={{
                  quoteNumber: "QT-2025-0001",
                  issueDate: form.watch("issueDate"),
                  expiryDate: form.watch("expiryDate"),
                  client: {
                    name: form.watch("client") || "Client Name",
                    address: "Client Address",
                    email: "client@example.com",
                    phone: "123-456-7890"
                  },
                  company: {
                    name: "Your Company",
                    address: "Your Company Address",
                    email: "info@yourcompany.com",
                    phone: "098-765-4321",
                    logo: "/lovable-uploads/44062e3c-e3b2-47ea-9869-37a2dc71b5d8.png",
                    stamp: "/lovable-uploads/21bb22cc-35f7-4bdc-b74c-281c0412605d.png"
                  },
                  items: [
                    {
                      description: "Sample Item",
                      quantity: 1,
                      rate: 1000,
                      amount: 1000
                    }
                  ],
                  subtotal: 1000,
                  tax: 150,
                  total: 1150,
                  notes: form.watch("notes") || "Quote notes will appear here",
                  terms: "Standard terms and conditions apply",
                  signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
                }}
                preview
              />
            )}
            {templateId === 5 && (
              <QuoteTemplate5
                data={{
                  quoteNumber: "QT-2025-0001",
                  issueDate: form.watch("issueDate"),
                  expiryDate: form.watch("expiryDate"),
                  client: {
                    name: form.watch("client") || "Client Name",
                    address: "Client Address",
                    email: "client@example.com",
                    phone: "123-456-7890"
                  },
                  company: {
                    name: "Your Company",
                    address: "Your Company Address",
                    email: "info@yourcompany.com",
                    phone: "098-765-4321",
                    logo: "/lovable-uploads/44062e3c-e3b2-47ea-9869-37a2dc71b5d8.png",
                    stamp: "/lovable-uploads/21bb22cc-35f7-4bdc-b74c-281c0412605d.png"
                  },
                  items: [
                    {
                      description: "Sample Item",
                      quantity: 1,
                      rate: 1000,
                      amount: 1000
                    }
                  ],
                  subtotal: 1000,
                  tax: 150,
                  total: 1150,
                  notes: form.watch("notes") || "Quote notes will appear here",
                  terms: "Standard terms and conditions apply",
                  signature: "/lovable-uploads/b2e5e094-40b1-4fb0-86a4-03b6a2d9d4fb.png"
                }}
                preview
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewQuote;
