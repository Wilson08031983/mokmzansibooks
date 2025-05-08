import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { Calculator, BarChart3, FileText, CreditCard, ArrowLeftRight, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

const Accounting: React.FC = () => {
  const navigate = useNavigate();

  // Define accounting modules
  const accountingModules = [
    {
      id: 'chart-of-accounts',
      title: 'Chart of Accounts',
      description: 'Manage your financial accounts structure',
      icon: <Calculator className="h-5 w-5" />,
      path: 'chart-of-accounts'
    },
    {
      id: 'transactions',
      title: 'Transactions',
      description: 'Record and manage financial transactions',
      icon: <ArrowLeftRight className="h-5 w-5" />,
      path: 'transactions'
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate financial reports and insights',
      icon: <BarChart3 className="h-5 w-5" />,
      path: 'reports'
    },
    {
      id: 'bank-reconciliation',
      title: 'Bank Reconciliation',
      description: 'Reconcile bank statements with your records',
      icon: <CreditCard className="h-5 w-5" />,
      path: 'bank-reconciliation'
    },
    {
      id: 'journal-entries',
      title: 'Journal Entries',
      description: 'Create and manage journal entries',
      icon: <FileText className="h-5 w-5" />,
      path: 'journal-entries'
    },
    {
      id: 'documents',
      title: 'Document Manager',
      description: 'Upload and link receipts, invoices, and bank statements',
      icon: <FileImage className="h-5 w-5" />,
      path: 'documents'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Accounting</h1>
      </div>
      
      <div className="flex flex-col space-y-6">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-1">
          <div className="flex space-x-2">
            {accountingModules.map((module) => (
              <NavLink 
                key={module.id}
                to={module.path}
                end
                className={({ isActive }) => cn(
                  "flex items-center space-x-1 px-2 py-1 text-sm rounded-md transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                {module.icon}
                <span>{module.title}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Module Grid for Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountingModules.map((module) => (
            <Card 
              key={module.id} 
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(module.path)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  {module.icon}
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Outlet for nested routes */}
        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Accounting;
