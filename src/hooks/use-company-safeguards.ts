import { useState, useEffect, useCallback } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationsContext';
import { 
  backupCompanyDetails, 
  validateCompanyDetails, 
  createEncryptedBackup, 
  recoverCompanyDetails,
  confirmCompanyChanges
} from '@/utils/companySafeguards';

/**
 * Custom hook for safely managing company details with data protection
 */
export const useCompanySafeguards = () => {
  const { 
    companyDetails, 
    setCompanyDetails, 
    saveCompanyDetails,
    addAuditLogEntry
  } = useCompany();
  
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null);
  
  // Track changes to company details
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [companyDetails]);
  
  // Perform data recovery on mount
  useEffect(() => {
    // Only attempt recovery if company details are missing
    if (!companyDetails || !companyDetails.name) {
      const recoveredData = recoverCompanyDetails();
      if (recoveredData) {
        setCompanyDetails(recoveredData);
        toast({
          title: "Data Recovered",
          description: "Your company information has been recovered from backup",
          variant: "default"
        });
      }
    }
  }, []);
  
  /**
   * Safely save company details with validation, backup, and confirmation
   */
  const saveCompanyDetailsWithSafeguards = useCallback(async (skipConfirmation = false) => {
    // Validate first
    const validation = validateCompanyDetails(companyDetails);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return false;
    }
    
    // Confirm changes unless skipped
    if (!skipConfirmation) {
      const confirmed = await confirmCompanyChanges(
        "Are you sure you want to update your company information? This data is critical for your business operations."
      );
      
      if (!confirmed) {
        return false;
      }
    }
    
    setIsSaving(true);
    
    try {
      // Create backups first
      backupCompanyDetails(companyDetails);
      createEncryptedBackup(companyDetails);
      
      // Save the company details
      await saveCompanyDetails();
      
      // Update state
      setHasUnsavedChanges(false);
      setLastSaveTime(new Date().toISOString());
      
      // Show success notification
      toast({
        title: "Success",
        description: "Company details updated successfully with data protection",
        variant: "default"
      });
      
      // Add system notification
      addNotification({
        id: crypto.randomUUID(),
        title: "Company Details Updated",
        message: "Your company information has been successfully updated with data protection.",
        type: "success",
        read: false,
        timestamp: new Date().toISOString()
      });
      
      // Add audit log entry
      addAuditLogEntry(
        'company_updated', 
        `Company details updated with data protection at ${new Date().toISOString()}`
      );
      
      return true;
    } catch (error) {
      console.error('Error updating company details:', error);
      
      toast({
        title: "Error",
        description: "Failed to update company details",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [companyDetails, saveCompanyDetails, addNotification, addAuditLogEntry, toast]);
  
  /**
   * Check if company data has critical fields that should be protected
   */
  const hasCriticalData = useCallback(() => {
    return !!(
      companyDetails && 
      companyDetails.name && 
      companyDetails.registrationNumber && 
      companyDetails.contactEmail
    );
  }, [companyDetails]);
  
  return {
    isSaving,
    hasUnsavedChanges,
    lastSaveTime,
    hasCriticalData,
    saveCompanyDetailsWithSafeguards
  };
};
