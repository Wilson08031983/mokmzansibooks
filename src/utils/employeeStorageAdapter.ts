/**
 * Employee Storage Adapter
 * 
 * This adapter ensures employee information is never lost by utilizing the
 * SuperPersistentStorage system with multiple redundant storage mechanisms.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';

// Employee interface for storage
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  hireDate: string;
  salary?: number;
  status: 'active' | 'inactive' | 'terminated';
  image?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchCode: string;
  };
  taxInfo?: {
    taxNumber: string;
    taxStatus: string;
  };
  benefits?: string[];
  documents?: {
    id: string;
    name: string;
    url: string;
    dateAdded: string;
  }[];
}

/**
 * Load all employees from storage with comprehensive fallback
 */
export const loadEmployees = async (): Promise<Employee[]> => {
  try {
    console.log('EmployeeStorageAdapter: Loading employees...');
    
    // First try super persistent storage
    const data = await superPersistentStorage.load<Employee[]>(DataCategory.EMPLOYEES);
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`EmployeeStorageAdapter: Loaded ${data.length} employees from super persistent storage`);
      
      // Also restore to legacy storage for compatibility with existing code
      localStorage.setItem('employees', JSON.stringify(data));
      
      return data;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      // Try multiple possible legacy keys to catch all possible data
      const legacyKeys = ['employees', 'EMPLOYEES', 'employeesData', 'hrEmployees'];
      
      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          const parsedData = JSON.parse(legacyData);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(`EmployeeStorageAdapter: Loaded ${parsedData.length} employees from legacy storage (${key})`);
            
            // Migrate to super persistent storage for future use
            await superPersistentStorage.save(DataCategory.EMPLOYEES, parsedData);
            
            return parsedData;
          }
        }
      }
    } catch (error) {
      console.error('EmployeeStorageAdapter: Error loading from legacy storage', error);
    }
    
    // If all else fails, return empty array
    console.log('EmployeeStorageAdapter: No employees found in any storage');
    return [];
  } catch (error) {
    console.error('EmployeeStorageAdapter: Error loading employees', error);
    return [];
  }
};

/**
 * Save employees with multi-layer persistence
 */
export const saveEmployees = async (employees: Employee[]): Promise<boolean> => {
  try {
    if (!employees || !Array.isArray(employees)) {
      console.error('EmployeeStorageAdapter: Invalid employees data', employees);
      return false;
    }
    
    console.log(`EmployeeStorageAdapter: Saving ${employees.length} employees...`);
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.EMPLOYEES, employees);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('employees', JSON.stringify(employees));
    
    // Create additional backup in a different key
    localStorage.setItem('employees_backup', JSON.stringify(employees));
    
    if (success) {
      console.log('EmployeeStorageAdapter: Employees saved successfully');
    } else {
      console.warn('EmployeeStorageAdapter: Some storage mechanisms failed when saving employees');
    }
    
    return success;
  } catch (error) {
    console.error('EmployeeStorageAdapter: Error saving employees', error);
    
    // Fall back to legacy storage as last resort
    try {
      localStorage.setItem('employees_emergency_backup', JSON.stringify(employees));
    } catch (fallbackError) {
      console.error('EmployeeStorageAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};

/**
 * Add a new employee
 */
export const addEmployee = async (employee: Employee): Promise<boolean> => {
  try {
    // Load existing employees first
    const employees = await loadEmployees();
    
    // Add new employee
    employees.push(employee);
    
    // Save updated list
    return saveEmployees(employees);
  } catch (error) {
    console.error('EmployeeStorageAdapter: Error adding employee', error);
    return false;
  }
};

/**
 * Update an existing employee
 */
export const updateEmployee = async (updatedEmployee: Employee): Promise<boolean> => {
  try {
    // Load existing employees
    const employees = await loadEmployees();
    
    // Find and update the employee
    const index = employees.findIndex(e => e.id === updatedEmployee.id);
    
    if (index !== -1) {
      employees[index] = updatedEmployee;
      return saveEmployees(employees);
    } else {
      console.warn(`EmployeeStorageAdapter: Employee with ID ${updatedEmployee.id} not found for update`);
      return false;
    }
  } catch (error) {
    console.error('EmployeeStorageAdapter: Error updating employee', error);
    return false;
  }
};

/**
 * Delete an employee by ID
 */
export const deleteEmployee = async (employeeId: string): Promise<boolean> => {
  try {
    // Load existing employees
    const employees = await loadEmployees();
    
    // Filter out the employee to delete
    const updatedEmployees = employees.filter(e => e.id !== employeeId);
    
    // Only save if something was actually removed
    if (updatedEmployees.length < employees.length) {
      return saveEmployees(updatedEmployees);
    } else {
      console.warn(`EmployeeStorageAdapter: Employee with ID ${employeeId} not found for deletion`);
      return false;
    }
  } catch (error) {
    console.error('EmployeeStorageAdapter: Error deleting employee', error);
    return false;
  }
};

/**
 * Get an employee by ID
 */
export const getEmployeeById = async (employeeId: string): Promise<Employee | null> => {
  try {
    // Load all employees
    const employees = await loadEmployees();
    
    // Find the employee by ID
    const employee = employees.find(e => e.id === employeeId);
    
    return employee || null;
  } catch (error) {
    console.error(`EmployeeStorageAdapter: Error getting employee with ID ${employeeId}`, error);
    return null;
  }
};
