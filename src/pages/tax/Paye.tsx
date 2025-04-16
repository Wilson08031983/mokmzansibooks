import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { CalendarIcon, FileText, Download, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";

const Paye = () => {
  const { toast } = useToast();
  const { payeReturns, addPayeReturn } = useFinancialData();
  const payeTableRef = useRef<HTMLDivElement>(null);
  const [isCreatingPaye, setIsCreatingPaye] = useState(false);

  const handleNewPaye = () => {
    setIsCreatingPaye(true);
    
    const newPayeReturn = {
      id: `PAYE-2025-04`,
      period: "April 2025",
      dueDate: "2025-05-07",
      status: "Due",
      amount: 45875.25,
    };
    
    // Simulate processing time
    setTimeout(() => {
      addPayeReturn(newPayeReturn);
      
      toast({
        title: "New PAYE Return",
        description: "A new PAYE return has been created successfully.",
      });
      
      setIsCreatingPaye(false);
    }, 2000);
  };

  const handleDownload = async (id: string) => {
    const payeReturn = payeReturns.find(paye => paye.id === id);
    if (!payeReturn) return;
    
    toast({
      title: "Generating PAYE Return",
      description: `Preparing ${payeReturn.id} for download...`,
    });
    
    const tempContainer = document.createElement('div');
    tempContainer.className = 'p-8 bg-white';
    
    tempContainer.innerHTML = `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">PAYE Return</h1>
        <h2 style="text-align: center; font-size: 18px; margin-bottom: 30px;">${payeReturn.id} - ${payeReturn.period}</h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Employer Information</h3>
          <p><strong>Employer Name:</strong> ABC Company (Pty) Ltd</p>
          <p><strong>Registration Number:</strong> 2020/123456/07</p>
          <p><strong>PAYE Reference:</strong> 7654321098</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Return Summary</h3>
          <p><strong>Period:</strong> ${payeReturn.period}</p>
          <p><strong>Due Date:</strong> ${new Date(payeReturn.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${payeReturn.status}</p>
          <p><strong>Amount:</strong> R${payeReturn.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          ${payeReturn.submissionDate ? `<p><strong>Submission Date:</strong> ${new Date(payeReturn.submissionDate).toLocaleDateString()}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Employee Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Employee</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Income</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">PAYE</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">UIF</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Employee 1</td>
                <td style="border: 1px solid #ddd; padding: 8px;">R45,000.00</td>
                <td style="border: 1px solid #ddd; padding: 8px;">R13,500.00</td>
                <td style="border: 1px solid #ddd; padding: 8px;">R450.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Employee 2</td>
                <td style="border: 1px solid #ddd; padding: 8px;">R38,000.00</td>
                <td style="border: 1px solid #ddd; padding: 8px;">R11,400.00</td>
                <td style="border: 1px solid #ddd; padding: 8px;">R380.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Employee 3</td>
                <td style="border: 1px solid #ddd; padding: 8px;">R65,000.00</td>
                <td style="border: 1px solid #ddd; padding: 8px;">R19,500.00</td>
                <td style="border: 1px solid #ddd; padding: 8px;">R650.00</td>
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
    
    document.body.appendChild(tempContainer);
    
    try {
      const success = await downloadDocumentAsPdf(
        tempContainer,
        `${payeReturn.id.toLowerCase()}.pdf`
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: `${payeReturn.id} has been downloaded successfully.`,
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your PAYE return PDF.",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  const handleDownloadAllReturns = async () => {
    if (!payeTableRef.current) return;
    
    toast({
      title: "Generating Report",
      description: "Preparing PAYE summary report for download...",
    });
    
    try {
      const success = await downloadDocumentAsPdf(
        payeTableRef.current,
        "paye-summary.pdf"
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: "PAYE summary has been downloaded successfully.",
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your PAYE summary PDF.",
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
          <h1 className="text-2xl font-bold">PAYE</h1>
          <p className="text-gray-500">Manage your Pay As You Earn tax submissions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleNewPaye}
            disabled={isCreatingPaye}
            variant={isCreatingPaye ? "success" : "default"}
          >
            {isCreatingPaye ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "New PAYE Return"
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
          <CardTitle>PAYE Returns History</CardTitle>
          <CardDescription>View and manage your monthly PAYE submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={payeTableRef}>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Paye;
