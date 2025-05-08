import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { QuoteData, QuoteItem } from '@/types/quote';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCompany } from '@/contexts/CompanyContext';
import { formatCurrency } from '@/utils/formatters';
import { calculateLineItemTotal, createNewQuoteItem } from '@/utils/quoteUtils';
import { Plus, Trash } from 'lucide-react';

interface EditQuoteFormProps {
  quoteData: QuoteData;
  onSave: (updatedQuote: QuoteData) => void;
  onCancel: () => void;
}

const EditQuoteForm: React.FC<EditQuoteFormProps> = ({
  quoteData: initialQuoteData,
  onSave,
  onCancel,
}) => {
  const [quote, setQuote] = useState<QuoteData>(() => {
    // Create a deep copy and ensure all required properties exist
    return {
      ...initialQuoteData,
      client: initialQuoteData.client || { name: '', address: '', email: '', phone: '', id: '' },
      company: initialQuoteData.company || { name: '', address: '', email: '', phone: '' },
      items: initialQuoteData.items || [],
      vatRate: initialQuoteData.vatRate || 0,
      subtotal: initialQuoteData.subtotal || 0,
      tax: initialQuoteData.tax || 0,
      total: initialQuoteData.total || 0
    };
  });
  const { companyDetails } = useCompany();
  const [isSaving, setIsSaving] = useState(false);

  // Calculate totals whenever items change
  useEffect(() => {
    const subtotal = quote.items.reduce((sum, item) => sum + (parseFloat(String(item.total)) || 0), 0);
    const vatAmount = subtotal * (parseFloat(String(quote.vatRate || 0)) / 100);
    
    setQuote(prev => ({
      ...prev,
      subtotal: subtotal,
      tax: vatAmount,
      total: subtotal + vatAmount
    }));
  }, [quote.items, quote.vatRate]);

  // Handle form field changes
  const handleInputChange = (field: string, value: string | number) => {
    setQuote(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle item changes
  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...quote.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate total for this line item
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(String(value)) : parseFloat(String(updatedItems[index].quantity));
      const unitPrice = field === 'unitPrice' ? parseFloat(String(value)) : parseFloat(String(updatedItems[index].unitPrice));
      
      updatedItems[index].total = calculateLineItemTotal(quantity, unitPrice);
    }

    setQuote(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Add a new item
  const addNewItem = () => {
    const nextItemNo = quote.items.length + 1;
    const newItem = createNewQuoteItem(nextItemNo);
    
    setQuote(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Remove an item
  const removeItem = (index: number) => {
    const updatedItems = quote.items.filter((_, i) => i !== index);
    
    // Re-number the remaining items
    const renumberedItems = updatedItems.map((item, i) => ({
      ...item,
      itemNo: i + 1
    }));
    
    setQuote(prev => ({
      ...prev,
      items: renumberedItems
    }));
  };

  // Handle save
  const handleSave = () => {
    if (!quote.client?.name) {
      toast.error("Client name is required");
      return;
    }
    
    if (!quote.items.some(item => item.description)) {
      toast.error("At least one item with a description is required");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const updatedQuote = {
        ...quote,
        lastUpdated: new Date().toISOString()
      };
      
      // Save the updated quote
      onSave(updatedQuote);
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error("Failed to update quote");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Quote Information */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quoteNumber">Quote Number</Label>
              <Input 
                id="quoteNumber" 
                value={quote.quoteNumber || ''} 
                onChange={(e) => handleInputChange('quoteNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input 
                id="issueDate" 
                type="date" 
                value={quote.issueDate || format(new Date(), 'yyyy-MM-dd')} 
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input 
                id="expiryDate" 
                type="date" 
                value={quote.expiryDate || ''} 
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Client</Label>
            <Input 
              id="clientName" 
              value={quote.client?.name || ''} 
              onChange={(e) => setQuote(prev => ({
                ...prev,
                client: { ...prev.client, name: e.target.value }
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={quote.shortDescription || ''} 
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Brief description of this quote"
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-full">Description</TableHead>
                  <TableHead className="w-32">Quantity</TableHead>
                  <TableHead className="w-32">Price</TableHead>
                  <TableHead className="w-32 text-right">Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.itemNo || index + 1}</TableCell>
                    <TableCell>
                      <Input 
                        value={item.description || ''} 
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="1" 
                        step="1"
                        value={item.quantity || ''} 
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={item.unitPrice || ''} 
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(item.total) || 0)}
                    </TableCell>
                    <TableCell>
                      {quote.items.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={addNewItem}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(Number(quote.subtotal) || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>VAT Rate (%):</span>
              <div className="w-24">
                <Select 
                  value={String(quote.vatRate || "0")}
                  onValueChange={(value) => handleInputChange('vatRate', parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="VAT Rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between">
              <span>VAT Amount:</span>
              <span>{formatCurrency(Number(quote.tax) || 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(Number(quote.total) || 0)}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Update Quote'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditQuoteForm;
