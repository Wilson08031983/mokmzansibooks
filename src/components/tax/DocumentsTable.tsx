
import React, { useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Bell } from "lucide-react";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: string;
}

interface ExtractedData {
  id: string;
  documentId: string;
  fields: Record<string, string>;
  extractedDate: string;
}

interface DocumentsTableProps {
  documents: Document[];
  extractedData: ExtractedData[];
  onDownload: (id: string) => void;
  onBulkDownload: () => void;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({ 
  documents, 
  extractedData, 
  onDownload,
  onBulkDownload
}) => {
  const { toast } = useToast();
  const tableRef = useRef<HTMLDivElement>(null);

  const getExpiryStatus = (docId: string) => {
    const extractedDoc = extractedData.find(data => data.documentId === docId);
    if (!extractedDoc || !extractedDoc.fields.expiryDate) return null;
    
    const expiryDate = new Date(extractedDoc.fields.expiryDate);
    const today = new Date();
    const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry < 0) {
      return { status: 'expired', daysToExpiry };
    } else if (daysToExpiry <= 30) {
      return { status: 'warning', daysToExpiry };
    } else {
      return { status: 'valid', daysToExpiry };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Documents</h3>
        <Button variant="outline" onClick={onBulkDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Document Index
        </Button>
      </div>
      
      <div ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No documents uploaded yet. Upload documents in Step 1.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => {
                const expiryStatus = getExpiryStatus(doc.id);
                return (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{doc.size}</TableCell>
                    <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {expiryStatus ? (
                        <>
                          {expiryStatus.status === 'expired' ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Bell className="h-3 w-3" /> Expired
                            </Badge>
                          ) : expiryStatus.status === 'warning' ? (
                            <Badge variant="outline" className="border-amber-500 text-amber-500 flex items-center gap-1">
                              <Bell className="h-3 w-3" /> 
                              {expiryStatus.daysToExpiry} days left
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              Valid
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                        onClick={() => onDownload(doc.id)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DocumentsTable;
