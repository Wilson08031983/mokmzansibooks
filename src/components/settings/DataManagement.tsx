import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Database, 
  CheckCircle2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const DataManagement = () => {
  const { currentUser } = useSupabaseAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportData = async () => {
    setIsExporting(true);
    try {
      // Simulate data export process
      const exportedData = {
        user: currentUser,
        invoices: [], // Fetch invoices
        transactions: [], // Fetch transactions
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mokmzansi_export_${new Date().toISOString().replace(/:/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Data Export Successful',
        description: 'Your data has been exported successfully.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Data Export Failed',
        description: 'Unable to export data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);

        // Validate imported data structure
        if (!importedData.user || !importedData.timestamp) {
          throw new Error('Invalid import file');
        }

        // Simulate data import process
        toast({
          title: 'Data Import Successful',
          description: 'Your data has been imported successfully.',
          variant: 'default'
        });
      };
      reader.readAsText(file);
    } catch (error) {
      toast({
        title: 'Data Import Failed',
        description: 'Unable to import data. Please check the file and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" /> Data Management
        </CardTitle>
        <CardDescription>
          Export or import your application data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium">Export Data</h3>
                <p className="text-xs text-muted-foreground">
                  Download all your application data
                </p>
              </div>
            </div>
            <Button 
              onClick={exportData} 
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-pulse" /> Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" /> Export
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium">Import Data</h3>
                <p className="text-xs text-muted-foreground">
                  Upload a previously exported data file
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              disabled={isImporting}
              className="relative overflow-hidden flex items-center gap-2"
            >
              <input 
                type="file" 
                accept=".json"
                onChange={importData}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {isImporting ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-pulse" /> Importing...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" /> Import
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
