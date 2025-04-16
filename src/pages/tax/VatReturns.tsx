import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, FileText, Download, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";

const VatReturns = () => {
  const { toast } = useToast();
  const vatTableRef = useRef<HTMLDivElement>(null);
  const [isCreatingReturn, setIsCreatingReturn] = useState(false);
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
    setIsCreatingReturn(true);
    
    toast({
      title: "New VAT return",
      description: "Creating a new VAT return submission",
    });
    
    // Simulate processing time
    setTimeout(() => {
      setIsCreatingReturn(false);
    }, 2000);
  };

  const handleDownload = async (id: string) => {
    const vatReturn = vatReturns.find(vat => vat.id === id);
    if (!vatReturn) return;
    
    toast({
      title: "Generating VAT Return",
      description: `Preparing ${vatReturn.id} for download...`,
    });
    
    // Create a temporary container with the VAT return data
    const tempContainer = document.createElement('div');
    tempContainer.className = 'p-8 bg-white';
    
    // Style the container with some basic VAT return layout
    tempContainer.innerHTML = `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">VAT Return</h1>
        <h2 style="text-align: center; font-size: 18px; margin-bottom: 30px;">${vatReturn.id} - ${vatReturn.period}</h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Vendor Information</h3>
          <p><strong>Vendor Name:</strong> ABC Company (Pty) Ltd</p>
          <p><strong>VAT Registration Number:</strong> 4123456789</p>
          <p><strong>Business Address:</strong> 123 Business Street, Business Park, Johannesburg, 2000</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Return Summary</h3>
          <p><strong>Period:</strong> ${vatReturn.period}</p>
          <p><strong>Due Date:</strong> ${new Date(vatReturn.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${vatReturn.status}</p>
          ${vatReturn.submissionDate ? `<p><strong>Submission Date:</strong> ${new Date(vatReturn.submissionDate).toLocaleDateString()}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">VAT Calculation</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount (ZAR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Standard-rated supplies (15%)</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R350,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Zero-rated supplies</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R50,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Total supplies (Value of goods/services)</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>R400,000.00</strong></td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">VAT charged on standard-rated supplies (Output VAT)</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R52,500.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">VAT paid on expenses (Input VAT)</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R40,050.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>VAT payable / (refundable)</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>R${vatReturn.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
              </tr>
            </tbody>
          </table>
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
        `${vatReturn.id.toLowerCase()}.pdf`
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: `${vatReturn.id} has been downloaded successfully.`,
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your VAT return PDF.",
        variant: "destructive",
      });
    } finally {
      // Clean up
      document.body.removeChild(tempContainer);
    }
  };

  const handleDownloadAllReturns = async () => {
    if (!vatTableRef.current) return;
    
    toast({
      title: "Generating Report",
      description: "Preparing VAT summary report for download...",
    });
    
    try {
      const success = await downloadDocumentAsPdf(
        vatTableRef.current,
        "vat-summary.pdf"
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: "VAT summary has been downloaded successfully.",
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your VAT summary PDF.",
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
          <h1 className="text-2xl font-bold">VAT Returns</h1>
          <p className="text-gray-500">Manage your Value-Added Tax returns</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleNewVatReturn}
            disabled={isCreatingReturn}
            variant={isCreatingReturn ? "success" : "default"}
          >
            {isCreatingReturn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "New VAT Return"
            )}
          </Button>
          <Button variant="outline" onClick={handleDownloadAllReturns} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>VAT Returns History</CardTitle>
          <CardDescription>View and manage your VAT return submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={vatTableRef}>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VatReturns;
