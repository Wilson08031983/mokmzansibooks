import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import ErrorFallback from './ErrorFallback';

// Enhanced error tracking service with better lazy-loading error handling
const errorTrackingService = {
  logError: (error: Error, errorInfo: ErrorInfo) => {
    // Detect potential lazy loading errors
    const isLazyLoadingError = (
      errorInfo.componentStack?.includes('Lazy') ||
      errorInfo.componentStack?.includes('Suspense') ||
      error.message?.includes('lazy') ||
      error.message?.includes('chunk')
    );
    
    // Log with appropriate category for better diagnostics
    console.error(
      isLazyLoadingError ? 'Lazy Loading Error:' : 'Application Error:', 
      {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        type: isLazyLoadingError ? 'lazy-loading' : 'runtime',
      }
    );
    
    // In production, this would send to a real error tracking service
  }
};

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, componentStack?: string) => ReactNode;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: undefined,
      errorInfo: undefined
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with the error info for componentStack
    this.setState({ errorInfo });
    
    // Log the error
    console.error('Uncaught error:', error, errorInfo);
    
    // Send error to tracking service
    errorTrackingService.logError(error, errorInfo);
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Check if this is a lazy loading error to provide a more specific message
    const isLazyLoading = (
      errorInfo.componentStack?.includes('Lazy') ||
      errorInfo.componentStack?.includes('Suspense')
    );
    
    // Show toast notification with contextual message
    toast({
      title: isLazyLoading ? 'Component Loading Error' : 'Application Error',
      description: isLazyLoading 
        ? 'Failed to load a component. Try refreshing the page.'
        : 'An unexpected error occurred. Our team has been notified.',
      variant: 'destructive'
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
    
    // Call onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      // Default recovery action - go to dashboard
      window.location.href = '/dashboard';
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo?.componentStack);
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={this.handleReset}
          componentStack={this.state.errorInfo?.componentStack} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
