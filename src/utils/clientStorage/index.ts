
/**
 * Client storage module - exposes all functionality from the client storage subsystem
 */

// Export types
export * from './types';

// Export storage keys
export * from './storage-keys';

// Export data retrieval functions
export { getClientsData, hasClients } from './data-retrieval';

// Export data persistence functions
export { saveClientsData } from './data-persistence';

// Export client operations
export { addClient, updateClient, deleteClient } from './client-operations';

// Re-export default state for backward compatibility
import { DEFAULT_CLIENTS_STATE } from './types';
export const defaultClientsState = DEFAULT_CLIENTS_STATE;
