
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // In a real app, you would fetch invoice data using the ID
  React.useEffect(() => {
    console.log(`Loading invoice details for ID: ${id}`);
    // Fetch invoice data here
  }, [id]);

  // Placeholder for invoice data
  const invoiceData = {
    id: id || '1',
    client: 'Sample Client',
    amount: 1500.00,
    date: '2023-05-15',
    dueDate: '2023-06-15',
    status: 'pending'
  };

  const handleGoBack = () => {
    navigate('/invoices');
  };

  const handleDownloadPdf = () => {
    toast({
      title: "PDF Download",
      description: "Your invoice PDF is being prepared for download."
    });
    // Implement PDF download logic
  };

  const handleMarkAsPaid = () => {
    toast({
      title: "Status Updated",
      description: "Invoice has been marked as paid."
    });
    // Implement status update logic
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            Download PDF
          </Button>
          <Button size="sm" onClick={handleMarkAsPaid}>
            Mark as Paid
          </Button>
        </div>
      </div>

      {/* Invoice content */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Invoice #{invoiceData.id}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Client</h3>
            <p>{invoiceData.client}</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold mb-2">Amount</h3>
            <p className="text-xl font-bold">${invoiceData.amount.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Invoice Date</h3>
            <p>{invoiceData.date}</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold mb-2">Due Date</h3>
            <p>{invoiceData.dueDate}</p>
          </div>
        </div>
      </Card>

      {/* Additional invoice details would go here */}
      <p className="text-gray-500 text-center">
        This is a placeholder. In a real app, this would display the full invoice details.
      </p>
    </div>
  );
};

export default InvoiceDetails;
