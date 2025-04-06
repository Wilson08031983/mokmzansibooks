
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, FileText } from "lucide-react";
import { useState } from "react";

const VatReturns = () => {
  const { toast } = useToast();
  const [vatReturns] = useState([
    {
      id: "VAT-2025-Q1",
      period: "Jan - Mar 2025",
      dueDate: "2025-04-30",
      status: "Due",
      amount: 12450.75,
    },
    {
      id: "VAT-2024-Q4",
      period: "Oct - Dec 2024",
      dueDate: "2025-01-31",
      status: "Submitted",
      amount: 10320.50,
      submissionDate: "2025-01-15",
    },
    {
      id: "VAT-2024-Q3",
      period: "Jul - Sep 2024",
      dueDate: "2024-10-31",
      status: "Submitted",
      amount: 9875.25,
      submissionDate: "2024-10-20",
    },
  ]);

  const handleNewVatReturn = () => {
    toast({
      title: "New VAT return",
      description: "Creating a new VAT return submission",
    });
  };

  const handleDownload = (id: string) => {
    toast({
      title: "Downloading VAT return",
      description: `Downloading VAT return ${id}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">VAT Returns</h1>
          <p className="text-gray-500">Manage your Value-Added Tax returns</p>
        </div>
        <Button onClick={handleNewVatReturn}>New VAT Return</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>VAT Returns History</CardTitle>
          <CardDescription>View and manage your VAT return submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vatReturns.map((vatReturn) => (
                <TableRow key={vatReturn.id}>
                  <TableCell className="font-medium">{vatReturn.id}</TableCell>
                  <TableCell>{vatReturn.period}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {new Date(vatReturn.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      vatReturn.status === "Due" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {vatReturn.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(vatReturn.amount)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => handleDownload(vatReturn.id)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download
                    </Button>
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

export default VatReturns;
