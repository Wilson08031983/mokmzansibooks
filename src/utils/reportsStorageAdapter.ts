/**
 * Reports Storage Adapter
 * 
 * This adapter ensures report data is never lost by utilizing the
 * SuperPersistentStorage system with multiple redundant storage mechanisms.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';
import { createSyncStorageWrapper, SyncCallbacks } from './syncStorageUtils';
import { v4 as uuidv4 } from 'uuid';

// Basic interfaces for report data
export interface Report {
  id: string;
  name: string;
  type: 'financial' | 'sales' | 'inventory' | 'custom' | 'hr' | 'tax';
  description?: string;
  parameters: {
    dateRange: {
      start: string;
      end: string;
    };
    filters: { [key: string]: any };
    groupBy?: string[];
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  };
  data?: any;
  columns: {
    field: string;
    title: string;
    type: 'string' | 'number' | 'date' | 'currency' | 'percentage';
    format?: string;
    width?: number;
  }[];
  charts?: {
    type: 'bar' | 'line' | 'pie' | 'area';
    title: string;
    dataKey: string;
    categoryKey: string;
    series?: string[];
  }[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    recipients: string[];
    lastRun?: string;
    nextRun?: string;
  };
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  lastGeneratedAt?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  reportType: string;
  filters: { [key: string]: any };
  isDefault: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: {
    id: string;
    type: 'chart' | 'metric' | 'table' | 'alert';
    title: string;
    size: { width: number; height: number };
    position: { x: number; y: number };
    reportId?: string;
    chartType?: 'bar' | 'line' | 'pie' | 'area';
    metricType?: 'number' | 'currency' | 'percentage';
    parameters?: any;
    data?: any;
  }[];
  isDefault: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExport {
  id: string;
  reportId: string;
  name: string;
  format: 'pdf' | 'csv' | 'excel' | 'json';
  url?: string;
  parameters: any;
  createdBy?: string;
  createdAt: string;
  size?: number;
}

export interface ReportsData {
  reports: Report[];
  savedFilters: SavedFilter[];
  dashboards: Dashboard[];
  exports: ReportExport[];
  settings: {
    defaultDateRange: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'thisYear' | 'lastYear' | 'custom';
    defaultCurrency: string;
    defaultChartType: 'bar' | 'line' | 'pie' | 'area';
  };
}

// Default empty state
const defaultReportsData: ReportsData = {
  reports: [],
  savedFilters: [],
  dashboards: [],
  exports: [],
  settings: {
    defaultDateRange: 'thisMonth',
    defaultCurrency: 'ZAR',
    defaultChartType: 'bar'
  }
};

/**
 * Load reports data from storage with comprehensive fallback
 */
