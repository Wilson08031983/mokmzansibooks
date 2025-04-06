
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
}

const JournalEntries = () => {
  const { toast } = useToast();
  
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

  const addNewEntry = () => {
    toast({
      title: "Add Journal Entry",
      description: "This functionality will be implemented soon",
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
          onClick={addNewEntry}
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
    </div>
  );
};

export default JournalEntries;
