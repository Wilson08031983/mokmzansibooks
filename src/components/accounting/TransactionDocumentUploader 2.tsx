import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileUp, AlertCircle, File, Link as LinkIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface DocumentFile {
  id: string;
  filename: string;
  fileType: string;
  uploadDate: string;
  fileSize: number;
  documentType: 'bank_statement' | 'receipt';
  linkedTransactionId?: string;
}

interface TransactionDocumentUploaderProps {
  transactions: Transaction[];
  onDocumentUploaded?: (document: DocumentFile) => void;
  onDocumentLinked?: (document: DocumentFile, transactionId: string) => void;
}

export const TransactionDocumentUploader = ({
  transactions = [],
  onDocumentUploaded,
  onDocumentLinked
}: TransactionDocumentUploaderProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [documentType, setDocumentType] = useState<'bank_statement' | 'receipt'>('receipt');
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentFile[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File too large. Maximum size is 10MB.");
      }

      // Determine file type category
      const fileType = file.type.split('/')[1] || 'unknown';
      
      // First, create a record in appropriate documents table
      const tableName = documentType === 'bank_statement' ? 'bank_statements' : 'transaction_receipts';
      const storageBucket = documentType === 'bank_statement' ? 'bank-statements' : 'transaction-receipts';
      
      const { data: documentRecord, error: dbError } = await supabase
        .from(tableName)
        .insert([
          { 
            file_name: file.name,
            file_type: fileType,
            file_size: file.size,
            status: 'pending',
            upload_date: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // Track upload progress
      const filePath = `${documentRecord.id}/${file.name}`;
      
      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });
        
      if (uploadError) throw uploadError;

      // Update status to completed
      await supabase
        .from(tableName)
        .update({ status: 'completed' })
        .eq('id', documentRecord.id);

      // Add to our local list
      const newDocument: DocumentFile = {
        id: documentRecord.id,
        filename: file.name,
        fileType,
        uploadDate: new Date().toISOString(),
        fileSize: file.size,
        documentType
      };

      setUploadedDocuments(prev => [newDocument, ...prev]);
      
      if (onDocumentUploaded) {
        onDocumentUploaded(newDocument);
      }

      toast({
        title: `${documentType === 'bank_statement' ? 'Bank statement' : 'Receipt'} uploaded successfully`,
        description: "Your document has been uploaded and is ready to be linked to transactions.",
      });

      // If this is a receipt and there's a selected transaction, offer to link it
      if (documentType === 'receipt' && selectedTransaction) {
        await linkDocumentToTransaction(newDocument.id, selectedTransaction);
      }

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload document');
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err.message || 'Failed to upload document',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const linkDocumentToTransaction = async (documentId: string, transactionId: string) => {
    try {
      // Update the receipt record with the transaction ID
      const { error } = await supabase
        .from('transaction_receipts')
        .update({ transaction_id: transactionId })
        .eq('id', documentId);

      if (error) throw error;

      // Update local state
      setUploadedDocuments(docs => 
        docs.map(doc => 
          doc.id === documentId 
            ? { ...doc, linkedTransactionId: transactionId } 
            : doc
        )
      );

      // Find document and transaction for notification
      const document = uploadedDocuments.find(d => d.id === documentId);
      const transaction = transactions.find(t => t.id === transactionId);

      if (document && transaction && onDocumentLinked) {
        onDocumentLinked(document, transactionId);
      }

      toast({
        title: "Document linked successfully",
        description: `Receipt "${document?.filename}" has been linked to transaction "${transaction?.description}"`,
      });

      // Reset selections
      setSelectedDocument(null);
      setSelectedTransaction(null);
      
    } catch (err: any) {
      console.error('Linking error:', err);
      toast({
        variant: "destructive",
        title: "Linking failed",
        description: err.message || 'Failed to link document to transaction',
      });
    }
  };

  const unlinkDocument = async (documentId: string) => {
    try {
      // Update the receipt record to remove transaction ID
      const { error } = await supabase
        .from('transaction_receipts')
        .update({ transaction_id: null })
        .eq('id', documentId);

      if (error) throw error;

      // Update local state
      setUploadedDocuments(docs => 
        docs.map(doc => 
          doc.id === documentId 
            ? { ...doc, linkedTransactionId: undefined } 
            : doc
        )
      );

      toast({
        title: "Document unlinked",
        description: "Receipt has been unlinked from the transaction",
      });
      
    } catch (err: any) {
      console.error('Unlinking error:', err);
      toast({
        variant: "destructive",
        title: "Unlinking failed",
        description: err.message || 'Failed to unlink document',
      });
    }
  };

  // Load documents on initial render
  const loadDocuments = async () => {
    try {
      // Load bank statements
      const { data: bankStatements, error: bankError } = await supabase
        .from('bank_statements')
        .select('*')
        .order('upload_date', { ascending: false });

      // Load receipts with their linked transactions
      const { data: receipts, error: receiptsError } = await supabase
        .from('transaction_receipts')
        .select('*')
        .order('upload_date', { ascending: false });

      if (bankError) throw bankError;
      if (receiptsError) throw receiptsError;

      const formattedBankStatements: DocumentFile[] = (bankStatements || []).map(bs => ({
        id: bs.id,
        filename: bs.file_name,
        fileType: bs.file_type,
        uploadDate: bs.upload_date,
        fileSize: bs.file_size,
        documentType: 'bank_statement'
      }));

      const formattedReceipts: DocumentFile[] = (receipts || []).map(receipt => ({
        id: receipt.id,
        filename: receipt.file_name,
        fileType: receipt.file_type,
        uploadDate: receipt.upload_date,
        fileSize: receipt.file_size,
        documentType: 'receipt',
        linkedTransactionId: receipt.transaction_id
      }));

      setUploadedDocuments([...formattedBankStatements, ...formattedReceipts]);

    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError('Failed to load existing documents');
    }
  };

  // A helper to format file sizes
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Find a transaction by ID
  const getTransactionById = (id: string): Transaction | undefined => {
    return transactions.find(t => t.id === id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Management</CardTitle>
        <CardDescription>
          Upload and manage bank statements and transaction receipts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            <TabsTrigger value="manage">Manage & Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Document Type</label>
                <Select 
                  value={documentType} 
                  onValueChange={(value) => setDocumentType(value as 'bank_statement' | 'receipt')}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_statement">Bank Statement</SelectItem>
                    <SelectItem value="receipt">Receipt/Invoice/Slip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {documentType === 'receipt' && (
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Link to Transaction (Optional)</label>
                  <Select 
                    value={selectedTransaction || ''} 
                    onValueChange={setSelectedTransaction}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select transaction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Link later)</SelectItem>
                      {transactions.map(transaction => (
                        <SelectItem key={transaction.id} value={transaction.id}>
                          {transaction.description.slice(0, 25)}{transaction.description.length > 25 ? '...' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col items-center justify-center">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <div className="w-full space-y-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        {documentType === 'bank_statement' 
                          ? 'CSV, XLSX, PDF (MAX. 10MB)' 
                          : 'PDF, PNG, JPG (MAX. 10MB)'}
                      </p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept={documentType === 'bank_statement' 
                    ? ".csv,.xlsx,.pdf"
                    : ".pdf,.png,.jpg,.jpeg"}
                  disabled={isUploading}
                />
              </label>
            </div>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Filter By Type</label>
                <Select 
                  value={documentType} 
                  onValueChange={(value) => setDocumentType(value as 'bank_statement' | 'receipt')}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_statement">Bank Statements</SelectItem>
                    <SelectItem value="receipt">Receipts/Invoices/Slips</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {documentType === 'receipt' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Select Receipt to Link</h3>
                    <Select 
                      value={selectedDocument || ''} 
                      onValueChange={setSelectedDocument}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select receipt" />
                      </SelectTrigger>
                      <SelectContent>
                        {uploadedDocuments
                          .filter(doc => doc.documentType === 'receipt')
                          .map(doc => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.filename.slice(0, 25)}{doc.filename.length > 25 ? '...' : ''}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Link to Transaction</h3>
                    <div className="flex space-x-2">
                      <Select 
                        value={selectedTransaction || ''} 
                        onValueChange={setSelectedTransaction}
                        disabled={!selectedDocument}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select transaction" />
                        </SelectTrigger>
                        <SelectContent>
                          {transactions.map(transaction => (
                            <SelectItem key={transaction.id} value={transaction.id}>
                              {transaction.description.slice(0, 25)}{transaction.description.length > 25 ? '...' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="default" 
                        disabled={!selectedDocument || !selectedTransaction}
                        onClick={() => {
                          if (selectedDocument && selectedTransaction) {
                            linkDocumentToTransaction(selectedDocument, selectedTransaction);
                          }
                        }}
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Link
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border rounded-md">
              <div className="grid grid-cols-12 bg-gray-100 p-3 font-semibold border-b">
                <div className="col-span-5">Filename</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Actions</div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {uploadedDocuments
                  .filter(doc => doc.documentType === documentType)
                  .map(doc => (
                    <div key={doc.id} className="grid grid-cols-12 p-3 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="col-span-5 flex items-center">
                        <File className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{doc.filename}</span>
                      </div>
                      <div className="col-span-2">{doc.fileType}</div>
                      <div className="col-span-2">{formatFileSize(doc.fileSize)}</div>
                      <div className="col-span-2">{new Date(doc.uploadDate).toLocaleDateString()}</div>
                      <div className="col-span-1 flex justify-end">
                        {doc.documentType === 'receipt' && doc.linkedTransactionId && (
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              Linked
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => unlinkDocument(doc.id)}
                              title="Unlink from transaction"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {doc.documentType === 'receipt' && doc.linkedTransactionId && (
                        <div className="col-span-12 pl-6 mt-1 text-xs text-gray-500">
                          Linked to: {getTransactionById(doc.linkedTransactionId)?.description || 'Unknown transaction'}
                        </div>
                      )}
                    </div>
                  ))}
                
                {uploadedDocuments.filter(doc => doc.documentType === documentType).length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No {documentType === 'bank_statement' ? 'bank statements' : 'receipts'} uploaded yet
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
