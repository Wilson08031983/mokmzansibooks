
import React, { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as robustStorageMigrator from '@/utils/robustStorageMigrator';

interface CompanyDisplayProps {
  variant?: 'default' | 'minimal';
}

const CompanyDisplay: React.FC<CompanyDisplayProps> = ({ variant = 'default' }) => {
  const { company, loading, error } = useCompany();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error Loading Company',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Attempt to consolidate storage
      const result = await robustStorageMigrator.consolidateStorage({
        forceFetch: true,
        includeCompanyData: true
      });
      
      if (result.success) {
        toast({
          title: 'Refresh Complete',
          description: 'Company data has been refreshed.',
        });
      } else {
        toast({
          title: 'Refresh Failed',
          description: (result.result?.error as Error)?.message || 'Could not refresh company data.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Refresh Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading company data...
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
          No company data available.
        </CardContent>
      </Card>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="secondary">{company.name}</Badge>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="text-lg font-semibold">{company.name}</div>
        <div className="text-sm text-gray-500">{company.address}, {company.city}</div>
        <div className="text-sm text-gray-500">{company.email}</div>
        <div className="text-sm text-gray-500">{company.phone}</div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanyDisplay;
