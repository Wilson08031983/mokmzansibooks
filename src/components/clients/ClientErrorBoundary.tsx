
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createClientDataBackup, restoreClientDataFromBackup } from '@/utils/clientDataPersistence';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ClientErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error("Client component error:", error, errorInfo);
    
    // Create a backup of the current state when an error occurs
    createClientDataBackup();
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleRestore = (): void => {
    const restored = restoreClientDataFromBackup();
    if (restored) {
      this.setState({ hasError: false, error: null, errorInfo: null });
      window.location.reload();
    } else {
      alert("Failed to restore from backup. No backup data found.");
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-300 rounded-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong with the client module</h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || "An unknown error occurred"}
          </p>
          <div className="space-y-2">
            <button
              onClick={this.handleReset}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
            >
              Reset
            </button>
            <button
              onClick={this.handleRestore}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Restore from Backup
            </button>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-700">Error details</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
              {this.state.error?.stack}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ClientErrorBoundary;
