/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import SuspenseFallback from '../SuspenseFallback';

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  writable: true,
  value: { reload: jest.fn() }
});

describe('SuspenseFallback', () => {
  // Test loading state
  it('renders loading state correctly', () => {
    renderWithProviders(<SuspenseFallback message="Testing loading" />);
    
    // Verify the loading message is displayed
    const loadingMessage = screen.getByText('Testing loading');
    expect(loadingMessage).toBeInTheDocument();
    
    // Verify loading spinner exists
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  // Test error state
  it('renders error state correctly', () => {
    const testError = new Error('Test error message');
    renderWithProviders(<SuspenseFallback error={testError} />);
    
    // Verify error message is displayed
    const errorMessage = screen.getByText('Test error message');
    expect(errorMessage).toBeInTheDocument();
    
    // Verify reload button exists
    const reloadButton = screen.getByText('Reload Page');
    expect(reloadButton).toBeInTheDocument();
    
    // Verify error heading
    const errorHeading = screen.getByText('Error Loading Content');
    expect(errorHeading).toBeInTheDocument();
  });

  // Test default message
  it('uses default message when none provided', () => {
    renderWithProviders(<SuspenseFallback />);
    
    // Verify default message is used
    const defaultMessage = screen.getByText('Loading content...');
    expect(defaultMessage).toBeInTheDocument();
  });
});
