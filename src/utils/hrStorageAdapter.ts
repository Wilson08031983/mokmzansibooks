/**
 * HR Storage Adapter
 * 
 * This adapter ensures HR and employee information is never lost by utilizing the
 * SuperPersistentStorage system with multiple redundant storage mechanisms.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';
import { createSyncStorageWrapper, SyncCallbacks } from './syncStorageUtils';
import { v4 as uuidv4 } from 'uuid';

// Basic interfaces for HR data
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  employmentStatus: 'active' | 'on-leave' | 'terminated';
  startDate: string;
  endDate?: string;
  salary: number;
  managerId?: string;
  nationalId?: string;
  taxNumber?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchCode: string;
  };
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  benefits: string[];
  leaveBalance: {
    annual: number;
    sick: number;
    family: number;
    study: number;
  };
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'family' | 'study' | 'unpaid';
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedById?: string;
  approvedAt?: string;
  attachments?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  period: {
    year: number;
    month: number;
  };
  basicSalary: number;
  allowances: {
    name: string;
    amount: number;
    taxable: boolean;
  }[];
  deductions: {
    name: string;
    amount: number;
    statutory: boolean;
  }[];
  overtime: {
    hours: number;
    rate: number;
    amount: number;
  };
  bonus?: number;
  commission?: number;
  taxDeducted: number;
  netPay: number;
  paymentStatus: 'pending' | 'paid';
  paymentDate?: string;
  payslipGenerated: boolean;
  payslipUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  type: 'health' | 'retirement' | 'insurance' | 'other';
  provider: string;
  description: string;
  coverage: string;
  cost: number;
  employerContribution: number;
  eligibility: string;
  enrolledEmployees: string[]; // Array of employee IDs
  documents?: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HRData {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  payroll: PayrollRecord[];
  benefitPlans: BenefitPlan[];
  settings: {
    organizationStructure: any;
    workingHours: any;
    holidayCalendar: any;
    leavePolicy: any;
  };
}

// Default empty state
const defaultHRData: HRData = {
  employees: [],
  leaveRequests: [],
  payroll: [],
  benefitPlans: [],
  settings: {
    organizationStructure: {},
    workingHours: {},
    holidayCalendar: {},
    leavePolicy: {}
  }
};

/**
 * Load HR data from storage with comprehensive fallback
 */
export const loadHRData = async (): Promise<HRData> => {
  try {
    console.log('HRStorageAdapter: Loading HR data...');
    
    // First try super persistent storage
    const data = await superPersistentStorage.load<HRData>(DataCategory.HR);
    
    if (data && data.employees) {
      console.log(`HRStorageAdapter: Loaded ${data.employees.length} employees from super persistent storage`);
      
      // Also restore to legacy storage for compatibility
      localStorage.setItem('hrData', JSON.stringify(data));
      
      return data;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      // Try multiple possible legacy keys
      const legacyKeys = ['hrData', 'employeeData', 'HR_DATA', 'employees'];
      
      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          try {
            const parsedData = JSON.parse(legacyData);
            
            if (parsedData && (parsedData.employees || Array.isArray(parsedData))) {
              // If it's an array, assume it's just employee data
              let structuredData: HRData;
              
              if (Array.isArray(parsedData)) {
                structuredData = {
                  ...defaultHRData,
                  employees: parsedData
                };
              } else if (parsedData.employees) {
                structuredData = {
                  ...defaultHRData,
                  ...parsedData
                };
              } else {
                // Try to match fields to our structure 
                structuredData = {
                  ...defaultHRData
                };
                
                if (parsedData.staff || parsedData.personnel) {
                  structuredData.employees = parsedData.staff || parsedData.personnel;
                }
                
                if (parsedData.leave || parsedData.leaveRequests) {
                  structuredData.leaveRequests = parsedData.leave || parsedData.leaveRequests;
                }
                
                if (parsedData.payroll || parsedData.salaries) {
                  structuredData.payroll = parsedData.payroll || parsedData.salaries;
                }
                
                if (parsedData.benefits || parsedData.benefitPlans) {
                  structuredData.benefitPlans = parsedData.benefits || parsedData.benefitPlans;
                }
              }
              
              console.log(`HRStorageAdapter: Loaded HR data from legacy storage (${key})`);
              
              // Migrate to super persistent storage for future use
              await superPersistentStorage.save(DataCategory.HR, structuredData);
              
              return structuredData;
            }
          } catch (error) {
            console.error(`HRStorageAdapter: Error parsing legacy data from ${key}`, error);
          }
        }
      }
      
      // Also check if we have separate employee data
      const employeeData = localStorage.getItem('employees');
      if (employeeData) {
        try {
          const parsedEmployees = JSON.parse(employeeData);
          
          if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
            const structuredData = {
              ...defaultHRData,
              employees: parsedEmployees
            };
            
            console.log(`HRStorageAdapter: Found and migrated legacy employee data`);
            
            // Migrate to super persistent storage for future use
            await superPersistentStorage.save(DataCategory.HR, structuredData);
            
            return structuredData;
          }
        } catch (error) {
          console.error('HRStorageAdapter: Error parsing legacy employee data', error);
        }
      }
    } catch (error) {
      console.error('HRStorageAdapter: Error loading from legacy storage', error);
    }
    
    // If all else fails, return default data
    console.log('HRStorageAdapter: No HR data found, using defaults');
    return { ...defaultHRData };
  } catch (error) {
    console.error('HRStorageAdapter: Error loading HR data', error);
    return { ...defaultHRData };
  }
};