export const loadReportsData = async (): Promise<ReportsData> => {
  try {
    console.log('ReportsStorageAdapter: Loading reports data...');
    
    // First try super persistent storage
    const data = await superPersistentStorage.load<ReportsData>(DataCategory.REPORTS);
    
    if (data && data.reports) {
      console.log(`ReportsStorageAdapter: Loaded ${data.reports.length} reports from super persistent storage`);
      
      // Also restore to legacy storage for compatibility
      localStorage.setItem('reportsData', JSON.stringify(data));
      
      return data;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      // Try multiple possible legacy keys
      const legacyKeys = ['reportsData', 'reports', 'savedReports', 'reportConfig'];
      
      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          try {
            const parsedData = JSON.parse(legacyData);
            
            if (parsedData) {
              // Determine if this is a complete reports data object or just reports
              let structuredData: ReportsData;
              
              if (Array.isArray(parsedData)) {
                // It's just an array of reports
                structuredData = {
                  ...defaultReportsData,
                  reports: parsedData
                };
              } else if (parsedData.reports) {
                // It's a proper reports data object
                structuredData = {
                  ...defaultReportsData,
                  ...parsedData
                };
              } else {
                // Try to infer structure
                structuredData = { ...defaultReportsData };
                
                // Check for reports with different property names
                if (parsedData.reportList || parsedData.savedReports) {
                  structuredData.reports = parsedData.reportList || parsedData.savedReports;
                }
                
                // Check for saved filters with different property names
                if (parsedData.filters || parsedData.savedFilters) {
                  structuredData.savedFilters = parsedData.filters || parsedData.savedFilters;
                }
                
                // Check for dashboards with different property names
                if (parsedData.dashboards || parsedData.dashboardConfigs) {
                  structuredData.dashboards = parsedData.dashboards || parsedData.dashboardConfigs;
                }
                
                // Check for exports with different property names
                if (parsedData.exports || parsedData.exportedReports) {
                  structuredData.exports = parsedData.exports || parsedData.exportedReports;
                }
              }
              
              console.log(`ReportsStorageAdapter: Loaded reports data from legacy storage (${key})`);
              
              // Migrate to super persistent storage for future use
              await superPersistentStorage.save(DataCategory.REPORTS, structuredData);
              
              return structuredData;
            }
          } catch (error) {
            console.error(`ReportsStorageAdapter: Error parsing legacy data from ${key}`, error);
          }
        }
      }
    } catch (error) {
      console.error('ReportsStorageAdapter: Error loading from legacy storage', error);
    }
    
    // If all else fails, return default data
    console.log('ReportsStorageAdapter: No reports data found, using defaults');
    return { ...defaultReportsData };
  } catch (error) {
    console.error('ReportsStorageAdapter: Error loading reports data', error);
    return { ...defaultReportsData };
  }
};

/**
 * Save reports data with multi-layer persistence
 */
