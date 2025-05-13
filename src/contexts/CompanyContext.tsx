import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from './NotificationsContext';
import { useSyncStatus } from './SyncContext';
import { safeJsonParse, safeJsonStringify, withErrorHandling } from '@/utils/errorHandling';
// Import our new super persistent storage adapters
import { loadCompanyDetails as getCompanyDetailsFromStorage, saveCompanyDetails as saveCompanyDetailsToStorage } from '@/utils/companyStorageAdapter';
import { syncCompanyData } from '@/utils/companyDataSync';
import { createSyncStorageWrapper } from '@/utils/syncStorageUtils';
// Import Supabase services
import companyService from '@/services/supabase/companyService';
import { v4 as uuidv4 } from 'uuid';
// Import the new system health check
import systemHealthCheck from '@/utils/systemHealthCheck';
import superPersistentStorage, { DataCategory } from '@/utils/superPersistentStorage';

// Import the event bus with a try-catch to handle potential HMR issues
let eventBus: any = null;
try {
  // Dynamic import to prevent HMR issues
  eventBus = require('@/utils/companyEventBus').default;
} catch (error) {
  console.warn('Could not load event bus, real-time updates may be affected:', error);
  // Provide a fallback dummy eventBus if the real one fails to load
  eventBus = {
    publish: (event: string, data: any) => console.log(`Event ${event} would be published with:`, data),
    subscribe: () => 'dummy-id',
    unsubscribe: () => {}
  };
}

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
  id: "",
  name: "",
  registrationNumber: "",
  vatNumber: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  websiteUrl: '',
  logo: null,
  stamp: null,
  signature: null,
  taxRegistrationNumber: '',
  csdRegistrationNumber: '',
  directorFirstName: '',
  directorLastName: ''
};

