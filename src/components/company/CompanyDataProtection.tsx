
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';
import { backupCompanyDetails, createEncryptedBackup, recoverCompanyDetails } from '@/utils/companySafeguards';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Lock, Save, RotateCcw } from 'lucide-react';
import { CompanyDetails } from '@/types/company';

const CompanyDataProtection: React.FC = () => {
  const { companyDetails, updateCompany } = useCompany();
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [backupId, setBackupId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCreateBackup = async () => {
    setIsProcessing(true);
    
    try {
      // Convert from context CompanyDetails to type definition CompanyDetails
      const companyData: CompanyDetails = {
        name: companyDetails.name,
        address: companyDetails.address,
        city: companyDetails.city,
        province: companyDetails.province,
        postalCode: companyDetails.postalCode,
        phone: companyDetails.phone || '',
        email: companyDetails.email || '',
        contactEmail: companyDetails.contactEmail || '',
        contactPhone: companyDetails.contactPhone || '',
        website: companyDetails.website || '',
        registrationNumber: companyDetails.registrationNumber || '',
        vatNumber: companyDetails.vatNumber || '',
        // Handle optional fields
        logo: typeof companyDetails.logo === 'string' ? companyDetails.logo : '',
        primaryColor: companyDetails.primaryColor || '',
        secondaryColor: companyDetails.secondaryColor || '',
        industry: companyDetails.industry || '',
        addressLine2: companyDetails.addressLine2 || '',
        stamp: companyDetails.stamp || null,
        signature: companyDetails.signature || null
      };
      
      await backupCompanyDetails(companyData);
      
      toast({
        title: 'Backup Created',
        description: 'Company data has been backed up successfully.',
      });
    } catch (error) {
      toast({
        title: 'Backup Failed',
        description: error instanceof Error ? error.message : 'Could not create backup.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateEncryptedBackup = async () => {
    setIsProcessing(true);
    
    try {
      if (!passphrase) {
        throw new Error('Passphrase is required');
      }
      
      // Convert from context CompanyDetails to type definition CompanyDetails
      const companyData: CompanyDetails = {
        name: companyDetails.name,
        address: companyDetails.address,
        city: companyDetails.city,
        province: companyDetails.province,
        postalCode: companyDetails.postalCode,
        phone: companyDetails.phone || '',
        email: companyDetails.email || '',
        contactEmail: companyDetails.contactEmail || '',
        contactPhone: companyDetails.contactPhone || '',
        website: companyDetails.website || '',
        registrationNumber: companyDetails.registrationNumber || '',
        vatNumber: companyDetails.vatNumber || '',
        // Handle optional fields
        logo: typeof companyDetails.logo === 'string' ? companyDetails.logo : '',
        primaryColor: companyDetails.primaryColor || '',
        secondaryColor: companyDetails.secondaryColor || '',
        industry: companyDetails.industry || '',
        addressLine2: companyDetails.addressLine2 || '',
        stamp: companyDetails.stamp || null,
        signature: companyDetails.signature || null
      };
      
      const id = await createEncryptedBackup(companyData, passphrase);
      
      toast({
        title: 'Encrypted Backup Created',
        description: `Backup ID: ${id.substring(0, 8)}...`,
      });
      
      setBackupDialogOpen(false);
      setPassphrase('');
    } catch (error) {
      toast({
        title: 'Encrypted Backup Failed',
        description: error instanceof Error ? error.message : 'Could not create encrypted backup.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreBackup = async () => {
    setIsProcessing(true);
    
    try {
      if (!backupId) {
        throw new Error('Backup ID is required');
      }
      
      // Await the promise to get the actual CompanyDetails object
      const recoveredData = await recoverCompanyDetails(backupId);
      
      // Update company with recovered data
      await updateCompany(recoveredData);
      
      toast({
        title: 'Backup Restored',
        description: 'Company data has been restored successfully.',
      });
      
      setRestoreDialogOpen(false);
      setBackupId('');
    } catch (error) {
      toast({
        title: 'Restore Failed',
        description: error instanceof Error ? error.message : 'Could not restore backup.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Protection</CardTitle>
        <CardDescription>Backup and restore your company data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Regularly backup your company data to prevent loss. You can create standard backups or
          encrypted backups with a passphrase for additional security.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCreateBackup} disabled={isProcessing}>
          <Save className="mr-2 h-4 w-4" />
          Create Backup
        </Button>
        <Button variant="outline" onClick={() => setBackupDialogOpen(true)} disabled={isProcessing}>
          <Lock className="mr-2 h-4 w-4" />
          Encrypted Backup
        </Button>
        <Button variant="outline" onClick={() => setRestoreDialogOpen(true)} disabled={isProcessing}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restore Backup
        </Button>
      </CardFooter>

      {/* Encrypted Backup Dialog */}
      <Dialog open={backupDialogOpen} onOpenChange={setBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Encrypted Backup</DialogTitle>
            <DialogDescription>
              Enter a passphrase to encrypt your company data. You'll need this passphrase to restore the backup.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateEncryptedBackup} disabled={!passphrase || isProcessing}>
              {isProcessing ? 'Processing...' : 'Create Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Backup</DialogTitle>
            <DialogDescription>
              Enter your backup ID to restore company data. This will overwrite your current company data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter backup ID"
              value={backupId}
              onChange={(e) => setBackupId(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRestoreBackup} disabled={!backupId || isProcessing}>
              {isProcessing ? 'Processing...' : 'Restore Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CompanyDataProtection;