/**
 * Save HR data with multi-layer persistence
 */
export const saveHRData = async (data: HRData): Promise<boolean> => {
  try {
    console.log('HRStorageAdapter: Saving HR data...');
    
    if (!data || !data.employees) {
      console.error('HRStorageAdapter: Invalid HR data', data);
      return false;
    }
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.HR, data);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('hrData', JSON.stringify(data));
    
    // Create separate backups for main data types
    localStorage.setItem('employees', JSON.stringify(data.employees));
    localStorage.setItem('leaveRequests', JSON.stringify(data.leaveRequests));
    localStorage.setItem('payroll', JSON.stringify(data.payroll));
    localStorage.setItem('benefitPlans', JSON.stringify(data.benefitPlans));
    
    if (success) {
      console.log('HRStorageAdapter: HR data saved successfully');
    } else {
      console.warn('HRStorageAdapter: Some storage mechanisms failed when saving HR data');
    }
    
    return success;
  } catch (error) {
    console.error('HRStorageAdapter: Error saving HR data', error);
    
    // Fall back to legacy storage as last resort
    try {
      localStorage.setItem('hrData_emergency_backup', JSON.stringify(data));
    } catch (fallbackError) {
      console.error('HRStorageAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};

/**
 * Add a new employee
 */
export const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    // Generate ID and timestamps
    const newEmployee: Employee = {
      ...employee,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Employee;
    
    // Load existing HR data
    const data = await loadHRData();
    
    // Add the new employee
    data.employees.push(newEmployee);
    
    // Save updated data
    const success = await saveHRData(data);
    
    return success ? newEmployee.id : null;
  } catch (error) {
    console.error('HRStorageAdapter: Error adding employee', error);
    return null;
  }
};

/**
 * Update an existing employee
 */
export const updateEmployee = async (updatedEmployee: Employee): Promise<boolean> => {
  try {
    // Load existing HR data
    const data = await loadHRData();
    
    // Find and update the employee
    const index = data.employees.findIndex(e => e.id === updatedEmployee.id);
    
    if (index !== -1) {
      // Update the employee with new data, preserving created date
      data.employees[index] = {
        ...updatedEmployee,
        updatedAt: new Date().toISOString()
      };
      
      // Save updated data
      return saveHRData(data);
    } else {
      console.warn(`HRStorageAdapter: Employee with ID ${updatedEmployee.id} not found for update`);
      return false;
    }
  } catch (error) {
    console.error('HRStorageAdapter: Error updating employee', error);
    return false;
  }
};

/**
 * Delete an employee (mark as terminated, don't actually remove)
 */
export const terminateEmployee = async (employeeId: string, terminationDetails: { endDate: string, reason: string }): Promise<boolean> => {
  try {
    // Load existing HR data
    const data = await loadHRData();
    
    // Find the employee
    const index = data.employees.findIndex(e => e.id === employeeId);
    
    if (index !== -1) {
      // Mark as terminated rather than deleting
      data.employees[index] = {
        ...data.employees[index],
        employmentStatus: 'terminated',
        endDate: terminationDetails.endDate,
        updatedAt: new Date().toISOString()
      };
      
      // Add a note in the payroll
      // TODO: Add termination record to payroll or leave history
      
      // Save updated data
      return saveHRData(data);
    } else {
      console.warn(`HRStorageAdapter: Employee with ID ${employeeId} not found for termination`);
      return false;
    }
  } catch (error) {
    console.error('HRStorageAdapter: Error terminating employee', error);
    return false;
  }
};

/**
 * Add a new leave request
 */
export const addLeaveRequest = async (leaveRequest: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string | null> => {
  try {
    // Generate ID and timestamps
    const newLeaveRequest: LeaveRequest = {
      ...leaveRequest,
      id: uuidv4(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as LeaveRequest;
    
    // Load existing HR data
    const data = await loadHRData();
    
    // Add the new leave request
    data.leaveRequests.push(newLeaveRequest);
    
    // Save updated data
    const success = await saveHRData(data);
    
    return success ? newLeaveRequest.id : null;
  } catch (error) {
    console.error('HRStorageAdapter: Error adding leave request', error);
    return null;
  }
};

/**
 * Update an existing leave request status
 */
export const updateLeaveRequestStatus = async (
  leaveRequestId: string, 
  status: 'approved' | 'rejected', 
  approverId: string
): Promise<boolean> => {
  try {
    // Load existing HR data
    const data = await loadHRData();
    
    // Find and update the leave request
    const index = data.leaveRequests.findIndex(lr => lr.id === leaveRequestId);
    
    if (index !== -1) {
      // Update the leave request status
      data.leaveRequests[index] = {
        ...data.leaveRequests[index],
        status,
        approvedById: approverId,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // If approved, update employee leave balance
      if (status === 'approved') {
        const employeeId = data.leaveRequests[index].employeeId;
        const leaveType = data.leaveRequests[index].type;
        const duration = data.leaveRequests[index].duration;
        
        const employeeIndex = data.employees.findIndex(e => e.id === employeeId);
        
        if (employeeIndex !== -1 && leaveType !== 'unpaid') {
          // Deduct from appropriate leave balance
          data.employees[employeeIndex].leaveBalance[leaveType] -= duration;
        }
      }
      
      // Save updated data
      return saveHRData(data);
    } else {
      console.warn(`HRStorageAdapter: Leave request with ID ${leaveRequestId} not found for update`);
      return false;
    }
  } catch (error) {
    console.error('HRStorageAdapter: Error updating leave request', error);
    return false;
  }
};

/**
 * Add a new payroll record
 */
export const addPayrollRecord = async (payrollRecord: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    // Generate ID and timestamps
    const newPayrollRecord: PayrollRecord = {
      ...payrollRecord,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as PayrollRecord;
    
    // Load existing HR data
    const data = await loadHRData();
    
    // Add the new payroll record
    data.payroll.push(newPayrollRecord);
    
    // Save updated data
    const success = await saveHRData(data);
    
    return success ? newPayrollRecord.id : null;
  } catch (error) {
    console.error('HRStorageAdapter: Error adding payroll record', error);
    return null;
  }
};

/**
 * Update payroll record payment status
 */
export const updatePayrollPaymentStatus = async (
  payrollRecordId: string, 
  status: 'paid', 
  paymentDate: string
): Promise<boolean> => {
  try {
    // Load existing HR data
    const data = await loadHRData();
    
    // Find and update the payroll record
    const index = data.payroll.findIndex(pr => pr.id === payrollRecordId);
    
    if (index !== -1) {
      // Update the payroll record status
      data.payroll[index] = {
        ...data.payroll[index],
        paymentStatus: status,
        paymentDate,
        updatedAt: new Date().toISOString()
      };
      
      // Save updated data
      return saveHRData(data);
    } else {
      console.warn(`HRStorageAdapter: Payroll record with ID ${payrollRecordId} not found for update`);
      return false;
    }
  } catch (error) {
    console.error('HRStorageAdapter: Error updating payroll payment status', error);
    return false;
  }
};

/**
 * Add a new benefit plan
 */
export const addBenefitPlan = async (benefitPlan: Omit<BenefitPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    // Generate ID and timestamps
    const newBenefitPlan: BenefitPlan = {
      ...benefitPlan,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as BenefitPlan;
    
    // Load existing HR data
    const data = await loadHRData();
    
    // Add the new benefit plan
    data.benefitPlans.push(newBenefitPlan);
    
    // Save updated data
    const success = await saveHRData(data);
    
    return success ? newBenefitPlan.id : null;
  } catch (error) {
    console.error('HRStorageAdapter: Error adding benefit plan', error);
    return null;
  }
};

/**
 * Enroll employee in benefit plan
 */
export const enrollEmployeeInBenefit = async (
  employeeId: string, 
  benefitPlanId: string
): Promise<boolean> => {
  try {
    // Load existing HR data
    const data = await loadHRData();
    
    // Find the benefit plan
    const planIndex = data.benefitPlans.findIndex(bp => bp.id === benefitPlanId);
    
    if (planIndex === -1) {
      console.warn(`HRStorageAdapter: Benefit plan with ID ${benefitPlanId} not found`);
      return false;
    }
    
    // Find the employee
    const employeeIndex = data.employees.findIndex(e => e.id === employeeId);
    
    if (employeeIndex === -1) {
      console.warn(`HRStorageAdapter: Employee with ID ${employeeId} not found`);
      return false;
    }
    
    // Check if employee is already enrolled
    if (data.benefitPlans[planIndex].enrolledEmployees.includes(employeeId)) {
      console.warn(`HRStorageAdapter: Employee ${employeeId} already enrolled in benefit plan ${benefitPlanId}`);
      return true; // Already enrolled is considered a success
    }
    
    // Add employee to the benefit plan
    data.benefitPlans[planIndex].enrolledEmployees.push(employeeId);
    data.benefitPlans[planIndex].updatedAt = new Date().toISOString();
    
    // Add benefit to employee
    if (!data.employees[employeeIndex].benefits.includes(benefitPlanId)) {
      data.employees[employeeIndex].benefits.push(benefitPlanId);
      data.employees[employeeIndex].updatedAt = new Date().toISOString();
    }
    
    // Save updated data
    return saveHRData(data);
  } catch (error) {
    console.error('HRStorageAdapter: Error enrolling employee in benefit', error);
    return false;
  }
};

// Create sync-enabled storage wrapper for HR data
const syncHRStorage = createSyncStorageWrapper<HRData>(
  saveHRData,
  loadHRData,
  'HR Data'
);

// Public API with sync indicators
export const syncHRAdapter = {
  load: async (callbacks?: SyncCallbacks): Promise<HRData> => {
    return syncHRStorage.load(callbacks);
  },
  save: async (data: HRData, callbacks?: SyncCallbacks): Promise<boolean> => {
    return syncHRStorage.save(data, callbacks);
  },
  addEmployee: async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>, callbacks?: SyncCallbacks): Promise<string | null> => {
    try {
      const data = await syncHRStorage.load(callbacks);
      
      // Generate ID and timestamps
      const newEmployee: Employee = {
        ...employee,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Employee;
      
      // Add the new employee
      data.employees.push(newEmployee);
      
      // Save updated data
      const success = await syncHRStorage.save(data, callbacks);
      
      return success ? newEmployee.id : null;
    } catch (error) {
      console.error('Error adding employee with sync:', error);
      return null;
    }
  },
  updateEmployee: async (employee: Employee, callbacks?: SyncCallbacks): Promise<boolean> => {
    try {
      const data = await syncHRStorage.load(callbacks);
      
      const index = data.employees.findIndex(e => e.id === employee.id);
      if (index !== -1) {
        // Update with new timestamp
        data.employees[index] = {
          ...employee,
          updatedAt: new Date().toISOString()
        };
        return syncHRStorage.save(data, callbacks);
      }
      return false;
    } catch (error) {
      console.error('Error updating employee with sync:', error);
      return false;
    }
  },
  addLeaveRequest: async (leaveRequest: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>, callbacks?: SyncCallbacks): Promise<string | null> => {
    try {
      const data = await syncHRStorage.load(callbacks);
      
      // Generate ID and timestamps
      const newLeaveRequest: LeaveRequest = {
        ...leaveRequest,
        id: uuidv4(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as LeaveRequest;
      
      // Add the new leave request
      data.leaveRequests.push(newLeaveRequest);
      
      // Save updated data
      const success = await syncHRStorage.save(data, callbacks);
      
      return success ? newLeaveRequest.id : null;
    } catch (error) {
      console.error('Error adding leave request with sync:', error);
      return null;
    }
  },
  addPayrollRecord: async (payrollRecord: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>, callbacks?: SyncCallbacks): Promise<string | null> => {
    try {
      const data = await syncHRStorage.load(callbacks);
      
      // Generate ID and timestamps
      const newPayrollRecord: PayrollRecord = {
        ...payrollRecord,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as PayrollRecord;
      
      // Add the new payroll record
      data.payroll.push(newPayrollRecord);
      
      // Save updated data
      const success = await syncHRStorage.save(data, callbacks);
      
      return success ? newPayrollRecord.id : null;
    } catch (error) {
      console.error('Error adding payroll record with sync:', error);
      return null;
    }
  }
};
