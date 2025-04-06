
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, FileText } from "lucide-react";
import { useState } from "react";

const IncomeTax = () => {
  const { toast } = useToast();
  const [taxForms] = useState([
    {
      id: "ITR14-2024",
      taxYear: "2024",
      dueDate: "2024-12-31",
      status: "Pending",
      taxableIncome: 1250000,
      taxDue: 350000,
    },
    {
      id: "ITR14-2023",
      taxYear: "2023",
      dueDate: "2023-12-31",
      status: "Submitted",
      taxableIncome: 980000,
      taxDue: 274400,
      submissionDate: "2023-11-15",
    },
    {
      id: "ITR14-2022",
      taxYear: "2022",
      dueDate: "2022-12-31",
      status: "Submitted",
      taxableIncome: 875000,
      taxDue: 245000,
      submissionDate: "2022-10-25",
    },
  ]);

  const handlePrepare = () => {
    toast({
      title: "Prepare Income Tax",
      description: "Starting income tax preparation workflow",
    });
  };

  const handleDownload = (id: string) => {
    toast({
      title: "Downloading Tax Form",
      description: `Downloading tax form ${id}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Income Tax</h1>
          <p className="text-gray-500">Manage your company income tax submissions</p>
        </div>
        <Button onClick={handlePrepare}>Prepare Income Tax</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Tax History</CardTitle>
          <CardDescription>View and manage your company's ITR14 submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Tax Year</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Taxable Income</TableHead>
                <TableHead>Tax Due</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxForms.map((taxForm) => (
                <TableRow key={taxForm.id}>
                  <TableCell className="font-medium">{taxForm.id}</TableCell>
                  <TableCell>{taxForm.taxYear}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {new Date(taxForm.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      taxForm.status === "Pending" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {taxForm.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(taxForm.taxableIncome)}</TableCell>
                  <TableCell>{formatCurrency(taxForm.taxDue)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => handleDownload(taxForm.id)}
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

export default IncomeTax;
