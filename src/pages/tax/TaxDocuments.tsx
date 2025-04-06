
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download } from "lucide-react";
import { useState, useRef } from "react";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";

const TaxDocuments = () => {
  const { toast } = useToast();
  const documentsTableRef = useRef<HTMLDivElement>(null);
  const [taxDocuments] = useState([
    {
      id: "doc-1",
      name: "Tax Clearance Certificate",
      type: "PDF",
      size: "1.2 MB",
      uploadDate: "2025-02-15",
      category: "Certificates",
    },
    {
      id: "doc-2",
      name: "VAT Registration Certificate",
      type: "PDF",
      size: "854 KB",
      uploadDate: "2024-11-20",
      category: "Certificates",
    },
    {
      id: "doc-3",
      name: "ITR14 2023 Submission",
      type: "PDF",
      size: "2.3 MB",
      uploadDate: "2023-12-01",
      category: "Returns",
    },
    {
      id: "doc-4",
      name: "PAYE Registration Certificate",
      type: "PDF",
      size: "1.1 MB",
      uploadDate: "2023-10-15",
      category: "Certificates",
    },
    {
      id: "doc-5",
      name: "Tax Exemption Letter",
      type: "PDF",
      size: "590 KB",
      uploadDate: "2024-05-22",
      category: "Correspondence",
    },
  ]);

  const handleUpload = () => {
    toast({
      title: "Upload Document",
      description: "Document upload functionality would be triggered here",
    });
  };

  const handleDownload = async (id: string) => {
    const taxDoc = taxDocuments.find(doc => doc.id === id);
    if (!taxDoc) return;
    
    toast({
      title: "Generating Document",
      description: `Preparing ${taxDoc.name} for download...`,
    });
    
    // Create a temporary container with the document data
    const tempContainer = document.createElement('div');
    tempContainer.className = 'p-8 bg-white';
    
    // Style the container with different content based on document type
    if (taxDoc.category === "Certificates") {
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; border: 2px solid #000; padding: 20px; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 28px; margin-bottom: 10px;">${taxDoc.name}</h1>
            <p style="font-size: 18px;">Certificate #: ${taxDoc.id.toUpperCase()}</p>
          </div>
          
          <div style="margin-bottom: 40px;">
            <p style="font-size: 16px; margin-bottom: 20px;">This is to certify that:</p>
            <p style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px;">ABC Company (Pty) Ltd</p>
            <p style="font-size: 16px; margin-bottom: 20px;">Registration Number: 2020/123456/07</p>
            
            <p style="font-size: 16px; margin-bottom: 20px; text-align: center;">Has been registered for ${taxDoc.name.replace(" Certificate", "")} purposes with the South African Revenue Service.</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-top: 60px;">
            <div>
              <p style="border-top: 1px solid #000; padding-top: 10px; width: 200px;">Authorized Signature</p>
            </div>
            <div>
              <p style="border-top: 1px solid #000; padding-top: 10px; width: 200px;">Date: ${new Date(taxDoc.uploadDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div style="margin-top: 40px; text-align: center;">
            <p>This certificate is valid from ${new Date(taxDoc.uploadDate).toLocaleDateString()} to ${new Date(new Date(taxDoc.uploadDate).setFullYear(new Date(taxDoc.uploadDate).getFullYear() + 1)).toLocaleDateString()}</p>
          </div>
        </div>
      `;
    } else if (taxDoc.category === "Returns") {
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">${taxDoc.name}</h1>
          <p style="text-align: center; margin-bottom: 30px;">Submission ID: ${taxDoc.id.toUpperCase()}</p>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; margin-bottom: 10px;">Company Information</h2>
            <p><strong>Company Name:</strong> ABC Company (Pty) Ltd</p>
            <p><strong>Registration Number:</strong> 2020/123456/07</p>
            <p><strong>Tax Reference Number:</strong> 9876543210</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; margin-bottom: 10px;">Return Details</h2>
            <p><strong>Tax Year:</strong> 2023</p>
            <p><strong>Submission Date:</strong> ${new Date(taxDoc.uploadDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> Submitted</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; margin-bottom: 10px;">Tax Calculation Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount (ZAR)</th>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Total Income</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R5,250,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Total Expenses</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R3,750,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Taxable Income</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R1,500,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Tax Calculated</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R420,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Tax Credits</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R50,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Final Tax Due</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>R370,000.00</strong></td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 50px;">
            <p style="text-align: center;">This is a computer-generated document. No signature required.</p>
          </div>
        </div>
      `;
    } else {
      // Correspondence
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: right; margin-bottom: 40px;">
            <p>South African Revenue Service</p>
            <p>299 Bronkhorst Street</p>
            <p>Nieuw Muckleneuk, Pretoria</p>
            <p>0181</p>
            <p>Date: ${new Date(taxDoc.uploadDate).toLocaleDateString()}</p>
          </div>
          
          <div style="margin-bottom: 40px;">
            <p>ABC Company (Pty) Ltd</p>
            <p>123 Business Street</p>
            <p>Business Park</p>
            <p>Johannesburg, 2000</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>Subject: ${taxDoc.name}</strong></p>
            <p><strong>Reference: ${taxDoc.id.toUpperCase()}</strong></p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>Dear Taxpayer,</p>
            
            <p style="margin-top: 20px;">This letter serves to confirm that ABC Company (Pty) Ltd (Registration Number: 2020/123456/07) has been granted tax exemption status under Section 10(1)(cN) of the Income Tax Act, 1962 (Act No. 58 of 1962).</p>
            
            <p style="margin-top: 20px;">This exemption is valid from ${new Date(taxDoc.uploadDate).toLocaleDateString()} and will remain in effect unless revoked by the Commissioner for the South African Revenue Service.</p>
            
            <p style="margin-top: 20px;">Please note the following conditions associated with this exemption:</p>
            <ul style="margin-left: 20px;">
              <li style="margin-top: 10px;">The entity must continue to comply with all relevant provisions of the Income Tax Act.</li>
              <li style="margin-top: 10px;">Annual tax returns must still be submitted.</li>
              <li style="margin-top: 10px;">Any changes to the entity's constitution or activities must be reported to SARS.</li>
            </ul>
            
            <p style="margin-top: 20px;">Should you have any queries regarding this matter, please do not hesitate to contact your nearest SARS branch or call the SARS Contact Centre at 0800 00 7277.</p>
          </div>
          
          <div style="margin-top: 50px;">
            <p>Yours sincerely,</p>
            <p style="margin-top: 30px;"><strong>J. Smith</strong></p>
            <p>Senior Manager: Tax Exemption Unit</p>
            <p>South African Revenue Service</p>
          </div>
        </div>
      `;
    }
    
    // Append to document temporarily
    document.body.appendChild(tempContainer);
    
    try {
      const success = await downloadDocumentAsPdf(
        tempContainer,
        `${taxDoc.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: `${taxDoc.name} has been downloaded successfully.`,
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your document PDF.",
        variant: "destructive",
      });
    } finally {
      // Clean up
      document.body.removeChild(tempContainer);
    }
  };

  const handleDownloadAllDocuments = async () => {
    if (!documentsTableRef.current) return;
    
    toast({
      title: "Generating Report",
      description: "Preparing document index for download...",
    });
    
    try {
      const success = await downloadDocumentAsPdf(
        documentsTableRef.current,
        "tax-documents-index.pdf"
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: "Tax documents index has been downloaded successfully.",
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your documents index PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tax Documents</h1>
          <p className="text-gray-500">Store and manage your tax-related documents</p>
        </div>
        <Button variant="outline" onClick={handleDownloadAllDocuments} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Document Index
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input type="file" />
            </div>
            <Button onClick={handleUpload}>Upload</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={documentsTableRef}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxDocuments.map((taxDoc) => (
                  <TableRow key={taxDoc.id}>
                    <TableCell className="font-medium">{taxDoc.name}</TableCell>
                    <TableCell>{taxDoc.category}</TableCell>
                    <TableCell>{taxDoc.type}</TableCell>
                    <TableCell>{taxDoc.size}</TableCell>
                    <TableCell>{new Date(taxDoc.uploadDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                        onClick={() => handleDownload(taxDoc.id)}
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

export default TaxDocuments;

