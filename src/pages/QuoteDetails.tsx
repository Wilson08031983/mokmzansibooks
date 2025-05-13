
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuoteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // In a real app, you would fetch quote data using the ID
  React.useEffect(() => {
    console.log(`Loading quote details for ID: ${id}`);
    // Fetch quote data here
  }, [id]);

  // Placeholder for quote data
  const quoteData = {
    id: id || '1',
    client: 'Sample Client',
    amount: 1200.00,
    date: '2023-05-10',
    expiryDate: '2023-06-10',
    status: 'sent'
  };

  const handleGoBack = () => {
    navigate('/quotes');
  };

  const handleDownloadPdf = () => {
    toast({
      title: "PDF Download",
      description: "Your quote PDF is being prepared for download."
    });
    // Implement PDF download logic
  };

  const handleCreateInvoice = () => {
    toast({
      title: "Creating Invoice",
      description: "Converting quote to invoice..."
    });
    // Navigate to the new invoice page with quote data
    navigate('/invoices/new', { state: { fromQuote: quoteData } });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotes
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            Download PDF
          </Button>
          <Button size="sm" onClick={handleCreateInvoice}>
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Quote content */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Quote #{quoteData.id}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Client</h3>
            <p>{quoteData.client}</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold mb-2">Amount</h3>
            <p className="text-xl font-bold">${quoteData.amount.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Quote Date</h3>
            <p>{quoteData.date}</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold mb-2">Expiry Date</h3>
            <p>{quoteData.expiryDate}</p>
          </div>
        </div>
      </Card>

      {/* Additional quote details would go here */}
      <p className="text-gray-500 text-center">
        This is a placeholder. In a real app, this would display the full quote details.
      </p>
    </div>
  );
};

export default QuoteDetails;
