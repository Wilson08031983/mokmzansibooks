
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";
import { useState } from "react";

const TaxDocuments = () => {
  const { toast } = useToast();
  const [documents] = useState([
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

  const handleDownload = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (document) {
      toast({
        title: "Downloading Document",
        description: `Downloading ${document.name}`,
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
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">{document.name}</TableCell>
                  <TableCell>{document.category}</TableCell>
                  <TableCell>{document.type}</TableCell>
                  <TableCell>{document.size}</TableCell>
                  <TableCell>{new Date(document.uploadDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => handleDownload(document.id)}
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

export default TaxDocuments;
