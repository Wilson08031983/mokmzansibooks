
/**
 * @deprecated This file is deprecated. Use the new client storage API from utils/clientStorage instead.
 * This file is kept for backward compatibility and will be removed in a future version.
 */

import { 
  getClientsData,
  saveClientsData,
  addClient, 
  updateClient, 
  deleteClient,
  hasClients,
  defaultClientsState
} from './clientStorage';

// Re-export everything for backward compatibility
export {
  defaultClientsState,
  getClientsData,
  saveClientsData,
  addClient,
  updateClient,
  deleteClient,
  hasClients
};
