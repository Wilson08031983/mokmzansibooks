import React, { useState, useEffect } from "react";
import { parseNumberWithComma, parseIntSafe } from "@/utils/numberUtils";
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

  // Recalculate all item totals on load to ensure fresh start
  useEffect(() => {
    // Force recalculating all items on component mount
    if (initialQuoteData.items && initialQuoteData.items.length > 0) {
      const recalculatedItems = initialQuoteData.items.map(item => {
        // Ensure all values are numbers
        const quantity = parseFloat(String(item.quantity)) || 0;
        const unitPrice = parseFloat(String(item.unitPrice)) || 0;
        const markupPercentage = parseFloat(String(item.markupPercentage)) || 0;
        const discount = parseFloat(String(item.discount)) || 0;
        
        // Calculation steps
        const priceWithMarkup = unitPrice * (1 + markupPercentage / 100);
        const amountBeforeDiscount = priceWithMarkup * quantity;
        const discountAmount = amountBeforeDiscount * (discount / 100);
        const finalAmount = parseFloat((amountBeforeDiscount - discountAmount).toFixed(2));
        
        // Return item with calculated totals
        return {
          ...item,
          amount: finalAmount,
          total: finalAmount
        };
      });
      
      // Calculate totals
      const subtotal = recalculatedItems.reduce((sum, item) => sum + item.total, 0);
      const vatRate = parseFloat(String(initialQuoteData.vatRate)) || 0;
      const vatAmount = subtotal * (vatRate / 100);
      const total = subtotal + vatAmount;
      
      // Update the quote state with recalculated values
      setQuote(prev => ({
        ...prev,
        items: recalculatedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(vatAmount.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      }));
      
      console.log('Initial recalculation:', {
        items: recalculatedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        vatAmount: parseFloat(vatAmount.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      });
    }
  }, []); // Only run on mount
  
  // Additional effect for changes
  useEffect(() => {
    // This effect handles updates when items or VAT rate changes
    const subtotal = quote.items.reduce((sum, item) => sum + (parseFloat(String(item.total)) || 0), 0);
    const vatAmount = subtotal * (parseFloat(String(quote.vatRate || 0)) / 100);
    const total = subtotal + vatAmount;
    
    console.log('Recalculation on change:', {
      items: quote.items,
      subtotal,
      vatAmount,
      total
    });
    
    setQuote(prev => ({
      ...prev,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(vatAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2))
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
    
    // First update the field with the new value
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Always recalculate totals for this line item to ensure they're up to date
    // Convert all values to numbers to avoid string concatenation issues
    const quantity = parseFloat(String(updatedItems[index].quantity)) || 0;
    const unitPrice = parseFloat(String(updatedItems[index].unitPrice)) || 0;
    const markupPercentage = parseFloat(String(updatedItems[index].markupPercentage)) || 0;
    const discount = parseFloat(String(updatedItems[index].discount)) || 0;
    
    // Clear calculation steps
    const priceWithMarkup = unitPrice * (1 + markupPercentage / 100);
    const amountBeforeDiscount = priceWithMarkup * quantity;
    const discountAmount = amountBeforeDiscount * (discount / 100);
    
    // Calculate the final amount and ensure it's a number with two decimal places
    const finalAmount = parseFloat((amountBeforeDiscount - discountAmount).toFixed(2));
    
    // Update the amount and total properties
    updatedItems[index].amount = finalAmount;
    updatedItems[index].total = finalAmount;
    
    // Force a recalculation of all totals
    const subtotal = updatedItems.reduce((sum, item) => {
      const itemTotal = parseFloat(String(item.total)) || 0;
      return sum + itemTotal;
    }, 0);
    
    const vatRate = parseFloat(String(quote.vatRate)) || 0;
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;
    
    // Update the entire quote with new calculated values
    setQuote(prev => ({
      ...prev,
      items: updatedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(vatAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }));
  };

  // Add a new item
  const addNewItem = () => {
    const nextItemNo = quote.items.length + 1;
    const newItem: QuoteItem = {
      itemNo: nextItemNo,
      description: "",
      quantity: 1,
      unitPrice: 0,
      markupPercentage: 0,
      discount: 0,
      total: 0,
      amount: 0
    };
    
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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Quote Details</CardTitle>
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? 'Saving...' : 'Save Quote'}
          </Button>
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
                  <TableHead className="w-32">Mark Up %</TableHead>
                  <TableHead className="w-32">Discount %</TableHead>
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
                        type="text" 
                        inputMode="numeric" 
                        pattern="[0-9]*"
                        value={item.quantity || ''} 
                        onChange={(e) => {
                          // Force convert to number and update immediately
                          const val = e.target.value === '' ? 0 : parseIntSafe(e.target.value);
                          handleItemChange(index, 'quantity', val);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="text" 
                        inputMode="decimal" 
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={item.unitPrice || ''} 
                        onChange={(e) => {
                          // Force convert to number and update immediately
                          const val = e.target.value === '' ? 0 : parseNumberWithComma(e.target.value);
                          handleItemChange(index, 'unitPrice', val);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="text" 
                        inputMode="decimal" 
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={item.markupPercentage || 0} 
                        onChange={(e) => {
                          // Force convert to number and update immediately
                          const val = e.target.value === '' ? 0 : parseNumberWithComma(e.target.value);
                          handleItemChange(index, 'markupPercentage', val);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="text" 
                        inputMode="decimal" 
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={item.discount || 0} 
                        onChange={(e) => {
                          // Force convert to number and update immediately
                          const val = e.target.value === '' ? 0 : parseNumberWithComma(e.target.value);
                          handleItemChange(index, 'discount', val);
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(() => {
                        // Force recalculation of the line total right in the render
                        const quantity = parseFloat(String(item.quantity)) || 0;
                        const unitPrice = parseFloat(String(item.unitPrice)) || 0;
                        const markupPercentage = parseFloat(String(item.markupPercentage)) || 0;
                        const discount = parseFloat(String(item.discount)) || 0;
                        
                        const priceWithMarkup = unitPrice * (1 + markupPercentage / 100);
                        const amountBeforeDiscount = priceWithMarkup * quantity;
                        const discountAmount = amountBeforeDiscount * (discount / 100);
                        const total = parseFloat((amountBeforeDiscount - discountAmount).toFixed(2));
                        
                        // Display the calculated total
                        return formatCurrency(total);
                      })()}
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
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="bg-green-600 hover:bg-green-700 edit-quote-save-btn"
            >
              {isSaving ? 'Saving...' : 'Save Quote'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditQuoteForm;
