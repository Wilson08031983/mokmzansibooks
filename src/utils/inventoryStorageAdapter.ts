/**
 * Inventory Storage Adapter
 * 
 * This adapter ensures inventory data is never lost by utilizing the
 * SuperPersistentStorage system with multiple redundant storage mechanisms.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';
import { createSyncStorageWrapper, SyncCallbacks } from './syncStorageUtils';
import { v4 as uuidv4 } from 'uuid';

// Basic interfaces for inventory data
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  category: string;
  subcategory?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  quantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  location?: string;
  supplier?: string;
  images?: string[];
  attributes?: { [key: string]: string };
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  reference: string;
  date: string;
  items: {
    itemId: string;
    quantity: number;
    unitPrice: number;
    location?: string;
    destinationLocation?: string; // for transfers
  }[];
  notes?: string;
  attachments?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  paymentTerms?: string;
  creditLimit?: number;
  website?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  attributes?: { name: string; type: string; required: boolean }[];
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryData {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  suppliers: Supplier[];
  categories: Category[];
  locations: Location[];
  settings: {
    defaultTaxRate: number;
    defaultLocation: string;
    enableBarcodeScan: boolean;
    trackSerialNumbers: boolean;
    trackExpiryDates: boolean;
    lowStockNotification: boolean;
  };
}

// Default empty state
const defaultInventoryData: InventoryData = {
  items: [],
  transactions: [],
  suppliers: [],
  categories: [],
  locations: [],
  settings: {
    defaultTaxRate: 15,
    defaultLocation: 'main',
    enableBarcodeScan: true,
    trackSerialNumbers: false,
    trackExpiryDates: false,
    lowStockNotification: true
  }
};

/**
 * Load inventory data from storage with comprehensive fallback
 */
export const loadInventoryData = async (): Promise<InventoryData> => {
  try {
    console.log('InventoryStorageAdapter: Loading inventory data...');
    
    // First try super persistent storage
    const data = await superPersistentStorage.load<InventoryData>(DataCategory.INVENTORY);
    
    if (data && data.items) {
      console.log(`InventoryStorageAdapter: Loaded ${data.items.length} inventory items from super persistent storage`);
      
      // Also restore to legacy storage for compatibility
      localStorage.setItem('inventoryData', JSON.stringify(data));
      
      return data;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      // Try multiple possible legacy keys
      const legacyKeys = ['inventoryData', 'inventory', 'INVENTORY_DATA', 'items'];
      
      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          try {
            const parsedData = JSON.parse(legacyData);
            
            if (parsedData) {
              // Determine if this is a complete inventory data object or just items
              let structuredData: InventoryData;
              
              if (Array.isArray(parsedData)) {
                // It's just an array of items
                structuredData = {
                  ...defaultInventoryData,
                  items: parsedData
                };
              } else if (parsedData.items) {
                // It's a proper inventory data object
                structuredData = {
                  ...defaultInventoryData,
                  ...parsedData
                };
              } else if (parsedData.products || parsedData.stock) {
                // It's using different field names
                structuredData = {
                  ...defaultInventoryData,
                  items: parsedData.products || parsedData.stock || []
                };
              } else {
                // Try to infer structure
                structuredData = { ...defaultInventoryData };
                
                // Check for inventory items with different property names
                if (parsedData.itemList || parsedData.productList) {
                  structuredData.items = parsedData.itemList || parsedData.productList;
                }
                
                // Check for transactions with different property names
                if (parsedData.transactions || parsedData.movements) {
                  structuredData.transactions = parsedData.transactions || parsedData.movements;
                }
                
                // Check for suppliers with different property names
                if (parsedData.suppliers || parsedData.vendors) {
                  structuredData.suppliers = parsedData.suppliers || parsedData.vendors;
                }
                
                // Check for categories with different property names
                if (parsedData.categories || parsedData.itemCategories) {
                  structuredData.categories = parsedData.categories || parsedData.itemCategories;
                }
                
                // Check for locations with different property names
                if (parsedData.locations || parsedData.warehouses) {
                  structuredData.locations = parsedData.locations || parsedData.warehouses;
                }
              }
              
              console.log(`InventoryStorageAdapter: Loaded inventory data from legacy storage (${key})`);
              
              // Migrate to super persistent storage for future use
              await superPersistentStorage.save(DataCategory.INVENTORY, structuredData);
              
              return structuredData;
            }
          } catch (error) {
            console.error(`InventoryStorageAdapter: Error parsing legacy data from ${key}`, error);
          }
        }
      }
    } catch (error) {
      console.error('InventoryStorageAdapter: Error loading from legacy storage', error);
    }
    
    // If all else fails, return default data
    console.log('InventoryStorageAdapter: No inventory data found, using defaults');
    return { ...defaultInventoryData };
  } catch (error) {
    console.error('InventoryStorageAdapter: Error loading inventory data', error);
    return { ...defaultInventoryData };
  }
};

/**
 * Save inventory data with multi-layer persistence
 */
