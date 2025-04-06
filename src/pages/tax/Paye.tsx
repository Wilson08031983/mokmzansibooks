
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, FileText } from "lucide-react";
import { useState } from "react";

const Paye = () => {
  const { toast } = useToast();
  const [payeReturns] = useState([
    {
      id: "PAYE-2025-03",
      period: "March 2025",
      dueDate: "2025-04-07",
      status: "Due",
      amount: 45250.50,
    },
    {
      id: "PAYE-2025-02",
      period: "February 2025",
      dueDate: "2025-03-07",
      status: "Submitted",
      amount: 44830.75,
      submissionDate: "2025-03-05",
    },
    {
      id: "PAYE-2025-01",
      period: "January 2025",
      dueDate: "2025-02-07",
      status: "Submitted",
      amount: 44125.25,
      submissionDate: "2025-02-06",
    },
  ]);

  const handleNewPaye = () => {
    toast({
      title: "New PAYE Return",
      description: "Creating a new PAYE return submission",
    });
  };

  const handleDownload = (id: string) => {
    toast({
      title: "Downloading PAYE Return",
      description: `Downloading PAYE return ${id}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">PAYE</h1>
          <p className="text-gray-500">Manage your Pay As You Earn tax submissions</p>
        </div>
        <Button onClick={handleNewPaye}>New PAYE Return</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PAYE Returns History</CardTitle>
          <CardDescription>View and manage your monthly PAYE submissions</CardDescription>
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
              {payeReturns.map((payeReturn) => (
                <TableRow key={payeReturn.id}>
                  <TableCell className="font-medium">{payeReturn.id}</TableCell>
                  <TableCell>{payeReturn.period}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {new Date(payeReturn.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payeReturn.status === "Due" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {payeReturn.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(payeReturn.amount)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => handleDownload(payeReturn.id)}
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

export default Paye;
