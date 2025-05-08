import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Upload, Download, Tag, Camera, FileUp, User, Link as LinkIcon, X, Check, ImageIcon, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/utils/formatters';

// Interfaces
interface TransactionCategory {
  id: string;
  name: string;
  color: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  categoryId: string;
  account?: string;
  clientId?: string;
}

interface NewTransactionForm {
  amount: string;
  description: string;
  type: 'income' | 'expense';
  categoryId: string;
  clientId: string;
}

// Transaction Categories
const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  { id: 'all', name: 'All Categories', color: '#8E9196' },
  { id: 'income', name: 'Income', color: '#4CAF50' },
  { id: 'expense', name: 'Expense', color: '#F44336' },
  { id: 'salary', name: 'Salary', color: '#2196F3' },
  { id: 'rent', name: 'Rent', color: '#FF9800' },
  { id: 'utilities', name: 'Utilities', color: '#9C27B0' },
  { id: 'groceries', name: 'Groceries', color: '#795548' },
  { id: 'entertainment', name: 'Entertainment', color: '#607D8B' },
  { id: 'transportation', name: 'Transportation', color: '#00BCD4' },
  { id: 'medical', name: 'Medical', color: '#E91E63' },
  { id: 'insurance', name: 'Insurance', color: '#673AB7' },
  { id: 'education', name: 'Education', color: '#3F51B5' },
  { id: 'savings', name: 'Savings', color: '#CDDC39' },
  { id: 'gifts', name: 'Gifts', color: '#FF5722' },
  { id: 'taxes', name: 'Taxes', color: '#9E9E9E' },
  { id: 'other', name: 'Other', color: '#8BC34A' },
];

// Mock Clients
const CLIENTS: Client[] = [
  { id: 'client1', name: 'ABC Corp', email: 'contact@abccorp.com' },
  { id: 'client2', name: 'XYZ Ltd', email: 'info@xyzltd.com' },
  { id: 'client3', name: 'Acme Inc', email: 'hello@acmeinc.com' },
  { id: 'client4', name: 'Global Enterprises', email: 'contact@globalent.com' },
  { id: 'client5', name: 'Local Business', email: 'info@localbiz.com' },
];

