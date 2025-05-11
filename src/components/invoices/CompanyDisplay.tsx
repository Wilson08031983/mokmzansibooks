import React, { useEffect, useState, useRef } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import type { CompanyDetails } from "@/contexts/CompanyContext";
import { getSharedCompanyData, getDirectSyncData } from "@/utils/companyDataSync";

// Import the event bus for real-time updates
let eventBus: any = null;
try {
  eventBus = require('@/utils/companyEventBus').default;
} catch (error) {
  console.warn('CompanyDisplay: Could not load event bus:', error);
}

// Interface for display purposes
interface DisplayCompany {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo?: string | null;
  stamp?: string | null;
}

// Props interface
interface CompanyDisplayProps {
  company?: {
    name: string;
    address: string;
    email: string;
    phone: string;
    logo?: string | null;
    stamp?: string | null;
  };
}

// Default company data
const DEFAULT_COMPANY: DisplayCompany = {
  name: "Your Company",
  address: "Company Address",
  email: "company@example.com",
  phone: "Phone Number"
};

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
      logo: details.logo as string || null,
      stamp: details.stamp as string || null
    };
  };

  // Memoize the updateDisplayCompany function to prevent infinite re-renders
  const memoizedUpdateDisplayCompany = useRef(() => {
    try {
      // Try context first (highest priority)
      if (companyContext?.companyDetails?.name) {
        setDisplayCompany(formatContextCompanyDetails(companyContext.companyDetails));
        return;
      }
      
      // Try props second
      if (propCompany?.name) {
        setDisplayCompany(propCompany as DisplayCompany);
        return;
      }
      
      // Try direct sync data third
      const directData = getDirectSyncData();
      if (directData?.name) {
        setDisplayCompany(directData as DisplayCompany);
        return;
      }
      
      // Try shared storage fourth
      const sharedData = getSharedCompanyData();
      if (sharedData?.name) {
        setDisplayCompany(sharedData as DisplayCompany);
        return;
      }
      
      // Fall back to defaults if nothing else
      setDisplayCompany({...DEFAULT_COMPANY});
    } catch (error) {
      console.error('Error in memoized update company display:', error);
      setDisplayCompany({...DEFAULT_COMPANY});
    }
  }).current;
  
  // Update when context or props change - without dependency on memoizedUpdateDisplayCompany
  useEffect(() => {
    try {
      memoizedUpdateDisplayCompany();
    } catch (error) {
      console.error('Error updating company display:', error);
      // Fallback to defaults on error
      setDisplayCompany({...DEFAULT_COMPANY});
    }
  }, [companyContext?.companyDetails, propCompany]);
  
  // Set up multi-layered synchronization
  useEffect(() => {
    let isComponentMounted = true;
    
    // Safely update state only if component is still mounted
    const safeSetDisplayCompany = (data: any) => {
      try {
        if (!isComponentMounted) return;
        if (!data || typeof data !== 'object') return;
        
        // Ensure required fields are present to avoid rendering issues
        const safeData = {
          name: data.name || DEFAULT_COMPANY.name,
          address: data.address || DEFAULT_COMPANY.address,
          email: data.email || DEFAULT_COMPANY.email,
          phone: data.phone || DEFAULT_COMPANY.phone,
          logo: data.logo || null,
          stamp: data.stamp || null
        };
        
        setDisplayCompany(safeData);
      } catch (err) {
        console.error('Error safely setting company data:', err);
      }
    };
    
    // 1. Event bus for real-time updates - with safety checks
    if (eventBus) {
      try {
        subscriptionIdRef.current = eventBus.subscribe('companyDetailsUpdated', (data: any) => {
          if (data?.name) {
            console.log('CompanyDisplay received event bus update:', data.name);
            safeSetDisplayCompany(data);
          }
        });
      } catch (err) {
        console.error('Error setting up event bus subscription:', err);
      }
    }
    
    // 2. DOM events for cross-component communication
    const handleCompanyDataChanged = (event: Event) => {
      try {
        const customEvent = event as CustomEvent<any>;
        if (customEvent?.detail?.name) {
          console.log('CompanyDisplay received DOM event:', customEvent.detail.name);
          safeSetDisplayCompany(customEvent.detail);
        }
      } catch (err) {
        console.error('Error handling company data event:', err);
      }
    };
    
    // 3. LocalStorage for cross-tab communication
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'COMPANY_DATA_FORCE_UPDATE_NOW' && e.newValue) {
        try {
          const updateData = JSON.parse(e.newValue);
          if (updateData?.data?.name) {
            console.log('CompanyDisplay detected storage update:', updateData.data.name);
            safeSetDisplayCompany(updateData.data);
          }
        } catch (err) {
          console.error('Error parsing company data update:', err);
        }
      }
    };
    
    // Add all listeners with try-catch for safety
    try {
      window.addEventListener('company-data-changed', handleCompanyDataChanged);
      window.addEventListener('storage', handleStorageChange);
    } catch (err) {
      console.error('Error adding event listeners:', err);
    }
    
    // Remove polling mechanism entirely as it's causing global rendering errors
    
    // Cleanup with safety checks
    return () => {
      isComponentMounted = false;
      
      try {
        if (eventBus && subscriptionIdRef.current) {
          eventBus.unsubscribe(subscriptionIdRef.current);
          subscriptionIdRef.current = null;
        }
        
        window.removeEventListener('company-data-changed', handleCompanyDataChanged);
        window.removeEventListener('storage', handleStorageChange);
        
        // Polling interval removed to prevent rendering errors
      } catch (err) {
        console.error('Error cleaning up CompanyDisplay:', err);
      }
    };
  }, []); // Removed dependency as we now use the memoized function inside
  
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p>{displayCompany.name}</p>
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
      </div>
    </div>
  );
};

export default CompanyDisplay;
