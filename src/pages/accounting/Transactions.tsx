
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    description: isIncome ? "Client Payment" : "Business Expense",
  };
});

const AccountingTransactions = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    description: "",
    type: "expense",
    categoryId: "expense",
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: value,
    });
  };

  // Handle new transaction submission
  const handleSubmitTransaction = () => {
    toast({
      title: "Transaction Added",
      description: `${newTransaction.type === "income" ? "Income" : "Expense"} of ${formatCurrency(parseFloat(newTransaction.amount) || 0, "ZAR")} added successfully.`,
    });
    setNewTransactionOpen(false);
    // Reset form
    setNewTransaction({
      amount: "",
      description: "",
      type: "expense",
      categoryId: "expense",
    });
  };

  // Handle import submission
  const handleImport = () => {
    toast({
      title: "Import Successful",
      description: "Your transactions have been imported successfully.",
    });
    setImportDialogOpen(false);
  };

  // Handle export submission
  const handleExport = () => {
    toast({
      title: "Export Successful",
      description: "Your transactions have been exported successfully.",
    });
    setExportDialogOpen(false);
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
          <Button onClick={() => setNewTransactionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
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

      {/* New Transaction Dialog */}
      <Dialog open={newTransactionOpen} onOpenChange={setNewTransactionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (ZAR)
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={newTransaction.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={newTransaction.type}
                onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}
              >
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={newTransaction.categoryId}
                onValueChange={(value) => setNewTransaction({...newTransaction, categoryId: value})}
              >
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(cat => cat.id !== "all").map((category) => (
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newTransaction.description}
                onChange={handleInputChange}
                placeholder="Transaction details"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmitTransaction}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Transactions</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-500">Upload a CSV or Excel file with your transactions.</p>
            <div className="flex justify-center">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV, XLSX (MAX. 10MB)</p>
                </div>
                <input id="file-upload" type="file" className="hidden" />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Transactions</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-500">Choose a format to export your transactions.</p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleExport} className="flex flex-col p-4 h-auto">
                <FileText className="h-6 w-6 mb-2" />
                <span>CSV</span>
              </Button>
              <Button variant="outline" onClick={handleExport} className="flex flex-col p-4 h-auto">
                <FileText className="h-6 w-6 mb-2" />
                <span>Excel</span>
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select defaultValue="all">
                <SelectTrigger id="date-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleExport}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountingTransactions;
