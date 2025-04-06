
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
}

// Sample accounts for the form dropdown
const ACCOUNTS = [
  "1100 - Cash",
  "1120 - Accounts Receivable",
  "1210 - Equipment",
  "1220 - Buildings",
  "2110 - Accounts Payable",
  "2120 - Accrued Expenses",
  "3100 - Capital",
  "3200 - Retained Earnings",
  "4100 - Sales Revenue",
  "4200 - Service Revenue",
  "5100 - Salaries Expense",
  "5200 - Rent Expense",
  "5300 - Utilities Expense",
  "6200 - Rent Expense"
];

// Form schema for new journal entry
const journalEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(3, "Description is required"),
  debitAccount: z.string().min(1, "Debit account is required"),
  creditAccount: z.string().min(1, "Credit account is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
}).refine(data => data.debitAccount !== data.creditAccount, {
  message: "Debit and credit accounts cannot be the same",
  path: ["creditAccount"],
});

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;

const JournalEntries = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Sample journal entries data
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      date: "2025-04-01",
      description: "Office Rent Payment",
      debitAccount: "6200 - Rent Expense",
      creditAccount: "1100 - Cash",
      amount: 2500,
    },
    {
      id: "2",
      date: "2025-04-02",
      description: "Client Invoice Payment",
      debitAccount: "1100 - Cash",
      creditAccount: "4100 - Sales Revenue",
      amount: 5000,
    },
    {
      id: "3",
      date: "2025-04-03",
      description: "Equipment Purchase",
      debitAccount: "1600 - Equipment",
      creditAccount: "2100 - Accounts Payable",
      amount: 12000,
    },
    {
      id: "4",
      date: "2025-04-05",
      description: "Utility Bill Payment",
      debitAccount: "6300 - Utilities Expense",
      creditAccount: "1100 - Cash",
      amount: 350,
    },
  ]);

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: "",
      debitAccount: "",
      creditAccount: "",
      amount: 0,
    },
  });

  const addNewEntry = (data: JournalEntryFormValues) => {
    const newEntry: JournalEntry = {
      id: (journalEntries.length + 1).toString(),
      date: data.date,
      description: data.description,
      debitAccount: data.debitAccount,
      creditAccount: data.creditAccount,
      amount: data.amount,
    };

    setJournalEntries(prev => [newEntry, ...prev]);
    
    toast({
      title: "Journal Entry Added",
      description: `New entry for ${formatCurrency(data.amount, "ZAR")} has been recorded.`,
    });
    
    setIsDialogOpen(false);
    form.reset({
      date: new Date().toISOString().split('T')[0],
      description: "",
      debitAccount: "",
      creditAccount: "",
      amount: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Journal Entries</h1>
          <p className="text-gray-500">Record and manage your accounting transactions</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Add Journal Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-6 bg-gray-100 p-3 font-semibold border-b">
              <div>Date</div>
              <div className="col-span-2">Description</div>
              <div>Debit Account</div>
              <div>Credit Account</div>
              <div className="text-right">Amount</div>
            </div>
            <div>
              {journalEntries.map((entry) => (
                <div key={entry.id} className="grid grid-cols-6 p-3 border-b last:border-b-0 hover:bg-gray-50">
                  <div>{entry.date}</div>
                  <div className="col-span-2">{entry.description}</div>
                  <div>{entry.debitAccount}</div>
                  <div>{entry.creditAccount}</div>
                  <div className="text-right">{formatCurrency(entry.amount, "ZAR")}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Journal Entry</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addNewEntry)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter transaction description" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="debitAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debit Account</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ACCOUNTS.map(account => (
                            <SelectItem key={account} value={account}>{account}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="creditAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Account</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ACCOUNTS.map(account => (
                            <SelectItem key={account} value={account}>{account}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit">Add Entry</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalEntries;
