
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Upload, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define transaction categories
const CATEGORIES = [
  { id: "all", name: "All Categories", color: "#8E9196" },
  { id: "income", name: "Income", color: "#4CAF50" },
  { id: "expense", name: "Expense", color: "#F97316" },
  { id: "supplies", name: "Office Supplies", color: "#8B5CF6" },
  { id: "marketing", name: "Marketing", color: "#0EA5E9" },
  { id: "salary", name: "Salary", color: "#D946EF" },
  { id: "rent", name: "Rent", color: "#F59E0B" },
  { id: "utilities", name: "Utilities", color: "#10B981" },
];

// Mock transaction data with categories
const TRANSACTIONS = [...Array(8)].map((_, index) => {
  const isIncome = index % 3 === 0;
  let categoryId = isIncome ? "income" : "expense";
  
  // For expenses, assign more specific categories
  if (!isIncome) {
    const expenseCategories = ["supplies", "marketing", "salary", "rent", "utilities"];
    categoryId = expenseCategories[index % expenseCategories.length];
  }

  return {
    id: 1000 + index,
    date: `April ${index + 1}, 2025`,
    amount: Math.random() * 1000,
    type: isIncome ? "income" : "expense",
    categoryId,
  };
});

const AccountingTransactions = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleFeatureClick = () => {
    toast({
      title: "Feature Access Granted",
      description: "You now have full access to this feature.",
    });
  };

  // Filter transactions based on selected category
  const filteredTransactions = TRANSACTIONS.filter(
    (transaction) =>
      selectedCategory === "all" || transaction.categoryId === selectedCategory
  );

  // Find the category object by id
  const getCategoryById = (id) => CATEGORIES.find((cat) => cat.id === id) || CATEGORIES[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-gray-500">Manage your financial transactions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleFeatureClick}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
          <Button variant="outline" onClick={handleFeatureClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleFeatureClick}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-[250px_1fr] gap-6">
        {/* Category filter section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions list */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const category = getCategoryById(transaction.categoryId);
                return (
                  <div key={transaction.id} className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-md mr-4">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Transaction #{transaction.id}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{transaction.date}</span>
                          <div className="flex items-center ml-3">
                            <Tag className="h-3 w-3 mr-1" />
                            <div className="flex items-center">
                              <div
                                className="w-2 h-2 rounded-full mr-1"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span>{category.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(transaction.amount, "ZAR")}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.type === "income" ? "Income" : "Expense"}
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No transactions found for the selected category.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingTransactions;
