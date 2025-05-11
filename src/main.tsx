
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { initializeApp } from './utils/initApp';

// Basic error fallback component (no dependencies)
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ padding: '20px', margin: '20px', background: '#fff5f5', border: '1px solid #f56565', borderRadius: '0.25rem' }}>
    <h2 style={{ color: '#c53030', fontSize: '1.5rem', marginBottom: '10px' }}>Application Error</h2>
    <p style={{ marginBottom: '10px' }}>{error.message}</p>
    <button 
      onClick={() => window.location.reload()}
      style={{ backgroundColor: '#4299e1', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
    >
      Reload Application
    </button>
  </div>
);

// Basic loading fallback (no dependencies)
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
    <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
    <p style={{ marginTop: '20px', color: '#4a5568' }}>Loading MokMzansi Books...</p>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

// Simple error boundary component (defined before it's used)
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error || new Error('Unknown rendering error')} />;
    }

    return this.props.children;
  }
}

// Lazy load App component to isolate potential issues
const App = React.lazy(() => import('./App'));

// Find the root element once
const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = `<div style="padding: 20px; color: red;">Critical error: Root element not found</div>`;
  throw new Error('Root element not found in document');
}

// Create root only once
const root = ReactDOM.createRoot(rootElement);

// Function to render error UI
const renderError = (error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
  console.error('Error during application initialization:', error);
  
  root.render(
    <ErrorFallback error={error instanceof Error ? error : new Error(errorMessage)} />
  );
};

// Function to render the main application
const renderApp = () => {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('Application rendering started successfully');
};

// Register a global error handler before rendering
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event);
  event.preventDefault();
});

// Initialize and render the application with proper error handling
try {
  // Initialize the app before rendering
  initializeApp();
  renderApp();
} catch (error) {
  renderError(error);
}
