/**
 * Client error prevention utilities
 * Provides safeguards against common errors in client data management
 */

import { Client, CompanyClient, IndividualClient, VendorClient } from "@/types/client";
import { ClientsState } from "./clientDataPersistence";

/**
 * Validates a client object to ensure it has all required fields
 * @param client The client object to validate
 * @returns An object with validation result and any error messages
 */
export function validateClient(client: Client): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for required fields common to all client types
  if (!client.id) errors.push('Client ID is missing');
  if (!client.name || client.name.trim() === '') errors.push('Client name is required');
  if (!client.email || client.email.trim() === '') errors.push('Client email is required');
  if (!client.address || client.address.trim() === '') errors.push('Client address is required');
  
  // Type-specific validation
  if (client.type === 'company' && 'registrationNumber' in client) {
    const companyClient = client as CompanyClient;
    if (!companyClient.registrationNumber || companyClient.registrationNumber.trim() === '') {
      errors.push('Company registration number is required');
    }
  }
  
  if (client.type === 'vendor' && 'vendorCode' in client) {
    const vendorClient = client as VendorClient;
    if (!vendorClient.vendorCode || vendorClient.vendorCode.trim() === '') {
      errors.push('Vendor code is required');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes client data to prevent common issues
 * @param client The client object to sanitize
 * @returns A sanitized copy of the client object
 */
export function sanitizeClient<T extends Client>(client: T): T {
  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(client)) as T;
  
  // Trim all string fields
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim();
    }
  });
  
  // Ensure credit is a valid number
  if ('credit' in sanitized && sanitized.credit !== undefined) {
    sanitized.credit = typeof sanitized.credit === 'number' 
      ? sanitized.credit 
      : parseFloat(sanitized.credit) || 0;
  }
  
  // Ensure dates are properly formatted
  if ('lastInteraction' in sanitized && sanitized.lastInteraction) {
    try {
      const date = new Date(sanitized.lastInteraction);
      sanitized.lastInteraction = date.toISOString();
    } catch (e) {
      sanitized.lastInteraction = new Date().toISOString();
    }
  }
  
  return sanitized;
}

/**
 * Checks for duplicate clients in the client list
 * @param clients The client state to check
 * @param newClient The new client to check for duplicates
 * @returns True if a duplicate exists, false otherwise
 */
export function hasDuplicateClient(clients: ClientsState, newClient: Client): boolean {
  // Check for duplicate email addresses
  const allClients = [
    ...clients.companies,
    ...clients.individuals,
    ...clients.vendors
  ];
  
  // Skip checking the same client (for updates)
  const otherClients = allClients.filter(c => c.id !== newClient.id);
  
  return otherClients.some(client => 
    client.email.toLowerCase() === newClient.email.toLowerCase()
  );
}

/**
 * Validates client state to ensure it's properly structured
 * @param state The client state to validate
 * @returns True if the state is valid, false otherwise
 */
export function validateClientState(state: any): boolean {
  if (!state) return false;
  
  // Check if state has the expected structure
  if (!state.companies || !Array.isArray(state.companies)) return false;
  if (!state.individuals || !Array.isArray(state.individuals)) return false;
  if (!state.vendors || !Array.isArray(state.vendors)) return false;
  
  return true;
}

/**
 * Prevents JSX and React rendering errors by ensuring client data is properly formatted
 * @param clients The client state to sanitize
 * @returns A sanitized copy of the client state
 */
export function preventRenderingErrors(clients: ClientsState): ClientsState {
  return {
    companies: clients.companies.map(client => sanitizeClient(client)),
    individuals: clients.individuals.map(client => sanitizeClient(client)),
    vendors: clients.vendors.map(client => sanitizeClient(client))
  };
}

/**
 * Creates a safe client ID that won't cause rendering issues
 * @returns A safe client ID
 */
export function createSafeClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
