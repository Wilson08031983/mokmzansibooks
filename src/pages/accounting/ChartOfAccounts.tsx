import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Filter, Edit, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  description?: string;
  reportingCategory?: string;
  status: "active" | "inactive";
  balance: number;
  children?: Account[];
}

const accountTypes = [
  "Assets",
  "Liabilities",
  "Income",
  "Expenses",
  "Equity"
] as const;

const reportingCategories = {
  "Assets": ["Current Assets", "Fixed Assets", "Other Assets"],
  "Liabilities": ["Current Liabilities", "Long-term Liabilities"],
  "Income": ["Operating Revenue", "Other Revenue"],
  "Expenses": ["Operating Expenses", "Administrative Expenses", "Other Expenses"],
  "Equity": ["Owner's Equity", "Retained Earnings"]
};

const accountSchema = z.object({
  code: z.string().min(2, "Account code must be at least 2 characters"),
  name: z.string().min(2, "Account name must be at least 2 characters"),
  type: z.enum(accountTypes),
  description: z.string().optional(),
  reportingCategory: z.string(),
  status: z.enum(["active", "inactive"]).default("active"),
  parentId: z.string().optional(),
  balance: z.coerce.number().default(0),
});

type AccountFormValues = z.infer<typeof accountSchema>;

const ChartOfAccounts = () => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Flat account list for table view
  const [flatAccounts, setFlatAccounts] = useState<Account[]>([]);

  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "1000",
      code: "1000",
      name: "Assets",
      type: "Asset",
      balance: 0,
      children: [
        {
          id: "1100",
          code: "1100",
          name: "Current Assets",
          type: "Asset",
          balance: 0,
          children: [
            {
              id: "1110",
              code: "1110",
              name: "Cash",
              type: "Asset",
              balance: 15000,
            },
            {
              id: "1120",
              code: "1120",
              name: "Accounts Receivable",
              type: "Asset",
              balance: 25000,
            },
          ],
        },
        {
          id: "1200",
          code: "1200",
          name: "Fixed Assets",
          type: "Asset",
          balance: 0,
          children: [
            {
              id: "1210",
              code: "1210",
              name: "Equipment",
              type: "Asset",
              balance: 50000,
            },
            {
              id: "1220",
              code: "1220",
              name: "Buildings",
              type: "Asset",
              balance: 150000,
            },
          ],
        },
      ],
    },
    {
      id: "2000",
      code: "2000",
      name: "Liabilities",
      type: "Liability",
      balance: 0,
      children: [
        {
          id: "2100",
          code: "2100",
          name: "Current Liabilities",
          type: "Liability",
          balance: 0,
          children: [
            {
              id: "2110",
              code: "2110",
              name: "Accounts Payable",
              type: "Liability",
              balance: 18000,
            },
            {
              id: "2120",
              code: "2120",
              name: "Accrued Expenses",
              type: "Liability",
              balance: 5000,
            },
          ],
        },
      ],
    },
    {
      id: "3000",
      code: "3000",
      name: "Equity",
      type: "Equity",
      balance: 0,
      children: [
        {
          id: "3100",
          code: "3100",
          name: "Capital",
          type: "Equity",
          balance: 200000,
        },
        {
          id: "3200",
          code: "3200",
          name: "Retained Earnings",
          type: "Equity",
          balance: 17000,
        },
      ],
    },
    {
      id: "4000",
      code: "4000",
      name: "Revenue",
      type: "Revenue",
      balance: 0,
      children: [
        {
          id: "4100",
          code: "4100",
          name: "Sales Revenue",
          type: "Revenue",
          balance: 120000,
        },
        {
          id: "4200",
          code: "4200",
          name: "Service Revenue",
          type: "Revenue",
          balance: 80000,
        },
      ],
    },
    {
      id: "5000",
      code: "5000",
      name: "Expenses",
      type: "Expense",
      balance: 0,
      children: [
        {
          id: "5100",
          code: "5100",
          name: "Salaries Expense",
          type: "Expense",
          balance: 65000,
        },
        {
          id: "5200",
          code: "5200",
          name: "Rent Expense",
          type: "Expense",
          balance: 24000,
        },
        {
          id: "5300",
          code: "5300",
          name: "Utilities Expense",
          type: "Expense",
          balance: 8000,
        },
      ],
    },
  ]);

  // Initialize the form
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "Assets",
      description: "",
      reportingCategory: "",
      status: "active",
      parentId: "",
      balance: 0,
    },
  });
  
  // Function to handle editing an account
  const handleEditAccount = (account: Account) => {
    setCurrentAccount(account);
    setIsEditMode(true);
    form.reset({
      code: account.code,
      name: account.name,
      type: account.type as any,
      description: account.description || "",
      reportingCategory: account.reportingCategory || "",
      status: account.status,
      balance: account.balance
    });
    setIsDialogOpen(true);
  };

  // Function to toggle account status (active/inactive)
  const toggleAccountStatus = (accountId: string) => {
    const updatedAccounts = [...accounts];
    
    const toggleStatus = (accounts: Account[]): boolean => {
      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].id === accountId) {
          accounts[i].status = accounts[i].status === "active" ? "inactive" : "active";
          
          toast({
            title: accounts[i].status === "active" ? "Account Activated" : "Account Deactivated",
            description: `${accounts[i].name} has been ${accounts[i].status === "active" ? "activated" : "deactivated"}`
          });
          
          return true;
        }
        if (accounts[i].children && toggleStatus(accounts[i].children)) {
          return true;
        }
      }
      return false;
    };
    
    toggleStatus(updatedAccounts);
    setAccounts(updatedAccounts);
  };
  
  // Function to flatten the account hierarchy for table view
  useEffect(() => {
    const flatten = (accounts: Account[], result: Account[] = []) => {
      accounts.forEach(account => {
        result.push(account);
        if (account.children) {
          flatten(account.children, result);
        }
      });
      return result;
    };
    
    setFlatAccounts(flatten(accounts));
  }, [accounts]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const getAllAccountPaths = (
    accountArray: Account[] = accounts, 
    parentPath: string = ""
  ): { id: string; path: string }[] => {
    let results: { id: string; path: string }[] = [];
    
    accountArray.forEach(account => {
      const currentPath = parentPath ? `${parentPath} > ${account.name}` : account.name;
      results.push({ id: account.id, path: currentPath });
      
      if (account.children && account.children.length > 0) {
        results = [...results, ...getAllAccountPaths(account.children, currentPath)];
      }
    });
    
    return results;
  };

  const addNewAccount = (data: AccountFormValues) => {
    const newAccount: Account = {
      id: data.code,
      code: data.code,
      name: data.name,
      type: data.type,
      balance: data.balance,
    };

    if (!data.parentId) {
      setAccounts(prev => [...prev, newAccount]);
    } else {
      const addToParent = (accountList: Account[]): Account[] => {
        return accountList.map(account => {
          if (account.id === data.parentId) {
            return {
              ...account,
              children: [...(account.children || []), newAccount],
            };
          } else if (account.children) {
            return {
              ...account,
              children: addToParent(account.children),
            };
          }
          return account;
        });
      };

      setAccounts(prev => addToParent(prev));
    }

    toast({
      title: "Account Added",
      description: `${data.name} (${data.code}) has been added to your chart of accounts.`,
    });

    setIsDialogOpen(false);
    form.reset();
  };

  const renderAccount = (account: Account, level = 0) => {
    const isExpanded = expanded.includes(account.id);
    const hasChildren = account.children && account.children.length > 0;
    
    return (
      <div key={account.id} className="border-b last:border-b-0">
        <div 
          className={`flex items-center p-3 hover:bg-gray-50 ${level > 0 ? 'pl-' + (level * 6) : ''}`}
          onClick={() => hasChildren && toggleExpand(account.id)}
        >
          {hasChildren && (
            <button className="mr-2 w-4 text-center">
              {isExpanded ? '−' : '+'}
            </button>
          )}
          {!hasChildren && <div className="mr-6" />}
          
          <div className="flex-1 flex items-center">
            <span className="font-medium w-20">{account.code}</span>
            <span className="flex-1">{account.name}</span>
            <span 
              className={`w-32 text-right ${
                account.type === 'Asset' || account.type === 'Expense' 
                  ? 'text-blue-600' 
                  : account.type === 'Liability' || account.type === 'Equity' 
                    ? 'text-green-600'
                    : 'text-purple-600'
              }`}
            >
              {formatCurrency(account.balance, "ZAR")}
            </span>
          </div>
        </div>
        
        {isExpanded && account.children && (
          <div>
            {account.children.map(child => renderAccount(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <p className="text-gray-500">Organize your accounts in a structured hierarchy</p>
        </div>
        <Button 
          onClick={() => {
            setIsEditMode(false);
            form.reset({
              code: "",
              name: "",
              type: "Assets",
              description: "",
              reportingCategory: "",
              status: "active",
              balance: 0
            });
            setIsDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
        >
          <Plus size={16} /> Add New Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>Manage your accounting structure</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="mt-4" onValueChange={setCurrentTab}>
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              {accountTypes.map(type => (
                <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reporting Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    {searchTerm ? "No accounts match your search" : "No accounts found. Create your first account."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell>{account.reportingCategory || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={account.status === "active" ? "success" : "secondary"}>
                        {account.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAccount(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={account.status === "active" ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleAccountStatus(account.id)}
                        >
                          {account.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Account" : "Add New Account"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addNewAccount)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 1010" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Cash on Hand" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Balance (ZAR)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="reportingCategory"
                render={({ field }) => {
                  const currentType = form.watch("type") as keyof typeof reportingCategories;
                  const categories = currentType ? reportingCategories[currentType] || [] : [];
                  
                  return (
                    <FormItem>
                      <FormLabel>Reporting Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={!currentType || categories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Cash in the company's bank account" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Account (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Leave empty for top-level account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-parent">No Parent (Top Level)</SelectItem>
                        {getAllAccountPaths().map(({ id, path }) => (
                          <SelectItem key={id} value={id}>{path}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add Account</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChartOfAccounts;
