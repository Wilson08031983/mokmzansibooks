
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, FileSignature } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/utils/statusUtils';

// Mock quote data
const mockQuotes = [
  {
    id: '1',
    client: 'ABC Corporation',
    date: '2023-05-10',
    amount: 1500.00,
    status: 'accepted'
  },
  {
    id: '2',
    client: 'XYZ Industries',
    date: '2023-05-05',
    amount: 2800.50,
    status: 'sent'
  },
  {
    id: '3',
    client: 'Tech Solutions Inc',
    date: '2023-04-28',
    amount: 950.25,
    status: 'draft'
  },
  {
    id: '4',
    client: 'Global Services Ltd',
    date: '2023-04-15',
    amount: 3600.00,
    status: 'expired'
  }
];

const Quotes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter quotes based on search query
  const filteredQuotes = mockQuotes.filter(quote => 
    quote.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.id.includes(searchQuery)
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateQuote = () => {
    navigate('/quotes/new');
  };

  const handleViewQuote = (id: string) => {
    navigate(`/quotes/${id}`);
  };

  const handleCreateInvoice = (id: string) => {
    toast({
      title: "Creating Invoice",
      description: `Converting quote #${id} to invoice...`
    });
    // In a real app, you would navigate to invoice creation with quote data
    navigate(`/invoices/new`, { state: { fromQuoteId: id } });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Quotes</h1>
      
      {/* Search and actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search quotes..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Button onClick={handleCreateQuote}>
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>
      
      {/* Quotes list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuotes.length > 0 ? (
          filteredQuotes.map((quote) => (
            <Card key={quote.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <span>Quote #{quote.id}</span>
                  <StatusBadge status={quote.status} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{quote.client}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{quote.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium">${quote.amount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewQuote(quote.id)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleCreateInvoice(quote.id)}
                      disabled={quote.status === 'draft' || quote.status === 'expired'}
                    >
                      <FileSignature className="h-4 w-4 mr-2" />
                      Convert
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-gray-500">
            No quotes found. Create your first quote!
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotes;
