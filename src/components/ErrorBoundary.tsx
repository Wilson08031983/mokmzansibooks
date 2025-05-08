import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import ErrorFallback from './ErrorFallback';

// Optional: Replace with your actual error tracking service
const errorTrackingService = {
  logError: (error: Error, errorInfo: ErrorInfo) => {
    // Example implementation
    console.error('Error Tracking:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }
};

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
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
    // Log the error
    console.error('Uncaught error:', error, errorInfo);
    
    // Send error to tracking service
    errorTrackingService.logError(error, errorInfo);

    // Optional: Show toast notification
    toast({
      title: 'Application Error',
      description: 'An unexpected error occurred. Our team has been notified.',
      variant: 'destructive'
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
    
    // Optional: Soft reset or redirect
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={this.handleReset} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