export const saveReportsData = async (data: ReportsData): Promise<boolean> => {
  try {
    console.log('ReportsStorageAdapter: Saving reports data...');
    
    if (!data || !data.reports) {
      console.error('ReportsStorageAdapter: Invalid reports data', data);
      return false;
    }
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.REPORTS, data);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('reportsData', JSON.stringify(data));
    
    // Create separate backups for main data types
    localStorage.setItem('reports', JSON.stringify(data.reports));
    localStorage.setItem('savedFilters', JSON.stringify(data.savedFilters));
    localStorage.setItem('dashboards', JSON.stringify(data.dashboards));
    localStorage.setItem('reportExports', JSON.stringify(data.exports));
    
    if (success) {
      console.log('ReportsStorageAdapter: Reports data saved successfully');
    } else {
      console.warn('ReportsStorageAdapter: Some storage mechanisms failed when saving reports data');
    }
    
    return success;
  } catch (error) {
    console.error('ReportsStorageAdapter: Error saving reports data', error);
    
    // Fall back to legacy storage as last resort
    try {
      localStorage.setItem('reportsData_emergency_backup', JSON.stringify(data));
    } catch (fallbackError) {
      console.error('ReportsStorageAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};

/**
 * Save a report (new or updated)
 */
export const saveReport = async (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> | Report): Promise<string | null> => {
  try {
    // Load existing reports data
    const data = await loadReportsData();
    
    let reportToSave: Report;
    
    if ('id' in report) {
      // Existing report, find and update
      const index = data.reports.findIndex(r => r.id === report.id);
      
      if (index !== -1) {
        // Update existing report
        reportToSave = {
          ...report,
          updatedAt: new Date().toISOString()
        };
        
        data.reports[index] = reportToSave;
      } else {
        // Report ID not found, create new with provided ID
        reportToSave = {
          ...report,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.reports.push(reportToSave);
      }
    } else {
      // New report, generate ID and timestamps
      reportToSave = {
        ...report,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Report;
      
      // Add to reports list
      data.reports.push(reportToSave);
    }
    
    // Save updated data
    const success = await saveReportsData(data);
    
    return success ? reportToSave.id : null;
  } catch (error) {
    console.error('ReportsStorageAdapter: Error saving report', error);
    return null;
  }
};

/**
 * Delete a report
 */
export const deleteReport = async (reportId: string): Promise<boolean> => {
  try {
    // Load existing reports data
    const data = await loadReportsData();
    
    // Find report index
    const index = data.reports.findIndex(r => r.id === reportId);
    
    if (index !== -1) {
      // Remove the report
      data.reports.splice(index, 1);
      
      // Also remove any associated filters, exports, and dashboard widgets
      data.savedFilters = data.savedFilters.filter(f => f.reportType !== reportId);
      data.exports = data.exports.filter(e => e.reportId !== reportId);
      
      // Update dashboards to remove widgets using this report
      data.dashboards.forEach(dashboard => {
        dashboard.widgets = dashboard.widgets.filter(widget => widget.reportId !== reportId);
        dashboard.updatedAt = new Date().toISOString();
      });
      
      // Save updated data
      return saveReportsData(data);
    } else {
      console.warn(`ReportsStorageAdapter: Report with ID ${reportId} not found for deletion`);
      return false;
    }
  } catch (error) {
    console.error('ReportsStorageAdapter: Error deleting report', error);
    return false;
  }
};

/**
 * Save a dashboard (new or updated)
 */
export const saveDashboard = async (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'> | Dashboard): Promise<string | null> => {
  try {
    // Load existing reports data
    const data = await loadReportsData();
    
    let dashboardToSave: Dashboard;
    
    if ('id' in dashboard) {
      // Existing dashboard, find and update
      const index = data.dashboards.findIndex(d => d.id === dashboard.id);
      
      if (index !== -1) {
        // Update existing dashboard
        dashboardToSave = {
          ...dashboard,
          updatedAt: new Date().toISOString()
        };
        
        data.dashboards[index] = dashboardToSave;
      } else {
        // Dashboard ID not found, create new with provided ID
        dashboardToSave = {
          ...dashboard,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.dashboards.push(dashboardToSave);
      }
    } else {
      // New dashboard, generate ID and timestamps
      dashboardToSave = {
        ...dashboard,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Dashboard;
      
      // Add to dashboards list
      data.dashboards.push(dashboardToSave);
    }
    
    // Save updated data
    const success = await saveReportsData(data);
    
    return success ? dashboardToSave.id : null;
  } catch (error) {
    console.error('ReportsStorageAdapter: Error saving dashboard', error);
    return null;
  }
};

/**
 * Save a filter (new or updated)
 */
export const saveFilter = async (filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'> | SavedFilter): Promise<string | null> => {
  try {
    // Load existing reports data
    const data = await loadReportsData();
    
    let filterToSave: SavedFilter;
    
    if ('id' in filter) {
      // Existing filter, find and update
      const index = data.savedFilters.findIndex(f => f.id === filter.id);
      
      if (index !== -1) {
        // Update existing filter
        filterToSave = {
          ...filter,
          updatedAt: new Date().toISOString()
        };
        
        data.savedFilters[index] = filterToSave;
      } else {
        // Filter ID not found, create new with provided ID
        filterToSave = {
          ...filter,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.savedFilters.push(filterToSave);
      }
    } else {
      // New filter, generate ID and timestamps
      filterToSave = {
        ...filter,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as SavedFilter;
      
      // Add to filters list
      data.savedFilters.push(filterToSave);
    }
    
    // If this is a default filter, unset default flag on other filters of same type
    if (filterToSave.isDefault) {
      data.savedFilters.forEach(f => {
        if (f.id !== filterToSave.id && f.reportType === filterToSave.reportType) {
          f.isDefault = false;
        }
      });
    }
    
    // Save updated data
    const success = await saveReportsData(data);
    
    return success ? filterToSave.id : null;
  } catch (error) {
    console.error('ReportsStorageAdapter: Error saving filter', error);
    return null;
  }
};

/**
 * Add a report export
 */
export const addReportExport = async (exportData: Omit<ReportExport, 'id' | 'createdAt'>): Promise<string | null> => {
  try {
    // Load existing reports data
    const data = await loadReportsData();
    
    // Generate new export with ID and timestamp
    const newExport: ReportExport = {
      ...exportData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    
    // Add to exports list
    data.exports.push(newExport);
    
    // Save updated data
    const success = await saveReportsData(data);
    
    return success ? newExport.id : null;
  } catch (error) {
    console.error('ReportsStorageAdapter: Error adding report export', error);
    return null;
  }
};

/**
 * Update report settings
 */
export const updateReportSettings = async (settings: Partial<ReportsData['settings']>): Promise<boolean> => {
  try {
    // Load existing reports data
    const data = await loadReportsData();
    
    // Update settings
    data.settings = {
      ...data.settings,
      ...settings
    };
    
    // Save updated data
    return saveReportsData(data);
  } catch (error) {
    console.error('ReportsStorageAdapter: Error updating report settings', error);
    return false;
  }
};

// Create sync-enabled storage wrapper for reports data
const syncReportsStorage = createSyncStorageWrapper<ReportsData>(
  saveReportsData,
  loadReportsData,
  'Reports Data'
);

// Public API with sync indicators
export const syncReportsAdapter = {
  load: async (callbacks?: SyncCallbacks): Promise<ReportsData> => {
    return syncReportsStorage.load(callbacks);
  },
  save: async (data: ReportsData, callbacks?: SyncCallbacks): Promise<boolean> => {
    return syncReportsStorage.save(data, callbacks);
  },
  saveReport: async (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> | Report, callbacks?: SyncCallbacks): Promise<string | null> => {
    try {
      const data = await syncReportsStorage.load(callbacks);
      
      let reportToSave: Report;
      
      if ('id' in report) {
        // Existing report, find and update
        const index = data.reports.findIndex(r => r.id === report.id);
        
        if (index !== -1) {
          // Update existing report
          reportToSave = {
            ...report,
            updatedAt: new Date().toISOString()
          };
          
          data.reports[index] = reportToSave;
        } else {
          // Report ID not found, create new with provided ID
          reportToSave = {
            ...report,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          data.reports.push(reportToSave);
        }
      } else {
        // New report, generate ID and timestamps
        reportToSave = {
          ...report,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Report;
        
        // Add to reports list
        data.reports.push(reportToSave);
      }
      
      // Save updated data
      const success = await syncReportsStorage.save(data, callbacks);
      
      return success ? reportToSave.id : null;
    } catch (error) {
      console.error('Error saving report with sync:', error);
      return null;
    }
  },
  saveDashboard: async (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'> | Dashboard, callbacks?: SyncCallbacks): Promise<string | null> => {
    try {
      const data = await syncReportsStorage.load(callbacks);
      
      let dashboardToSave: Dashboard;
      
      if ('id' in dashboard) {
        // Existing dashboard, find and update
        const index = data.dashboards.findIndex(d => d.id === dashboard.id);
        
        if (index !== -1) {
          // Update existing dashboard
          dashboardToSave = {
            ...dashboard,
            updatedAt: new Date().toISOString()
          };
          
          data.dashboards[index] = dashboardToSave;
        } else {
          // Dashboard ID not found, create new with provided ID
          dashboardToSave = {
            ...dashboard,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          data.dashboards.push(dashboardToSave);
        }
      } else {
        // New dashboard, generate ID and timestamps
        dashboardToSave = {
          ...dashboard,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Dashboard;
        
        // Add to dashboards list
        data.dashboards.push(dashboardToSave);
      }
      
      // Save updated data
      const success = await syncReportsStorage.save(data, callbacks);
      
      return success ? dashboardToSave.id : null;
    } catch (error) {
      console.error('Error saving dashboard with sync:', error);
      return null;
    }
  }
};