export const saveInventoryData = async (data: InventoryData): Promise<boolean> => {
  try {
    console.log('InventoryStorageAdapter: Saving inventory data...');
    
    if (!data || !data.items) {
      console.error('InventoryStorageAdapter: Invalid inventory data', data);
      return false;
    }
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.INVENTORY, data);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('inventoryData', JSON.stringify(data));
    
    // Create separate backups for main data types
    localStorage.setItem('inventoryItems', JSON.stringify(data.items));
    localStorage.setItem('inventoryTransactions', JSON.stringify(data.transactions));
    localStorage.setItem('inventorySuppliers', JSON.stringify(data.suppliers));
    localStorage.setItem('inventoryCategories', JSON.stringify(data.categories));
    localStorage.setItem('inventoryLocations', JSON.stringify(data.locations));
    
    if (success) {
      console.log('InventoryStorageAdapter: Inventory data saved successfully');
    } else {
      console.warn('InventoryStorageAdapter: Some storage mechanisms failed when saving inventory data');
    }
    
    return success;
  } catch (error) {
    console.error('InventoryStorageAdapter: Error saving inventory data', error);
    
    // Fall back to legacy storage as last resort
    try {
      localStorage.setItem('inventoryData_emergency_backup', JSON.stringify(data));
    } catch (fallbackError) {
      console.error('InventoryStorageAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};

/**
 * Add a new inventory item
 */
export const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    // Generate ID and timestamps
    const newItem: InventoryItem = {
      ...item,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as InventoryItem;
    
    // Load existing inventory data
    const data = await loadInventoryData();
    
    // Add the new item
    data.items.push(newItem);
    
    // Save updated data
    const success = await saveInventoryData(data);
    
    return success ? newItem.id : null;
  } catch (error) {
    console.error('InventoryStorageAdapter: Error adding inventory item', error);
    return null;
  }
};

/**
 * Update an existing inventory item
 */
export const updateInventoryItem = async (updatedItem: InventoryItem): Promise<boolean> => {
  try {
    // Load existing inventory data
    const data = await loadInventoryData();
    
    // Find and update the item
    const index = data.items.findIndex(i => i.id === updatedItem.id);
    
    if (index !== -1) {
      // Update the item with new data
      data.items[index] = {
        ...updatedItem,
        updatedAt: new Date().toISOString()
      };
      
      // Save updated data
      return saveInventoryData(data);
    } else {
      console.warn(`InventoryStorageAdapter: Item with ID ${updatedItem.id} not found for update`);
      return false;
    }
  } catch (error) {
    console.error('InventoryStorageAdapter: Error updating inventory item', error);
    return false;
  }
};

/**
 * Record an inventory transaction
 */
export const recordInventoryTransaction = async (transaction: Omit<InventoryTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    // Generate ID and timestamps
    const newTransaction: InventoryTransaction = {
      ...transaction,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as InventoryTransaction;
    
    // Load existing inventory data
    const data = await loadInventoryData();
    
    // Add the new transaction
    data.transactions.push(newTransaction);
    
    // Update inventory quantities based on transaction type
    for (const item of newTransaction.items) {
      const inventoryItemIndex = data.items.findIndex(i => i.id === item.itemId);
      
      if (inventoryItemIndex !== -1) {
        // Update quantity based on transaction type
        switch (newTransaction.type) {
          case 'purchase':
            data.items[inventoryItemIndex].quantity += item.quantity;
            break;
          case 'sale':
            data.items[inventoryItemIndex].quantity -= item.quantity;
            break;
          case 'adjustment':
            // Adjustment is an absolute value, not relative
            data.items[inventoryItemIndex].quantity = item.quantity;
            break;
          case 'transfer':
            // For transfers, quantity doesn't change overall
            break;
          case 'return':
            // Return adds back to inventory
            data.items[inventoryItemIndex].quantity += item.quantity;
            break;
        }
        
        // Update item's updated timestamp
        data.items[inventoryItemIndex].updatedAt = new Date().toISOString();
      }
    }
    
    // Save updated data
    const success = await saveInventoryData(data);
    
    return success ? newTransaction.id : null;
  } catch (error) {
    console.error('InventoryStorageAdapter: Error recording inventory transaction', error);
    return null;
  }
};

/**
 * Add a new supplier
 */
export const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    // Generate ID and timestamps
    const newSupplier: Supplier = {
      ...supplier,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Supplier;
    
    // Load existing inventory data
    const data = await loadInventoryData();
    
    // Add the new supplier
    data.suppliers.push(newSupplier);
    
    // Save updated data
    const success = await saveInventoryData(data);
    
    return success ? newSupplier.id : null;
  } catch (error) {
    console.error('InventoryStorageAdapter: Error adding supplier', error);
    return null;
  }
};

/**
 * Update supplier information
 */
export const updateSupplier = async (updatedSupplier: Supplier): Promise<boolean> => {
  try {
    // Load existing inventory data
    const data = await loadInventoryData();
    
    // Find and update the supplier
    const index = data.suppliers.findIndex(s => s.id === updatedSupplier.id);
    
    if (index !== -1) {
      // Update the supplier with new data
      data.suppliers[index] = {
        ...updatedSupplier,
        updatedAt: new Date().toISOString()
      };
      
      // Save updated data
      return saveInventoryData(data);
    } else {
      console.warn(`InventoryStorageAdapter: Supplier with ID ${updatedSupplier.id} not found for update`);
      return false;
    }
  } catch (error) {
    console.error('InventoryStorageAdapter: Error updating supplier', error);
    return false;
  }
};

/**
 * Add a new inventory category
 */
export const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    // Generate ID and timestamps
    const newCategory: Category = {
      ...category,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Category;
    
    // Load existing inventory data
    const data = await loadInventoryData();
    
    // Add the new category
    data.categories.push(newCategory);
    
    // Save updated data
    const success = await saveInventoryData(data);
    
    return success ? newCategory.id : null;
  } catch (error) {
    console.error('InventoryStorageAdapter: Error adding category', error);
    return null;
  }
};

