import React, { Component, ErrorInfo, ReactNode } from 'react';
import SuspenseFallback from './SuspenseFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary wrapper for SuspenseFallback
 * This catches JSX syntax errors and React rendering errors without modifying SuspenseFallback
 */
class ErrorBoundaryWrapper extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
    
    // Broadcast error to the application
    window.dispatchEvent(new CustomEvent('app:error:boundary', { 
      detail: { error, errorInfo }
    }));
    
    // Could send to a monitoring service here
    // if (process.env.NODE_ENV === 'production') {
    //   // sendToErrorMonitoring(error, errorInfo);
    // }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <SuspenseFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWrapper;
