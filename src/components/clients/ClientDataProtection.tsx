
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Download, Upload, RefreshCw } from "lucide-react";
import { createClientDataBackup, restoreClientDataFromBackup } from '@/utils/clientDataPersistence';
import { useToast } from '@/hooks/use-toast';

interface ClientDataProtectionProps {
  onRefresh?: () => void;
}

const ClientDataProtection: React.FC<ClientDataProtectionProps> = ({ onRefresh }) => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      const success = createClientDataBackup();
      
      if (success) {
        toast({
          title: "Backup created",
          description: "Your client data has been backed up successfully.",
        });
      } else {
        toast({
          title: "Backup failed",
          description: "There was an issue creating the backup.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      setIsRestoring(true);
      const success = restoreClientDataFromBackup();
      
      if (success) {
        toast({
          title: "Backup restored",
          description: "Your client data has been restored successfully.",
        });
        
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast({
          title: "Restore failed",
          description: "There was no backup found or the backup is invalid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast({
        title: "Error",
        description: "Failed to restore backup",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Data Protection</AlertTitle>
        <AlertDescription>
          Create a backup of your client data or restore from a previous backup.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
        >
          <Download className="h-4 w-4" />
          {isCreatingBackup ? "Creating Backup..." : "Create Backup"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleRestoreBackup}
          disabled={isRestoring}
        >
          <Upload className="h-4 w-4" />
          {isRestoring ? "Restoring..." : "Restore Backup"}
        </Button>
        
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClientDataProtection;
