import React, { useState } from 'react';
import { Shield, AlertTriangle, Save, CheckCircle } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useToast } from '@/hooks/use-toast';
import { 
  backupCompanyDetails, 
  createEncryptedBackup, 
  recoverCompanyDetails 
} from '@/utils/companySafeguards';
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

/**
 * Component that provides data protection controls for company information
 */
const CompanyDataProtection: React.FC = () => {
  const { companyDetails, setCompanyDetails } = useCompany();
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  
  // Check if company has critical data that needs protection
  const hasCriticalData = 
    companyDetails && 
    companyDetails.name && 
    companyDetails.contactEmail &&
    companyDetails.contactPhone;
  
  // Create a manual backup of company data
  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    
    try {
      // Create both types of backups
      const backupCreated = backupCompanyDetails(companyDetails);
      const encryptedBackupCreated = createEncryptedBackup(companyDetails);
      
      if (backupCreated && encryptedBackupCreated) {
        toast({
          title: "Backup Created",
          description: "Your company data has been backed up successfully",
          variant: "default"
        });
      } else {
        toast({
          title: "Backup Failed",
          description: "There was an issue creating your company data backup",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Backup Error",
        description: "Failed to create company data backup",
        variant: "destructive"
      });
    } finally {
      setIsBackingUp(false);
    }
  };
  
  // Recover company data from backups
  const handleRecoverData = async () => {
    try {
      const recoveredData = recoverCompanyDetails();
      
      if (recoveredData) {
        setCompanyDetails(recoveredData);
        toast({
          title: "Data Recovered",
          description: "Your company information has been recovered from backup",
          variant: "default"
        });
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
        description: "Failed to recover company data",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return (
    <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-700 dark:text-amber-500">Company Data Protection</CardTitle>
        </div>
        <CardDescription>
          Safeguard your critical company information from accidental deletion or modification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-amber-700 dark:text-amber-500">
                Protected Information
              </h4>
              <p className="text-sm text-muted-foreground">
                The company information on this page should not be removed as it's used throughout the system.
                This includes your company name, registration details, and contact information.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                  Company Name
                </Badge>
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                  Registration Numbers
                </Badge>
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                  Contact Details
                </Badge>
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                  Address Information
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-amber-200 dark:border-amber-800/50 pt-4 mt-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${hasCriticalData ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {hasCriticalData ? 'Data Protection Active' : 'Missing Critical Data'}
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
                    <AlertDialogTitle>Recover Company Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will attempt to recover your company data from backups. Any unsaved changes to your current company data will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRecoverData}>
                      Recover Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleCreateBackup}
                disabled={isBackingUp || !hasCriticalData}
              >
                <Save className="h-4 w-4 mr-2" />
                {isBackingUp ? 'Backing Up...' : 'Create Backup'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-amber-200 dark:border-amber-800/50 pt-4">
        <p className="text-xs text-muted-foreground">
          Your company data is automatically backed up when changes are saved. You can manually create backups or recover data if needed.
        </p>
      </CardFooter>
    </Card>
  );
};

export default CompanyDataProtection;
