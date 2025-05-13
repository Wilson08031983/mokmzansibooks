import React, { useEffect, useState, useRef, useCallback } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import type { CompanyDetails } from "@/contexts/CompanyContext";
import { getSharedCompanyData, getDirectSyncData } from "@/utils/companyDataSync";
import robustStorageMigrator from "@/utils/robustStorageMigrator";
import superPersistentStorage, { DataCategory } from "@/utils/superPersistentStorage";
import { storageAvailability } from "@/utils/indexedDBAvailabilityCheck";

// Import the event bus for real-time updates
let eventBus: any = null;
try {
  eventBus = require('@/utils/companyEventBus').default;
} catch (error) {
  console.warn('CompanyDisplay: Could not load event bus:', error);
}

// Interface for display purposes - enhanced to match ComprehensiveCompanyData
interface DisplayCompany {
  name: string;
  address: string;
  email: string;
  phone: string;
  vatNumber?: string;
  registrationNumber?: string;
  website?: string;
  directorFirstName?: string;
  directorLastName?: string;
  logo?: string | null;
  stamp?: string | null;
  signature?: string | null;
  bankingDetails?: string;
  industry?: string;
  taxId?: string;
  notes?: string;
}

// Props interface - enhanced to match DisplayCompany
interface CompanyDisplayProps {
  company?: DisplayCompany;
}

// Default company data
const DEFAULT_COMPANY: DisplayCompany = {
  name: "Your Company",
  address: "Company Address",
  email: "company@example.com",
  phone: "Phone Number",
  vatNumber: "",
  registrationNumber: "",
  website: "",
  directorFirstName: "",
  directorLastName: ""
};

// Add ErrorBoundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CompanyDisplay Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-fallback">Company information unavailable</div>;
    }
    return this.props.children;
  }
}

/**
 * CompanyDisplay component with multi-layer synchronization
 * Ensures company data is always up-to-date between MyCompany page and this component
 */
