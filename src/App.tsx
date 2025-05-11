
import React from 'react';
import { debugHelpers } from '@/utils/initApp';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">MokMzansi Books</h1>
        <p className="text-gray-600 text-center">
          Welcome to MokMzansi Books accounting app
        </p>
      </div>
    </div>
  );
};

// For debug purposes, expose these methods to the window object if needed
if (process.env.NODE_ENV === 'development') {
  (window as any).debugHelpers = debugHelpers;
}

export default App;
