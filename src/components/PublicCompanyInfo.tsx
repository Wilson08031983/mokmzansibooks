import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Phone, Globe, MapPin, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { safeJsonParse } from '@/utils/errorHandling';
import eventBus from '@/utils/companyEventBus';

interface PublicCompanyDetails {
  // Basic identification
  id?: string;
  name: string;
  registrationNumber?: string;
  vatNumber?: string;
  taxRegistrationNumber?: string;
  csdRegistrationNumber?: string;
  
  // Contact details
  contactEmail: string;
  contactPhone: string;
  
  // Address information
  address: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  
  // Director information
  directorFirstName?: string;
  directorLastName?: string;
  
  // Web and media assets
  websiteUrl?: string;
  logo?: string | null;
  stamp?: string | null;
  signature?: string | null;
  
  // Metadata
  lastUpdated?: string;
}

const defaultPublicCompanyDetails: PublicCompanyDetails = {
  name: '',
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
  lastUpdated: '',
};

const PublicCompanyInfo: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<PublicCompanyDetails>(defaultPublicCompanyDetails);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  
  // Check if the card was hidden by user preference
  useEffect(() => {
    const hideCompanyInfoCard = localStorage.getItem('hideCompanyInfoCard');
    if (hideCompanyInfoCard === 'true') {
      setIsVisible(false);
    }
  }, []);

  // Subscribe to company update events
  useEffect(() => {
    // Function to handle company data updates
    const handleCompanyUpdated = (updatedData: any) => {
      console.log('PublicCompanyInfo: Received company update event');
      if (updatedData) {
        setCompanyInfo(updatedData);
        
        // Make card visible again if it was hidden
        if (!isVisible) {
          setIsVisible(true);
          localStorage.removeItem('hideCompanyInfoCard');
        }
      }
    };
    
    // Subscribe to company update events
    const subscriptionId = eventBus.subscribe('companyDetailsUpdated', handleCompanyUpdated);
    
    // Cleanup subscription when component unmounts
    return () => {
      eventBus.unsubscribe(subscriptionId);
    };
  }, [isVisible]);
  
  // Load company information from persistent storage with enhanced recovery
  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        // Multi-layered approach to loading company details for maximum persistence
        
        // First try localStorage
        const publicCompanyData = localStorage.getItem('publicCompanyDetails');
        if (publicCompanyData) {
          const parsedData = safeJsonParse(publicCompanyData, defaultPublicCompanyDetails);
          if (parsedData.name && parsedData.contactEmail) {
            console.log('PublicCompanyInfo: Loaded from localStorage');
            setCompanyInfo(parsedData);
            return;
          }
        }
        
        // Try the persistentCompanyData storage
        const persistentData = localStorage.getItem('persistentCompanyData');
        if (persistentData) {
          try {
            const parsedData = safeJsonParse(persistentData, defaultPublicCompanyDetails);
            if (parsedData.name) {
              console.log('PublicCompanyInfo: Loaded from persistent storage');
              setCompanyInfo(parsedData);
              return;
            }
          } catch (persistentError) {
            console.error('Error parsing persistent company data:', persistentError);
          }
        }
        
        // Try sessionStorage backup if other attempts failed
        const backupData = sessionStorage.getItem('companyDataBackup');
        if (backupData) {
          try {
            console.log('PublicCompanyInfo: Attempting recovery from backup');
            const allBackupData = JSON.parse(backupData);
            
            // If we have public company details in the backup, use that
            if (allBackupData.publicCompanyDetails) {
              const recoveredDetails = JSON.parse(allBackupData.publicCompanyDetails);
              console.log('PublicCompanyInfo: Recovered from backup');
              
              // Also restore to localStorage for future use
              localStorage.setItem('publicCompanyDetails', allBackupData.publicCompanyDetails);
              
              setCompanyInfo(recoveredDetails);
              return;
            }
          } catch (parseError) {
            console.error('Error parsing backup data:', parseError);
          }
        }
      } catch (error) {
        console.error('Error loading company info:', error);
      }
    };
    
    // Execute the function
    loadCompanyInfo();
  }, []);

  // Save hidden state preference
  const handleHideCard = () => {
    setIsVisible(false);
    localStorage.setItem('hideCompanyInfoCard', 'true');
    
    toast({
      title: "Company Info Hidden",
      description: "The company information card has been hidden."
    });
  };
  
  // Format the full address
  const formatAddress = () => {
    const parts = [
      companyInfo.address,
      companyInfo.addressLine2,
      companyInfo.city,
      companyInfo.province,
      companyInfo.postalCode
    ].filter(Boolean);
    
    return parts.join(', ');
  };
  
  // Compute whether we have enough company data to be meaningful
  const hasCompanyInfo = (
    companyInfo.name?.trim() !== '' || 
    companyInfo.contactEmail?.trim() !== '' ||
    companyInfo.contactPhone?.trim() !== '' ||
    companyInfo.address?.trim() !== ''
  );
  
  // If the card is hidden or there's no meaningful company info, don't render
  if (!isVisible || !hasCompanyInfo) {
    return null;
  }

  return (
    <Card className="shadow-md relative">
      <button 
        onClick={handleHideCard}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        aria-label="Hide company info card"
      >
        <X size={16} />
      </button>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {companyInfo.name || 'Company Information'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-3">
        {companyInfo.contactEmail && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`mailto:${companyInfo.contactEmail}`} 
              className="text-blue-600 hover:underline"
            >
              {companyInfo.contactEmail}
            </a>
          </div>
        )}
        
        {companyInfo.contactPhone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`tel:${companyInfo.contactPhone}`}
              className="text-blue-600 hover:underline"
            >
              {companyInfo.contactPhone}
            </a>
          </div>
        )}
        
        {companyInfo.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span>{formatAddress()}</span>
          </div>
        )}
        
        {companyInfo.websiteUrl && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a 
              href={companyInfo.websiteUrl.startsWith('http') ? companyInfo.websiteUrl : `https://${companyInfo.websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {companyInfo.websiteUrl.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PublicCompanyInfo;
