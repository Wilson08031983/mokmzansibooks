
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export const BankStatementUploader = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // First, create a record in bank_statements table
      const { data: statementRecord, error: dbError } = await supabase
        .from('bank_statements')
        .insert([
          { 
            file_name: file.name,
            status: 'pending',
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // Upload file to storage - manually track progress since onUploadProgress isn't supported
      const filePath = `${statementRecord.id}/${file.name}`;
      
      // Create a custom upload with progress tracking
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setUploadProgress(percent);
        }
      });

      // Create a promise to handle the XHR request
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
              resolve();
            } else {
              reject(new Error('Upload failed'));
            }
          }
        };
      });

      // Get the appropriate URL and headers from Supabase
      const { data, error: uploadError } = await supabase.storage
        .from('bank-statements')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;

      // Update status to processing
      await supabase
        .from('bank_statements')
        .update({ status: 'processing' })
        .eq('id', statementRecord.id);

      toast({
        title: "Statement uploaded successfully",
        description: "Your bank statement is being processed. You'll be notified once it's complete.",
      });

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload bank statement');
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err.message || 'Failed to upload bank statement',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Bank Statement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                    <p className="text-xs text-gray-500">CSV, XLSX, PDF (MAX. 10MB)</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload}
                accept=".csv,.xlsx,.pdf"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
