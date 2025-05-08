import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Filter, Edit, Trash2, Download, FileText, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  description: string;
  reportingCategory: string;
  status: 'Active' | 'Inactive';
  balance?: number;
}

const ChartOfAccounts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', code: '1000', name: 'Cash', type: 'Asset', description: 'Cash on hand and in bank accounts', reportingCategory: 'Current Assets', status: 'Active', balance: 50000 },
    { id: '2', code: '1100', name: 'Accounts Receivable', type: 'Asset', description: 'Amounts owed by customers', reportingCategory: 'Current Assets', status: 'Active', balance: 25000 },
    { id: '3', code: '1200', name: 'Inventory', type: 'Asset', description: 'Goods held for sale', reportingCategory: 'Current Assets', status: 'Active', balance: 35000 },
    { id: '4', code: '1500', name: 'Office Equipment', type: 'Asset', description: 'Computers, furniture, etc.', reportingCategory: 'Fixed Assets', status: 'Active', balance: 15000 },
    { id: '5', code: '2000', name: 'Accounts Payable', type: 'Liability', description: 'Amounts owed to suppliers', reportingCategory: 'Current Liabilities', status: 'Active', balance: 10000 },
    { id: '6', code: '2100', name: 'Salaries Payable', type: 'Liability', description: 'Salaries owed to employees', reportingCategory: 'Current Liabilities', status: 'Active', balance: 8000 },
    { id: '7', code: '2200', name: 'VAT Payable', type: 'Liability', description: 'VAT owed to SARS', reportingCategory: 'Current Liabilities', status: 'Active', balance: 5000 },
    { id: '8', code: '3000', name: 'Owner\'s Equity', type: 'Equity', description: 'Owner\'s investment in the business', reportingCategory: 'Equity', status: 'Active', balance: 100000 },
    { id: '9', code: '3100', name: 'Retained Earnings', type: 'Equity', description: 'Accumulated profits', reportingCategory: 'Equity', status: 'Active', balance: 50000 },
    { id: '10', code: '4000', name: 'Sales Revenue', type: 'Income', description: 'Revenue from sales', reportingCategory: 'Operating Revenue', status: 'Active', balance: 250000 },
    { id: '11', code: '4100', name: 'Service Revenue', type: 'Income', description: 'Revenue from services', reportingCategory: 'Operating Revenue', status: 'Active', balance: 75000 },
    { id: '12', code: '5000', name: 'Cost of Goods Sold', type: 'Expense', description: 'Cost of items sold', reportingCategory: 'Cost of Sales', status: 'Active', balance: 100000 },
    { id: '13', code: '6000', name: 'Salaries Expense', type: 'Expense', description: 'Salaries paid to employees', reportingCategory: 'Operating Expenses', status: 'Active', balance: 80000 },
    { id: '14', code: '6100', name: 'Rent Expense', type: 'Expense', description: 'Office rent', reportingCategory: 'Operating Expenses', status: 'Active', balance: 24000 },
    { id: '15', code: '6200', name: 'Utilities Expense', type: 'Expense', description: 'Electricity, water, etc.', reportingCategory: 'Operating Expenses', status: 'Active', balance: 12000 },
  ]);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [activeTab, setActiveTab] = useState('all');

  // New account form state
  const [newAccount, setNewAccount] = useState<Omit<Account, 'id'>>({ 
    code: '', 
    name: '', 
    type: 'Asset', 
    description: '', 
    reportingCategory: 'Current Assets', 
    status: 'Active' 
  });

  const handleAddAccount = () => {
    const id = (accounts.length + 1).toString();
    const accountToAdd = { ...newAccount, id };
    setAccounts([...accounts, accountToAdd]);
    setIsAddDialogOpen(false);
    setNewAccount({ code: '', name: '', type: 'Asset', description: '', reportingCategory: 'Current Assets', status: 'Active' });
    
    toast({
      title: "Account Added",
      description: `${newAccount.name} has been added to your chart of accounts.`,
    });
  };

  const handleEditAccount = () => {
    if (!selectedAccount) return;
    
    setAccounts(accounts.map(account => 
      account.id === selectedAccount.id ? selectedAccount : account
    ));
    
    setIsEditDialogOpen(false);
    
    toast({
      title: "Account Updated",
      description: `${selectedAccount.name} has been updated.`,
    });
  };

  const handleDeleteAccount = (id: string) => {
    const accountToDelete = accounts.find(account => account.id === id);
    if (!accountToDelete) return;
    
    setAccounts(accounts.filter(account => account.id !== id));
    
    toast({
      title: "Account Deactivated",
      description: `${accountToDelete.name} has been deactivated.`,
      variant: "destructive"
    });
  };

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['Code', 'Account Name', 'Type', 'Description', 'Reporting Category', 'Status'];
    const csvContent = [
      headers.join(','),
      ...accounts.map(account => [
        account.code,
        `"${account.name}"`,
        account.type,
        `"${account.description}"`,
        account.reportingCategory,
        account.status
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'chart_of_accounts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "CSV Downloaded",
      description: "Your chart of accounts has been downloaded as a CSV file.",
    });
  };

  // Filter accounts by type and search term
  const filteredAccounts = accounts.filter(account => {
    const matchesType = filterType === 'All' || account.type === filterType;
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          account.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && account.status === 'Active') ||
                      (activeTab === 'inactive' && account.status === 'Inactive');
    
    return matchesType && matchesSearch && matchesTab;
  });

  // Group accounts by type for display
  const accountsByType = {
    Asset: filteredAccounts.filter(account => account.type === 'Asset'),
    Liability: filteredAccounts.filter(account => account.type === 'Liability'),
    Equity: filteredAccounts.filter(account => account.type === 'Equity'),
    Income: filteredAccounts.filter(account => account.type === 'Income'),
    Expense: filteredAccounts.filter(account => account.type === 'Expense')
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          <div>
            <h1 className="text-2xl font-bold">Chart of Accounts</h1>
            <p className="text-muted-foreground">Manage your financial accounts structure</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add New Account
          </Button>
          <Button variant="outline" onClick={handleDownloadCSV} className="flex items-center gap-1">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Asset">Assets</SelectItem>
                  <SelectItem value="Liability">Liabilities</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reporting Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(accountsByType).map(([type, accounts]) => {
                // Only render if there are accounts for this type
                if (accounts.length === 0) return null;
                
                return (
                  <React.Fragment key={type}>
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={7} className="font-medium">{type}s</TableCell>
                    </TableRow>
                    {accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="max-w-xs truncate">{account.description}</TableCell>
                        <TableCell>{account.reportingCategory}</TableCell>
                        <TableCell>
                          <Badge variant={account.status === 'Active' ? "default" : "secondary"}>
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setSelectedAccount(account);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteAccount(account.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
              
              {filteredAccounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No accounts found. Try adjusting your filters or search term.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Account Code</Label>
                <Input
                  id="code"
                  value={newAccount.code}
                  onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
                  placeholder="e.g., 1000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Account Type</Label>
                <Select 
                  value={newAccount.type} 
                  onValueChange={(value) => setNewAccount({...newAccount, type: value as Account['type']})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asset">Asset</SelectItem>
                    <SelectItem value="Liability">Liability</SelectItem>
                    <SelectItem value="Equity">Equity</SelectItem>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={newAccount.name}
                onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                placeholder="e.g., Cash"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAccount.description}
                onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
                placeholder="Brief description of the account"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Reporting Category</Label>
              <Select 
                value={newAccount.reportingCategory} 
                onValueChange={(value) => setNewAccount({...newAccount, reportingCategory: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Current Assets">Current Assets</SelectItem>
                  <SelectItem value="Fixed Assets">Fixed Assets</SelectItem>
                  <SelectItem value="Other Assets">Other Assets</SelectItem>
                  <SelectItem value="Current Liabilities">Current Liabilities</SelectItem>
                  <SelectItem value="Long-term Liabilities">Long-term Liabilities</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Operating Revenue">Operating Revenue</SelectItem>
                  <SelectItem value="Other Revenue">Other Revenue</SelectItem>
                  <SelectItem value="Cost of Sales">Cost of Sales</SelectItem>
                  <SelectItem value="Operating Expenses">Operating Expenses</SelectItem>
                  <SelectItem value="Other Expenses">Other Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="status" 
                checked={newAccount.status === 'Active'}
                onCheckedChange={(checked) => 
                  setNewAccount({...newAccount, status: checked ? 'Active' : 'Inactive'})
                }
              />
              <Label htmlFor="status">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAccount}>Add Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          
          {selectedAccount && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Account Code</Label>
                  <Input
                    id="edit-code"
                    value={selectedAccount.code}
                    onChange={(e) => setSelectedAccount({...selectedAccount, code: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Account Type</Label>
                  <Select 
                    value={selectedAccount.type} 
                    onValueChange={(value) => setSelectedAccount({...selectedAccount, type: value as Account['type']})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asset">Asset</SelectItem>
                      <SelectItem value="Liability">Liability</SelectItem>
                      <SelectItem value="Equity">Equity</SelectItem>
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-name">Account Name</Label>
                <Input
                  id="edit-name"
                  value={selectedAccount.name}
                  onChange={(e) => setSelectedAccount({...selectedAccount, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedAccount.description}
                  onChange={(e) => setSelectedAccount({...selectedAccount, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Reporting Category</Label>
                <Select 
                  value={selectedAccount.reportingCategory} 
                  onValueChange={(value) => setSelectedAccount({...selectedAccount, reportingCategory: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Current Assets">Current Assets</SelectItem>
                    <SelectItem value="Fixed Assets">Fixed Assets</SelectItem>
                    <SelectItem value="Other Assets">Other Assets</SelectItem>
                    <SelectItem value="Current Liabilities">Current Liabilities</SelectItem>
                    <SelectItem value="Long-term Liabilities">Long-term Liabilities</SelectItem>
                    <SelectItem value="Equity">Equity</SelectItem>
                    <SelectItem value="Operating Revenue">Operating Revenue</SelectItem>
                    <SelectItem value="Other Revenue">Other Revenue</SelectItem>
                    <SelectItem value="Cost of Sales">Cost of Sales</SelectItem>
                    <SelectItem value="Operating Expenses">Operating Expenses</SelectItem>
                    <SelectItem value="Other Expenses">Other Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-status" 
                  checked={selectedAccount.status === 'Active'}
                  onCheckedChange={(checked) => 
                    setSelectedAccount({...selectedAccount, status: checked ? 'Active' : 'Inactive'})
                  }
                />
                <Label htmlFor="edit-status">Active</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditAccount}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChartOfAccounts;
