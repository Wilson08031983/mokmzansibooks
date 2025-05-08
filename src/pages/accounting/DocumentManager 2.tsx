import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TransactionDocumentUploader } from "@/components/accounting/TransactionDocumentUploader";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
}

const DocumentManager = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, you would fetch from your database
        // This is a simulation using either Supabase or local data
        
        // Try to fetch from Supabase if available
        try {
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            setTransactions(data.map(t => ({
              id: t.id,
              date: t.date,
              description: t.description,
              amount: t.amount
            })));
            return;
          }
        } catch (err) {
          console.log('Supabase fetch failed, using sample data instead');
        }
        
        // Sample data if database fetch fails
        setTransactions([
          {
            id: "1",
            date: "2025-04-01",
            description: "Client Payment - ABC Corp",
            amount: 3500
          },
          {
            id: "2",
            date: "2025-04-02",
            description: "Office Supplies",
            amount: -250
          },
          {
            id: "3",
            date: "2025-04-03",
            description: "Client Payment - XYZ Ltd",
            amount: 4200
          },
          {
            id: "4",
            date: "2025-04-04",
            description: "Monthly Rent",
            amount: -2500
          },
          {
            id: "5",
            date: "2025-04-05",
            description: "Internet Bill",
            amount: -150
          }
        ]);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        toast({
          variant: "destructive",
          title: "Failed to load transactions",
          description: "Could not load transaction data. Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  const handleDocumentUploaded = (document: any) => {
    toast({
      title: "Document uploaded",
      description: `${document.documentType === 'bank_statement' ? 'Bank statement' : 'Receipt'} "${document.filename}" has been uploaded successfully.`
    });
  };

  const handleDocumentLinked = (document: any, transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    
    toast({
      title: "Document linked",
      description: `"${document.filename}" has been linked to transaction "${transaction?.description || 'Unknown'}" successfully.`
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/dashboard/accounting')}
              title="Back to Accounting"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Document Manager</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-500 mb-6">
            Upload and manage bank statements and transaction receipts. Link your receipts, invoices, and slips to specific transactions for better organization and audit trails.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
          ) : (
            <TransactionDocumentUploader 
              transactions={transactions}
              onDocumentUploaded={handleDocumentUploaded}
              onDocumentLinked={handleDocumentLinked}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManager;
