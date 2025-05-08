import React, { useState, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Define account types
type AccountType = 
  | 'Asset' 
  | 'Liability' 
  | 'Equity' 
  | 'Revenue' 
  | 'Expense';

// Account interface
interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  normalBalance: 'Debit' | 'Credit';
}

const ChartOfAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      code: '1000',
      name: 'Cash',
      type: 'Asset',
      description: 'Cash on hand and in bank accounts',
      normalBalance: 'Debit'
    },
    {
      id: '2',
      code: '2000',
      name: 'Accounts Payable',
      type: 'Liability',
      description: 'Money owed to suppliers',
      normalBalance: 'Credit'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Partial<Account>>({});

  const handleAddAccount = useCallback(() => {
    if (!currentAccount.code || !currentAccount.name || !currentAccount.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newAccount: Account = {
      id: String(accounts.length + 1),
      code: currentAccount.code,
      name: currentAccount.name,
      type: currentAccount.type,
      description: currentAccount.description || '',
      normalBalance: currentAccount.normalBalance || 'Debit'
    };

    setAccounts([...accounts, newAccount]);
    toast.success('Account added successfully');
    setIsDialogOpen(false);
    setCurrentAccount({});
  }, [accounts, currentAccount]);

  const handleUpdateAccount = useCallback((updatedAccount: Account) => {
    setAccounts(accounts.map(acc => 
      acc.id === updatedAccount.id ? updatedAccount : acc
    ));
    toast.success('Account updated successfully');
  }, [accounts]);

  const handleDeleteAccount = useCallback((accountId: string) => {
    setAccounts(accounts.filter(acc => acc.id !== accountId));
    toast.success('Account deleted successfully');
  }, [accounts]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Chart of Accounts</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {currentAccount.id ? 'Edit Account' : 'Add New Account'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="code" className="text-right">
                      Account Code
                    </label>
                    <Input
                      id="code"
                      value={currentAccount.code || ''}
                      onChange={(e) => setCurrentAccount({
                        ...currentAccount, 
                        code: e.target.value
                      })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right">
                      Account Name
                    </label>
                    <Input
                      id="name"
                      value={currentAccount.name || ''}
                      onChange={(e) => setCurrentAccount({
                        ...currentAccount, 
                        name: e.target.value
                      })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="type" className="text-right">
                      Account Type
                    </label>
                    <Select
                      value={currentAccount.type}
                      onValueChange={(value: AccountType) => setCurrentAccount({
                        ...currentAccount, 
                        type: value
                      })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select Account Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right">
                      Description
                    </label>
                    <Input
                      id="description"
                      value={currentAccount.description || ''}
                      onChange={(e) => setCurrentAccount({
                        ...currentAccount, 
                        description: e.target.value
                      })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddAccount}>
                    {currentAccount.id ? 'Update' : 'Add'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Normal Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.code}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>{account.type}</TableCell>
                  <TableCell>{account.description}</TableCell>
                  <TableCell>{account.normalBalance}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setCurrentAccount(account);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartOfAccounts;
