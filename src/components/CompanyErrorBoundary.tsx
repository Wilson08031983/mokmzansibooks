import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { restoreCompanyDataFromBackup } from '@/utils/companyDataPersistence';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRecovering: boolean;
}

/**
 * Error boundary specifically for company data components
 * Provides recovery mechanisms and fallback UI
 */
export class CompanyErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isRecovering: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRecovering: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Company component error:', error, errorInfo);
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Implement error logging here
      // e.g., Sentry.captureException(error);
    }
    
    toast({
      title: 'Company Data Error',
      description: 'There was a problem with the company information. You can try to recover the data.',
      variant: 'destructive',
    });
  }

  private handleRecovery = async () => {
    this.setState({ isRecovering: true });
    
    try {
      // Ensure we properly wait for the async restoration to complete
      const recovered = await Promise.resolve(restoreCompanyDataFromBackup());
      
      if (recovered) {
        toast({
          title: 'Recovery Successful',
          description: 'Company data has been restored from backup.',
          variant: 'default',
        });
        
        // Reset the error state to render the children again
        this.setState({ hasError: false, error: null });
      } else {
        toast({
          title: 'Recovery Failed',
          description: 'Unable to recover company data. Please try again or contact support.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error during recovery:', error);
      
      toast({
        title: 'Recovery Error',
        description: 'An error occurred during the recovery process.',
        variant: 'destructive',
      });
    } finally {
      this.setState({ isRecovering: false });
    }
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-6 rounded-lg border border-destructive bg-destructive/10 text-center">
          <h3 className="text-lg font-medium mb-2">Something went wrong with company data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We encountered an issue displaying your company information.
          </p>
          <div className="flex justify-center space-x-2">
            <Button 
              variant="outline" 
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            <Button 
              variant="default" 
              onClick={this.handleRecovery}
              disabled={this.state.isRecovering}
            >
              {this.state.isRecovering ? 'Recovering...' : 'Recover Data'}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