// Provider component
export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { showSyncing, showSuccess, showError } = useSyncStatus();

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

  // Track whether component is mounted to prevent memory leaks
  const isMounted = useRef(true);
  
  // Recovery attempts counter to prevent infinite loops
  const recoveryAttempts = useRef(0);
  
  // Last successful data timestamp to detect data loss
  const lastDataTimestamp = useRef<number>(Date.now());
  
  // State for company details with multiple data recovery mechanisms
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(() => {
    try {
      // Using synchronous initialization with multiple fallbacks
      
      // 1. First try localStorage for immediate display
      const savedCompany = localStorage.getItem('companyDetails');
      if (savedCompany) {
        const parsed = safeJsonParse(savedCompany, null);
        if (parsed && parsed.name) {
          console.log('Loaded company details from localStorage (initial)');
          // Create immediate backup for extra safety
          localStorage.setItem('company_backup_initial', savedCompany);
          return parsed;
        }
      }
      
      // 2. Try emergency backup keys in localStorage
      const backupKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('emergency_company_backup_') || 
        key.startsWith('company_backup_')
      );
      
      if (backupKeys.length > 0) {
        // Sort by timestamp (newest first) if available
        backupKeys.sort().reverse();
        
        for (const key of backupKeys) {
          const backupData = localStorage.getItem(key);
          if (backupData) {
            const parsed = safeJsonParse(backupData, null);
            if (parsed && parsed.name) {
              console.log(`Loaded company details from backup (${key})`);
              return parsed;
            }
          }
        }
      }
      
      return {...defaultCompanyDetails};
    } catch (error) {
      console.error('Error loading initial company details:', error);
      return {...defaultCompanyDetails};
    }
  });

  // Setup effect for cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Run system health check on startup
  useEffect(() => {
    const runHealthCheck = async () => {
      try {
        setIsLoading(true);
        
        // Run system health check
        await systemHealthCheck.runSystemHealthCheck();
        
        // Create emergency backup immediately
        if (companyDetails && companyDetails.name) {
          await systemHealthCheck.createEmergencyBackup();
        }
      } catch (error) {
        console.error('Error running health check:', error);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    runHealthCheck();
  }, []);

  // Enhanced loading effect with multiple recovery mechanisms
  useEffect(() => {
    const loadCompanyDetailsWithRecovery = async () => {
      try {
        console.log('Loading company details with recovery mechanisms...');
        setIsLoading(true);
        
        // First try normal loading
        let companyData = await getCompanyDetailsFromStorage();
        
        // Check if we got valid data
        if (!companyData || !companyData.name) {
          console.warn('Failed to load company details normally, attempting recovery...');
          recoveryAttempts.current += 1;
          
          // Attempt recovery if we're not in an infinite loop
          if (recoveryAttempts.current < 3) {
            // Try system recovery
            companyData = await systemHealthCheck.runCompanyDataRecovery();
            
            if (!companyData || !companyData.name) {
              // Last resort - try emergency backup
              companyData = await systemHealthCheck.restoreFromEmergencyBackup();
            }
          }
        }
        
        // If we have valid data, update state
        if (companyData && companyData.name && isMounted.current) {
          // Validate data integrity to prevent rendering errors
          const validatedData = await systemHealthCheck.validateCompanyDataIntegrity(companyData);
          
          // Update state
          setCompanyDetails(validatedData);
          
          // Update timestamp of successful data
          lastDataTimestamp.current = Date.now();
          
          // Create fresh backup
          await systemHealthCheck.createEmergencyBackup();
          
          console.log('Successfully loaded company details for:', validatedData.name);
          
          // Show success notification if we recovered from a bad state
          if (recoveryAttempts.current > 0) {
            toast({
              title: 'Data Recovered Successfully',
              description: 'Your company information has been recovered.',
              duration: 5000
            });
          }
        }
      } catch (error) {
        console.error('Error loading company details with recovery:', error);
        setHasError(true);
        setErrorMessage('Failed to load company details. Please try again.');
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadCompanyDetailsWithRecovery();
    
    // Set up periodic data validation (every 5 minutes)
    const validateInterval = setInterval(async () => {
      if (companyDetails && companyDetails.name) {
        // Create regular backups
        await systemHealthCheck.createEmergencyBackup();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(validateInterval);
    };
  }, []);

  // Create sync-enabled storage functions for company details
  const syncCompanyStorage = createSyncStorageWrapper(
    saveCompanyDetailsToStorage,
    getCompanyDetailsFromStorage,
    'Company Details'
  );

  // Load company details from super persistent storage on component mount
  useEffect(() => {
    const loadCompanyDetailsFromStorage = async () => {
      try {
        setIsLoading(true);
        showSyncing('Loading company information...');
        
        const savedCompany = await syncCompanyStorage.load({
          onSyncStart: () => showSyncing('Loading company information...'),
          onSyncSuccess: () => showSuccess('Company information loaded'),
          onSyncError: () => showError('Error loading company information')
        });
        
        if (savedCompany) {
          console.log('Loaded company details from super persistent storage');
          setCompanyDetails(savedCompany);
        } else {
          console.warn('No company details found in super persistent storage');
        }
      } catch (error) {
        console.error('Error loading company details from storage:', error);
        setHasError(true);
        setErrorMessage('Failed to load company details');
        showError('Failed to load company details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCompanyDetailsFromStorage();
  }, []);

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

  // Function to save company details with super persistence and sync indicator
  const saveCompanyDetails = async () => {
    try {
      setIsLoading(true);
      showSyncing('Saving company information...');
      
      // Save to our super persistent storage system with sync status
      const result = await syncCompanyStorage.save(companyDetails, {
        onSyncStart: () => showSyncing('Saving company information...'),
        onSyncSuccess: () => showSuccess('Company information saved successfully'),
        onSyncError: () => showError('Error saving company information')
      });
      
      if (result) {
        // Publish an event that company details have been updated
        if (eventBus) {
          eventBus.publish('company-details-updated', companyDetails);
        }
        
        // Add audit log entry
        addAuditLogEntry('company_updated', 'Company details updated');
        
        // Show success notification
        toast({
          title: "Company Details Saved",
          description: "Your company information has been updated successfully."
        });
        
        addNotification({
          title: 'Company information saved',
          message: 'Your company details have been saved and will persist even after browser restarts.',
          type: 'success'
        });
      } else {
        throw new Error('Failed to save company details to storage');
      }
    } catch (error) {
      console.error('Error saving company details:', error);
      setHasError(true);
      setErrorMessage('Failed to save company details. Please try again.');
      
      // Show error notification
      toast({
        title: "Error Saving Company Details",
        description: "There was a problem saving your company information. Please try again.",
        variant: "destructive"
      });
      
      addNotification({
        title: 'Save error',
        message: 'Could not save company information. Please try again.',
        type: 'error'
      });
      
      showError('Failed to save company details');
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