/**
 * Add a new inventory location
 */
export const addLocation = async (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    // Generate ID and timestamps
    const newLocation: Location = {
      ...location,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Location;
    
    // Load existing inventory data
    const data = await loadInventoryData();
    
    // Add the new location
    data.locations.push(newLocation);
    
    // Save updated data
    const success = await saveInventoryData(data);
    
    return success ? newLocation.id : null;
  } catch (error) {
    console.error('InventoryStorageAdapter: Error adding location', error);
    return null;
  }
};

/**
 * Update inventory settings
 */
export const updateInventorySettings = async (settings: Partial<InventoryData['settings']>): Promise<boolean> => {
  try {
    // Load existing inventory data
    const data = await loadInventoryData();
    
    // Update settings
    data.settings = {
      ...data.settings,
      ...settings
    };
    
    // Save updated data
    return saveInventoryData(data);
  } catch (error) {
    console.error('InventoryStorageAdapter: Error updating inventory settings', error);
    return false;
  }
};

// Create sync-enabled storage wrapper for inventory data
const syncInventoryStorage = createSyncStorageWrapper<InventoryData>(
  saveInventoryData,
  loadInventoryData,
  'Inventory Data'
);

// Public API with sync indicators
export const syncInventoryAdapter = {
  load: async (callbacks?: SyncCallbacks): Promise<InventoryData> => {
    return syncInventoryStorage.load(callbacks);
  },
  save: async (data: InventoryData, callbacks?: SyncCallbacks): Promise<boolean> => {
    return syncInventoryStorage.save(data, callbacks);
  },
  addItem: async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>, callbacks?: SyncCallbacks): Promise<string | null> => {
    try {
      const data = await syncInventoryStorage.load(callbacks);
      
      // Generate ID and timestamps
      const newItem: InventoryItem = {
        ...item,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as InventoryItem;
      
      // Add the new item
      data.items.push(newItem);
      
      // Save updated data
      const success = await syncInventoryStorage.save(data, callbacks);
      
      return success ? newItem.id : null;
    } catch (error) {
      console.error('Error adding inventory item with sync:', error);
      return null;
    }
  },
  updateItem: async (item: InventoryItem, callbacks?: SyncCallbacks): Promise<boolean> => {
    try {
      const data = await syncInventoryStorage.load(callbacks);
      
      const index = data.items.findIndex(i => i.id === item.id);
      if (index !== -1) {
        // Update with new timestamp
        data.items[index] = {
          ...item,
          updatedAt: new Date().toISOString()
        };
        return syncInventoryStorage.save(data, callbacks);
      }
      return false;
    } catch (error) {
      console.error('Error updating inventory item with sync:', error);
      return false;
    }
  },
  recordTransaction: async (transaction: Omit<InventoryTransaction, 'id' | 'createdAt' | 'updatedAt'>, callbacks?: SyncCallbacks): Promise<string | null> => {
    try {
      const data = await syncInventoryStorage.load(callbacks);
      
      // Generate ID and timestamps
      const newTransaction: InventoryTransaction = {
        ...transaction,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as InventoryTransaction;
      
      // Add the new transaction
      data.transactions.push(newTransaction);
      
      // Update inventory quantities based on transaction type
      for (const item of newTransaction.items) {
        const inventoryItemIndex = data.items.findIndex(i => i.id === item.itemId);
        
        if (inventoryItemIndex !== -1) {
          // Update quantity based on transaction type
          switch (newTransaction.type) {
            case 'purchase':
              data.items[inventoryItemIndex].quantity += item.quantity;
              break;
            case 'sale':
              data.items[inventoryItemIndex].quantity -= item.quantity;
              break;
            case 'adjustment':
              data.items[inventoryItemIndex].quantity = item.quantity;
              break;
            case 'transfer':
              break;
            case 'return':
              data.items[inventoryItemIndex].quantity += item.quantity;
              break;
          }
          
          // Update timestamp
          data.items[inventoryItemIndex].updatedAt = new Date().toISOString();
        }
      }
      
      // Save updated data
      const success = await syncInventoryStorage.save(data, callbacks);
      
      return success ? newTransaction.id : null;
    } catch (error) {
      console.error('Error recording inventory transaction with sync:', error);
      return null;
    }
  }
};
