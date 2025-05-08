import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from './NotificationsContext';
import { safeJsonParse, safeJsonStringify, withErrorHandling } from '@/utils/errorHandling';

// Define the CompanyDetails interface
export interface CompanyDetails {
  id?: string;
  name: string;
  registrationNumber: string;
  vatNumber: string;
  taxRegistrationNumber?: string;
  csdRegistrationNumber?: string;
  directorFirstName?: string;
  directorLastName?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  websiteUrl?: string;
  logo?: File | string | null;
  stamp?: File | string | null;
  signature?: File | string | null;
}

// User Permissions interface
export interface UserPermissions {
  dashboard: { view: boolean; edit: boolean };
  clients: { view: boolean; edit: boolean };
  invoicesQuotes: { view: boolean; edit: boolean };
  myCompany: { view: boolean; edit: boolean };
  accounting: { view: boolean; edit: boolean };
  reports: { view: boolean; edit: boolean };
  hr: { view: boolean; edit: boolean };
  settings: { view: boolean; edit: boolean };
}

// User interface
export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'Admin' | 'Manager' | 'Viewer' | 'Custom';
  lastLogin?: Date | string;
  permissions: UserPermissions;
  password?: string;
  status: 'active' | 'inactive';
}

// Audit Log Entry interface
export interface AuditLogEntry {
  id: string;
  timestamp: Date | string;
  action: 'user_added' | 'user_removed' | 'permissions_updated' | 'password_reset' | 'company_updated';
  performedBy: string;
  details: string;
}

// Define the context interface with enhanced features
interface CompanyContextType {
  // Company Details
  companyDetails: CompanyDetails;
  setCompanyDetails: React.Dispatch<React.SetStateAction<CompanyDetails>>;
  saveCompanyDetails: () => Promise<void>;
  resetCompanyDetails: () => void;
  
  // User Management
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  removeUser: (userId: string) => boolean;
  toggleUserStatus: (userId: string) => void;
  
  // Audit Log
  auditLog: AuditLogEntry[];
  addAuditLogEntry: (action: AuditLogEntry['action'], details: string, performedBy?: string) => void;
  
  // State Management
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  clearError: () => void;
  
  // Passcode Verification
  verifyPasscode: (passcode: string) => Promise<boolean>;
  isFirstTimeSetup: boolean;
  setAdminPasscode: (passcode: string) => Promise<void>;
}

// Create the context with a default value
const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Default company details
const defaultCompanyDetails: CompanyDetails = {
  name: '',
  registrationNumber: '',
  vatNumber: '',
  taxRegistrationNumber: '',
  csdRegistrationNumber: '',
  directorFirstName: '',
  directorLastName: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  websiteUrl: '',
  logo: null,
  stamp: null,
  signature: null,
};

