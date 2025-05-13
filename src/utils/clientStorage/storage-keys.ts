
/**
 * Storage keys used for client data persistence
 */

// Primary storage key
export const PRIMARY_STORAGE_KEY = 'mok-mzansi-books-clients';

// Legacy storage keys in order of preference
export const LEGACY_STORAGE_KEYS = [
  'mok-mzansi-books-clients',
  'mok-mzansi-books-clients-persistent', 
  'mok-mzansi-books-clients-alt1',
  'mok-mzansi-books-clients-alt2',
  'mok-mzansi-books-clients-backup',
  'clients'
];

// Backup storage keys
export const BACKUP_STORAGE_KEYS = [
  'mok-mzansi-books-clients-emergency-backup',
  'mokClients'
];