const CompanyDisplay: React.FC<CompanyDisplayProps> = ({ company: propCompany }) => {
  // Event bus subscription reference for cleanup
  const subscriptionIdRef = useRef<string | null>(null);
  
  // Get company context - most authoritative source
  const companyContext = useCompany();
  
  // State to track display company data
  const [displayCompany, setDisplayCompany] = useState<DisplayCompany>(
    propCompany as DisplayCompany || {...DEFAULT_COMPANY}
  );
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Format company context data into display format
  const formatContextCompanyDetails = (details: CompanyDetails): DisplayCompany => {
    if (!details) return {...DEFAULT_COMPANY};
    
    // Format address from multiple fields
    const formattedAddress = [
      details.address,
      details.addressLine2,
      details.city,
      details.province,
      details.postalCode
    ].filter(Boolean).join('\n');
    
    return {
      name: details.name || DEFAULT_COMPANY.name,
      address: formattedAddress || DEFAULT_COMPANY.address,
      email: details.contactEmail || DEFAULT_COMPANY.email,
      phone: details.contactPhone || DEFAULT_COMPANY.phone,
      vatNumber: details.vatNumber || '',
      registrationNumber: details.registrationNumber || '',
      website: details.website || '',
      directorFirstName: details.directorFirstName || '',
      directorLastName: details.directorLastName || '',
      logo: details.logo as string || null,
      stamp: details.stamp as string || null,
      signature: details.signature as string || null,
      bankingDetails: details.bankingDetails || '',
      industry: details.industry || '',
      taxId: details.taxId || '',
      notes: details.notes || ''
    };
  };

  // Memoize the updateDisplayCompany function to prevent infinite re-renders
  const memoizedUpdateDisplayCompany = useRef(() => {
    try {
      // Try context first (highest priority)
      if (companyContext?.companyDetails?.name) {
        setDisplayCompany(formatContextCompanyDetails(companyContext.companyDetails));
        setIsLoading(false);
        return;
      }
      
      // Try props second
      if (propCompany?.name) {
        setDisplayCompany(propCompany as DisplayCompany);
        setIsLoading(false);
        return;
      }
      
      // Try direct sync data third
      const directData = getDirectSyncData();
      if (directData?.name) {
        setDisplayCompany(directData as DisplayCompany);
        setIsLoading(false);
        return;
      }
      
      // Try shared storage fourth
      const sharedData = getSharedCompanyData();
      if (sharedData?.name) {
        setDisplayCompany(sharedData as DisplayCompany);
        setIsLoading(false);
        return;
      }
      
      // Fall back to defaults if nothing else
      setDisplayCompany({...DEFAULT_COMPANY});
      setIsLoading(false);
    } catch (error) {
      console.error('Error in memoized update company display:', error);
      setDisplayCompany({...DEFAULT_COMPANY});
      setIsLoading(false);
    }
  }).current;
  
  // Debounce function to prevent too many updates
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce(() => {
      try {
        memoizedUpdateDisplayCompany();
      } catch (error) {
        console.error('Error in debounced company display update:', error);
        // Fallback to defaults on error
        setDisplayCompany({...DEFAULT_COMPANY});
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Update when context or props change - with debouncing
  useEffect(() => {
    debouncedUpdate();
  }, [debouncedUpdate, companyContext?.companyDetails, propCompany]);
  
  // Set up multi-layered synchronization
  useEffect(() => {
    console.log('[CompanyDisplay] Initializing synchronization');
    let isComponentMounted = true;
    let initAttempted = false;
    
    // Check if storage is available before attempting operations
    if (!storageAvailability.checked) {
      storageAvailability.check().catch(err => {
        console.error('[CompanyDisplay] Error checking storage availability:', err);
      });
    }
    
    // Ensure robust storage is initialized only once
    if (!initAttempted) {
      initAttempted = true;
      robustStorageMigrator.ensureInitialized().catch(err => {
        console.error('[CompanyDisplay] Error initializing robust storage:', err);
      });
    }
    
    // Safely update state only if component is still mounted
    const safeSetDisplayCompany = (data: any) => {
      try {
        console.log('[CompanyDisplay] Received data update:', data);
        if (!isComponentMounted) return;
        if (!data || typeof data !== 'object') return;

        // Ensure required fields are present to avoid rendering issues
        const safeData = {
          name: data.name || DEFAULT_COMPANY.name,
          address: data.address || DEFAULT_COMPANY.address,
          email: data.email || DEFAULT_COMPANY.email,
          phone: data.phone || DEFAULT_COMPANY.phone,
          vatNumber: data.vatNumber || '',
          registrationNumber: data.registrationNumber || '',
          website: data.website || '',
          directorFirstName: data.directorFirstName || '',
          directorLastName: data.directorLastName || '',
          logo: data.logo || null,
          stamp: data.stamp || null,
          signature: data.signature || null,
          bankingDetails: data.bankingDetails || '',
          industry: data.industry || '',
          taxId: data.taxId || '',
          notes: data.notes || ''
        };

        console.log('[CompanyDisplay] Setting display company:', safeData);
        setDisplayCompany(safeData);
        setIsLoading(false);
        
        // Only save to persistent storage if it's available and we have meaningful data
        if (safeData.name !== DEFAULT_COMPANY.name && storageAvailability.localStorage) {
          // Save the data to our super persistent storage in the background
          // This ensures the company data is never lost
          const companyData = {
            ...safeData,
            lastUpdated: new Date().toISOString()
          };
          
          // Use a debounced save to prevent too many storage operations
          // We use setTimeout to defer this operation
          setTimeout(() => {
            try {
              // Only save if IndexedDB is available
              if (storageAvailability.indexedDB) {
                superPersistentStorage.save(DataCategory.COMPANY, companyData);
              }
            } catch (err) {
              console.error('[CompanyDisplay] Error backing up company data:', err);
            }
          }, 500);
        }
      } catch (err) {
        console.error('[CompanyDisplay] Error setting company data:', err);
      }
    };

    // 1. Event bus for real-time updates - with safety checks
    // Use a longer timeout to ensure the app has fully initialized
    const eventBusTimeout = setTimeout(() => {
      if (eventBus) {
        console.log('[CompanyDisplay] Setting up delayed event bus subscription');
        try {
          if (subscriptionIdRef.current) {
            eventBus.unsubscribe(subscriptionIdRef.current);
          }
          subscriptionIdRef.current = eventBus.subscribe('companyDetailsUpdated', safeSetDisplayCompany);
        } catch (err) {
          console.error('[CompanyDisplay] Error setting up delayed event bus subscription:', err);
        }
      }
      
      // Only attempt data recovery if we don't already have data
      if (displayCompany.name === DEFAULT_COMPANY.name) {
        try {
          // Now force an update to ensure we have data
          memoizedUpdateDisplayCompany();
        } catch (err) {
          console.error('[CompanyDisplay] Error in delayed data recovery:', err);
          // Still try to update display even if recovery failed
          if (isComponentMounted) {
            setDisplayCompany({...DEFAULT_COMPANY});
            setIsLoading(false);
          }
        }
      }
    }, 3000);

    // 2. DOM events for cross-component communication
    const handleCompanyDataChanged = (event: Event) => {
      console.log('[CompanyDisplay] DOM event received');
      try {
        const customEvent = event as CustomEvent<any>;
        if (customEvent?.detail?.name) {
          safeSetDisplayCompany(customEvent.detail);
        }
      } catch (err) {
        console.error('[CompanyDisplay] DOM event handling error:', err);
      }
    };

    // 3. LocalStorage for cross-tab communication
    const handleStorageChange = (e: StorageEvent) => {
      console.log('[CompanyDisplay] Storage event detected');
      if (e.key === 'COMPANY_DATA_FORCE_UPDATE_NOW' && e.newValue) {
        try {
          const updateData = JSON.parse(e.newValue);
          if (updateData?.data?.name) {
            safeSetDisplayCompany(updateData.data);
          }
        } catch (err) {
          console.error('[CompanyDisplay] Storage parse error:', err);
        }
      }
    };

    // Add all listeners with try-catch for safety
    try {
      console.log('[CompanyDisplay] Adding DOM event listener');
      window.addEventListener('company-data-changed', handleCompanyDataChanged);
      window.addEventListener('storage', handleStorageChange);
    } catch (err) {
      console.error('[CompanyDisplay] Listener setup error:', err);
    }

    return () => {
      console.log('[CompanyDisplay] Cleaning up synchronization');
      isComponentMounted = false;
      
      // Clear any pending timeouts
      if (eventBusTimeout) clearTimeout(eventBusTimeout);
      
      try {
        // Clean up event bus subscription
        if (eventBus && subscriptionIdRef.current) {
          eventBus.unsubscribe(subscriptionIdRef.current);
          subscriptionIdRef.current = null;
        }
        
        // Remove DOM event listeners
        window.removeEventListener('company-data-changed', handleCompanyDataChanged);
        window.removeEventListener('storage', handleStorageChange);
      } catch (err) {
        console.error('[CompanyDisplay] Cleanup error:', err);
      }
    };
  }, []);
  
  // Wrap return in ErrorBoundary and add loading state
  return (
    <ErrorBoundary>
      {isLoading ? (
        <div className="loading-placeholder">Loading company information...</div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="font-semibold">{displayCompany.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p>{displayCompany.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p style={{ whiteSpace: 'pre-line' }}>{displayCompany.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p>{displayCompany.phone}</p>
            </div>
            
            {displayCompany.vatNumber && (
              <div>
                <p className="text-sm font-medium text-gray-500">VAT Number</p>
                <p>{displayCompany.vatNumber}</p>
              </div>
            )}
            
            {displayCompany.registrationNumber && (
              <div>
                <p className="text-sm font-medium text-gray-500">Registration Number</p>
                <p>{displayCompany.registrationNumber}</p>
              </div>
            )}
            
            {displayCompany.website && (
              <div>
                <p className="text-sm font-medium text-gray-500">Website</p>
                <p>{displayCompany.website}</p>
              </div>
            )}
            
            {displayCompany.directorFirstName && displayCompany.directorLastName && (
              <div>
                <p className="text-sm font-medium text-gray-500">Director</p>
                <p>{displayCompany.directorFirstName} {displayCompany.directorLastName}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default CompanyDisplay;