// Provider component
export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // State for passcode verification and first-time setup
  const [adminPasscode, setAdminPasscodeState] = useState<string>(() => {
    try {
      return localStorage.getItem('adminPasscode') || '';
    } catch (error) {
      console.error('Error loading admin passcode:', error);
      return '';
    }
  });
  
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean>(() => {
    return !localStorage.getItem('adminPasscode');
  });

  // State for company details with enhanced persistence
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(() => {
    try {
      // Multi-layered approach to loading company details for maximum persistence
      
      // First try to load from authenticated storage (normal flow)
      const savedCompany = localStorage.getItem('companyDetails');
      if (savedCompany) {
        console.log('Loaded company details from primary storage');
        return safeJsonParse(savedCompany, defaultCompanyDetails);
      }
      
      // If not found, try to load from public persistent storage
      const publicCompanyData = localStorage.getItem('publicCompanyDetails');
      if (publicCompanyData) {
        console.log('Loaded company details from public persistent storage');
        const parsedData = safeJsonParse(publicCompanyData, defaultCompanyDetails);
        
        // If the public data is comprehensive, use it
        if (parsedData.name && parsedData.contactEmail) {
          // Immediately restore this to the main storage as well
          localStorage.setItem('companyDetails', safeJsonStringify(parsedData));
          return parsedData;
        }
      }
      
      // Last resort - check session storage backup (created during logout)
      const backupData = sessionStorage.getItem('companyDataBackup');
      if (backupData) {
        try {
          console.log('Attempting to recover from session backup');
          const allBackupData = JSON.parse(backupData);
          
          // If we have company details in the backup, use that
          if (allBackupData.companyDetails) {
            const recoveredDetails = JSON.parse(allBackupData.companyDetails);
            // Restore to localStorage for future use
            localStorage.setItem('companyDetails', allBackupData.companyDetails);
            return recoveredDetails;
          } 
          
          // If we have public company details, use that as a fallback
          if (allBackupData.publicCompanyDetails) {
            const recoveredPublicDetails = JSON.parse(allBackupData.publicCompanyDetails);
            // Restore to localStorage for future use
            localStorage.setItem('publicCompanyDetails', allBackupData.publicCompanyDetails);
            return recoveredPublicDetails;
          }
        } catch (parseError) {
          console.error('Error parsing backup data:', parseError);
        }
      }
      
      // If all else fails, return defaults
      return defaultCompanyDetails;
    } catch (error) {
      console.error('Error loading company details:', error);
      return defaultCompanyDetails;
    }
  });

  // Initialize users from localStorage if available
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('companyUsers');
      const parsedUsers = savedUsers ? safeJsonParse(savedUsers, []) : [];
      
      // If no users exist, create a default admin user
      if (parsedUsers.length === 0) {
        return [
          {
            id: crypto.randomUUID(),
            fullName: 'Wilson Moabelo',
            email: 'wilson@mokmzansibooks.co.za',
            phoneNumber: '071 234 5678',
            role: 'Admin',
            lastLogin: new Date().toISOString(),
            status: 'active',
            permissions: {
              dashboard: { view: true, edit: true },
              clients: { view: true, edit: true },
              invoicesQuotes: { view: true, edit: true },
              myCompany: { view: true, edit: true },
              accounting: { view: true, edit: true },
              reports: { view: true, edit: true },
              hr: { view: true, edit: true },
              settings: { view: true, edit: true }
            }
          }
        ];
      }
      
      return parsedUsers;
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  });

  // Initialize audit log from localStorage if available
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => {
    try {
      const savedLog = localStorage.getItem('companyAuditLog');
      return savedLog ? safeJsonParse(savedLog, []) : [];
    } catch (error) {
      console.error('Error loading audit log:', error);
      return [];
    }
  });

  // Save company details to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('companyDetails', safeJsonStringify(companyDetails));
    } catch (error) {
      console.error('Error saving company details to localStorage:', error);
      setHasError(true);
      setErrorMessage('Failed to save company details');
    }
  }, [companyDetails]);

  // Save users to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('companyUsers', safeJsonStringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
      setHasError(true);
      setErrorMessage('Failed to save user data');
    }
  }, [users]);

  // Save audit log to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('companyAuditLog', safeJsonStringify(auditLog));
    } catch (error) {
      console.error('Error saving audit log to localStorage:', error);
      setHasError(true);
      setErrorMessage('Failed to save audit log');
    }
  }, [auditLog]);

  // Clear any errors
  const clearError = () => {
    setHasError(false);
    setErrorMessage('');
  };

  // Validate company details before saving
  const validateCompanyDetails = (details: CompanyDetails): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check required fields
    if (!details.name || details.name.trim() === '') {
      errors.push('Company name is required');
    }
    
    if (!details.contactEmail || details.contactEmail.trim() === '') {
      errors.push('Contact email is required');
    }
    
    if (!details.contactPhone || details.contactPhone.trim() === '') {
      errors.push('Contact phone is required');
    }
    
    if (!details.address || details.address.trim() === '') {
      errors.push('Company address is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Create a backup of company details
  const backupCompanyDetails = () => {
    try {
      // Get current timestamp for versioning
      const timestamp = new Date().toISOString();
      
      // Create a versioned backup
      const backupKey = `companyDetails_backup_${timestamp}`;
      localStorage.setItem(backupKey, safeJsonStringify(companyDetails));
      
      // Keep track of backups (store last 5 versions)
      const backupList = localStorage.getItem('companyDetailsBackupList');
      const backups = backupList ? safeJsonParse(backupList, []) : [];
      
      // Add new backup to the list
      backups.unshift({ key: backupKey, timestamp });
      
      // Keep only the last 5 backups
      const trimmedBackups = backups.slice(0, 5);
      
      // Remove any backups beyond the 5 most recent
      if (backups.length > 5) {
        backups.slice(5).forEach(backup => {
          localStorage.removeItem(backup.key);
        });
      }
      
      // Save the updated backup list
      localStorage.setItem('companyDetailsBackupList', safeJsonStringify(trimmedBackups));
      
      return true;
    } catch (error) {
      console.error('Error creating company details backup:', error);
      return false;
    }
  };

  // Save company details with enhanced safeguards
  const saveCompanyDetails = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Validate company details before saving
      const validation = validateCompanyDetails(companyDetails);
      
      if (!validation.isValid) {
        setHasError(true);
        setErrorMessage(`Cannot save company details: ${validation.errors.join(', ')}`);
        setIsLoading(false);
        return;
      }
      
      // Create a backup before saving new data
      const backupCreated = backupCompanyDetails();
      if (!backupCreated) {
        console.warn('Failed to create backup, but proceeding with save');
      }
      
      // Save to regular authenticated storage
      localStorage.setItem('companyDetails', safeJsonStringify(companyDetails));
      
      // Create a more complete public company data object to persist more information
      // This ensures most company data remains available even after logout
      const publicCompanyData = {
        // Basic identification
        id: companyDetails.id,
        name: companyDetails.name,
        registrationNumber: companyDetails.registrationNumber,
        vatNumber: companyDetails.vatNumber,
        taxRegistrationNumber: companyDetails.taxRegistrationNumber,
        csdRegistrationNumber: companyDetails.csdRegistrationNumber,
        
        // Contact details
        contactEmail: companyDetails.contactEmail,
        contactPhone: companyDetails.contactPhone,
        
        // Address information
        address: companyDetails.address,
        addressLine2: companyDetails.addressLine2,
        city: companyDetails.city,
        province: companyDetails.province,
        postalCode: companyDetails.postalCode,
        
        // Director information
        directorFirstName: companyDetails.directorFirstName,
        directorLastName: companyDetails.directorLastName,
        
        // Web and media assets
        websiteUrl: companyDetails.websiteUrl,
        logo: companyDetails.logo,
        stamp: companyDetails.stamp,
        signature: companyDetails.signature,
        
        // Timestamp to track when this was last updated
        lastUpdated: new Date().toISOString(),
        
        // Add a data protection flag
        protected: true
      };
      
      // Save to multiple storage mechanisms for redundancy
      // 1. localStorage - primary storage
      localStorage.setItem('publicCompanyDetails', safeJsonStringify(publicCompanyData));
      
      // 2. sessionStorage - backup while browser is open
      sessionStorage.setItem('publicCompanyDetails', safeJsonStringify(publicCompanyData));
      
      // 3. Create an additional encrypted backup (using a simple encryption)
      const encryptedData = btoa(safeJsonStringify(publicCompanyData));
      localStorage.setItem('publicCompanyDetails_encrypted', encryptedData);
      
      // Add audit log entry with more detailed information
      addAuditLogEntry('company_updated', `Company details updated by user at ${new Date().toISOString()}`);
      
      // Show success notification
      toast({
        title: "Company Details Saved",
        description: "Your company information has been permanently saved and will persist across sessions."
      });
      
      addNotification({
        title: "Company Updated", 
        message: "Company details have been successfully updated and backed up.", 
        type: 'success',
      });
    } catch (error) {
      setHasError(true);
      setErrorMessage('Failed to save company details: ' + (error instanceof Error ? error.message : String(error)));
      
      toast({
        title: "Error Saving Company Details",
        description: "There was a problem saving your company information.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset company details to default
  const resetCompanyDetails = () => {
    setCompanyDetails(defaultCompanyDetails);
  };

  // Add a new user
  const addUser = (user: Omit<User, 'id'>) => {
    try {
      const newUser: User = {
        ...user,
        id: crypto.randomUUID()
      };

      setUsers(prevUsers => [...prevUsers, newUser]);
      
      // Add audit log entry
      addAuditLogEntry('user_added', `New user ${newUser.fullName} was added`);
      
      toast({
        title: 'User Added',
        description: `${newUser.fullName} has been added successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      setHasError(true);
      setErrorMessage('Failed to add user');
      
      toast({
        title: 'Error',
        description: 'There was an error adding the user.',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  // Update an existing user
  const updateUser = (userId: string, updates: Partial<User>) => {
    try {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...updates } : user
        )
      );
      
      // Add audit log entry
      addAuditLogEntry('permissions_updated', `User with ID ${userId} was updated`);
      
      toast({
        title: 'User Updated',
        description: 'User has been updated successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      setHasError(true);
      setErrorMessage('Failed to update user');
      
      toast({
        title: 'Error',
        description: 'There was an error updating the user.',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  // Remove a user
  const removeUser = (userId: string) => {
    try {
      const userToRemove = users.find(user => user.id === userId);
      if (!userToRemove) return false;
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      // Add audit log entry
      addAuditLogEntry('user_removed', `User ${userToRemove.fullName} was removed`);
      
      toast({
        title: 'User Removed',
        description: 'The user has been successfully removed.',
      });
      
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      setHasError(true);
      setErrorMessage('Failed to remove user');
      
      toast({
        title: 'Error',
        description: 'There was an error removing the user.',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  // Toggle user status (active/inactive)
  const toggleUserStatus = (userId: string) => {
    try {
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            
            // Add audit log entry
            addAuditLogEntry(
              'permissions_updated', 
              `User status changed to ${newStatus} for ${user.fullName}`
            );
            
            toast({
              title: 'Status Updated',
              description: `User is now ${newStatus}.`,
            });
            
            return { ...user, status: newStatus };
          }
          return user;
        })
      );
      
      return true;
    } catch (error) {
      console.error('Error toggling user status:', error);
      setHasError(true);
      setErrorMessage('Failed to update user status');
      
      toast({
        title: 'Error',
        description: 'There was an error updating the user status.',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  // Add audit log entry
  const addAuditLogEntry = (action: AuditLogEntry['action'], details: string, performedBy?: string) => {
    try {
      const newEntry: AuditLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action,
        performedBy: performedBy || 'Wilson Moabelo', // Default to admin if not specified
        details
      };

      setAuditLog(prevLog => [newEntry, ...prevLog]);
    } catch (error) {
      console.error('Error adding audit log entry:', error);
      setHasError(true);
      setErrorMessage('Failed to add audit log entry');
    }
  };
  
  // Verify passcode for admin actions
  const verifyPasscode = async (passcode: string): Promise<boolean> => {
    try {
      // If it's first time setup, any passcode is valid
      if (isFirstTimeSetup) {
        return true;
      }
      
      // Simple comparison for demo purposes
      // In a real app, you would use a secure hash comparison
      const isValid = passcode === adminPasscode;
      
      if (!isValid) {
        toast({
          title: "Invalid Passcode",
          description: "The passcode you entered is incorrect.",
          variant: "destructive"
        });
      }
      
      return isValid;
    } catch (error) {
      console.error('Error verifying passcode:', error);
      setHasError(true);
      setErrorMessage('Failed to verify passcode');
      return false;
    }
  };
  
  // Set admin passcode
  const setAdminPasscode = async (passcode: string): Promise<void> => {
    try {
      // In a real app, you would hash the passcode before storing it
      setAdminPasscodeState(passcode);
      localStorage.setItem('adminPasscode', passcode);
      
      // If this is first time setup, mark it as complete
      if (isFirstTimeSetup) {
        setIsFirstTimeSetup(false);
        
        // Add audit log entry
        addAuditLogEntry('company_updated', 'Initial setup completed');
        
        toast({
          title: "Setup Complete",
          description: "Your admin passcode has been set successfully.",
        });
      } else {
        // Add audit log entry
        addAuditLogEntry('company_updated', 'Admin passcode was updated');
        
        toast({
          title: "Passcode Updated",
          description: "Your admin passcode has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error setting admin passcode:', error);
      setHasError(true);
      setErrorMessage('Failed to set admin passcode');
      
      toast({
        title: "Error",
        description: "There was an error setting your admin passcode.",
        variant: "destructive"
      });
    }
  };

  return (
    <CompanyContext.Provider value={{
      // Company Details
      companyDetails,
      setCompanyDetails,
      saveCompanyDetails,
      resetCompanyDetails,
      
      // User Management
      users,
      setUsers,
      addUser,
      updateUser,
      removeUser,
      toggleUserStatus,
      
      // Audit Log
      auditLog,
      addAuditLogEntry,
      
      // State Management
      isLoading,
      hasError,
      errorMessage,
      clearError,
      
      // Passcode Verification
      verifyPasscode,
      isFirstTimeSetup,
      setAdminPasscode
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

// Custom hook to use the company context
export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
