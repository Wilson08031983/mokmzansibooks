import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Trash2, Code, Server } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentStack?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary,
  componentStack 
}) => {
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Analyze error type to provide better guidance
  const errorMessage = error?.message || 'Unknown error';
  const errorStack = error?.stack || '';
  
  const isLazyLoadError = (
    errorMessage.includes('lazy') || 
    errorMessage.includes('Suspense') || 
    errorMessage.includes('import(') ||
    errorMessage.includes('chunk')
  );
  
  const isSupabaseError = (
    errorMessage.includes('supabase') || 
    errorMessage.includes('anon key') ||
    errorMessage.includes('auth')
  );
  
  const isCompanyDataError = errorMessage.includes('company');
  
  const handleAdvancedRecovery = () => {
    setIsRecovering(true);
    
    // Clear relevant caches based on error type
    if (isCompanyDataError) {
      localStorage.removeItem('companyDetails');
      localStorage.removeItem('publicCompanyDetails');
      sessionStorage.removeItem('companyDetailsBackup');
    }
    
    // Clear service worker caches if it's a loading error
    if (isLazyLoadError && 'caches' in window) {
      // Clear caches that might contain problematic module chunks
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('webpack') || cacheName.includes('static')) {
            caches.delete(cacheName);
          }
        });
      });
    }
    
    // Add a slight delay before reloading
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  // Generate a helpful message based on the error type
  let helpMessage = 'We ran into an unexpected error while loading this page.';
  let recoveryMessage = 'Reload the page to try again.';
  
  if (isLazyLoadError) {
    helpMessage = 'A component or module failed to load properly.';
    recoveryMessage = 'This might be due to a network issue or a recent update. Clearing your browser cache might help.';
  } else if (isSupabaseError) {
    helpMessage = 'There was a problem connecting to the database service.';
    recoveryMessage = 'This could be due to network connectivity or authentication issues.';
  } else if (isCompanyDataError) {
    helpMessage = 'There was a problem with your company information.';
    recoveryMessage = 'Clearing your company data cache might resolve this issue.';
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg border-destructive/20">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Application Error</CardTitle>
          </div>
          <CardDescription>{helpMessage}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="message" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="message">Message</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="recovery">Recovery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="message" className="space-y-4 py-4">
              <div className="text-sm space-y-2">
                <p className="font-medium">{recoveryMessage}</p>
                <p className="text-muted-foreground">
                  If this problem persists, please contact support with the error details.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="py-4">
              <div className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-[200px] mb-4">
                <p className="font-semibold">Error message:</p>
                <pre className="text-destructive">{errorMessage}</pre>
                
                {componentStack && (
                  <>
                    <p className="font-semibold mt-2">Component stack:</p>
                    <pre className="text-muted-foreground">{componentStack}</pre>
                  </>
                )}
                
                {errorStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Show stack trace</summary>
                    <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">{errorStack}</pre>
                  </details>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="recovery" className="space-y-4 py-4">
              <div className="text-sm space-y-4">
                <p>Choose a recovery option below:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={resetErrorBoundary}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload Page
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="justify-start"
                    onClick={handleAdvancedRecovery}
                    disabled={isRecovering}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isRecovering ? 'Recovering...' : 'Clear Cache & Reload'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;