// Mock Transactions Generator
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const types: ('income' | 'expense')[] = ['income', 'expense'];
  const accounts = ['Business Account', 'Savings Account', 'Credit Card'];
  
  // Get categories excluding 'all'
  const categories = TRANSACTION_CATEGORIES.filter(cat => cat.id !== 'all');
  
  // Generate 20 random transactions
  for (let i = 0; i < 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const amount = Math.floor(Math.random() * 10000) / 100;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const transaction: Transaction = {
      id: `tx${Math.floor(1000 + Math.random() * 9000)}`,
      date: date.toISOString().split('T')[0],
      amount: amount,
      type: type,
      categoryId: category.id,
      category: category.name,
      description: type === 'income' 
        ? ['Client Payment', 'Service Fee', 'Product Sale', 'Consultation', 'Subscription'][Math.floor(Math.random() * 5)]
        : ['Office Supplies', 'Software Subscription', 'Utilities', 'Rent', 'Marketing', 'Travel Expense'][Math.floor(Math.random() * 6)],
      account: accounts[Math.floor(Math.random() * accounts.length)],
    };
    
    // Add client ID for some income transactions
    if (type === 'income' && Math.random() > 0.3) {
      transaction.clientId = CLIENTS[Math.floor(Math.random() * CLIENTS.length)].id;
    }
    
    transactions.push(transaction);
  }
  
  // Sort by date (newest first)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const Transactions: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State management
  const [transactions, setTransactions] = useState<Transaction[]>(generateMockTransactions());
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  
  // Dialog states
  const [newTransactionOpen, setNewTransactionOpen] = useState<boolean>(false);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState<boolean>(false);
  const [clientLinkDialogOpen, setClientLinkDialogOpen] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  
  // Form state
  const [newTransaction, setNewTransaction] = useState<NewTransactionForm>({
    amount: '',
    description: '',
    type: 'expense',
    categoryId: 'expense',
    clientId: '',
  });
  
  // Filter transactions based on category and search query
  useEffect(() => {
    let filtered = [...transactions];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tx => tx.categoryId === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(query) ||
        tx.account?.toLowerCase().includes(query) ||
        tx.category?.toLowerCase().includes(query)
      );
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, selectedCategory, searchQuery]);
  
  // Handle adding a new transaction
  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    // Generate a unique ID using timestamp and random string to avoid duplicate keys
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 10);
    
    const newTx: Transaction = {
      id: `tx${timestamp}-${randomStr}`,
      date: new Date().toISOString().split('T')[0],
      description: newTransaction.description,
      amount: amount,
      type: newTransaction.type,
      categoryId: newTransaction.categoryId,
      category: TRANSACTION_CATEGORIES.find(cat => cat.id === newTransaction.categoryId)?.name,
      clientId: newTransaction.clientId || undefined,
    };
    
    setTransactions(prev => [newTx, ...prev]);
    
    toast({
      title: "Success",
      description: `${newTransaction.type === 'income' ? 'Income' : 'Expense'} of ${formatCurrency(amount)} added successfully`,
    });
    
    // Reset form and close dialog
    setNewTransactionOpen(false);
    setNewTransaction({
      amount: '',
      description: '',
      type: 'expense',
      categoryId: 'expense',
      clientId: '',
    });
  };
  
  // Handle deleting a transaction
  const handleDeleteTransaction = () => {
    if (selectedTransactionId) {
      setTransactions(prev => prev.filter(tx => tx.id !== selectedTransactionId));
      
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      
      setSelectedTransactionId(null);
      setDeleteConfirmOpen(false);
    }
  };
  
  // Handle export transactions
  const handleExportTransactions = () => {
    toast({
      title: "Export Initiated",
      description: "Your transactions are being exported",
    });
    
    setExportDialogOpen(false);
  };
  
  // Find a transaction by ID
  const findTransaction = (id: string): Transaction | undefined => {
    return transactions.find(tx => tx.id === id);
  };
  
  // Get category color
  const getCategoryColor = (categoryId: string): string => {
    return TRANSACTION_CATEGORIES.find(cat => cat.id === categoryId)?.color || '#9E9E9E';
  };
  
  // Get client name
  const getClientName = (clientId: string | undefined): string => {
    if (!clientId) return 'N/A';
    return CLIENTS.find(client => client.id === clientId)?.name || 'Unknown Client';
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/dashboard/accounting')}
              className="h-9 w-9"
              title="Back to Accounting"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Transactions</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={() => setNewTransactionOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge 
                          style={{ 
                            backgroundColor: getCategoryColor(transaction.categoryId),
                            color: '#fff'
                          }}
                        >
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.clientId ? (
                          <span className="flex items-center">
                            <User className="h-3.5 w-3.5 mr-1" />
                            {getClientName(transaction.clientId)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}>
                          {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedTransactionId(transaction.id);
                              setAttachmentDialogOpen(true);
                            }}
                          >
                            <FileUp className="h-4 w-4" />
                          </Button>
                          {transaction.type === 'income' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedTransactionId(transaction.id);
                                setClientLinkDialogOpen(true);
                              }}
                            >
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedTransactionId(transaction.id);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No transactions found. Try adjusting your filters or add a new transaction.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add New Transaction Dialog */}
      <Dialog open={newTransactionOpen} onOpenChange={setNewTransactionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Enter the details of the transaction below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transaction-type">Type</Label>
                <Select
                  value={newTransaction.type}
                  onValueChange={(value) => setNewTransaction({
                    ...newTransaction,
                    type: value as 'income' | 'expense',
                    categoryId: value // Set default category based on type
                  })}
                >
                  <SelectTrigger id="transaction-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction-amount">Amount</Label>
                <Input
                  id="transaction-amount"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-description">Description</Label>
              <Input
                id="transaction-description"
                placeholder="Description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  description: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-category">Category</Label>
              <Select
                value={newTransaction.categoryId}
                onValueChange={(value) => setNewTransaction({
                  ...newTransaction,
                  categoryId: value
                })}
              >
                <SelectTrigger id="transaction-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_CATEGORIES.filter(cat => 
                    cat.id !== 'all' && 
                    (cat.id === newTransaction.type || 
                     (cat.id !== 'income' && cat.id !== 'expense'))
                  ).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newTransaction.type === 'income' && (
              <div className="space-y-2">
                <Label htmlFor="transaction-client">Client (Optional)</Label>
                <Select
                  value={newTransaction.clientId}
                  onValueChange={(value) => setNewTransaction({
                    ...newTransaction,
                    clientId: value
                  })}
                >
                  <SelectTrigger id="transaction-client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Client</SelectItem>
                    {CLIENTS.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTransactionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction}>
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Transactions</DialogTitle>
            <DialogDescription>
              Choose the format and date range for your export.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="export-from">From</Label>
                <Input id="export-from" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="export-to">To</Label>
                <Input id="export-to" type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportTransactions}>
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Attachment Dialog */}
      <Dialog open={attachmentDialogOpen} onOpenChange={setAttachmentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
            <DialogDescription>
              {selectedTransactionId && findTransaction(selectedTransactionId) ? 
                `Add an attachment to transaction: ${findTransaction(selectedTransactionId)?.description}` :
                'Add an attachment to this transaction'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              <Button variant="outline">
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttachmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Success",
                description: "Attachment added successfully",
              });
              setAttachmentDialogOpen(false);
            }}>
              Add Attachment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Client Link Dialog */}
      <Dialog open={clientLinkDialogOpen} onOpenChange={setClientLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Link to Client</DialogTitle>
            <DialogDescription>
              {selectedTransactionId && findTransaction(selectedTransactionId) ? 
                `Link transaction "${findTransaction(selectedTransactionId)?.description}" to a client` :
                'Link this transaction to a client'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-select">Select Client</Label>
              <Select defaultValue="">
                <SelectTrigger id="client-select">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTS.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Success",
                description: "Transaction linked to client successfully",
              });
              setClientLinkDialogOpen(false);
            }}>
              Link Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transactions;
