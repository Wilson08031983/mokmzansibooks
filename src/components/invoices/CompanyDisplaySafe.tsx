import React, { useEffect, useState } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { getSharedCompanyData } from "@/utils/companyDataSync";
import dataService from "@/services/supabase/dataService";

/**
 * Enhanced CompanyDisplay component that syncs with My Company page
 * This version pulls data from multiple sources to ensure consistency
 */
const CompanyDisplaySafe = ({ company }: any) => {
  // Initialize with the passed company data or defaults
  const [displayCompany, setDisplayCompany] = useState(company || {
    name: "Your Company",
    address: "Company Address",
    email: "company@example.com",
    phone: "Phone Number",
    vatNumber: "",
    registrationNumber: "",
    website: ""
  });
  
  // Sync with company data from all available sources
  useEffect(() => {
    const syncCompanyData = async () => {
      try {
        // Try to get company data from Context first
        try {
          const { companyDetails } = useCompany();
          if (companyDetails && companyDetails.name) {
            setDisplayCompany(companyDetails);
            return;
          }
        } catch (err) {
          console.log('CompanyContext not available, trying other sources');
        }
        
        // Try to get from shared data
        const sharedData = getSharedCompanyData();
        if (sharedData && sharedData.name) {
          setDisplayCompany(sharedData);
          return;
        }
        
        // Try to get from Supabase
        const supabaseData = await dataService.getAllData('company');
        if (supabaseData && supabaseData.length > 0) {
          setDisplayCompany(supabaseData[0]);
          return;
        }
        
        // Try to get from localStorage as last resort
        const localData = localStorage.getItem('companyDetails');
        if (localData) {
          try {
            const parsedData = JSON.parse(localData);
            if (parsedData && parsedData.name) {
              setDisplayCompany(parsedData);
              return;
            }
          } catch (e) {
            console.error('Error parsing company data from localStorage', e);
          }
        }
      } catch (error) {
        console.error('Error syncing company data:', error);
      }
    };
    
    syncCompanyData();
    
    // Listen for company data changes
    const handleCompanyDataChange = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      if (customEvent.detail && customEvent.detail.name) {
        setDisplayCompany(customEvent.detail);
      }
    };
    
    window.addEventListener('company-data-changed', handleCompanyDataChange);
    
    return () => {
      window.removeEventListener('company-data-changed', handleCompanyDataChange);
    };
  }, []);
  
  // Update when the passed company prop changes
  useEffect(() => {
    if (company && company.name) {
      setDisplayCompany(company);
    }
  }, [company]);

  return (
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
  );
};

export default CompanyDisplaySafe;
