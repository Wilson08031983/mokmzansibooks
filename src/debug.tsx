import React from 'react';
import ReactDOM from 'react-dom/client';

// Minimal debug component to bypass normal app initialization
const Debug = () => {
  return (
    <div className="p-8 max-w-md mx-auto mt-10 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-4">MokMzansi Books Debug Page</h1>
      <p className="mb-4">If you can see this page, React is working correctly.</p>
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-4">
        <p className="text-sm font-medium">Check console for errors</p>
      </div>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Return to App
      </button>
    </div>
  );
};

// Render directly to bypass potential initialization issues
try {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(<Debug />);
    console.log('Debug component rendered successfully');
  } else {
    console.error('Root element not found');
  }
} catch (error) {
  console.error('Error rendering debug component:', error);
  // Show error directly in the DOM as a fallback
  document.body.innerHTML = `
    <div style="padding: 20px; margin: 20px; border: 1px solid #f56565; background: #fff5f5;">
      <h2 style="color: #c53030; font-size: 1.5rem;">React Rendering Error</h2>
      <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  `;
}
