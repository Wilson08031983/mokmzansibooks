
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClientDataBackup, restoreClientDataFromBackup, clientStorageAdapter } from '@/utils/clientDataPersistence';

/**
 * Component to handle client data protection and backup.
 * This is used in the clients page to ensure data persistence and recovery options.
 */
export const ClientDataProtection = () => {
  const { toast } = useToast();
  const [isBackupSuccessful, setIsBackupSuccessful] = useState<boolean | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);

  // On mount, check for last backup timestamp
  useEffect(() => {
    try {
      const storedTime = localStorage.getItem('last_client_backup_time');
      if (storedTime) {
        setLastBackupTime(storedTime);
        setIsBackupSuccessful(true);
      }
    } catch (error) {
      console.error('Error reading backup time:', error);
    }
  }, []);

  // Function to create a backup of clients data
  const handleCreateBackup = async () => {
    try {
      // Create backup
      const success = createClientDataBackup();
      
      if (success) {
        // Update local state
        const currentTime = new Date().toISOString();
        setLastBackupTime(currentTime);
        setIsBackupSuccessful(true);
        
        // Store timestamp in localStorage
        localStorage.setItem('last_client_backup_time', currentTime);
        
        toast({
          title: "Backup created",
          description: "Your client data has been backed up successfully.",
        });
      } else {
        setIsBackupSuccessful(false);
        toast({
          variant: "destructive",
          title: "Backup failed",
          description: "There was an error backing up your client data. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      setIsBackupSuccessful(false);
      
      toast({
        variant: "destructive",
        title: "Backup failed",
        description: "There was an error backing up your client data. Please try again.",
      });
    }
  };

  // Function to restore data from backup
  const handleRestoreFromBackup = async () => {
    try {
      // Use direct restore function
      const success = restoreClientDataFromBackup();
      
      if (success) {
        toast({
          title: "Data restored",
          description: "Your client data has been restored from the latest backup.",
        });
        
        // Force refresh to show restored data
        window.location.reload();
      } else {
        // Try using the adapter as fallback if available
        const adapterSuccess = clientStorageAdapter.restoreFromBackup();
          
        if (adapterSuccess) {
          toast({
            title: "Data restored",
            description: "Your client data has been restored using the adapter backup.",
          });
          
          // Force refresh to show restored data
          window.location.reload();
        } else {
          toast({
            variant: "destructive",
            title: "Restore failed",
            description: "No backup found or the backup is invalid.",
          });
        }
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
      
      toast({
        variant: "destructive",
        title: "Restore failed",
        description: "There was an error restoring your client data.",
      });
    }
  };

  // Format the last backup time for display
  const formattedBackupTime = lastBackupTime 
    ? new Date(lastBackupTime).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Never';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Client Data Protection
        </CardTitle>
        <CardDescription>
          Create backups of your client data to prevent loss
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-medium">Last Backup</div>
          <div className="flex items-center gap-2">
            {isBackupSuccessful === true && <CheckCircle className="h-4 w-4 text-green-500" />}
            <span className="text-sm">{formattedBackupTime}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateBackup}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Create Backup
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRestoreFromBackup}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Restore from Backup
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Your client data is automatically backed up when you sign out. 
          Manual backups provide an additional safety measure.
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDataProtection;
