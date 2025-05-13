
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clientStorageAdapter } from "@/utils/clientDataPersistence";
import { useClient } from "@/contexts/ClientContext";

/**
 * Component for client data protection features
 */
const ClientDataProtection: React.FC = () => {
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [isRestoreInProgress, setIsRestoreInProgress] = useState(false);
  const { toast } = useToast();
  const { clients } = useClient();

  const handleBackup = async () => {
    setIsBackupInProgress(true);
    try {
      // Create backup in localStorage
      localStorage.setItem('client-data-backup', JSON.stringify(clients));
      
      toast({
        title: "Backup successful",
        description: "Client data has been backed up successfully.",
      });
    } catch (error) {
      console.error("Error backing up client data:", error);
      toast({
        title: "Backup failed",
        description: "There was an error backing up client data.",
        variant: "destructive",
      });
    } finally {
      setIsBackupInProgress(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoreInProgress(true);
    try {
      // Attempt to restore from adapter
      const restored = clientStorageAdapter.restoreClientDataFromBackup();
      
      if (restored) {
        toast({
          title: "Restore successful",
          description: "Client data has been restored. Please refresh the page to see the changes.",
        });
        // Force a page reload to reflect restored data
        window.location.reload();
      } else {
        toast({
          title: "Restore failed",
          description: "No backup data found or restoration failed.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error restoring client data:", error);
      toast({
        title: "Restore failed",
        description: "There was an error restoring client data.",
        variant: "destructive",
      });
    } finally {
      setIsRestoreInProgress(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Data Protection</AlertTitle>
        <AlertDescription>
          Protect your client data by creating backups and restoring if needed.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleBackup} 
          disabled={isBackupInProgress}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isBackupInProgress ? "Backing up..." : "Backup Data"}
        </Button>
        
        <Button 
          onClick={handleRestore} 
          disabled={isRestoreInProgress}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {isRestoreInProgress ? "Restoring..." : "Restore from Backup"}
        </Button>
      </div>
    </div>
  );
};

export default ClientDataProtection;
