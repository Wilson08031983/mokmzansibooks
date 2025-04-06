
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
  children?: Account[];
}

const ChartOfAccounts = () => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string[]>([]);

  // Sample accounts data
  const accounts: Account[] = [
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
  ];

  const toggleExpand = (id: string) => {
    setExpanded(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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
              {formatCurrency(account.balance)}
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

  const addNewAccount = () => {
    toast({
      title: "Add Account",
      description: "This functionality will be implemented soon",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <p className="text-gray-500">Organize your accounts in a structured hierarchy</p>
        </div>
        <button 
          onClick={addNewAccount}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
        >
          Add Account
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-3 bg-gray-100 p-3 font-semibold border-b">
              <div>Account Code & Name</div>
              <div>Type</div>
              <div className="text-right">Balance</div>
            </div>
            <div>
              {accounts.map(account => renderAccount(account))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartOfAccounts;
