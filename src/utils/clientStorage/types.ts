
import { ClientsState, Client } from '@/types/client';

export interface ClientStorageResult {
  success: boolean;
  data?: ClientsState;
  error?: Error;
}

export interface ClientOperationResult {
  success: boolean;
  error?: Error;
}

export const DEFAULT_CLIENTS_STATE: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};
