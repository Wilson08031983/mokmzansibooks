/**
 * Data Management Page
 * 
 * A comprehensive page for managing and recovering data in the application.
 * Allows users to:
 * - Check data health status
 * - Trigger data recovery operations
 * - View sync status
 * - Manage data backup options
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { NetworkStatusIndicator } from "@/components/ui/network-status";
import { VersionHistory } from "@/components/data-management/VersionHistory";
import { BackupManager } from "@/components/data-management/BackupManager";
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ConflictResolution } from '@/components/data-management/ConflictResolution';
import { DataCategory } from '@/utils/superPersistentStorage';
import superPersistentStorage from '@/utils/superPersistentStorage';
import { recoverData, fullRecovery, detectConflicts } from '@/utils/dataRecovery';
import syncManager from '@/utils/syncManager';

import { AlertTriangle, Check, CloudOff, Clock, Database, HardDrive, RefreshCw, Server, Shield } from 'lucide-react';

export function DataManagementPage() {
  const { currentUser } = useSupabaseAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('health');
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [syncCount, setSyncCount] = useState(0);
  const [conflictCategory, setConflictCategory] = useState<DataCategory | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [categoryStatuses, setCategoryStatuses] = useState<Record<string, any>>({});
  
  // Auto backup settings
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(
    localStorage.getItem('auto_backup_enabled') === 'true'
  );
  
  useEffect(() => {
    checkHealth();
    updateSyncCount();
    
    // Set up interval to periodically check health and sync status
    const intervalId = setInterval(() => {
      updateSyncCount();
    }, 10000);
    
    // Add listener for sync status changes
    syncManager.addListener(updateSyncCount);
    
    return () => {
      clearInterval(intervalId);
      syncManager.removeListener(updateSyncCount);
    };
  }, []);
  
  const updateSyncCount = () => {
    setSyncCount(syncManager.getPendingSyncCount());
  };
  
  const checkHealth = async () => {
    setLoading(true);
    try {
      const status = await superPersistentStorage.validateHealth();
      setHealthStatus(status);
      
      // Check each category for conflicts
      await checkAllCategoriesForConflicts();
      
    } catch (error) {
      console.error('Error checking health:', error);
      toast({
        title: 'Failed to check system health',
        description: 'There was an error checking the health of your data storage systems.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFullRecovery = async () => {
    setRecovering(true);
    
    try {
      const result = await fullRecovery();
      
      if (result.success) {
        toast({
          title: 'Recovery Successful',
          description: 'All your data has been successfully recovered.'
        });
      } else {
        toast({
          title: 'Partial Recovery',
          description: `Recovered ${result.recovered.length} categories, but ${result.failed.length} categories failed.`,
          variant: 'destructive'
        });
      }
      
      // Refresh health status
      await checkHealth();
      
    } catch (error) {
      console.error('Error during full recovery:', error);
      toast({
        title: 'Recovery Failed',
        description: 'There was an error during the recovery process. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setRecovering(false);
    }
  };
  
  const handleCategoryRecovery = async (category: DataCategory) => {
    try {
      const success = await recoverData(category);
      
      if (success) {
        // Update category status
        await checkCategoryForConflicts(category);
      }
      
    } catch (error) {
      console.error(`Error recovering category ${category}:`, error);
      toast({
        title: 'Recovery Failed',
        description: `Failed to recover ${category} data. Please try again later.`,
        variant: 'destructive'
      });
    }
  };
  
  const checkCategoryForConflicts = async (category: DataCategory) => {
    try {
      const hasConflict = await detectConflicts(category);
      
      setCategoryStatuses(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          hasConflict
        }
      }));
      
      return hasConflict;
    } catch (error) {
      console.error(`Error checking conflicts for ${category}:`, error);
      return false;
    }
  };
  
  const checkAllCategoriesForConflicts = async () => {
    const statuses: Record<string, any> = {};
    const categories = Object.values(DataCategory);
    
    for (const category of categories) {
      try {
        const hasConflict = await checkCategoryForConflicts(category);
        
        statuses[category] = {
          hasConflict,
          lastChecked: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error checking category ${category}:`, error);
        statuses[category] = {
          hasConflict: false,
          error: true,
          lastChecked: new Date().toISOString()
        };
      }
    }
    
    setCategoryStatuses(statuses);
  };
  
  const handleResolveConflict = (category: DataCategory) => {
    setConflictCategory(category);
    setShowConflictDialog(true);
  };
  
  const onConflictResolved = async () => {
    if (conflictCategory) {
      await checkCategoryForConflicts(conflictCategory);
    }
  };
  
  const toggleAutoBackup = (enabled: boolean) => {
    setAutoBackupEnabled(enabled);
    localStorage.setItem('auto_backup_enabled', enabled.toString());
    
    toast({
      title: enabled ? 'Auto Backup Enabled' : 'Auto Backup Disabled',
      description: enabled 
        ? 'Your data will be automatically backed up periodically.' 
        : 'Automatic data backups have been disabled.'
    });
  };
  
  const getHealthStatusColor = () => {
    if (!healthStatus) return 'bg-gray-300';
    if (healthStatus.healthy) return 'bg-green-500';
    if (healthStatus.issues.length > 2) return 'bg-red-500';
    return 'bg-amber-500';
  };
  
  const getHealthPercentage = () => {
    if (!healthStatus) return 0;
    if (healthStatus.healthy) return 100;
    
    // Calculate a percentage based on the number of issues
    const storageKeys = Object.keys(healthStatus.storageTypes).length;
    const issueCount = healthStatus.issues.length;
    
    return Math.max(0, Math.min(100, 100 - (issueCount / storageKeys) * 100));
  };
  
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Data Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor, backup, and recover your business data
            </p>
          </div>
          <Button 
            onClick={checkHealth} 
            variant="outline" 
            className="flex gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full sm:w-[600px]">
            <TabsTrigger value="health">Health Status</TabsTrigger>
            <TabsTrigger value="data">Data Recovery</TabsTrigger>
            <TabsTrigger value="history">Version History</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="health" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Health Status
                </CardTitle>
                <CardDescription>
                  Overview of the health and reliability of your data storage systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Health Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Overall Health</span>
                      <span className="text-sm font-medium">
                        {!healthStatus ? 'Checking...' : 
                          healthStatus.healthy ? 'Healthy' : 'Issues Detected'}
                      </span>
                    </div>
                    <Progress value={getHealthPercentage()} className={getHealthStatusColor()} />
                  </div>
                  
                  {/* Storage Status Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex gap-2 items-center">
                          <HardDrive className="h-4 w-4" />
                          Local Storage
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          {healthStatus?.storageTypes.localStorage ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" /> Working
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Error
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex gap-2 items-center">
                          <Database className="h-4 w-4" />
                          IndexedDB
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          {healthStatus?.storageTypes.indexedDB ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" /> Working
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Error
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex gap-2 items-center">
                          <Server className="h-4 w-4" />
                          Network & Sync
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          {healthStatus?.storageTypes.network ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" /> Online
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <CloudOff className="h-3 w-3 mr-1" /> Offline
                            </Badge>
                          )}
                          {syncCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {syncCount} pending
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Issues List */}
                  {healthStatus && healthStatus.issues.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Issues Detected</AlertTitle>
                      <AlertDescription>
                        <ScrollArea className="h-28 mt-2">
                          <ul className="space-y-2">
                            {healthStatus.issues.map((issue: string, index: number) => (
                              <li key={index} className="text-sm">• {issue}</li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Recovery
                </CardTitle>
                <CardDescription>
                  Recover your data from backups or resolve conflicts between local and server data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Full Recovery */}
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-medium text-lg">Full System Recovery</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Attempt to recover all data from the best available source.
                      This will scan all backups and select the most reliable data.
                    </p>
                    <Button 
                      onClick={handleFullRecovery} 
                      disabled={recovering}
                      className="gap-2"
                    >
                      {recovering && <RefreshCw className="h-4 w-4 animate-spin" />}
                      Run Full Recovery
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  {/* Category-specific recovery */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Recover Specific Data</h3>
                    
                    <div className="space-y-4">
                      {Object.values(DataCategory).map((category) => {
                        const status = categoryStatuses[category];
                        return (
                          <Card key={category} className="overflow-hidden">
                            <div className={`px-4 py-3 border-l-4 ${
                                status?.hasConflict 
                                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/10' 
                                  : status?.error 
                                    ? 'border-red-500 bg-red-50 dark:bg-red-950/10'
                                    : 'border-green-500 bg-green-50 dark:bg-green-950/10'
                              }`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">{category}</h4>
                                  {status?.hasConflict && (
                                    <p className="text-sm text-amber-600 dark:text-amber-400">
                                      Conflict detected between local and server data
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {status?.hasConflict ? (
                                    <Button 
                                      variant="secondary" 
                                      size="sm"
                                      onClick={() => handleResolveConflict(category as DataCategory)}
                                    >
                                      Resolve Conflict
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleCategoryRecovery(category as DataCategory)}
                                    >
                                      Recover
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Version History
                </CardTitle>
                <CardDescription>
                  View and restore previous versions of your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50 mb-4">
                    <h3 className="font-medium text-lg">About Version History</h3>
                    <p className="text-sm text-muted-foreground">
                      MokMzansi Books automatically keeps track of changes made to your data, allowing you to view
                      previous versions and restore them if needed. Select a data category below to view its history.
                    </p>
                  </div>
                  
                  <Tabs defaultValue="company">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="company">Company</TabsTrigger>
                      <TabsTrigger value="clients">Clients</TabsTrigger>
                      <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="company">
                      <VersionHistory 
                        category={DataCategory.COMPANY} 
                        onVersionRestored={() => {
                          toast({
                            title: "Version Restored",
                            description: "Company data has been restored to a previous version."
                          });
                        }}
                      />
                    </TabsContent>
                    
                    <TabsContent value="clients">
                      <VersionHistory 
                        category={DataCategory.CLIENTS} 
                        onVersionRestored={() => {
                          toast({
                            title: "Version Restored",
                            description: "Client data has been restored to a previous version."
                          });
                        }}
                      />
                    </TabsContent>
                    
                    <TabsContent value="invoices">
                      <VersionHistory 
                        category={DataCategory.INVOICES} 
                        onVersionRestored={() => {
                          toast({
                            title: "Version Restored",
                            description: "Invoice data has been restored to a previous version."
                          });
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backups" className="space-y-6 mt-6">
            <BackupManager />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Protection Settings
                </CardTitle>
                <CardDescription>
                  Configure how your data is protected and backed up
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto-backup" className="flex flex-col space-y-1">
                      <span>Automatic Backup</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Create regular backups of your data in the background
                      </span>
                    </Label>
                    <Switch
                      id="auto-backup"
                      checked={autoBackupEnabled}
                      onCheckedChange={toggleAutoBackup}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="cloud-sync" className="flex flex-col space-y-1">
                      <span>Cloud Synchronization</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Sync your data to the cloud when you're online
                      </span>
                    </Label>
                    <Switch
                      id="cloud-sync"
                      checked={true}
                      disabled={true}
                    />
                  </div>
                  
                  <Alert>
                    <AlertTitle>Cloud sync is required</AlertTitle>
                    <AlertDescription>
                      Cloud synchronization is required for the application to function properly.
                      This ensures your data is safely stored in the cloud and available across devices.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Conflict Resolution Dialog */}
      {conflictCategory && (
        <ConflictResolution
          isOpen={showConflictDialog}
          onClose={() => setShowConflictDialog(false)}
          category={conflictCategory}
          onResolved={onConflictResolved}
        />
      )}
    </div>
  );
}
