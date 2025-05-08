import React, { useState } from 'react';
import { Shield, AlertTriangle, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  createClientDataBackup, 
  restoreClientDataFromBackup 
} from '@/utils/clientDataPersistence';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClientDataProtectionProps {
  clientCount: number;
  onDataRestored: () => void;
}

/**
 * Component that provides data protection controls for client information
 */
const ClientDataProtection: React.FC<ClientDataProtectionProps> = ({ 
  clientCount,
  onDataRestored
}) => {
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Create a manual backup of client data
  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    
    try {
      // Create backup
      const backupCreated = createClientDataBackup();
      
      if (backupCreated) {
        toast({
          title: "Backup Created",
          description: "Your client data has been backed up successfully",
          variant: "default"
        });
      } else {
        toast({
          title: "Backup Failed",
          description: "There was an issue creating your client data backup",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Backup Error",
        description: "Failed to create client data backup",
        variant: "destructive"
      });
    } finally {
      setIsBackingUp(false);
    }
  };
  
  // Recover client data from backups
  const handleRecoverData = async () => {
    setIsRestoring(true);
    
    try {
      const recoverySuccessful = restoreClientDataFromBackup();
      
      if (recoverySuccessful) {
        toast({
          title: "Data Recovered",
          description: "Your client information has been recovered from backup",
          variant: "default"
        });
        
        // Notify parent component that data has been restored
        onDataRestored();
        
        return true;
      } else {
        toast({
          title: "Recovery Failed",
          description: "No backup data was found to recover",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error recovering data:', error);
      toast({
        title: "Recovery Error",
        description: "Failed to recover client data",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsRestoring(false);
    }
  };
  
  return (
    <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-blue-700 dark:text-blue-500">Client Data Protection</CardTitle>
        </div>
        <CardDescription>
          Safeguard your client information from accidental deletion or modification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-700 dark:text-blue-500">
                Protected Information
              </h4>
              <p className="text-sm text-muted-foreground">
                Your client data is critical for your business operations. All changes are automatically backed up to prevent data loss.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                  Client Names
                </Badge>
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                  Contact Details
                </Badge>
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                  Address Information
                </Badge>
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                  Credit Balances
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-blue-200 dark:border-blue-800/50 pt-4 mt-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${clientCount > 0 ? 'bg-green-500' : 'bg-amber-500'}`} />
              <span className="text-sm font-medium">
                {clientCount > 0 ? `${clientCount} Clients Protected` : 'No Clients Added Yet'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Recover Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Recover Client Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will attempt to recover your client data from backups. Any unsaved changes to your current client data will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRecoverData} disabled={isRestoring}>
                      {isRestoring ? 'Recovering...' : 'Recover Data'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleCreateBackup}
                disabled={isBackingUp || clientCount === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {isBackingUp ? 'Backing Up...' : 'Create Backup'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-blue-200 dark:border-blue-800/50 pt-4">
        <p className="text-xs text-muted-foreground">
          Your client data is automatically backed up when changes are saved. You can manually create backups or recover data if needed.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ClientDataProtection;
