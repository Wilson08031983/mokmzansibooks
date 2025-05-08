import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function to wrap components with necessary providers
 * for testing purposes
 */
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
}

/**
 * Mock implementation of sessionStorage for testing
 */
export function setupStorageMock() {
  const storageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => {
        return store[key] || null;
      },
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };
  })();

  Object.defineProperty(window, 'sessionStorage', {
    value: storageMock,
    writable: true
  });
  
  return storageMock;
}
