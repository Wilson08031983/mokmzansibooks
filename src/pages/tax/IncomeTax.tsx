
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, FileText, Download, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";

const IncomeTax = () => {
  const { toast } = useToast();
  const taxTableRef = useRef<HTMLDivElement>(null);
  const [isPreparingTax, setIsPreparingTax] = useState(false);
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
    setIsPreparingTax(true);
    
    toast({
      title: "Prepare Income Tax",
      description: "Starting income tax preparation workflow",
    });
    
    // Simulate processing time
    setTimeout(() => {
      setIsPreparingTax(false);
    }, 2000);
  };

  const handleDownload = async (id: string) => {
    const taxForm = taxForms.find(form => form.id === id);
    if (!taxForm) return;
    
    toast({
      title: "Generating Tax Form",
      description: `Preparing ${taxForm.id} for download...`,
    });
    
    // Create a temporary container with the tax form data
    const tempContainer = document.createElement('div');
    tempContainer.className = 'p-8 bg-white';
    
    // Style the container with some basic tax form layout
    tempContainer.innerHTML = `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">Income Tax Return</h1>
        <h2 style="text-align: center; font-size: 18px; margin-bottom: 30px;">Form ${taxForm.id}</h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Company Information</h3>
          <p><strong>Company Name:</strong> ABC Company (Pty) Ltd</p>
          <p><strong>Registration Number:</strong> 2020/123456/07</p>
          <p><strong>Tax Reference:</strong> 9876543210</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Tax Summary</h3>
          <p><strong>Tax Year:</strong> ${taxForm.taxYear}</p>
          <p><strong>Taxable Income:</strong> R${taxForm.taxableIncome.toLocaleString()}</p>
          <p><strong>Tax Due:</strong> R${taxForm.taxDue.toLocaleString()}</p>
          <p><strong>Status:</strong> ${taxForm.status}</p>
          <p><strong>Due Date:</strong> ${new Date(taxForm.dueDate).toLocaleDateString()}</p>
          ${taxForm.submissionDate ? `<p><strong>Submission Date:</strong> ${new Date(taxForm.submissionDate).toLocaleDateString()}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Declaration</h3>
          <p style="margin-bottom: 30px;">I declare that the information provided in this return is true and correct to the best of my knowledge.</p>
          
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p>____________________</p>
              <p>Signature</p>
            </div>
            <div>
              <p>${new Date().toLocaleDateString()}</p>
              <p>Date</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Append to document temporarily
    document.body.appendChild(tempContainer);
    
    try {
      const success = await downloadDocumentAsPdf(
        tempContainer,
        `${taxForm.id.toLowerCase()}.pdf`
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: `${taxForm.id} has been downloaded successfully.`,
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your tax form PDF.",
        variant: "destructive",
      });
    } finally {
      // Clean up
      document.body.removeChild(tempContainer);
    }
  };

  const handleDownloadAllForms = async () => {
    if (!taxTableRef.current) return;
    
    toast({
      title: "Generating Report",
      description: "Preparing income tax summary report for download...",
    });
    
    try {
      const success = await downloadDocumentAsPdf(
        taxTableRef.current,
        "income-tax-summary.pdf"
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: "Income tax summary has been downloaded successfully.",
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your tax summary PDF.",
        variant: "destructive",
      });
    }
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
        <div className="flex gap-2">
          <Button 
            onClick={handlePrepare}
            disabled={isPreparingTax}
            variant={isPreparingTax ? "success" : "default"}
          >
            {isPreparingTax ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Prepare Income Tax"
            )}
          </Button>
          <Button variant="outline" onClick={handleDownloadAllForms} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Tax History</CardTitle>
          <CardDescription>View and manage your company's ITR14 submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={taxTableRef}>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeTax;
