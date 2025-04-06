
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define a type for accounting modules
interface AccountingModule {
  id: string;
  title: string;
  description: string;
  path: string;
}

const Accounting = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Define all accounting modules
  const modules: AccountingModule[] = [
    {
      id: "chart-of-accounts",
      title: "Chart of Accounts",
      description: "Organize your accounts in a structured hierarchy",
      path: "/accounting/chart-of-accounts"
    },
    {
      id: "journal-entries",
      title: "Journal Entries",
      description: "Record and manage your accounting transactions",
      path: "/accounting/journal-entries"
    },
    {
      id: "bank-reconciliation",
      title: "Bank Reconciliation",
      description: "Match your accounting records with bank statements",
      path: "/accounting/bank-reconciliation"
    },
    {
      id: "reports",
      title: "Financial Reports",
      description: "Generate income statements, balance sheets, and cash flow reports",
      path: "/accounting/reports"
    },
    {
      id: "receivables",
      title: "Accounts Receivable",
      description: "Track money owed to your business by customers",
      path: "/accounting/receivables"
    },
    {
      id: "payables",
      title: "Accounts Payable",
      description: "Manage bills and payments to your suppliers",
      path: "/accounting/payables"
    },
    {
      id: "integrations",
      title: "Banking Integrations",
      description: "Connect to your bank accounts and accounting software",
      path: "/accounting/integrations"
    },
    {
      id: "transactions",
      title: "Transactions",
      description: "View and categorize all your financial transactions",
      path: "/accounting/transactions"
    }
  ];

  const toggleSelection = (moduleId: string) => {
    setSelectedModules(prev => {
      // If already selected, remove it
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      }
      // Otherwise add it
      return [...prev, moduleId];
    });
  };

  const isSelected = (moduleId: string) => selectedModules.includes(moduleId);

  const clearSelection = () => {
    setSelectedModules([]);
  };

  const findSimilarModules = () => {
    if (selectedModules.length === 0) {
      toast({
        title: "No modules selected",
        description: "Please select at least one module to find similar ones",
      });
      return;
    }

    // This is a simple implementation - in a real app you'd use more sophisticated matching
    const selectedKeywords = selectedModules.flatMap(id => {
      const module = modules.find(m => m.id === id);
      if (!module) return [];
      return [...module.title.toLowerCase().split(' '), ...module.description.toLowerCase().split(' ')];
    });

    // Find modules with similar keywords
    const similarModuleIds = modules
      .filter(module => !selectedModules.includes(module.id))
      .map(module => {
        const moduleKeywords = [...module.title.toLowerCase().split(' '), ...module.description.toLowerCase().split(' ')];
        const matchCount = moduleKeywords.filter(keyword => selectedKeywords.includes(keyword)).length;
        return { id: module.id, matchCount };
      })
      .filter(item => item.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 3)
      .map(item => item.id);

    if (similarModuleIds.length === 0) {
      toast({
        title: "No similar modules found",
        description: "We couldn't find any modules similar to your selection",
      });
      return;
    }

    setSelectedModules([...selectedModules, ...similarModuleIds]);
    toast({
      title: "Similar modules added",
      description: `Added ${similarModuleIds.length} similar modules to your selection`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Accounting</h1>
        <p className="text-gray-500">Manage your company's financial transactions</p>
      </div>

      {selectedModules.length > 0 && (
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md">
          <span className="text-sm font-medium">
            {selectedModules.length} module{selectedModules.length > 1 ? 's' : ''} selected
          </span>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={findSimilarModules}>
              Find similar
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear selection
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.id} className="relative">
            <div
              className={`absolute top-3 right-3 z-10 ${isSelected(module.id) ? 'block' : 'hidden'}`}
            >
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <Card 
              className={`h-full hover:shadow-md transition-shadow ${isSelected(module.id) ? 'bg-green-50 ring-2 ring-green-500 ring-offset-2' : ''}`}
              onClick={() => toggleSelection(module.id)}
            >
              <CardHeader>
                <CardTitle>{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  {module.description}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <Link 
                    to={module.path} 
                    className="text-primary hover:underline text-sm"
                    onClick={(e) => e.stopPropagation()} // Prevent the card click from triggering
                  >
                    Open {module.title}
                  </Link>
                  {isSelected(module.id) && (
                    <Badge variant="secondary">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accounting;
